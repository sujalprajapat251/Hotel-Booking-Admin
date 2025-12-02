import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { FiCheckCircle, FiEdit } from 'react-icons/fi';
import { ChevronDown, ChevronLeft, ChevronRight, Download, Filter, RefreshCw, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { setAlert } from '../Redux/Slice/alert.slice';
import { IoEyeSharp } from 'react-icons/io5';
import { approveCleaningRoom, fetchFreeWorker } from '../Redux/Slice/housekeepingSlice.js';
import { assignWorkerToOrderRequest, fetchAllOrderRequesr } from '../Redux/Slice/orderRequestSlice.js';

const OrderRequest = () => {

    const dispatch = useDispatch();
    const { creating } = useSelector((state) => state.housekeeping);

    const [orderRequestRooms, setOrderRequestRooms] = useState([]);
    console.log('orderRequestRooms', orderRequestRooms);

    const {
        items = [],
        totalCount = 0,
        currentPage: reduxCurrentPage = 1,
        totalPages: reduxTotalPages = 1,
        loading = false
    } = useSelector((state) => state.orderrequest || {});
    console.log('items', items);

    const [housekeepingStaff, setHousekeepingStaff] = useState([]);

    useEffect(() => {
        dispatch(fetchFreeWorker());
    }, [dispatch]);
    const { freeWorkers } = useSelector((state) => state.housekeeping);

    useEffect(() => {
        if (freeWorkers && freeWorkers.length > 0) {
            const filteredStaff = freeWorkers.filter(
                (member) => member.department?.name === "Housekeeping"
            );

            setHousekeepingStaff(filteredStaff);
        } else {
            setHousekeepingStaff([]);
        }
    }, [freeWorkers]);

    const [isWorkerDropdownOpen, setIsWorkerDropdownOpen] = useState(false);
    const [isAssignWorkerModalOpen, setIsAssignWorkerModalOpen] = useState(false);
    const [selectedorderRequest, setSelectedorderRequest] = useState(null);
    const [selectedWorker, setSelectedWorker] = useState({ name: '', id: '' });
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showColumnDropdown, setShowColumnDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [visibleColumns, setVisibleColumns] = useState({
        No: true,
        workerName: true,
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
        const params = {
            page,
            limit,
        };

        if (debouncedSearch) {
            params.search = debouncedSearch;
        }

        dispatch(fetchAllOrderRequesr(params));
    }, [dispatch, page, limit, debouncedSearch]);

    useEffect(() => {
        if (items && items.length > 0) {
            const formattedData = items?.map((item, index) => ({
                id: item._id || item.id || index,
                name: item?.workerId?.name || (typeof item.cleanassign === 'string' ? item.cleanassign : 'N/A'),
                status: item.cleanStatus || 'Pending',
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
            setOrderRequestRooms(formattedData);
        } else {
            setOrderRequestRooms([]);
        }
    }, [items]);

    const handleAssignWorkerClose = () => {
        setIsAssignWorkerModalOpen(false);
        setSelectedorderRequest(null);
        setSelectedWorker({ name: '', id: '' });
        setIsWorkerDropdownOpen(false);
    };

    const handleAssignWorkerSubmit = async () => {
        const workerId = selectedWorker.id;
        const orderId = selectedorderRequest?.id;
        console.log('Submitting:', { orderId, workerId });

        if (!orderId || !workerId) {
            dispatch(setAlert({
                text: 'Please select both order and worker',
                color: 'error'
            }));
            return;
        }

        try {
            // Dispatch the API call
            await dispatch(assignWorkerToOrderRequest({
                Id: orderId,
                workerId
            })).unwrap();

            dispatch(fetchFreeWorker());
            dispatch(fetchAllOrderRequesr());
            handleAssignWorkerClose();
        } catch (error) {
            console.error('Failed to assign worker:', error);
        }
    };

    const handleAssignWorkerClick = (housekeeping) => {
        setSelectedorderRequest(housekeeping);

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

    // const getOrderItemCount = (housekeeping) => {
    //     if (!housekeeping?.rawData?.orderId?.items?.length) return 0;
    //     return housekeeping.rawData.orderId.items.reduce((sum, item) => sum + (item?.qty || 1), 0);
    // };

    // const getOrderTotalAmount = (housekeeping) => {
    //     if (!housekeeping?.rawData?.orderId?.items?.length) return 0;
    //     return housekeeping.rawData.orderId.items.reduce((sum, item) => {
    //         const price = item?.product?.price || 0;
    //         const qty = item?.qty || 1;
    //         return sum + price * qty;
    //     }, 0);
    // };

    // const getItemPreview = (housekeeping) => {
    //     if (!housekeeping?.rawData?.orderId?.items?.length) return 'No items';
    //     const names = housekeeping.rawData.orderId.items
    //         .map((item) => item?.product?.name)
    //         .filter(Boolean);
    //     if (!names.length) return 'No items';
    //     if (names.length <= 2) return names.join(', ');
    //     return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
    // };

    // const getItemsList = (housekeeping) => {
    //     if (!housekeeping?.rawData?.orderId?.items?.length) return [];
    //     return housekeeping.rawData.orderId.items
    //         .map((item) => item?.product?.name)
    //         .filter(Boolean);
    // };

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
        dispatch(fetchAllOrderRequesr({ page: 1, limit }));
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
            if (setOrderRequestRooms.length === 0) {
                dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
                return;
            }

            const excelData = orderRequestRooms?.map((bookingItem, index) => {
                const row = {};

                if (visibleColumns.No) {
                    row['No.'] = ((page - 1) * limit) + index + 1;
                }
                if (visibleColumns.workerName) {
                    row['Worker Name'] = bookingItem.name || '';
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


    const filteredBookings = orderRequestRooms.filter((item) => {
        const searchLower = searchTerm.trim().toLowerCase();
        if (!searchLower) return true;

        return (
            item.name?.toLowerCase().includes(searchLower) ||
            item.to?.toLowerCase().includes(searchLower) ||
            item.roomType?.toLowerCase().includes(searchLower) ||
            item.status?.toLowerCase().includes(searchLower) ||
            item.roomNo?.toString().includes(searchLower) ||
            item.floor?.toString().includes(searchLower) ||
            item.itemName?.toString().includes(searchLower) ||
            item.itemCount?.toString().includes(searchLower)
        );
    });

    // Correct pagination on filtered data
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredBookings.slice(startIndex, endIndex);


    const handleApprove = (id) => {
        alert('sds');
        dispatch(approveCleaningRoom(id));

        setTimeout(() => {
            dispatch(fetchAllOrderRequesr());
        }, 3000);
    };

    return (
        <>
            <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
                <section className="py-5">
                    <h1 className="text-2xl font-semibold text-black">Order Request</h1>
                </section>

                <div className="w-full">
                    <div className="bg-white rounded-lg shadow-md">
                        {/* Header */}
                        <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
                            <div className='flex gap-2 md:gap-5 sm:justify-between'>
                                <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">Order Request</p>

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
                                        {visibleColumns.workerName && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Name</th>
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
                                                            <span className="text-sm font-medium text-gray-800">
                                                                {housekeeping.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                )}

                                                {visibleColumns.itemName && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-gray-800">
                                                                {housekeeping.itemCount || 0} item
                                                                {housekeeping.itemCount === 1 ? "" : "s"}
                                                            </span>

                                                            <span className="text-xs text-gray-500 truncate max-w-[200px]">
                                                                {Array.isArray(housekeeping.itemName) &&
                                                                    housekeeping.itemName.length > 0
                                                                    ? housekeeping.itemName.length <= 2
                                                                        ? housekeeping.itemName.join(", ")
                                                                        : `${housekeeping.itemName
                                                                            .slice(0, 2)
                                                                            .join(", ")} +${housekeeping.itemName.length - 2
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
                                                                housekeeping.status
                                                            )}`}
                                                        >
                                                            {housekeeping.status}
                                                        </span>
                                                    </td>
                                                )}

                                                {visibleColumns.roomNo && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        {housekeeping.roomNo}
                                                    </td>
                                                )}

                                                {visibleColumns.floor && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        {housekeeping.floor}
                                                    </td>
                                                )}

                                                {visibleColumns.to && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-medium text-gray-800">
                                                                {housekeeping.to}
                                                            </span>
                                                        </div>
                                                    </td>
                                                )}

                                                {visibleColumns.actions && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                        <div className="mv_table_action flex items-center gap-3">
                                                            <div
                                                                onClick={() => handleViewClick(housekeeping)}
                                                                className="cursor-pointer"
                                                            >
                                                                <IoEyeSharp className="text-[18px] text-quaternary" />
                                                            </div>

                                                            {housekeeping.status === "Completed" ? (
                                                                <div
                                                                    onClick={() =>
                                                                        handleApprove(housekeeping.id)
                                                                    }
                                                                    title="Approve Cleaning"
                                                                    className="cursor-pointer"
                                                                >
                                                                    <FiCheckCircle className="text-[#43b82c] text-[18px]" />
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    onClick={() =>
                                                                        handleAssignWorkerClick(housekeeping)
                                                                    }
                                                                    className="cursor-pointer"
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
                                    {startIndex + 1} - {Math.min(endIndex, setOrderRequestRooms.length)} of {setOrderRequestRooms.length}
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

                {/* View Booking Modal */}
                {/* View Booking Modal */}
                {isModalOpen && selectedItem && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div
                            className="fixed inset-0 transition-opacity absolute bg-black/40"
                            onClick={handleCloseModal}
                        ></div>

                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-[4px] bg-white text-left shadow-xl transition-all sm:my-8 sm:w-[80%] sm:max-w-lg">
                                {/* Modal Header */}
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
                                        <h3 className="text-lg font-semibold text-black">Order Request Details</h3>
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
                                            <span className='text-gray-900'>{selectedItem.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Room No:</span>
                                            <span className='text-gray-900'>{selectedItem.roomNo}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Floor:</span>
                                            <span className='text-gray-900'>{selectedItem.floor}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">To:</span>
                                            <span className='text-gray-900'>{selectedItem.to}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Status:</span>
                                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold ${getStatusStyle(selectedItem.status)}`}>
                                                {selectedItem.status}
                                            </span>
                                        </div>

                                        {/* Items Section */}
                                        {selectedItem?.rawData?.orderId?.items?.length > 0 && (
                                            <div className="pt-3 border-t border-gray-200">
                                                <span className="font-semibold text-gray-700 block mb-2">Order Items:</span>
                                                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                                    {selectedItem.rawData.orderId.items.map((item, index) => (
                                                        <div key={item._id || index} className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-800">
                                                                {item?.product?.name || 'Unknown Item'} x {item?.qty || 1}
                                                            </span>
                                                            <span className="text-gray-600 font-medium">
                                                                ₹{((item?.product?.price || 0) * (item?.qty || 1)).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <div className="pt-2 border-t border-gray-300 flex justify-between items-center font-semibold">
                                                        <span className="text-gray-800">Total Amount:</span>
                                                        <span className="text-gray-900">₹{selectedItem.totalAmount?.toFixed(2) || '0.00'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
                            className="fixed inset-0 transition-opacity absolute bg-black/40"
                            onClick={handleAssignWorkerClose}
                        ></div>

                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-md bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
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
                                                Room Number: {selectedorderRequest?.roomNo || 'N/A'}
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
                                                                onClick={() => {
                                                                    setSelectedWorker({ name: staff?.name || '', id: staff?._id || staff?.id || '' });
                                                                    setIsWorkerDropdownOpen(false);
                                                                }}
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

export default OrderRequest