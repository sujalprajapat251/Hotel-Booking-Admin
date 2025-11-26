import React, { useEffect, useRef, useState } from 'react';
import { fetchBookings } from '../Redux/Slice/bookingSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { FaEllipsisV } from 'react-icons/fa';
import { HiOutlineDocumentChartBar } from 'react-icons/hi2';
import { FiEdit, FiPlusCircle } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { ChevronDown, ChevronLeft, ChevronRight, Download, Filter, Phone, RefreshCw, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { setAlert } from '../Redux/Slice/alert.slice';
import { IoEyeSharp } from 'react-icons/io5';
import { assignWorkerToRoom, fetchAllhousekeepingrooms } from '../Redux/Slice/housekeepingSlice.js';
import { getAllStaff } from '../Redux/Slice/staff.slice.js';


const AllHouseKeeping = () => {

    const dispatch = useDispatch();
    const { creating } = useSelector((state) => state.housekeeping);

    const [housekeepingRooms, setHousekeepingRooms] = useState([]);
    console.log('housekeepingRooms', housekeepingRooms);

    // Get data from Redux store including pagination
    const {
        items,
        totalCount,
        currentPage: reduxCurrentPage,
        totalPages: reduxTotalPages,
        loading
    } = useSelector((state) => state.housekeeping);
    console.log('items', items);

    const [housekeepingStaff, setHousekeepingStaff] = useState([]);
    const [housekeepingStaffName, setHousekeepingStaffName] = useState([]);
    console.log('housekeepingStaffName', housekeepingStaff);

    useEffect(() => {
        dispatch(getAllStaff());
    }, [dispatch])

    const { staff } = useSelector((state) => state.staff);
    console.log('staff', staff);

    useEffect(() => {
        if (staff && staff.length > 0) {
            const filteredStaff = staff.filter(
                (member) => member.department?.name === "Housekeeping"
            );

            const names = filteredStaff?.map((member) => member?.name);

            console.log('filteredStaff', filteredStaff); // Full objects
            console.log('names', names); // Just names

            setHousekeepingStaff(filteredStaff);
            setHousekeepingStaffName(names) // or names, depending on what you need
        } else {
            setHousekeepingStaff([]);
            setHousekeepingStaffName([]);
        }
    }, [staff]);

    console.log('housekeepingStaff', housekeepingStaff);

    const [isWorkerDropdownOpen, setIsWorkerDropdownOpen] = useState(false);
    const [isAssignWorkerModalOpen, setIsAssignWorkerModalOpen] = useState(false);
    const [selectedHousekeeping, setSelectedHousekeeping] = useState(null);
    // const [selectedWorker, setSelectedWorker] = useState('');
    const [roomId, setRoomId] = useState('');
    console.log('roomId', roomId);


    // Change this state from string to object
    const [selectedWorker, setSelectedWorker] = useState({ name: '', id: '' });

    const handleAssignWorkerClose = () => {
        setIsAssignWorkerModalOpen(false);
        setSelectedHousekeeping(null);
        setSelectedWorker({ name: '', id: '' });
        setIsWorkerDropdownOpen(false);
    };

    const handleAssignWorkerSubmit = async () => {
        const roomId = selectedHousekeeping?.rawData?.roomType?._id;
        const workerId = selectedWorker.id;

        console.log('Assigning Worker:', {
            roomId,
            workerId,
            workerName: selectedWorker.name
        });

        try {
            // Dispatch the API call
            await dispatch(assignWorkerToRoom({
                roomId,
                workerId
            })).unwrap();

            // Refresh the housekeeping rooms list after successful assignment
            dispatch(fetchAllhousekeepingrooms());

            // Close the modal
            handleAssignWorkerClose();
        } catch (error) {
            console.error('Failed to assign worker:', error);
            // Error is already handled in the slice with setAlert
        }
    };

    const handleAssignWorkerClick = (housekeeping) => {
        setSelectedHousekeeping(housekeeping);
        // Pre-select current worker if exists
        const currentWorker = housekeepingStaff.find(staff => staff.name === housekeeping.name);
        setSelectedWorker(currentWorker ? { name: currentWorker.name, id: currentWorker._id } : { name: '', id: '' });
        setIsAssignWorkerModalOpen(true);
    };

    const workerDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (workerDropdownRef.current && !workerDropdownRef.current.contains(event.target)) {
                setIsWorkerDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Pagination state for API calls
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // UI state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showColumnDropdown, setShowColumnDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [visibleColumns, setVisibleColumns] = useState({
        No: true,
        workerName: true,
        date: true,
        // checkOut: true,
        status: true,
        roomType: true,
        roomNo: true,
        // documents: true,
        actions: true
    });

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to first page on search
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch bookings with pagination parameters
    useEffect(() => {
        const params = {
            page,
            limit,
        };

        // Add search parameter if exists
        if (debouncedSearch) {
            params.search = debouncedSearch;
        }

        dispatch(fetchAllhousekeepingrooms(params));
    }, [dispatch, page, limit, debouncedSearch]);

    // Transform Redux data to local state (without sorting/slicing - backend handles this)
    useEffect(() => {
        if (items && items.length > 0) {
            const formattedData = items?.map((item, index) => ({
                id: item._id || item.id || index,
                name: item.cleanassign || 'N/A',
                status: item.cleanStatus || 'Pending',
                roomNo: item.roomNumber || 'N/A',
                roomType: item.roomType?.roomType || 'N/A',
                createdAt: item.createdAt || item.reservation?.checkInDate,
                rawData: item // Keep raw data for other operations
            }));
            console.log('formattedData', formattedData);
            setHousekeepingRooms(formattedData);
        } else {
            setHousekeepingRooms([]);
        }
    }, [items]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Paid':
                return 'border border-green-500 text-green-600 bg-green-50';
            case 'Unpaid':
                return 'border border-red-500 text-red-600 bg-red-50';
            case 'Pending':
                return 'border border-yellow-500 text-yellow-600 bg-yellow-50';
            default:
                return 'border border-gray-500 text-gray-600 bg-gray-50';
        }
    };

    const toggleColumn = (column) => {
        setVisibleColumns(prev => ({
            ...prev,
            [column]: !prev[column]
        }));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowColumnDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRefresh = () => {
        setSearchTerm("");
        setDebouncedSearch("");
        setPage(1);
        setCurrentPage(1);
        dispatch(fetchBookings({ page: 1, limit }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleDownloadExcel = () => {
        try {
            if (housekeepingRooms.length === 0) {
                dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
                return;
            }
            // Prepare data for Excel
            const excelData = housekeepingRooms?.map((bookingItem, index) => {
                const row = {};

                if (visibleColumns.No) {
                    row['No.'] = ((page - 1) * limit) + index + 1;
                }
                if (visibleColumns.workerName) {
                    row['Worker Name'] = bookingItem.workerName || '';
                }
                if (visibleColumns.status) {
                    row['Status'] = bookingItem.status || '';
                }
                if (visibleColumns.roomType) {
                    row['Room Type'] = bookingItem.roomType || '';
                }
                return row;
            });

            // Create a new workbook
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

            // Auto-size columns
            const maxWidth = 20;
            const wscols = Object.keys(excelData[0] || {})?.map(() => ({ wch: maxWidth }));
            worksheet['!cols'] = wscols;

            // Generate file name with current date
            const date = new Date();
            const fileName = `Bookings_List_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;

            // Download the file
            XLSX.writeFile(workbook, fileName);
            dispatch(setAlert({ text: "Export completed..!", color: 'success' }));
        } catch (error) {
            dispatch(setAlert({ text: "Export failed..!", color: 'error' }));
        }
    };

    const handleViewClick = (bookingItem) => {
        setSelectedItem(bookingItem);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleDeleteClick = (bookingItem) => {
        setItemToDelete(bookingItem);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteModalClose = () => {
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    // Pagination handlers
    const handlePageChange = (newPage) => {
        setPage(newPage);
        setCurrentPage(newPage);
    };

    const handleItemsPerPageChange = (newLimit) => {
        setLimit(newLimit);
        setItemsPerPage(newLimit);
        setPage(1);
        setCurrentPage(1);
    };

    // Use backend pagination data
    const totalPages = reduxTotalPages || 1;
    const startIndex = ((currentPage - 1) * itemsPerPage);
    const endIndex = Math.min(startIndex + itemsPerPage, totalCount || 0);
    const currentData = housekeepingRooms; // Already paginated from backend

    return (
        <>
            <div className='p-3 md:p-4 lg:p-5 bg-[#F0F3FB] h-full'>
                <p className='text-[20px] font-semibold text-black'>Housekeeping</p>
                <div className="w-full mt-3 md:mt-5">
                    <div className="bg-white rounded-lg shadow-md">
                        {/* Header */}
                        <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
                            <div className='flex gap-2 md:gap-5 sm:justify-between'>
                                <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">Housekeeping</p>

                                {/* Search Bar */}
                                <div className="relative max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div>
                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 justify-end mt-2">
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            // onClick={() => navigate('/staff/addstaff', { state: { mode: 'add' } })}
                                            className="p-2 text-[#4CAF50] hover:text-[#4CAF50] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors"
                                            title="Add New Booking"
                                        >
                                            <FiPlusCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                                            className="p-2 text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors"
                                            title="Show/Hide Columns"
                                        >
                                            <Filter size={20} />
                                        </button>

                                        {showColumnDropdown && (
                                            <div className="absolute right-0 top-full mt-2 w-56 md:w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999]">
                                                <div className="px-3 py-2 border-b border-gray-200">
                                                    <h3 className="text-sm font-semibold text-gray-700">Show/Hide Column</h3>
                                                </div>
                                                <div className="max-h-64 overflow-y-auto">
                                                    {Object.keys(visibleColumns)?.map((column) => (
                                                        <label
                                                            key={column}
                                                            className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={visibleColumns[column]}
                                                                onChange={() => toggleColumn(column)}
                                                                className="w-4 h-4 text-[#876B56] bg-gray-100 border-gray-300 rounded focus:ring-[#B79982] focus:ring-2"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700 capitalize">
                                                                {column === 'roomType' ? 'Room Type' : column}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Refresh" onClick={handleRefresh}>
                                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                                    </button>
                                    <button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors" title="Download" onClick={handleDownloadExcel}>
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full whitespace-nowrap">
                                <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] sticky top-0 z-10">
                                    <tr>
                                        {visibleColumns.No && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">No.</th>
                                        )}
                                        {visibleColumns.workerName && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Name</th>
                                        )}
                                        {visibleColumns.status && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Status</th>
                                        )}
                                        {visibleColumns.roomNo && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Room No.</th>
                                        )}
                                        {visibleColumns.roomType && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Room Type</th>
                                        )}
                                        {visibleColumns.actions && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <RefreshCw className="w-12 h-12 mb-4 text-[#B79982] animate-spin" />
                                                    <p className="text-lg font-medium">Loading bookings...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : currentData.length > 0 ? (
                                        currentData?.map((housekeeping, index) => (
                                            <tr
                                                key={housekeeping.id}
                                                className="transition-all duration-200"
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'linear-gradient(to right, rgba(247, 223, 156, 0.1), rgba(227, 199, 138, 0.1))';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                {visibleColumns.No && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                        {startIndex + index + 1}
                                                    </td>
                                                )}
                                                {visibleColumns.workerName && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-semibold text-[#755647]">{housekeeping.name}</span>
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.status && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <span className={`inline-flex items-center justify-center w-24 h-8 rounded-xl text-xs font-semibold ${getStatusStyle(housekeeping.status)}`}>
                                                            {housekeeping.status}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.roomNo && (
                                                    <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-sm" style={{ color: '#876B56' }}>{housekeeping.roomNo}</td>
                                                )}
                                                {visibleColumns.roomType && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                        <div className="flex items-center">
                                                            <span className="inline-flex items-center justify-center w-24 h-8 rounded-md text-xs font-semibold border" style={{
                                                                backgroundColor: 'rgba(183, 153, 130, 0.2)',
                                                                color: '#755647',
                                                                borderColor: 'rgba(183, 153, 130, 0.3)'
                                                            }}>
                                                                {housekeeping.roomType?.split(' ')[0] || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.actions && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <div className="flex items-center gap-2">
                                                            <div onClick={() => handleViewClick(housekeeping)} className="cursor-pointer">
                                                                <IoEyeSharp className='text-[18px] text-quaternary hover:text-[#876B56] transition-colors' />
                                                            </div>
                                                            <button
                                                                onClick={() => handleAssignWorkerClick(housekeeping)}
                                                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Assign Worker"
                                                            >
                                                                <FiEdit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(housekeeping)}
                                                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete Booking"
                                                            >
                                                                <RiDeleteBinLine size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                    <p className="text-lg font-medium">No bookings found</p>
                                                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-3 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                            <div className="flex items-center gap-1 sm:gap-3 md600:gap-2 md:gap-3">
                                <span className="text-sm text-gray-600">Items per page:</span>
                                <div className="relative">
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B79982] appearance-none bg-white cursor-pointer"
                                        disabled={loading}
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-3 md600:gap-2 md:gap-3">
                                <span className="text-sm text-gray-600">
                                    {totalCount > 0
                                        ? `${startIndex + 1} - ${Math.min(endIndex, totalCount)} of ${totalCount}`
                                        : '0 - 0 of 0'}
                                </span>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1 || loading}
                                        className="p-2 text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Previous Page"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <span className="px-3 py-1 text-sm font-medium text-gray-700">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages || loading}
                                        className="p-2 text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Next Page"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* View Booking Modal */}
                {isModalOpen && selectedItem && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div
                            className="fixed inset-0 transition-opacity"
                            style={{ backgroundColor: '#000000bf' }}
                            onClick={handleCloseModal}
                        ></div>

                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-md bg-white text-left shadow-xl transition-all sm:my-8 sm:w-[30%] sm:max-w-xl border-2" style={{
                                borderColor: '#E3C78A',
                                boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
                            }}>
                                {/* Modal Header */}
                                <div className="px-4 py-4 sm:p-" style={{
                                    background: 'linear-gradient(135deg, rgba(247, 223, 156, 0.1) 0%, rgba(227, 199, 138, 0.1) 100%)'
                                }}>
                                    <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: '#E3C78A' }}>
                                        <h3 className="text-lg font-semibold" style={{ color: '#755647' }}>Booking Details</h3>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="inline-flex items-center justify-center p-1 rounded-lg transition-colors"
                                            style={{ color: '#876B56' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.3)';
                                                e.currentTarget.style.color = '#755647';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = '#876B56';
                                            }}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3 p-2 rounded-lg transition-colors" style={{ backgroundColor: 'transparent' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.2)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <span className="font-semibold min-w-[120px]" style={{ color: '#755647' }}>Worker Name:</span>
                                            <span style={{ color: '#876B56' }}>{selectedItem.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-2 rounded-lg transition-colors" style={{ backgroundColor: 'transparent' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.2)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <span className="font-semibold min-w-[120px]" style={{ color: '#755647' }}>Room Type:</span>
                                            <span style={{ color: '#876B56' }}>{selectedItem.roomType}</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-2 rounded-lg transition-colors" style={{ backgroundColor: 'transparent' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.2)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <span className="font-semibold min-w-[120px]" style={{ color: '#755647' }}>Payment Status:</span>
                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold ${getStatusStyle(selectedItem.status)}`}>
                                                {selectedItem.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Assign Worker Modal */}
                {isAssignWorkerModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div
                            className="fixed inset-0 transition-opacity"
                            style={{ backgroundColor: '#000000bf' }}
                            onClick={handleAssignWorkerClose}
                        ></div>

                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <div className="relative transform h-[300px] overflow-hidden rounded-md bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border-2" style={{
                                borderColor: '#E3C78A',
                                boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
                            }}>
                                {/* Modal Header */}
                                <div className="px-4 py-4 sm:p-6" style={{
                                    background: 'linear-gradient(135deg, rgba(247, 223, 156, 0.1) 0%, rgba(227, 199, 138, 0.1) 100%)'
                                }}>
                                    <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: '#E3C78A' }}>
                                        <h3 className="text-lg font-semibold" style={{ color: '#755647' }}>Assign Worker</h3>
                                        <button
                                            type="button"
                                            onClick={handleAssignWorkerClose}
                                            className="inline-flex items-center justify-center p-1 rounded-lg transition-colors"
                                            style={{ color: '#876B56' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.3)';
                                                e.currentTarget.style.color = '#755647';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = '#876B56';
                                            }}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Form Content */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2" style={{ color: '#755647' }}>
                                                Room Number: {selectedHousekeeping?.roomNo}
                                            </label>
                                        </div>

                                        <div className="relative" ref={workerDropdownRef}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Worker <span className="text-red-500">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setIsWorkerDropdownOpen(!isWorkerDropdownOpen)}
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982]"
                                            >
                                                <span className={selectedWorker.name ? 'text-gray-800' : 'text-gray-400'}>
                                                    {selectedWorker.name || 'Select a worker'}
                                                </span>
                                                <ChevronDown size={18} className="text-gray-600" />
                                            </button>
                                            {isWorkerDropdownOpen && (
                                                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg mt-1 max-h-24 overflow-y-auto">
                                                    <div
                                                        onClick={() => {
                                                            setSelectedWorker({ name: '', id: '' });
                                                            setIsWorkerDropdownOpen(false);
                                                        }}
                                                        className="px-4 py-2 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-gray-400"
                                                    >
                                                        Select a worker
                                                    </div>
                                                    {housekeepingStaff?.map((staff) => (
                                                        <div
                                                            key={staff._id}
                                                            onClick={() => {
                                                                setSelectedWorker({ name: staff.name, id: staff._id });
                                                                setIsWorkerDropdownOpen(false);
                                                            }}
                                                            className="px-4 py-2 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                                                        >
                                                            {staff.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: '#E3C78A' }}>
                                            <button
                                                type="button"
                                                onClick={handleAssignWorkerClose}
                                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                style={{ color: '#876B56' }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleAssignWorkerSubmit}
                                                disabled={!selectedWorker.name || creating}
                                                className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{
                                                    backgroundColor: selectedWorker.name && !creating ? '#876B56' : '#ccc'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (selectedWorker.name && !creating) {
                                                        e.currentTarget.style.backgroundColor = '#755647';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (selectedWorker.name && !creating) {
                                                        e.currentTarget.style.backgroundColor = '#876B56';
                                                    }
                                                }}
                                            >
                                                {creating ? 'Assigning...' : 'Assign Worker'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40" onClick={handleDeleteModalClose}></div>
                        <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-semibold text-black">Delete Booking</h2>
                                <button className="text-gray-500 hover:text-gray-800" onClick={handleDeleteModalClose}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-700 mb-8 text-center">
                                Are you sure you want to delete the booking for{' '}
                                <span className="font-semibold">{itemToDelete?.name || 'this guest'}</span>?
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleDeleteModalClose}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    // onClick={handleDeleteConfirm}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </>
    )
}

export default AllHouseKeeping