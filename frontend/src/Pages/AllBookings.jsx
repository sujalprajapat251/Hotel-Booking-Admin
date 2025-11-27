import React, { useEffect, useRef, useState } from 'react';
import { fetchBookings } from '../Redux/Slice/bookingSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { FaEllipsisV } from 'react-icons/fa';
import { HiOutlineDocumentChartBar } from 'react-icons/hi2';
import { FiEdit, FiPlusCircle } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { ChevronLeft, ChevronRight, Download, Filter, Phone, RefreshCw, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { setAlert } from '../Redux/Slice/alert.slice';
import { IoEyeSharp } from 'react-icons/io5';


const AllBookings = () => {

    const dispatch = useDispatch();
    const [booking, setBooking] = useState([]);

    // Get data from Redux store including pagination
    const {
        items,
        totalCount,
        currentPage: reduxCurrentPage,
        totalPages: reduxTotalPages,
        loading
    } = useSelector((state) => state.booking);

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
        name: true,
        RoomNumber: true,
        checkIn: true,
        checkOut: true,
        status: true,
        phone: true,
        roomType: true,
        documents: true,
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

        dispatch(fetchBookings(params));
    }, [dispatch, page, limit, debouncedSearch]);

    // Transform Redux data to local state (without sorting/slicing - backend handles this)
    useEffect(() => {
        if (items && items.length > 0) {
            const formattedBookings = items.map((item, index) => ({
                id: item._id || item.id || index,
                name: item.guest?.fullName || 'N/A',
                roomNumber: item.room?.roomNumber || 'N/A',
                checkIn: item.reservation?.checkInDate?.slice(0, 10) || 'N/A',
                checkOut: item.reservation?.checkOutDate?.slice(0, 10) || 'N/A',
                status: item.payment?.status || 'Pending',
                phone: item.guest?.phone || 'N/A',
                roomType: item.room?.roomType?.roomType || 'N/A',
                createdAt: item.createdAt || item.reservation?.checkInDate,
                rawData: item 
            }));
            console.log('formattedBookings', formattedBookings);
            setBooking(formattedBookings);
        } else {
            setBooking([]);
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
            if (booking.length === 0) {
                dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
                return;
            }
            // Prepare data for Excel
            const excelData = booking.map((bookingItem, index) => {
                const row = {};

                if (visibleColumns.No) {
                    row['No.'] = ((page - 1) * limit) + index + 1;
                }
                if (visibleColumns.name) {
                    row['Name'] = bookingItem.name || '';
                }
                if (visibleColumns.checkIn) {
                    row['Check In'] = bookingItem.checkIn || '';
                }
                if (visibleColumns.checkOut) {
                    row['Check Out'] = bookingItem.checkOut || '';
                }
                if (visibleColumns.status) {
                    row['Status'] = bookingItem.status || '';
                }
                if (visibleColumns.phone) {
                    row['Phone'] = bookingItem.phone || '';
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
            const wscols = Object.keys(excelData[0] || {}).map(() => ({ wch: maxWidth }));
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
    const currentData = booking; // Already paginated from backend

    return (
        <>
            <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
                <section className="py-5">
                    <h1 className="text-2xl font-semibold text-black">All Bookings</h1>
                </section>

                <div className="w-full">
                    <div className="bg-white rounded-lg shadow-md">
                        {/* Header */}
                        <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
                            <div className='flex gap-2 md:gap-5 sm:justify-between'>
                                <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">All Bookings</p>

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
                                                    {Object.keys(visibleColumns).map((column) => (
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
                                        {visibleColumns.name && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Name</th>
                                        )}
                                        {visibleColumns.RoomNumber && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Room Number</th>
                                        )}
                                        {visibleColumns.checkIn && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Check In</th>
                                        )}
                                        {visibleColumns.checkOut && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Check Out</th>
                                        )}
                                        {visibleColumns.status && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Status</th>
                                        )}
                                        {visibleColumns.phone && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Phone</th>
                                        )}
                                        {visibleColumns.roomType && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Room Type</th>
                                        )}
                                        {visibleColumns.documents && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Documents</th>
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
                                        currentData.map((bookingItem, index) => (
                                            <tr
                                                key={bookingItem.id}
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
                                                {visibleColumns.name && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-semibold text-[#755647]">{bookingItem.name}</span>
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.RoomNumber && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                        {bookingItem.roomNumber || ''}
                                                    </td>
                                                )}
                                                {visibleColumns.checkIn && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                        {bookingItem.checkIn ? formatDate(bookingItem.checkIn) : ''}
                                                    </td>
                                                )}
                                                {visibleColumns.checkOut && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                        {bookingItem.checkOut ? formatDate(bookingItem.checkOut) : ''}
                                                    </td>
                                                )}
                                                {visibleColumns.status && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <span className={`inline-flex items-center justify-center w-24 h-8 rounded-xl text-xs font-semibold ${getStatusStyle(bookingItem.status)}`}>
                                                            {bookingItem.status}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.phone && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Phone size={16} className='text-green-600' />{bookingItem.phone}
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.roomType && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                        <div className="flex items-center">
                                                            <span className="inline-flex items-center justify-center w-24 h-8 rounded-md text-xs font-semibold border" style={{
                                                                backgroundColor: 'rgba(183, 153, 130, 0.2)',
                                                                color: '#755647',
                                                                borderColor: 'rgba(183, 153, 130, 0.3)'
                                                            }}>
                                                                {bookingItem.roomType?.split(' ')[0] || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.documents && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                                            <HiOutlineDocumentChartBar size={22} className='text-[#EC5C09] hover:text-[#EC0927] transition-colors cursor-pointer' />
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.actions && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <div className="flex items-center gap-2">
                                                            <div onClick={() => handleViewClick(bookingItem)} className="cursor-pointer">
                                                                <IoEyeSharp className='text-[18px] text-quaternary hover:text-[#876B56] transition-colors' />
                                                            </div>
                                                            <button
                                                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit Booking"
                                                            >
                                                                <FiEdit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(bookingItem)}
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
                            <div className="relative transform overflow-hidden rounded-md bg-white text-left shadow-xl transition-all sm:my-8 sm:w-[35%] sm:max-w-2xl border-2" style={{
                                borderColor: '#E3C78A',
                                boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
                            }}>
                                {/* Modal Header */}
                                <div className="px-4 py-4 sm:p-6" style={{
                                    background: 'linear-gradient(135deg, rgba(247, 223, 156, 0.08) 0%, rgba(227, 199, 138, 0.09) 100%)'
                                }}>
                                    <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: '#E3C78A' }}>
                                        <h3 className="text-xl font-bold" style={{ color: '#755647' }}>Booking Details</h3>
                                        <button type="button" onClick={handleCloseModal}
                                            className="inline-flex items-center justify-center p-1 rounded-lg transition-colors"
                                            style={{ color: '#876B56' }}
                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(247,223,156,0.3)'; e.currentTarget.style.color = '#755647'; }}
                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#876B56'; }}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    {/* Group guest, room, booking, and payment info */}
                                    <div className="space-y-4">
                                        {/* Guest Info */}
                                        <div>
                                            <h4 className="font-semibold text-lg text-quaternary mb-2">Guest Information</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div><span className="font-semibold">Name:</span> <span>{selectedItem.name}</span></div>
                                                {selectedItem.phone && <div><span className="font-semibold">Phone:</span> <span>{selectedItem.phone}</span></div>}
                                                {selectedItem.rawData?.guest?.email && <div><span className="font-semibold">Email:</span> <span>{selectedItem.rawData.guest.email}</span></div>}
                                                {selectedItem.rawData?.guest?.idNumber && <div><span className="font-semibold">ID Number:</span> <span>{selectedItem.rawData.guest.idNumber}</span></div>}
                                                {selectedItem.rawData?.guest?.nationality && <div><span className="font-semibold">Nationality:</span> <span>{selectedItem.rawData.guest.nationality}</span></div>}
                                            </div>
                                        </div>
                                        {/* Booking Info */}
                                        <div>
                                            <h4 className="font-semibold text-lg text-quaternary mb-2">Booking Info</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div><span className="font-semibold">Check In:</span> <span>{selectedItem.checkIn ? formatDate(selectedItem.checkIn) : 'N/A'}</span></div>
                                                <div><span className="font-semibold">Check Out:</span> <span>{selectedItem.checkOut ? formatDate(selectedItem.checkOut) : 'N/A'}</span></div>
                                                {selectedItem.createdAt && <div><span className="font-semibold">Created At:</span> <span>{formatDate(selectedItem.createdAt)}</span></div>}
                                            </div>
                                        </div>
                                        {/* Room Info */}
                                        <div>
                                            <h4 className="font-semibold text-lg text-quaternary mb-2">Room Details</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {selectedItem.RoomNumber && <div><span className="font-semibold">Room:</span> <span>{selectedItem.RoomNumber}</span></div>}
                                                {selectedItem.roomType && <div><span className="font-semibold">Type:</span> <span>{selectedItem.roomType}</span></div>}
                                                {selectedItem.rawData?.room?.floor && <div><span className="font-semibold">Floor:</span> <span>{selectedItem.rawData.room.floor}</span></div>}
                                                {selectedItem.rawData?.room?.bedType && <div><span className="font-semibold">Bed Type:</span> <span>{selectedItem.rawData.room.bedType}</span></div>}
                                            </div>
                                        </div>
                                        {/* Payment Status & Actions */}
                                        <div>
                                            <h4 className="font-semibold text-lg text-quaternary mb-2">Payment Info</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div><span className="font-semibold">Status:</span> <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${getStatusStyle(selectedItem.status)}`}>{selectedItem.status}</span></div>
                                                {selectedItem.totalAmount && <div><span className="font-semibold">Total Paid:</span> <span>{selectedItem.totalAmount}</span></div>}
                                                {selectedItem.paymentMethod && <div><span className="font-semibold">Method:</span> <span>{selectedItem.paymentMethod}</span></div>}
                                            </div>
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
                                        {selectedItem.rawData?.guest?.email && (
                                            <div className="flex items-center gap-3 p-2 rounded-lg transition-colors" style={{ backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.2)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span className="font-semibold min-w-[120px]" style={{ color: '#755647' }}>Email:</span>
                                                <span style={{ color: '#876B56' }}>{selectedItem.rawData.guest.email}</span>
                                            </div>
                                        )}
                                        {selectedItem.rawData?.guest?.idNumber && (
                                            <div className="flex items-center gap-3 p-2 rounded-lg transition-colors" style={{ backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.2)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span className="font-semibold min-w-[120px]" style={{ color: '#755647' }}>ID Number:</span>
                                                <span style={{ color: '#876B56' }}>{selectedItem.rawData.guest.idNumber}</span>
                                            </div>
                                        )}
                                        {selectedItem.rawData?.guest?.nationality && (
                                            <div className="flex items-center gap-3 p-2 rounded-lg transition-colors" style={{ backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.2)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span className="font-semibold min-w-[120px]" style={{ color: '#755647' }}>Nationality:</span>
                                                <span style={{ color: '#876B56' }}>{selectedItem.rawData.guest.nationality}</span>
                                            </div>
                                        )}
                                        {selectedItem.rawData?.reservation?.bookingReference && (
                                            <div className="flex items-center gap-3 p-2 rounded-lg transition-colors" style={{ backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.2)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span className="font-semibold min-w-[120px]" style={{ color: '#755647' }}>Booking Ref:</span>
                                                <span style={{ color: '#876B56' }}>{selectedItem.rawData.reservation.bookingReference}</span>
                                            </div>
                                        )}
                                        {selectedItem.rawData?.room?.roomNumber && (
                                            <div className="flex items-center gap-3 p-2 rounded-lg transition-colors" style={{ backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.2)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span className="font-semibold min-w-[120px]" style={{ color: '#755647' }}>Room Number:</span>
                                                <span style={{ color: '#876B56' }}>{selectedItem.rawData.room.roomNumber}</span>
                                            </div>
                                        )}
                                        {selectedItem.rawData?.reservation?.occupancy && (
                                            <div className="flex items-center gap-3 p-2 rounded-lg transition-colors" style={{ backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.2)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span className="font-semibold min-w-[120px]" style={{ color: '#755647' }}>Occupancy:</span>
                                                <span style={{ color: '#876B56' }}>
                                                    Adults: {selectedItem.rawData.reservation.occupancy.adults || 0}, 
                                                    Children: {selectedItem.rawData.reservation.occupancy.children || 0}
                                                </span>
                                            </div>
                                        )}
                                        {selectedItem.rawData?.payment?.totalAmount && (
                                            <div className="flex items-center gap-3 p-2 rounded-lg transition-colors" style={{ backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.2)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span className="font-semibold min-w-[120px]" style={{ color: '#755647' }}>Total Amount:</span>
                                                <span style={{ color: '#876B56' }}>
                                                    {selectedItem.rawData.payment.currency || 'USD'} {selectedItem.rawData.payment.totalAmount}
                                                </span>
                                            </div>
                                        )}
                                        {selectedItem.rawData?.payment?.method && (
                                            <div className="flex items-center gap-3 p-2 rounded-lg transition-colors" style={{ backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.2)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span className="font-semibold min-w-[120px]" style={{ color: '#755647' }}>Payment Method:</span>
                                                <span style={{ color: '#876B56' }}>{selectedItem.rawData.payment.method}</span>
                                            </div>
                                        )}
                                        {selectedItem.rawData?.reservation?.specialRequests && (
                                            <div className="flex items-start gap-3 p-2 rounded-lg transition-colors" style={{ backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.2)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span className="font-semibold min-w-[120px]" style={{ color: '#755647' }}>Special Requests:</span>
                                                <span style={{ color: '#876B56' }}>{selectedItem.rawData.reservation.specialRequests}</span>
                                            </div>
                                        )}
                                        {selectedItem.rawData?.notes && (
                                            <div className="flex items-start gap-3 p-2 rounded-lg transition-colors" style={{ backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.2)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <span className="font-semibold min-w-[120px]" style={{ color: '#755647' }}>Notes:</span>
                                                <span style={{ color: '#876B56' }}>{selectedItem.rawData.notes}</span>
                                            </div>
                                        )}
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
            </div>
        </>
    )
}

export default AllBookings