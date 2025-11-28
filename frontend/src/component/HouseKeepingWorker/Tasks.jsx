import React, { useEffect, useRef, useState } from 'react';
import { fetchBookings } from '../../Redux/Slice/bookingSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { FaEllipsisV } from 'react-icons/fa';
import { HiOutlineDocumentChartBar } from 'react-icons/hi2';
import { FiEdit, FiPlusCircle } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { ChevronDown, ChevronLeft, ChevronRight, Download, Filter, Phone, RefreshCw, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { setAlert } from '../../Redux/Slice/alert.slice';
import { IoEyeSharp } from 'react-icons/io5';
import { assignWorkerToRoom, fetchAllhousekeepingrooms, fetchFreeWorker } from '../../Redux/Slice/housekeepingSlice.js';
import { getAllStaff } from '../../Redux/Slice/staff.slice.js';
import axios from 'axios';
import { completeTask, fetchWorkerTasks, startWork } from '../../Redux/Slice/WorkerSlice';

const Tasks = () => {

    const dispatch = useDispatch();
    const workerId = localStorage.getItem("userId");
    // console.log('');

    useEffect(() => {
        dispatch(fetchWorkerTasks({ workerId }));
    }, [dispatch]);

    const {
        items,
        totalCount,
        currentPage: reduxCurrentPage,
        totalPages: reduxTotalPages,
        loading
    } = useSelector((state) => state.worker);


    const [assigndTask, setAssigndTask] = useState([]);
    // console.log('assigndTask', assigndTask?.map((ele, id) => ele?.id));
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // UI state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showColumnDropdown, setShowColumnDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const [visibleColumns, setVisibleColumns] = useState({
        No: true,
        roomNo: true,
        roomType: true,
        status: true,
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

    useEffect(() => {
        if (items && items.length > 0) {
            const formattedData = items?.map((item, index) => ({
                id: item._id || item.id || index,
                name: item.cleanassign?.name || (typeof item.cleanassign === 'string' ? item.cleanassign : 'N/A'),
                status: item.status || 'Pending',
                roomNo: item.roomId?.roomNumber || 'N/A',
                roomType: item?.roomId.roomType?.roomType || 'N/A',
                // createdAt: item.createdAt || item.reservation?.checkInDate,
                // rawData: item // Keep raw data for other operations
            }));
            console.log('formattedData', formattedData);
            setAssigndTask(formattedData);

        } else {
            setAssigndTask([]);
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
            if (assigndTask.length === 0) {
                dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
                return;
            }
            // Prepare data for Excel
            const excelData = assigndTask?.map((bookingItem, index) => {
                const row = {};

                if (visibleColumns.No) {
                    row['No.'] = ((page - 1) * limit) + index + 1;
                }
                if (visibleColumns.roomNo) {
                    row['Room No'] = bookingItem.roomNo || '';
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

    const toIsoDate = (dateInput) => {
        if (!dateInput) return '';
        const date = new Date(dateInput);
        if (Number.isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    };

    // Filter bookings based on search term
    const filteredBookings = assigndTask.filter((item) => {
        const searchLower = searchTerm.trim().toLowerCase();
        if (!searchLower) return true;

        return (
            item.name?.toLowerCase().includes(searchLower) ||
            item.roomNo?.toString().includes(searchLower) ||
            item.roomType?.toLowerCase().includes(searchLower) ||
            item.status?.toLowerCase().includes(searchLower) 
            // formatDate(item.createdAt).toLowerCase().includes(searchLower)
        );
    });

    // Use backend pagination data
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredBookings.slice(startIndex, endIndex);
    console.log('currentData', currentData);

    return (
        <>
            <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
                <section className="py-5">
                    <h1 className="text-2xl font-semibold text-black">Assigned tasks</h1>
                </section>

                <div className="w-full">
                    <div className="bg-white rounded-lg shadow-md">
                        {/* Header */}
                        <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
                            <div className='flex gap-2 md:gap-5 sm:justify-between'>
                                <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">Tasks</p>

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
                                        currentData?.map((tasks, index) => (
                                            <tr
                                                key={tasks.id}
                                                className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                                            >
                                                {visibleColumns.No && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                        {startIndex + index + 1}
                                                    </td>
                                                )}
                                                {visibleColumns.status && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <span className={`inline-flex items-center justify-center w-24 h-8 rounded-xl text-xs font-semibold ${getStatusStyle(tasks.status)}`}>
                                                            {tasks.status}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.roomNo && (
                                                    <td className="x-5 py-2 md600:py-3 lg:px-6">{tasks.roomNo}</td>
                                                )}
                                                {visibleColumns.roomType && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                        <div className="flex items-center">
                                                            <span className="inline-flex items-center justify-center w-24 h-8 rounded-md text-xs font-semibold border" style={{
                                                                backgroundColor: 'rgba(183, 153, 130, 0.2)',
                                                                color: '#755647',
                                                                borderColor: 'rgba(183, 153, 130, 0.3)'
                                                            }}>
                                                                {tasks.roomType?.split(' ')[0] || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.actions && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                        <div className="mv_table_action flex">
                                                            {tasks.status === 'In-Progress' ?
                                                                (
                                                                    < button
                                                                        onClick={() => {
                                                                            dispatch(completeTask({ id: tasks.id }))  // Changed to pass object with 'id' key
                                                                                .unwrap()
                                                                                .then(() => {
                                                                                    // Refetch tasks after successful start
                                                                                    dispatch(fetchWorkerTasks({ workerId }));
                                                                                })
                                                                                .catch((error) => {
                                                                                    console.error('Failed to start task:', error);
                                                                                });
                                                                        }}
                                                                        className='px-5 py-2 text-white rounded-lg font-semibold bg-tertiary hover:text-tertiary hover:bg-primary'
                                                                        disabled={loading}
                                                                    >
                                                                        Complete Task
                                                                    </button>
                                                                ) : (
                                                                    < button
                                                                        onClick={() => {
                                                                            dispatch(startWork({ id: tasks.id }))  // Changed to pass object with 'id' key
                                                                                .unwrap()
                                                                                .then(() => {
                                                                                    // Refetch tasks after successful start
                                                                                    dispatch(fetchWorkerTasks({ workerId }));
                                                                                })
                                                                                .catch((error) => {
                                                                                    console.error('Failed to start task:', error);
                                                                                });
                                                                        }}
                                                                        className='px-5 py-2 text-white rounded-lg font-semibold bg-tertiary hover:text-tertiary hover:bg-primary'
                                                                        disabled={loading}
                                                                    >
                                                                        Accept Task
                                                                    </button>
                                                                )
                                                            }
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
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B79982] appearance-none bg-white cursor-pointer"
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
                                    {startIndex + 1} - {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length}
                                </span>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
            </div >
        </>
    )
}

export default Tasks
