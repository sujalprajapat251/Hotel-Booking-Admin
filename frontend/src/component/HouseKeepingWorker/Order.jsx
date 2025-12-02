import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {  ChevronLeft, ChevronRight, Download, Filter, RefreshCw, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { setAlert } from '../../Redux/Slice/alert.slice.js';
import { acceptWorkeorders, fetchOrderTasks } from '../../Redux/Slice/WorkerSlice.js';

const Order = () => {

    const dispatch = useDispatch();
    const workerId = localStorage.getItem("userId");

    useEffect(() => {
        dispatch(fetchOrderTasks({ workerId }));
    }, [dispatch]);

    const {
        orders,
        totalCount,
        currentPage: reduxCurrentPage,
        totalPages: reduxTotalPages,
        loading
    } = useSelector((state) => state.worker);

    const [assigndOrder, setAssigndOrder] = useState([]);
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
        itemName: true,
        floor: true,
        status: true,
        roomNo: true,
        to: true,
        actions: true
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); 
            setCurrentPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        if (orders && orders.length > 0) {
            const formattedData = orders?.map((item, index) => ({
                id: item._id || item.id || index,
                status: item.status || 'Pending',
                roomNo: item.roomId?.roomNumber || 'N/A',
                to: item?.to || 'N/A',
                floor: item?.roomId?.floor || 'N/A',
                itemName: item?.orderId?.items?.map((ele) => ele?.product?.name).filter(Boolean) || [],
                itemCount: item?.orderId?.items?.reduce((sum, ele) => sum + (ele?.qty || 1), 0) || 0,
                totalAmount: item?.orderId?.items?.reduce((sum, ele) => {
                    const price = ele?.product?.price || 0;
                    const qty = ele?.qty || 1;
                    return sum + price * qty;
                }, 0) || 0,
                createdAt: item.createdAt || item.reservation?.checkInDate,
                rawData: item
            }));
            setAssigndOrder(formattedData);

        } else {
            setAssigndOrder([]);
        }
    }, [orders]);

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

    const handleAcceptorder = (orderId) => {
        dispatch(acceptWorkeorders({ id: orderId }))
            .unwrap()
            .then(() => {
                // Refresh the order list after accepting
                dispatch(fetchOrderTasks({ workerId }));
            })
            .catch((error) => {
                console.error('Failed to accept order:', error);
            });
    }

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
        dispatch(fetchOrderTasks({ workerId }));
    };

    const handleDownloadExcel = () => {
        try {
            if (assigndOrder.length === 0) {
                dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
                return;
            }
            const excelData = assigndOrder?.map((bookingItem, index) => {
                const row = {};

                if (visibleColumns.No) {
                    row['No.'] = ((page - 1) * limit) + index + 1;
                }
                if (visibleColumns.itemName) {
                    const items = bookingItem.itemName;

                    row['Item Name'] = Array.isArray(items) && items.length > 0
                        ? items.length <= 2
                            ? items.join(", ")
                            : `${items.slice(0, 2).join(", ")} +${items.length - 2} more`
                        : "No items";
                }

                if (visibleColumns.floor) {
                    row['Floor'] = bookingItem.floor || '';
                }
                if (visibleColumns.status) {
                    row['Status'] = bookingItem.status || '';
                }
                if (visibleColumns.roomNo) {
                    row['Room No'] = bookingItem.roomNo || '';
                }
                if (visibleColumns.to) {
                    row['To'] = bookingItem.to || '';
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

    const filteredBookings = assigndOrder.filter((item) => {
        const searchLower = searchTerm.trim().toLowerCase();
        if (!searchLower) return true;

        return (
            item.to?.toLowerCase().includes(searchLower) ||
            item.roomType?.toLowerCase().includes(searchLower) ||
            item.status?.toLowerCase().includes(searchLower) ||
            item.roomNo?.toString().includes(searchLower) ||
            item.floor?.toString().includes(searchLower) ||
            item.itemName?.toString().includes(searchLower) ||
            item.itemCount?.toString().includes(searchLower)
        );
    });

    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredBookings.slice(startIndex, endIndex);

    return (
        <>
            <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
                <section className="py-5">
                    <h1 className="text-2xl font-semibold text-black">Assigned Order</h1>
                </section>

                <div className="w-full">
                    <div className="bg-white rounded-lg shadow-md">
                        {/* Header */}
                        <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
                            <div className='flex gap-2 md:gap-5 sm:justify-between'>
                                <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">Order</p>

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
                                        {visibleColumns.itemName && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Item Name</th>
                                        )}
                                        {visibleColumns.status && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Status</th>
                                        )}
                                        {visibleColumns.roomNo && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Room No.</th>
                                        )}
                                        {visibleColumns.floor && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Floor</th>
                                        )}
                                        {visibleColumns.to && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">To</th>
                                        )}
                                        {visibleColumns.actions && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={
                                                    Object.values(visibleColumns).filter(Boolean).length
                                                }
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <RefreshCw className="w-12 h-12 mb-4 text-[#B79982] animate-spin" />
                                                    <p className="text-lg font-medium">Loading bookings...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : currentData.length > 0 ? (
                                        currentData.map((orders, index) => (
                                            <tr
                                                key={orders.id}
                                                className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                                            >
                                                {visibleColumns.No && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                        {startIndex + index + 1}
                                                    </td>
                                                )}
                                                {visibleColumns.itemName && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-gray-800">
                                                                {orders.itemCount || 0} item
                                                                {orders.itemCount === 1 ? "" : "s"}
                                                            </span>

                                                            <span className="text-xs text-gray-500 truncate max-w-[200px]">
                                                                {Array.isArray(orders.itemName) &&
                                                                    orders.itemName.length > 0
                                                                    ? orders.itemName.length <= 2
                                                                        ? orders.itemName.join(", ")
                                                                        : `${orders.itemName
                                                                            .slice(0, 2)
                                                                            .join(", ")} +${orders.itemName.length - 2
                                                                        } more`
                                                                    : "No items"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                )}

                                                {visibleColumns.status && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <span
                                                            className={`inline-flex items-center justify-center w-24 h-8 rounded-xl text-xs font-semibold ${getStatusStyle(
                                                                orders.status
                                                            )}`}
                                                        >
                                                            {orders.status}
                                                        </span>
                                                    </td>
                                                )}

                                                {visibleColumns.roomNo && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        {orders.roomNo}
                                                    </td>
                                                )}

                                                {visibleColumns.floor && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        {orders.floor}
                                                    </td>
                                                )}

                                                {visibleColumns.to && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-medium text-gray-800">
                                                                {orders.to}
                                                            </span>
                                                        </div>
                                                    </td>
                                                )}

                                                {visibleColumns.actions && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                        {
                                                            orders.status === "Completed" ? (
                                                                <span className="font-bold text-green-600">
                                                                    Approved
                                                                </span>
                                                            ) : orders.status === "In-Progress" ? (
                                                                <button
                                                                    onClick={() => handleAcceptorder(orders?.id)}
                                                                    className="w-[150px] text-center py-2 text-white rounded-lg font-semibold bg-tertiary hover:text-tertiary hover:bg-primary"
                                                                    disabled={loading}
                                                                >
                                                                    Complete Task
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAcceptorder(orders?.id)}
                                                                    className="w-[150px] py-2 text-center text-white rounded-lg font-semibold bg-tertiary hover:text-tertiary hover:bg-primary"
                                                                    disabled={loading}
                                                                >
                                                                    Accept Order
                                                                </button>
                                                            )
                                                        }
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={
                                                    Object.values(visibleColumns).filter(Boolean).length
                                                }
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <svg
                                                        className="w-16 h-16 mb-4 text-gray-300"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1.5}
                                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                                        />
                                                    </svg>
                                                    <p className="text-lg font-medium">No bookings found</p>
                                                    <p className="text-sm mt-1">
                                                        Try adjusting your search or filters
                                                    </p>
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

export default Order
