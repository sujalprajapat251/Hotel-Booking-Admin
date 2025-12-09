import React, { useEffect, useRef, useState } from 'react';
import { deleteBooking, fetchBookings, updateBooking } from '../Redux/Slice/bookingSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import { FiEdit } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { ChevronDown, ChevronLeft, ChevronRight, Download, Filter, Phone, RefreshCw, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { setAlert } from '../Redux/Slice/alert.slice';
import { IoEyeSharp } from 'react-icons/io5';
import { GoDotFill } from "react-icons/go";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const AllBookings = () => {

    const dispatch = useDispatch();
    const [booking, setBooking] = useState([]);

    const {
        items,
        totalCount,
        currentPage: reduxCurrentPage,
        totalPages: reduxTotalPages,
        loading
    } = useSelector((state) => state.booking);

    const user = useSelector((state) => state.auth?.user);
    const userRole = user?.designation || '';
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // UI state
    const [showColumnDropdown, setShowColumnDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const bodyOverflowRef = useRef('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [editFormData, setEditFormData] = useState({
        guest: {
            fullName: '',
            email: '',
            // phone fields (similar to GuestModal / StaffForm)
            countrycode: '+91',
            phone: '',
            fullMobile: '',
            idNumber: '',
            address: ''
        },
        reservation: {
            checkInDate: '',
            checkOutDate: '',

            occupancy: {
                adults: 1,
                children: 0
            },
            specialRequests: ''
        },
        payment: {
            status: 'Pending',
            totalAmount: 0,
            currency: 'USD',
            method: 'Cash'
        },
        status: 'Pending',
        notes: ''
    });
    // -------- SEARCH FUNCTIONALITY --------
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const [searchQuery, setSearchQuery] = useState("");
    const filteredBookings = booking.filter(b => {
        const normalized = str => (str ?? '').toString().toLowerCase().trim();

        // Helper to include both raw and formatted date string
        const searchableDates = b => [
            b.checkIn,
            formatDate(b.checkIn),
            b.checkOut,
            formatDate(b.checkOut),
            b.createdAt,
            formatDate(b.createdAt),
            b.rawData?.reservation?.checkInDate,
            formatDate(b.rawData?.reservation?.checkInDate),
            b.rawData?.reservation?.checkOutDate,
            formatDate(b.rawData?.reservation?.checkOutDate),
            b.rawData?.createdAt,
            formatDate(b.rawData?.createdAt),
            b.rawData?.updatedAt,
            formatDate(b.rawData?.updatedAt)
        ];
        const valuesToSearch = [
            b.name,
            b.roomNumber,
            b.status,
            b.phone,
            b.countrycode,
            b.roomType,
            b.rawData?.guest?.email,
            b.rawData?.guest?.idNumber,
            b.rawData?.guest?.address,
            b.rawData?.notes,
            b.rawData?.reservation?.occupancy?.adults?.toString(),
            b.rawData?.reservation?.occupancy?.children?.toString(),
            b.rawData?.room?.floor?.toString(),
            b.rawData?.payment?.totalAmount?.toString(),
            b.rawData?.payment?.currency,
            b.rawData?.payment?.method,
            ...searchableDates(b)  // <-- Add all date strings here!
        ];
        return valuesToSearch.some(field =>
            normalized(field).includes(normalized(searchQuery))
        );
    });
    const [visibleColumns, setVisibleColumns] = useState({
        No: true,
        name: true,
        RoomNumber: true,
        checkIn: true,
        checkOut: true,
        status: true,
        phone: true,
        roomType: true,
        // documents: true,
        actions: true
    });
    const [showPaymentStatusDropdown, setShowPaymentStatusDropdown] = useState(false);
    const [showBookingStatusDropdown, setShowBookingStatusDropdown] = useState(false);
    const paymentStatusRef = useRef(null);
    const bookingStatusRef = useRef(null);

    const paymentStatusOptions = [
        { value: 'Pending', label: 'Pending' },
        { value: 'Paid', label: 'Paid' },
        { value: 'Partial', label: 'Partial' },
        { value: 'Refunded', label: 'Refunded' },
    ];

    const bookingStatusOptions = [
        { value: 'Pending', label: 'Pending' },
        { value: 'Confirmed', label: 'Confirmed' },
        { value: 'CheckedIn', label: 'Checked In' },
        { value: 'CheckedOut', label: 'Checked Out' },
        { value: 'Cancelled', label: 'Cancelled' },
        { value: 'NoShow', label: 'No Show' },
    ];

    useEffect(() => {
        const params = {
            page,
            limit,
        };
        dispatch(fetchBookings(params));
    }, [dispatch, page, limit]);

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
                countrycode: item.guest?.countrycode || 'N/A',
                roomType: item.room?.roomType?.roomType || 'N/A',
                createdAt: item.createdAt || item.reservation?.checkInDate,
                rawData: item,
            }));
            setBooking(formattedBookings);
        } else {
            setBooking([]);
        }
    }, [items]);



    const totalBookings = totalCount || 0;
    const totalPages = reduxTotalPages || Math.ceil((totalBookings || 0) / limit) || 1;
    const currentPageValue = reduxCurrentPage || page || 1;
    const serialOffset = (currentPageValue - 1) * limit;
    // Replace currentData with filteredBookings
    const currentData = filteredBookings;
    const displayStart = totalBookings === 0 ? 0 : serialOffset + 1;
    const displayEnd = totalBookings === 0 ? 0 : Math.min(serialOffset + currentData.length, totalBookings);

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
            if (paymentStatusRef.current && !paymentStatusRef.current.contains(event.target)) {
                setShowPaymentStatusDropdown(false);
            }
            if (bookingStatusRef.current && !bookingStatusRef.current.contains(event.target)) {
                setShowBookingStatusDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRefresh = () => {
        setPage(1);
        dispatch(fetchBookings({ page: 1, limit }));
    };

    const handleDownloadExcel = () => {
        try {
            if (booking.length === 0) {
                dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
                return;
            }
            const excelData = booking.map((bookingItem, index) => {
                const row = {};

                if (visibleColumns.No) {
                    row['No.'] = ((currentPageValue - 1) * limit) + index + 1;
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
                    const code = bookingItem.countrycode || "+91";
                    row['Phone'] = `${code} ${bookingItem.phone}` || '';
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

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;

        try {
            const result = await dispatch(deleteBooking(itemToDelete.id));
            if (deleteBooking.fulfilled.match(result)) {
                dispatch(fetchBookings({ page, limit }));
            }
        } catch (error) {
            dispatch(setAlert({ text: "Failed to delete Booking", color: 'error' }));
        } finally {
            handleDeleteModalClose();
        }
    };

    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (isModalOpen || isDeleteModalOpen || isEditModalOpen) {
            bodyOverflowRef.current = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = bodyOverflowRef.current || '';
        }

        return () => {
            document.body.style.overflow = bodyOverflowRef.current || '';
        };
    }, [isModalOpen, isDeleteModalOpen, isEditModalOpen]);

    const handleEditClick = (bookingItem) => {
        const rawData = bookingItem.rawData || {};
        const existingCountryCode = rawData.guest?.countrycode || '+91';
        const existingPhone = rawData.guest?.phone || bookingItem.phone || '';
        const numericPhone = existingPhone ? String(existingPhone).replace(/\D/g, '') : '';
        const dialDigits = existingCountryCode.replace('+', '');
        const fullMobile = numericPhone ? `${dialDigits}${numericPhone}` : '';

        setItemToEdit(bookingItem);
        setEditFormData({
            guest: {
                fullName: rawData.guest?.fullName || bookingItem.name || '',
                email: rawData.guest?.email || '',
                countrycode: existingCountryCode,
                phone: numericPhone,
                fullMobile,
                idNumber: rawData.guest?.idNumber || '',
                address: rawData.guest?.address || ''
            },
            reservation: {
                checkInDate: rawData.reservation?.checkInDate ? new Date(rawData.reservation.checkInDate).toISOString().split('T')[0] : bookingItem.checkIn || '',
                checkOutDate: rawData.reservation?.checkOutDate ? new Date(rawData.reservation.checkOutDate).toISOString().split('T')[0] : bookingItem.checkOut || '',
                occupancy: {
                    adults: rawData.reservation?.occupancy?.adults || 1,
                    children: rawData.reservation?.occupancy?.children || 0
                },
                specialRequests: rawData.reservation?.specialRequests || ''
            },
            payment: {
                status: rawData.payment?.status || bookingItem.status || 'Pending',
                totalAmount: rawData.payment?.totalAmount || 0,
                refundAmount: rawData.payment?.refundAmount || 0,
                currency: rawData.payment?.currency || 'USD',
                method: rawData.payment?.method || 'Cash'
            },
            status: rawData.status || 'Pending',
            notes: rawData.notes || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setItemToEdit(null);
        setEditFormData({
            guest: {
                fullName: '',
                email: '',
                countrycode: '+91',
                phone: '',
                fullMobile: '',
                idNumber: '',
                address: ''
            },
            reservation: {
                checkInDate: '',
                checkOutDate: '',
                occupancy: {
                    adults: 1,
                    children: 0
                },
                specialRequests: ''
            },
            payment: {
                status: 'Pending',
                totalAmount: 0,
                currency: 'USD',
                method: 'Cash'
            },
            status: 'Pending',
            notes: ''
        });
    };

    const handleEditFormChange = (section, field, value) => {
        if (section === 'occupancy') {
            setEditFormData(prev => ({
                ...prev,
                reservation: {
                    ...prev.reservation,
                    occupancy: {
                        ...prev.reservation.occupancy,
                        [field]: value
                    }
                }
            }));
        } else if (section === 'guest' || section === 'reservation' || section === 'payment') {
            setEditFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else {
            setEditFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!itemToEdit) return;

        try {
            const bookingId = itemToEdit.rawData?._id || itemToEdit.rawData?.id || itemToEdit.id;
            if (!bookingId) {
                dispatch(setAlert({ text: 'Booking ID not found', color: 'error' }));
                return;
            }

            // Check if checkout date is before check-in date
            const checkInDate = new Date(editFormData.reservation.checkInDate);
            const checkOutDate = new Date(editFormData.reservation.checkOutDate);
            const isEarlyCheckout = checkOutDate < checkInDate;
            const isCheckedOut = editFormData.status === 'CheckedOut';

            // If early checkout and status is CheckedOut, automatically set payment status to Refunded
            if (isEarlyCheckout && isCheckedOut) {
                editFormData.payment.status = 'Refunded';
                editFormData.payment.refundAmount = editFormData.payment.totalAmount || 0;
                dispatch(setAlert({
                    text: `Early checkout detected! Payment status automatically set to Refunded. Refund amount: ${editFormData.payment.currency} ${editFormData.payment.refundAmount}`,
                    color: 'warning'
                }));
            }

            const updates = {
                guest: editFormData.guest,
                reservation: {
                    ...editFormData.reservation,
                    checkInDate: editFormData.reservation.checkInDate,
                    checkOutDate: editFormData.reservation.checkOutDate
                },
                payment: editFormData.payment,
                status: editFormData.status,
                notes: editFormData.notes
            };

            await dispatch(updateBooking({ id: bookingId, updates })).unwrap();
            // await dispatch(fetchBookings({ page, limit }));
            handleEditModalClose();
        } catch (error) {
            console.error('Failed to update booking:', error);
            dispatch(setAlert({ text: error.message || 'Failed to update booking', color: 'error' }));
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setPage(newPage);
    };

    const handleItemsPerPageChange = (newLimit) => {
        setLimit(newLimit);
        setPage(1);
    };

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
                                <div className="relative  max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
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
                                                    <p className="text-lg font-medium">Loading...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : currentData.length > 0 ? (
                                        currentData.map((bookingItem, index) => (
                                            <tr
                                                key={bookingItem.id}
                                                className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                                            >
                                                {visibleColumns.No && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                        {serialOffset + index + 1}
                                                    </td>
                                                )}
                                                {visibleColumns.name && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm text-black capitalize">{bookingItem.name}</span>
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
                                                            <Phone size={16} className='text-green-600' />
                                                            {bookingItem?.countrycode ? bookingItem?.countrycode : ""} {bookingItem.phone}
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.roomType && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700 capitalize">
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
                                                {visibleColumns.actions && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <div className="mv_table_action flex">
                                                            <div onClick={() => handleViewClick(bookingItem)} className="cursor-pointer">
                                                                <IoEyeSharp className='text-[18px] text-quaternary hover:text-[#876B56] transition-colors' />
                                                            </div>
                                                            <div
                                                                onClick={() => handleEditClick(bookingItem)}
                                                                title="Edit Booking"
                                                            >
                                                                <FiEdit className="text-[#6777ef] text-[18px]" />
                                                            </div>
                                                            {userRole !== 'receptionist' && (
                                                                <div
                                                                    onClick={() => handleDeleteClick(bookingItem)}
                                                                    title="Delete Booking"
                                                                >
                                                                    <RiDeleteBinLine className="text-[#ff5200] text-[18px]" />
                                                                </div>
                                                            )}
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
                                        value={limit}
                                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B79982] appearance-none bg-white cursor-pointer"
                                        disabled={loading}
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-3 md600:gap-2 md:gap-3">
                                <span className="text-sm text-gray-600">
                                    {displayStart} - {displayEnd} of {totalBookings}
                                </span>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handlePageChange(currentPageValue - 1)}
                                        disabled={currentPageValue === 1}
                                        className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPageValue + 1)}
                                        disabled={currentPageValue === totalPages}
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
                            className="fixed inset-0 bg-black/50"
                            onClick={handleCloseModal}
                        ></div>
                        <div className="flex min-h-full items-center justify-center p-2 md:p-4 text-center">
                            <div
                                className="relative transform overflow-hidden rounded-md bg-white text-left shadow-xl transition-all w-full sm:my-8 sm:w-[95%] md:w-[80%] sm:max-w-2xl border max-h-[80vh]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="bg-white px-3 mt-1 py-3 sm:px-6 sm:py-4">
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
                                        <h3 className="text-lg sm:text-xl font-semibold text-black">Booking Details</h3>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="inline-flex items-center justify-center p-1 rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Content with responsive grid */}
                                    <div className="space-y-4 sm:space-y-5 max-h-[70vh] overflow-y-auto pr-1 sm:pr-2 pb-2 bg-white">
                                        {/* Guest Information */}
                                        <div>
                                            <h4 className="font-semibold text-black sm:text-lg mb-3 flex items-center gap-1">
                                                <span className="w-6 h-6 rounded-full flex items-center justify-center">
                                                    <GoDotFill size={18} />
                                                </span> Guest Information</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                                                <div className="flex sm:flex-row flex-col">
                                                    <span className="min-w-[60px] font-italic text-black">Name:</span>
                                                    <span className="break-words whitespace-normal capitalize">{selectedItem.name || "N/A"}</span>
                                                </div>
                                                {selectedItem.phone && (
                                                    <div className="flex sm:flex-row flex-col">
                                                        <span className="min-w-[60px] font-italic text-black">Phone:</span>
                                                        <span className="break-words whitespace-normal">{selectedItem.countrycode || ""} {selectedItem.phone}</span>
                                                    </div>
                                                )}
                                                {selectedItem.rawData?.guest?.email && (
                                                    <div className="flex sm:flex-row flex-col sm:col-span-2">
                                                        <span className="min-w-[60px] font-italic text-black">Email:</span>
                                                        <span className="break-words whitespace-normal">{selectedItem.rawData.guest.email}</span>
                                                    </div>
                                                )}
                                                {selectedItem.rawData?.guest?.idNumber && (
                                                    <div className="flex sm:flex-row flex-col sm:col-span-2">
                                                        <span className="min-w-[90px] font-italic text-black">ID Number:</span>
                                                        <span className="break-words whitespace-normal">{selectedItem.rawData.guest.idNumber}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Booking Information */}
                                        <div>
                                            <h4 className="font-semibold text-black sm:text-lg mb-3 flex items-center gap-1">
                                                <span className="w-6 h-6 rounded-full flex items-center justify-center">
                                                    <GoDotFill size={18} />
                                                </span>Booking Information</h4>
                                            <div className="grid grid-cols-1 md600:grid-cols-2 md600:gap-2">
                                                <div className="flex items-center p-1 rounded-lg transition-colors">
                                                    <span className="text-sm sm:text-base font-italic text-black min-w-[100px] sm:min-w-[90px]">Check In Date:</span>
                                                    <span className="text-sm sm:text-base">{selectedItem.checkIn ? formatDate(selectedItem.checkIn) : 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center p-1 rounded-lg transition-colors"
                                                    style={{ backgroundColor: 'transparent' }}
                                                >
                                                    <span className="text-sm sm:text-base font-italic text-black min-w-[100px] sm:min-w-[90px]">Check Out Date:</span>
                                                    <span className="text-sm sm:text-base">{selectedItem.checkOut ? formatDate(selectedItem.checkOut) : 'N/A'}</span>
                                                </div>
                                                {selectedItem.rawData?.checkInTime && (
                                                    <div className="flex items-center p-1 rounded-lg transition-colors">
                                                        <span className="text-sm sm:text-base font-italic text-black min-w-[100px] sm:min-w-[120px]">Check In Time:</span>
                                                        <span className="text-sm sm:text-base">{formatDateTime(selectedItem.rawData.checkInTime)}</span>
                                                    </div>
                                                )}
                                                {selectedItem.rawData?.checkOutTime && (
                                                    <div className="flex items-center p-1 rounded-lg transition-colors">
                                                        <span className="text-sm sm:text-base font-italic text-black min-w-[100px] sm:min-w-[120px]">Check Out Time:</span>
                                                        <span className="text-sm sm:text-base">{formatDateTime(selectedItem.rawData.checkOutTime)}</span>
                                                    </div>
                                                )}
                                                {selectedItem.createdAt && (
                                                    <div className="flex items-center p-1 rounded-lg transition-colors">
                                                        <span className="text-sm sm:text-base font-italic text-black min-w-[100px] sm:min-w-[90px]">Created At:</span>
                                                        <span className="text-sm sm:text-base">{formatDate(selectedItem.createdAt)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Room Details */}
                                        <div>
                                            <h4 className="font-semibold text-black sm:text-lg mb-3 flex items-center gap-1">
                                                <span className="w-6 h-6 rounded-full flex items-center justify-center">
                                                    <GoDotFill size={18} />
                                                </span> Room Details</h4>
                                            <div className="grid grid-cols-1 md600:grid-cols-2 md600:gap-2">
                                                {selectedItem.rawData?.room?.roomNumber && (
                                                    <div className="flex items-center p-1 rounded-lg transition-colors">
                                                        <span className="text-sm sm:text-base font-italic text-black min-w-[100px] sm:min-w-[120px]">Room Number:</span>
                                                        <span className="text-sm sm:text-base">{selectedItem.rawData.room.roomNumber}</span>
                                                    </div>
                                                )}
                                                {selectedItem.roomType && (
                                                    <div className="flex items-center p-1 rounded-lg transition-colors" >
                                                        <span className="text-sm sm:text-base font-italic text-black min-w-[100px] sm:min-w-[100px]">Room Type:</span>
                                                        <span className="text-sm sm:text-base capitalize">{selectedItem.roomType}</span>
                                                    </div>
                                                )}
                                                {selectedItem.rawData?.room?.floor && (
                                                    <div className="flex items-center p-1 rounded-lg transition-colors">
                                                        <span className="text-sm sm:text-base font-italic text-black min-w-[100px] sm:min-w-[50px]">Floor:</span>
                                                        <span className="text-sm sm:text-base">{selectedItem.rawData.room.floor}</span>
                                                    </div>
                                                )}
                                                {selectedItem.rawData?.reservation?.occupancy && (
                                                    <div className="flex items-center p-1 rounded-lg transition-colors">
                                                        <span className="text-sm sm:text-base font-italic text-black min-w-[100px] sm:min-w-[100px]">Occupancy:</span>
                                                        <span className="text-sm sm:text-base">
                                                            Adults: {selectedItem.rawData.reservation.occupancy.adults || 0}, Children: {selectedItem.rawData.reservation.occupancy.children || 0}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Payment Information */}
                                        <div>
                                            <h4 className="font-semibold text-black sm:text-lg mb-3 flex items-center gap-1">
                                                <span className="w-6 h-6 rounded-full flex items-center justify-center">
                                                    <GoDotFill size={18} />
                                                </span> Payment Information
                                            </h4>
                                            <div className="grid grid-cols-1 md600:grid-cols-2 md600:gap-2">
                                                <div className="flex items-center p-2 rounded-lg transition-colors">
                                                    <span className="text-sm sm:text-base font-italic text-black min-w-[115px] sm:min-w-[130px]">Payment Status:</span>
                                                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold ${getStatusStyle(selectedItem.status)}`}>
                                                        {selectedItem.status}
                                                    </span>
                                                </div>
                                                {selectedItem.rawData?.payment?.totalAmount !== undefined && (
                                                    <div className="flex items-center p-2 rounded-lg transition-colors">
                                                        <span className="text-sm sm:text-base font-italic text-black min-w-[100px] sm:min-w-[110px]">Total Amount:</span>
                                                        <span className="text-sm sm:text-base font-semibold">
                                                            {selectedItem.rawData.payment.currency || ''} {selectedItem.rawData.payment.totalAmount}
                                                        </span>
                                                    </div>
                                                )}
                                                {selectedItem.rawData?.payment?.refundAmount !== undefined && selectedItem.rawData.payment.refundAmount > 0 && (
                                                    <div className="flex items-center p-2 rounded-lg transition-colors">
                                                        <span className="text-sm sm:text-base font-italic text-black min-w-[100px] sm:min-w-[110px]">Refund Amount:</span>
                                                        <span className="text-sm sm:text-base font-semibold text-red-600">
                                                            {selectedItem.rawData.payment.currency || ''} {selectedItem.rawData.payment.refundAmount}
                                                        </span>
                                                    </div>
                                                )}
                                                {selectedItem.rawData?.payment?.refundAmount !== undefined && selectedItem.rawData.payment.refundAmount > 0 && selectedItem.rawData?.payment?.totalAmount !== undefined && (
                                                    <div className="flex items-center p-2 rounded-lg transition-colors">
                                                        <span className="text-sm sm:text-base font-italic text-black min-w-[100px] sm:min-w-[110px]">Net Amount:</span>
                                                        <span className="text-sm sm:text-base font-semibold text-blue-600">
                                                            {selectedItem.rawData.payment.currency || ''} {(selectedItem.rawData.payment.totalAmount - selectedItem.rawData.payment.refundAmount).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                                {selectedItem.rawData?.payment?.method && (
                                                    <div className="flex items-center p-2 rounded-lg transition-colors">
                                                        <span className="text-sm sm:text-base font-italic text-black min-w-[120px] sm:min-w-[140px]">Payment Method:</span>
                                                        <span className="text-sm sm:text-base capitalize">{selectedItem.rawData.payment.method}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Additional Information */}
                                        {(selectedItem.rawData?.reservation?.specialRequests || selectedItem.rawData?.notes) && (
                                            <div>
                                                <h4 className="font-semibold text-black sm:text-lg mb-3 flex items-center gap-1">
                                                    <span className="w-6 h-6 rounded-full flex items-center justify-center">
                                                        <GoDotFill size={18} />
                                                    </span> Additional Information
                                                </h4>
                                                <div className="grid grid-cols-1 md600:gap-2">
                                                    {selectedItem.rawData?.reservation?.specialRequests && (
                                                        <div className="flex items-start p-2 rounded-lg transition-colors">
                                                            <span className="text-sm sm:text-base font-italic text-black min-w-[6   0px] sm:min-w-[60px]">Special Requests:</span>
                                                            <span className="text-sm sm:text-base flex-1">{selectedItem.rawData.reservation.specialRequests}</span>
                                                        </div>
                                                    )}
                                                    {selectedItem.rawData?.notes && (
                                                        <div className="flex items-start p-2 rounded-lg transition-colors">
                                                            <span className="text-sm sm:text-base font-italic text-black min-w-[50px] sm:min-w-[60px]">Notes:</span>
                                                            <span className="text-sm sm:text-base flex-1">{selectedItem.rawData.notes}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Booking Modal */}
                {isEditModalOpen && itemToEdit && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={handleEditModalClose}
                        ></div>
                        <div className="flex min-h-full items-center justify-center p-2 md:p-4 text-center sm:p-0">
                            <div
                                className="relative transform overflow-hidden rounded-md bg-white text-left shadow-xl transition-all sm:my-8 sm:w-[90%] sm:max-w-3xl border"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="px-4 py-4 sm:p-6">
                                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                                        <h3 className="text-xl font-bold text-black">Edit Booking</h3>
                                        <button
                                            type="button"
                                            onClick={handleEditModalClose}
                                            className="inline-flex items-center justify-center p-1 rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleEditSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                                        {/* Guest Information */}
                                        <div>
                                            <h4 className="font-serif text-black text-lg mb-3">Guest Information:</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-black mb-1">Full Name *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={editFormData.guest.fullName}
                                                        onChange={(e) => handleEditFormChange('guest', 'fullName', e.target.value)}
                                                        className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-black mb-1">Phone *</label>
                                                    <PhoneInput
                                                        country={"in"}
                                                        enableSearch={true}
                                                        value={editFormData.guest.fullMobile || ''}
                                                        onChange={(value, country) => {
                                                            const nextValue = value || '';
                                                            const dialCode = country?.dialCode || '';
                                                            const mobileOnly = nextValue.slice(dialCode.length);

                                                            setEditFormData((prev) => ({
                                                                ...prev,
                                                                guest: {
                                                                    ...prev.guest,
                                                                    countrycode: dialCode ? `+${dialCode}` : '',
                                                                    phone: mobileOnly,
                                                                    fullMobile: nextValue,
                                                                },
                                                            }));
                                                        }}
                                                        placeholder="Enter mobile number"
                                                        inputProps={{
                                                            name: "mobile",
                                                            required: true,
                                                        }}
                                                        containerStyle={{
                                                            width: "100%",
                                                        }}
                                                        buttonStyle={{
                                                            backgroundColor: "#f3f4f6",
                                                            border: "1px solid #d1d5db",
                                                            borderRadius: "4px",
                                                            width: "50px",
                                                        }}
                                                        inputStyle={{
                                                            width: "100%",
                                                            backgroundColor: "#f3f4f6",
                                                            border: "1px solid #d1d5db",
                                                            borderRadius: "4px",
                                                            paddingLeft: "55px",
                                                            height: "42px",
                                                        }}
                                                        dropdownStyle={{
                                                            width: "260px",
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-black mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        value={editFormData.guest.email}
                                                        onChange={(e) => handleEditFormChange('guest', 'email', e.target.value)}
                                                        className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-black mb-1">ID Number</label>
                                                    <input
                                                        type="text"
                                                        value={editFormData.guest.idNumber}
                                                        onChange={(e) => handleEditFormChange('guest', 'idNumber', e.target.value)}
                                                        className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-black mb-1">Address</label>
                                                    <input
                                                        type="text"
                                                        value={editFormData.guest.address}
                                                        onChange={(e) => handleEditFormChange('guest', 'address', e.target.value)}
                                                        className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reservation Information */}
                                        <div>
                                            <h4 className="font-serif text-black text-lg mb-3">Reservation Information:</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-black mb-1">Check In Date *</label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={editFormData.reservation.checkInDate}
                                                        onChange={(e) => handleEditFormChange('reservation', 'checkInDate', e.target.value)}
                                                        className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-black mb-1">Check Out Date *</label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={editFormData.reservation.checkOutDate}
                                                        onChange={(e) => {
                                                            const newCheckOutDate = e.target.value;
                                                            handleEditFormChange('reservation', 'checkOutDate', newCheckOutDate);

                                                            // Warn if checkout is before check-in
                                                            if (newCheckOutDate && editFormData.reservation.checkInDate) {
                                                                const checkIn = new Date(editFormData.reservation.checkInDate);
                                                                const checkOut = new Date(newCheckOutDate);
                                                                if (checkOut < checkIn) {
                                                                    dispatch(setAlert({
                                                                        text: 'Warning: Check-out date is before check-in date. Payment will be automatically set to Refunded if booking status is CheckedOut.',
                                                                        color: 'warning'
                                                                    }));
                                                                }
                                                            }
                                                        }}
                                                        className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                                                    />
                                                    {editFormData.reservation.checkOutDate && editFormData.reservation.checkInDate &&
                                                        new Date(editFormData.reservation.checkOutDate) < new Date(editFormData.reservation.checkInDate) && (
                                                            <p className="text-xs text-yellow-600 mt-1">
                                                                ⚠️ Check-out is before check-in. Refund will be processed if status is CheckedOut.
                                                            </p>
                                                        )
                                                    }
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-black mb-1">Adults</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={editFormData.reservation.occupancy.adults}
                                                        onChange={(e) => handleEditFormChange('occupancy', 'adults', parseInt(e.target.value) || 1)}
                                                        className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-black mb-1">Children</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={editFormData.reservation.occupancy.children}
                                                        onChange={(e) => handleEditFormChange('occupancy', 'children', parseInt(e.target.value) || 0)}
                                                        className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="text-sm font-medium text-black mb-1">Special Requests</label>
                                                    <textarea
                                                        value={editFormData.reservation.specialRequests}
                                                        onChange={(e) => handleEditFormChange('reservation', 'specialRequests', e.target.value)}
                                                        rows="3"
                                                        className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Information */}
                                        <div>
                                            <h4 className="font-serif text-black text-lg mb-3">Payment Information:</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="relative" ref={paymentStatusRef}>
                                                    <label className="text-sm font-medium text-black mb-1">Payment Status</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPaymentStatusDropdown((prev) => !prev)}
                                                        className="w-full rounded-[4px] border border-gray-200 px-3 py-2 bg-[#1414140F] flex items-center justify-between"
                                                    >
                                                        <span className={editFormData.payment.status ? 'text-black' : 'text-gray-400'}>
                                                            {paymentStatusOptions.find((opt) => opt.value === editFormData.payment.status)?.label || 'Select payment status'}
                                                        </span>
                                                        <ChevronDown size={18} className="text-gray-600" />
                                                    </button>
                                                    {showPaymentStatusDropdown && (
                                                        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-[4px] shadow-lg  max-h-48 overflow-y-auto">
                                                            {paymentStatusOptions.map((option) => (
                                                                <div
                                                                    key={option.value}
                                                                    onClick={() => {
                                                                        handleEditFormChange('payment', 'status', option.value);
                                                                        setShowPaymentStatusDropdown(false);
                                                                    }}
                                                                    className="px-4 py-1 text-sm text-black cursor-pointer hover:bg-[#F7DF9C] transition-colors"
                                                                >
                                                                    {option.label}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-black mb-1">Total Amount *</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                        value={editFormData.payment.totalAmount}
                                                        onChange={(e) => handleEditFormChange('payment', 'totalAmount', parseFloat(e.target.value) || 0)}
                                                        className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-black mb-1">Currency</label>
                                                    <input
                                                        type="text"
                                                        value={editFormData.payment.currency}
                                                        onChange={(e) => handleEditFormChange('payment', 'currency', e.target.value.toUpperCase())}
                                                        className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-black mb-1">Payment Method</label>
                                                    <input
                                                        type="text"
                                                        value={editFormData.payment.method}
                                                        onChange={(e) => handleEditFormChange('payment', 'method', e.target.value)}
                                                        className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Booking Status & Notes */}
                                        <div>
                                            <h4 className="font-serif text-black text-lg mb-3">Booking Details:</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="relative" ref={bookingStatusRef}>
                                                    <label className="text-sm font-medium text-black mb-1">Booking Status</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowBookingStatusDropdown((prev) => !prev)}
                                                        className="w-full rounded-[4px] border border-gray-200 px-3 py-2 bg-[#1414140F] flex items-center justify-between"
                                                    >
                                                        <span className={editFormData.status ? 'text-black' : 'text-gray-400'}>
                                                            {bookingStatusOptions.find((opt) => opt.value === editFormData.status)?.label || 'Select booking status'}
                                                        </span>
                                                        <ChevronDown size={18} className="text-gray-600" />
                                                    </button>
                                                    {showBookingStatusDropdown && (
                                                        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-[4px] shadow-lg  max-h-48 overflow-y-auto">
                                                            {bookingStatusOptions.map((option) => (
                                                                <div
                                                                    key={option.value}
                                                                    onClick={() => {
                                                                        handleEditFormChange(null, 'status', option.value);
                                                                        setShowBookingStatusDropdown(false);
                                                                    }}
                                                                    className="px-4 py-1 text-sm text-black cursor-pointer hover:bg-[#F7DF9C] transition-colors"
                                                                >
                                                                    {option.label}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="text-sm font-medium text-black mb-1">Notes</label>
                                                    <textarea
                                                        value={editFormData.notes}
                                                        onChange={(e) => handleEditFormChange(null, 'notes', e.target.value)}
                                                        rows="3"
                                                        className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Form Actions */}
                                        <div className="flex items-center justify-center gap-3 pt-4 border-t">
                                            <button
                                                type="button"
                                                onClick={handleEditModalClose}
                                                className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
                                            >
                                                {loading ? 'Updating...' : 'Update Booking'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={handleDeleteModalClose}></div>
                        <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl mx-5">
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
                                    className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
                                    onClick={handleDeleteConfirm}
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