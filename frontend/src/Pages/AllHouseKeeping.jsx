import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { fetchBookings } from '../Redux/Slice/bookingSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { FaEllipsisV } from 'react-icons/fa';
import { HiOutlineDocumentChartBar } from 'react-icons/hi2';
import { FiCheckCircle, FiEdit, FiPlusCircle } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { ChevronDown, ChevronLeft, ChevronRight, Download, Filter, Phone, RefreshCw, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { setAlert } from '../Redux/Slice/alert.slice';
import { IoEyeSharp } from 'react-icons/io5';
import { approveCleaningRoom, assignWorkerToRoom, fetchAllhousekeepingrooms, fetchFreeWorker } from '../Redux/Slice/housekeepingSlice.js';
import { getAllStaff } from '../Redux/Slice/staff.slice.js';
import axios from 'axios';
import { SOCKET_URL } from '../Utils/baseUrl.js';
import { io } from 'socket.io-client';

const AllHouseKeeping = () => {
    const dispatch = useDispatch();
    const { creating } = useSelector((state) => state.housekeeping);

    const [housekeepingRooms, setHousekeepingRooms] = useState([]);

    const {
        items,
        totalCount,
        currentPage: reduxCurrentPage,
        totalPages: reduxTotalPages,
        loading
    } = useSelector((state) => state.housekeeping);

    const [housekeepingStaff, setHousekeepingStaff] = useState([]);

    const [isWorkerDropdownOpen, setIsWorkerDropdownOpen] = useState(false);
    const [isAssignWorkerModalOpen, setIsAssignWorkerModalOpen] = useState(false);
    const [selectedHousekeeping, setSelectedHousekeeping] = useState(null);
    const [roomId, setRoomId] = useState('');
    const [selectedWorker, setSelectedWorker] = useState({ name: '', id: '' });

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

    const [visibleColumns, setVisibleColumns] = useState({
        No: true,
        workerName: true,
        status: true,
        roomNo: true,
        roomType: true,
        actions: true
    });

    const workerDropdownRef = useRef(null);

    const { freeWorkers } = useSelector((state) => state.housekeeping);

    // Memoize filtered housekeeping staff
    const filteredHousekeepingStaff = useMemo(() => {
        if (freeWorkers && freeWorkers.length > 0) {
            return freeWorkers.filter(
                (member) => member.department?.name === "Housekeeping"
            );
        }
        return [];
    }, [freeWorkers]);

    useEffect(() => {
        setHousekeepingStaff(filteredHousekeepingStaff);
    }, [filteredHousekeepingStaff]);

    // Memoize formatted housekeeping rooms data
    const formattedHousekeepingRooms = useMemo(() => {
        if (items && items.length > 0) {
            return items.map((item, index) => ({
                id: item._id || item.id || index,
                name: item.cleanassign?.name || (typeof item.cleanassign === 'string' ? item.cleanassign : 'N/A'),
                status: item.cleanStatus || 'Pending',
                roomNo: item.roomNumber || 'N/A',
                roomType: item.roomType?.roomType || 'N/A',
                createdAt: item.createdAt || item.reservation?.checkInDate,
                rawData: item
            }));
        }
        return [];
    }, [items]);

    useEffect(() => {
        setHousekeepingRooms(formattedHousekeepingRooms);
    }, [formattedHousekeepingRooms]);

    // Memoize getStatusStyle function
    const getStatusStyle = useCallback((status) => {
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
    }, []);

    // Memoize formatDate function
    const formatDate = useCallback((dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }, []);

    // Memoize toIsoDate function
    const toIsoDate = useCallback((dateInput) => {
        if (!dateInput) return '';
        const date = new Date(dateInput);
        if (Number.isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    }, []);

    // Memoize filtered bookings
    const filteredBookings = useMemo(() => {
        return housekeepingRooms.filter((item) => {
            const searchLower = searchTerm.trim().toLowerCase();
            if (!searchLower) return true;

            return (
                item.name?.toLowerCase().includes(searchLower) ||
                item.roomType?.toLowerCase().includes(searchLower) ||
                item.status?.toLowerCase().includes(searchLower) ||
                item.roomNo?.toString().includes(searchLower)
            );
        });
    }, [housekeepingRooms, searchTerm]);

    // Memoize pagination data
    const paginationData = useMemo(() => {
        const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentData = filteredBookings.slice(startIndex, endIndex);

        return { totalPages, startIndex, endIndex, currentData };
    }, [filteredBookings, currentPage, itemsPerPage]);

    const { totalPages, startIndex, endIndex, currentData } = paginationData;

    // Memoize visible columns count
    const visibleColumnsCount = useMemo(() => {
        return Object.values(visibleColumns).filter(Boolean).length;
    }, [visibleColumns]);

    // Memoized handlers with useCallback
    const handleAssignWorkerClose = useCallback(() => {
        setIsAssignWorkerModalOpen(false);
        setSelectedHousekeeping(null);
        setSelectedWorker({ name: '', id: '' });
        setIsWorkerDropdownOpen(false);
    }, []);

    const handleAssignWorkerSubmit = useCallback(async () => {
        const roomId = selectedHousekeeping?.id;
        const workerId = selectedWorker.id;

        try {
            await dispatch(assignWorkerToRoom({
                roomId,
                workerId
            })).unwrap();
            dispatch(fetchFreeWorker());
            dispatch(fetchAllhousekeepingrooms());
            dispatch(fetchFreeWorker());

            handleAssignWorkerClose();
        } catch (error) {
            console.error('Failed to assign worker:', error);
        }
    }, [selectedHousekeeping, selectedWorker, dispatch, handleAssignWorkerClose]);

    const handleAssignWorkerClick = useCallback((housekeeping) => {
        // Fetch free workers when edit button is clicked
        dispatch(fetchFreeWorker());
        
        setSelectedHousekeeping(housekeeping);

        const currentWorker = housekeepingStaff.find(staff => staff.name === housekeeping.name);
        setSelectedWorker(currentWorker ? { name: currentWorker.name, id: currentWorker._id } : { name: '', id: '' });
        setIsAssignWorkerModalOpen(true);
    }, [housekeepingStaff, dispatch]);

    const toggleColumn = useCallback((column) => {
        setVisibleColumns(prev => ({
            ...prev,
            [column]: !prev[column]
        }));
    }, []);

    const handleRefresh = useCallback(() => {
        setSearchTerm("");
        setDebouncedSearch("");
        setPage(1);
        setCurrentPage(1);
        dispatch(fetchAllhousekeepingrooms({ page: 1, limit }));
    }, [dispatch, limit]);

    const handleDownloadExcel = useCallback(() => {
        try {
            if (housekeepingRooms.length === 0) {
                dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
                return;
            }

            const excelData = housekeepingRooms.map((bookingItem, index) => {
                const row = {};

                if (visibleColumns.No) {
                    row['No.'] = ((page - 1) * limit) + index + 1;
                }
                if (visibleColumns.workerName) {
                    row['Worker Name'] = bookingItem.name || '';
                }
                if (visibleColumns.status) {
                    row['Status'] = bookingItem.status || '';
                }
                if (visibleColumns.roomType) {
                    row['Room Type'] = bookingItem.roomType || '';
                }
                return row;
            });

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

            const maxWidth = 20;
            const wscols = Object.keys(excelData[0] || {}).map(() => ({ wch: maxWidth }));
            worksheet['!cols'] = wscols;

            const date = new Date();
            const fileName = `Bookings_List_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;

            XLSX.writeFile(workbook, fileName);
            dispatch(setAlert({ text: "Export completed..!", color: 'success' }));
        } catch (error) {
            dispatch(setAlert({ text: "Export failed..!", color: 'error' }));
        }
    }, [housekeepingRooms, visibleColumns, page, limit, dispatch]);

    const handleViewClick = useCallback((bookingItem) => {
        setSelectedItem(bookingItem);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedItem(null);
    }, []);

    const handlePageChange = useCallback((newPage) => {
        setPage(newPage);
        setCurrentPage(newPage);
    }, []);

    const handleItemsPerPageChange = useCallback((newLimit) => {
        setLimit(newLimit);
        setItemsPerPage(newLimit);
        setPage(1);
        setCurrentPage(1);
    }, []);

    const handleApprove = useCallback((id) => {
        dispatch(approveCleaningRoom(id));

        setTimeout(() => {
            dispatch(fetchAllhousekeepingrooms());
        }, 3000);
    }, [dispatch]);

    const handlePreviousPage = useCallback(() => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    }, []);

    const handleNextPage = useCallback(() => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    }, [totalPages]);

    const handleItemsPerPageSelect = useCallback((e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    }, []);

    const handleWorkerSelect = useCallback((staff) => {
        setSelectedWorker({ name: staff?.name || '', id: staff?._id || staff?.id || '' });
        setIsWorkerDropdownOpen(false);
    }, []);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
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

        if (debouncedSearch) {
            params.search = debouncedSearch;
        }

        dispatch(fetchAllhousekeepingrooms(params));
    }, [dispatch, page, limit, debouncedSearch]);

    // Remove the default fetchFreeWorker call - only fetch when edit button is clicked
    // useEffect(() => {
    //     dispatch(fetchFreeWorker());
    // }, [dispatch]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const s = io(SOCKET_URL, { auth: { token, userId }, transports: ['websocket'], withCredentials: true });
        s.on('connect', () => { console.log('socket connected', s.id); });
        s.on('connect_error', (err) => { console.error('socket connect_error', err?.message || err); });
        s.on('error', (err) => { console.error('socket error', err?.message || err); });
        const refresh = () => {
            dispatch(fetchFreeWorker());
        };
        s.on('worker_asignee_changed', refresh);
        return () => {
            s.disconnect();
        };
    }, [dispatch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (workerDropdownRef.current && !workerDropdownRef.current.contains(event.target)) {
                setIsWorkerDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowColumnDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
                <section className="py-5">
                    <h1 className="text-2xl font-semibold text-black">Housekeeping</h1>
                </section>

                <div className="w-full">
                    <div className="bg-white rounded-lg shadow-md">
                        {/* Header */}
                        <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
                            <div className='flex gap-2 md:gap-5 sm:justify-between'>
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
                                            onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                                            className="p-2 text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors"
                                            title="Show/Hide Columns"
                                        >
                                            <Filter size={20} />
                                        </button>

                                        {showColumnDropdown && (
                                            <div className="absolute right-0 top-full mt-2 w-56 md:w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] sm:right-0 [@media(max-width:375px)]:left-1/4 [@media(max-width:375px)]:-translate-x-1/2">
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
                                            <td colSpan={visibleColumnsCount} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <RefreshCw className="w-12 h-12 mb-4 text-[#B79982] animate-spin" />
                                                    <p className="text-lg font-medium">Loading...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : currentData.length > 0 ? (
                                        currentData.map((housekeeping, index) => (
                                            <tr
                                                key={housekeeping.id}
                                                className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                                            >
                                                {visibleColumns.No && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                        {startIndex + index + 1}
                                                    </td>
                                                )}
                                                {visibleColumns.workerName && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-medium text-gray-800 capitalize">{housekeeping.name}</span>
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
                                                    <td className="x-5 py-2 md600:py-3 lg:px-6">{housekeeping.roomNo}</td>
                                                )}
                                                {visibleColumns.roomType && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700 capitalize">
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
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                        <div className="mv_table_action flex">
                                                            <div onClick={() => handleViewClick(housekeeping)}>
                                                                <IoEyeSharp className='text-[18px] text-quaternary' />
                                                            </div>
                                                            {housekeeping.status === "Completed" ? (
                                                                <div
                                                                    onClick={() => handleApprove(housekeeping?.id)}
                                                                    title="Approve"
                                                                >
                                                                    <FiCheckCircle className="text-[#43b82c] text-[18px]" />
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    onClick={() => handleAssignWorkerClick(housekeeping)}
                                                                >
                                                                    <FiEdit className="text-[#6777ef] text-[18px]" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={visibleColumnsCount} className="px-6 py-12 text-center">
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
                                        onChange={handleItemsPerPageSelect}
                                        className="px-1 sm:px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B79982] appearance-none bg-white cursor-pointer"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-3  md600:gap-2 md:gap-3">
                                <span className="text-sm text-gray-600">
                                    {startIndex + 1} - {Math.min(endIndex, housekeepingRooms.length)} of {housekeepingRooms.length}
                                </span>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                        className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="fixed inset-0 transition-opacity absolute bg-black/50"
                            onClick={handleCloseModal}
                        ></div>

                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-[4px] bg-white text-left shadow-xl transition-all sm:my-8 sm:w-[80%] sm:max-w-lg" >
                                {/* Modal Header */}
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6" >
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
                                        <h3 className="text-lg font-semibold text-black">Housekeeping Details</h3>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="inline-flex items-center justify-center p-1"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Worker Name:</span>
                                            <span className='text-gray-900 capitalize'>{selectedItem.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]" >Room Type:</span>
                                            <span className='text-gray-900 capitalize'>{selectedItem.roomType}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]" >Status:</span>
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
                            className="fixed inset-0 transition-opacity absolute bg-black/50"
                            onClick={handleAssignWorkerClose}
                        ></div>

                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-4">
                            <div className="relative transform overflow-visible rounded-md bg-white text-left shadow-xl transition-all sm:my-8  w-full sm:max-w-lg">
                                {/* Modal Header */}
                                <div className="px-4 py-4 sm:p-6">
                                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
                                        <h3 className="text-xl md:text-2xl font-bold text-black">Assign Worker</h3>
                                        <button onClick={handleAssignWorkerClose} className="text-gray-500 hover:text-gray-800">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Form Content */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-black">
                                                Room Number: {selectedHousekeeping?.roomNo || 'N/A'}
                                            </label>
                                        </div>

                                        <div className="relative" ref={workerDropdownRef}>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Select Worker <span className="text-red-500">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setIsWorkerDropdownOpen(!isWorkerDropdownOpen)}
                                                className="w-full flex items-center justify-between px-4 py-2 border bg-gray-100 rounded-[4px]"
                                            >
                                                <span className={`text-sm truncate ${selectedWorker.name ? 'text-gray-800' : 'text-gray-400'}`}>
                                                    {selectedWorker.name || 'Select Worker'}
                                                </span>
                                                <ChevronDown
                                                    size={18}
                                                    className={`text-gray-600 transition-transform duration-200 ${isWorkerDropdownOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                            {isWorkerDropdownOpen && (
                                                <div className="absolute top-full left-0 z-50 w-full bg-white border border-gray-200 shadow-lg max-h-48 overflow-y-auto rounded-[4px]">
                                                    {freeWorkers?.map((staff) => {
                                                        const isSelected = selectedWorker.id && (selectedWorker.id === (staff?._id || staff?.id));
                                                        return (
                                                            <div
                                                                key={staff?._id || staff?.id}
                                                                onClick={() => handleWorkerSelect(staff)}
                                                                className={`px-4 py-2 text-sm cursor-pointer transition-colors ${isSelected ? 'bg-[#F7DF9C] text-black font-medium' : 'text-black hover:bg-[#F7DF9C]'
                                                                    }`}
                                                            >
                                                                {staff?.name || 'Unnamed Staff'}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={handleAssignWorkerClose}
                                                className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] px-4 py-2 rounded"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleAssignWorkerSubmit}
                                                disabled={!selectedWorker.name || creating}
                                                className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div >
        </>
    )
}

export default AllHouseKeeping