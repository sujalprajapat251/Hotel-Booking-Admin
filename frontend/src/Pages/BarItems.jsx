import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import "../Style/vaidik.css"
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit, FiPlusCircle } from "react-icons/fi";
import { IoEyeSharp } from 'react-icons/io5';
import { Search, Filter, Download, ChevronLeft, ChevronRight, RefreshCw, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { setAlert } from '../Redux/Slice/alert.slice';
import { IMAGE_URL, BASE_URL } from '../Utils/baseUrl';
import axios from 'axios';
import { createBaritem, deleteBaritem, getAllBaritem, updateBaritem, toggleBaritemStatus } from '../Redux/Slice/baritemSlice';

const BarItems = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showColumnDropdown, setShowColumnDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [categories, setCategories] = useState([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const categoryDropdownRef = useRef(null);
    const dispatch = useDispatch();
    const { barItem, loading } = useSelector((state) => state.bar);

    const [visibleColumns, setVisibleColumns] = useState({
        no: true,
        name: true,
        category: true,
        price: true,
        image: true,
        description: true,
        status: true,
        actions: true,
    });


    const getImageFileName = (path = '') => {
        if (!path) return '';
        const segments = path.split(/[/\\]/);
        const fileName = segments[segments.length - 1] || '';
        return fileName.replace(/^\d+-/, '');
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
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
                setShowCategoryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const shouldDisableScroll = isModalOpen || isAddModalOpen || isDeleteModalOpen;
        if (shouldDisableScroll) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isModalOpen, isAddModalOpen, isDeleteModalOpen]);

    useEffect(() => {
        dispatch(getAllBaritem());
    }, [dispatch]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = await localStorage.getItem("token");
                const response = await axios.get(`${BASE_URL}/getallbarcategory`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (response.data.success) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleViewClick = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const validationSchema = useMemo(() => (
        Yup.object({
            name: Yup.string().required('Name is required'),
            category: Yup.string().required('Category is required'),
            price: Yup.number().required('Price is required').positive('Price must be positive'),
            description: Yup.string().required('Description is required'),
            image: Yup.mixed()
                .nullable()
                .test('required', 'Image is required', function (value) {
                    if (isEditMode) {
                        return true;
                    }
                    return Boolean(value);
                }),
        })
    ), [isEditMode]);

    const formik = useFormik({
        initialValues: {
            name: '',
            category: '',
            price: '',
            description: '',
            image: null,
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                if (isEditMode && editingItem) {
                    const payload = {
                        ...values,
                        id: editingItem._id || editingItem.id,
                    };
                    const result = await dispatch(updateBaritem(payload));
                    if (updateBaritem.fulfilled.match(result)) {
                        dispatch(setAlert({ text: "Bar Item updated successfully..!", color: 'success' }));
                        resetForm();
                        setIsAddModalOpen(false);
                        setIsEditMode(false);
                        setEditingItem(null);
                        dispatch(getAllBaritem());
                    }
                } else {
                    const result = await dispatch(createBaritem(values));
                    if (createBaritem.fulfilled.match(result)) {
                        dispatch(setAlert({ text: "Bar Item created successfully..!", color: 'success' }));
                        resetForm();
                        setIsAddModalOpen(false);
                        setIsEditMode(false);
                        setEditingItem(null);
                        dispatch(getAllBaritem());
                    }
                }
            } catch (error) {
                console.error('Error creating bar item:', error);
            }
        },
    });

    const handleAddModalClose = () => {
        setIsAddModalOpen(false);
        setIsEditMode(false);
        setEditingItem(null);
        formik.resetForm();
    };

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteModalClose = () => {
        setItemToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;

        try {
            const result = await dispatch(deleteBaritem({ id: itemToDelete._id || itemToDelete.id }));

            if (deleteBaritem.fulfilled.match(result)) {
                dispatch(setAlert({ text: "Bar Item deleted successfully..!", color: 'success' }));
                dispatch(getAllBaritem());
            }
        } catch (error) {
            dispatch(setAlert({ text: "Failed to delete bar item", color: 'error' }));
        } finally {
            handleDeleteModalClose();
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid':
                return '#4EB045';
            case 'Unpaid':
                return '#EC0927';
            case 'Pending':
                return '#F7DF9C';
            default:
                return '#gray';
        }
    };

    const formatDate = (dateInput) => {
        if (!dateInput) return '';
        const date = new Date(dateInput);
        if (Number.isNaN(date.getTime())) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const toIsoDate = (dateInput) => {
        if (!dateInput) return '';
        const date = new Date(dateInput);
        if (Number.isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    };


    // Filter bookings based on search term
    const filteredBookings = barItem.filter((item) => {
        const searchLower = searchTerm.trim().toLowerCase();
        if (!searchLower) return true;

        const formattedCreatedAt = formatDate(item.createdAt).toLowerCase();
        const formattedDate = formatDate(item.date).toLowerCase();
        const isoCreatedAt = toIsoDate(item.createdAt).toLowerCase();
        const isoDate = toIsoDate(item.date).toLowerCase();

        return (
            item.name?.toLowerCase().includes(searchLower) ||
            item.category?.name?.toLowerCase().includes(searchLower) ||
            item.price?.toString().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            formattedCreatedAt.includes(searchLower) ||
            formattedDate.includes(searchLower) ||
            isoCreatedAt.includes(searchLower) ||
            isoDate.includes(searchLower)
        );
    });

    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredBookings.slice(startIndex, endIndex);

    const handleDownloadExcel = () => {
        try {
            if (filteredBookings.length === 0) {
                dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
                return;
            }
            // Prepare data for Excel
            const excelData = filteredBookings.map((item, index) => {
                const row = {};
                if (visibleColumns.no) {
                    row['No.'] = startIndex + index + 1;
                }
                if (visibleColumns.name) {
                    row['Name'] = item.name || '';
                }
                if (visibleColumns.category) {
                    row['Category'] = item.category.name || '';
                }
                if (visibleColumns.price) {
                    row['Price'] = item.price || '';
                }
                if (visibleColumns.image) {
                    row['Image'] = item.image ? item.image : '';
                }
                if (visibleColumns.description) {
                    row['Description'] = item.description || '';
                }

                return row;
            });

            // Create a new workbook
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Barlist');

            // Auto-size columns
            const maxWidth = 20;
            const wscols = Object.keys(excelData[0] || {}).map(() => ({ wch: maxWidth }));
            worksheet['!cols'] = wscols;

            // Generate file name with current date
            const date = new Date();
            const fileName = `Bar_List_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;

            // Download the file
            XLSX.writeFile(workbook, fileName);
            dispatch(setAlert({ text: "Export completed..!", color: 'success' }));
        } catch (error) {
            dispatch(setAlert({ text: "Export failed..!", color: 'error' }));
        }
    };

    const handleRefresh = () => {
        dispatch(getAllBaritem());
        setSearchTerm("");
        setCurrentPage(1);
    };

    return (
        <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">

            <section className="py-5">
                <h1 className="text-2xl font-semibold text-black">Bar Items</h1>
            </section>

            <div className='bg-white rounded-lg shadow-md'>

                {/* Header */}
                <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
                    <div className='flex gap-2 md:gap-5 sm:justify-between'>
                        {/* <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">Bar Items</p> */}

                        {/* Search Bar */}
                        <div className="relative  max-w-md">
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

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 justify-end mt-2 whitespace-nowrap">
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => {
                                    setIsEditMode(false);
                                    setEditingItem(null);
                                    formik.resetForm();
                                    setIsAddModalOpen(true);
                                }}
                                className="p-2 text-[#4CAF50] hover:text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded-lg transition-colors"
                                title="Show/Hide Columns"
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
                                <div className="absolute right-0 mt-2 w-44 md600:w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-50 ">
                                    <div className="px-3 py-2 md600:px-4 md:py-3 border-b border-gray-200">
                                        <h3 className="text-sm font-semibold text-gray-700">Show/Hide Column</h3>
                                    </div>
                                    <div className="max-h-44 overflow-y-auto">
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
                                                    {column === 'joiningDate' ? 'Joining Date' : column}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Refresh" onClick={handleRefresh}>
                            <RefreshCw size={20} />
                        </button>
                        <button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors" title="Download" onClick={handleDownloadExcel}>
                            <Download size={20} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-[#B79982] scrollbar-track-[#F7DF9C]/20 hover:scrollbar-thumb-[#876B56]">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] sticky top-0 z-10 shadow-sm">
                            <tr>
                                {visibleColumns.no && (
                                    <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">No</th>
                                )}
                                {visibleColumns.name && (
                                    <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Name</th>
                                )}
                                {visibleColumns.category && (
                                    <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Category</th>
                                )}
                                {visibleColumns.price && (
                                    <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Price</th>
                                )}
                                {visibleColumns.description && (
                                    <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Description</th>
                                )}
                                {visibleColumns.status && (
                                    <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Status</th>
                                )}
                                {visibleColumns.actions && (
                                    <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Action</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
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
                                currentData.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                                    >
                                        {visibleColumns.no && (
                                            <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{startIndex + index + 1}</td>
                                        )}

                                        {/* name */}
                                        {visibleColumns.name && (
                                            <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-[#E3C78A]"
                                                    />
                                                    <span className="text-sm font-medium text-gray-800 capitalize">{item.name}</span>
                                                </div>
                                            </td>
                                        )}

                                        {/* Category */}
                                        {visibleColumns.category && (
                                            <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700 capitalize">
                                                <div className="flex items-center gap-2">
                                                    {item.category?.name}
                                                </div>
                                            </td>
                                        )}

                                        {/* Price */}
                                        {visibleColumns.price && (
                                            <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    ${item.price}
                                                </div>
                                            </td>
                                        )}

                                        {/* description */}
                                        {visibleColumns.description && (
                                            <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700 whitespace-normal break-words max-w-[160px]">
                                                <div className="line-clamp-3">
                                                    {item.description || ''}
                                                </div>
                                            </td>
                                        )}

                                        {/* Status */}
                                        {visibleColumns.status && (
                                            <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                <div className="flex flex-col items-start gap-1">
                                                    <div className="w-full"></div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.available || false}
                                                            onChange={async () => {
                                                                try {
                                                                    const result = await dispatch(toggleBaritemStatus({ id: item._id || item.id }));
                                                                    if (toggleBaritemStatus.fulfilled.match(result)) {
                                                                        dispatch(setAlert({ text: "Status updated successfully", color: 'success' }));
                                                                        dispatch(getAllBaritem());
                                                                    }
                                                                } catch (error) {
                                                                    dispatch(setAlert({ text: "Failed to update status", color: 'error' }));
                                                                }
                                                            }}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#B79982] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4CAF50]"></div>
                                                    </label>
                                                </div>
                                            </td>
                                        )}

                                        {/* Actions */}
                                        {visibleColumns.actions && (
                                            <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                <div className="mv_table_action flex">
                                                    <div onClick={() => handleViewClick(item)}><IoEyeSharp className='text-[18px] text-quaternary' /></div>
                                                    <div onClick={() => {
                                                        setIsEditMode(true);
                                                        setEditingItem(item);
                                                        formik.setValues({
                                                            name: item.name || '',
                                                            category: item.category?._id || '',
                                                            price: item.price || '',
                                                            description: item.description || '',
                                                            image: null,
                                                        });
                                                        formik.setTouched({});
                                                        setIsAddModalOpen(true);
                                                    }}>
                                                        <FiEdit className="text-[#6777ef] text-[18px]" />
                                                    </div>
                                                    <div onClick={() => handleDeleteClick(item)}><RiDeleteBinLine className="text-[#ff5200] text-[18px]" /></div>
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
                                            <p className="text-lg font-medium">No data available</p>
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

            {/* View Modal */}
            {isModalOpen && selectedItem && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black/50  transition-opacity duration-300" onClick={handleCloseModal}></div>

                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-[4px] bg-white text-left shadow-xl transition-all sm:my-8 sm:w-[80%] sm:max-w-xl">
                            {/* Modal Header */}
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                                <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
                                    <h3 className="text-lg font-semibold text-black">Bar Item Details</h3>
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
                                <div className="">

                                    {/* Image */}
                                    <div className="flex items-center mb-4">
                                        <img
                                            src={selectedItem.image}
                                            alt={selectedItem.name}
                                            className="min-w-32 h-32 m-auto"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Name:</span>
                                            <span className="text-gray-900 capitalize">{selectedItem.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Category:</span>
                                            <span className="text-gray-900 capitalize">{selectedItem.category?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Price:</span>
                                            <span className="text-gray-900">${selectedItem.price}</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Description:</span>
                                            <span className="text-gray-900">{selectedItem.description || ''}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add & Edit Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={handleAddModalClose}></div>
                    <div className="relative w-full md:max-w-xl max-w-[90%] rounded-[4px] bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
                            <h2 className="text-2xl font-semibold text-black">
                                {isEditMode ? 'Edit Bar Item' : 'Add Bar Item'}
                            </h2>
                            <button onClick={handleAddModalClose} className="text-gray-500 hover:text-gray-800">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form className="" onSubmit={formik.handleSubmit}>
                            <div className="flex flex-col mb-4">
                                <label htmlFor="name" className="text-sm font-medium text-black mb-1">Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter Name"
                                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.name && formik.errors.name ? (
                                    <p className="text-sm text-red-500">{formik.errors.name}</p>
                                ) : null}
                            </div>

                            <div className="flex flex-col mb-4">
                                <label htmlFor="category" className="text-sm font-medium text-black mb-1">Category</label>
                                <div className="relative" ref={categoryDropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                        onBlur={formik.handleBlur}
                                        name="category"
                                        className={`w-full rounded-[4px] border px-2 py-2 focus:outline-none bg-[#1414140F] flex items-center justify-between ${formik.touched.category && formik.errors.category
                                            ? 'border-red-500'
                                            : 'border-gray-200'
                                            }`}
                                    >
                                        <span className={formik.values.category ? 'text-black' : 'text-gray-400'}>
                                            {formik.values.category
                                                ? categories.find(cat => cat._id === formik.values.category)?.name || 'Select Category'
                                                : 'Select Category'}
                                        </span>
                                        <ChevronDown
                                            size={18}
                                            className={`text-gray-600 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                    {showCategoryDropdown && (
                                        <div className="absolute z-50 w-full bg-white border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
                                            {categories.length === 0 ? (
                                                <div className="px-4 py-2 text-sm text-gray-500">No categories available</div>
                                            ) : (
                                                categories.map((cat) => (
                                                    <div
                                                        key={cat._id}
                                                        onClick={() => {
                                                            formik.setFieldValue('category', cat._id);
                                                            setShowCategoryDropdown(false);
                                                        }}
                                                        className={`px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors ${formik.values.category === cat._id
                                                            ? 'bg-[#F7DF9C] text-black/100 font-medium'
                                                            : 'text-black/100'
                                                            }`}
                                                    >
                                                        {cat.name}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                                {formik.touched.category && formik.errors.category ? (
                                    <p className="text-sm text-red-500 mt-1">{formik.errors.category}</p>
                                ) : null}
                            </div>

                            <div className="flex flex-col mb-4">
                                <label htmlFor="price" className="text-sm font-medium text-black mb-1">Price</label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    placeholder="Enter Price"
                                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                                    value={formik.values.price}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    min="0"
                                    step="0.01"
                                />
                                {formik.touched.price && formik.errors.price ? (
                                    <p className="text-sm text-red-500">{formik.errors.price}</p>
                                ) : null}
                            </div>

                            <div className="flex flex-col mb-4">
                                <label htmlFor="description" className="text-sm font-medium text-black mb-1">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Enter Description"
                                    rows="4"
                                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F] resize-none"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.description && formik.errors.description ? (
                                    <p className="text-sm text-red-500">{formik.errors.description}</p>
                                ) : null}
                            </div>

                            <div className="flex flex-col mb-4">
                                <label htmlFor="image" className="text-sm font-medium text-black mb-1">Image</label>
                                <label className="flex w-full cursor-pointer items-center justify-between rounded-[4px] border border-gray-200 px-2 py-2 text-gray-500 bg-[#1414140F]">
                                    <span className="truncate">
                                        {formik.values.image
                                            ? formik.values.image.name
                                            : (isEditMode && editingItem?.image
                                                ? getImageFileName(editingItem.image)
                                                : 'Choose file')}
                                    </span>
                                    <span className="rounded-[4px] bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] px-4 py-1 text-black text-sm">Browse</span>
                                    <input
                                        id="image"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(event) => {
                                            const file = event.currentTarget.files && event.currentTarget.files[0];
                                            formik.setFieldValue('image', file);
                                        }}
                                        onBlur={formik.handleBlur}
                                    />
                                </label>
                                {formik.touched.image && formik.errors.image ? (
                                    <p className="text-sm text-red-500">{formik.errors.image}</p>
                                ) : null}
                            </div>

                            <div className="flex items-center justify-center pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleAddModalClose}
                                    className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
                                >
                                    {isEditMode ? 'Edit' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={handleDeleteModalClose}></div>
                    <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl">
                        <div className="flex items- justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-black">Delete Bar Item</h2>
                            <button onClick={handleDeleteModalClose} className="text-gray-500 hover:text-gray-800">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-700 mb-8 text-center">Are you sure you want to delete this bar item?</p>
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
                                onClick={handleDeleteConfirm}
                                className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default BarItems;