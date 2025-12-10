import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import "../Style/vaidik.css"
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit, FiPlusCircle } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { IoEyeSharp } from 'react-icons/io5';
import { Search, Filter, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { getAllBlog, createBlog, updateBlog, deleteBlog } from '../Redux/Slice/blogSlice';
import * as XLSX from 'xlsx';
import 'react-quill-new/dist/quill.snow.css';
import { setAlert } from '../Redux/Slice/alert.slice';

const Blog = () => {
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
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {blog,loading} = useSelector((state) => state.blog);

    const [visibleColumns, setVisibleColumns] = useState({
        no: true,
        image: true,
        title: true,
        subtitle: true,
        description: true,
        tag: true,
        count: true,
        date: true,
        actions: true,
    });
    const visibleColumnCount = Object.values(visibleColumns).filter(Boolean).length || 1;

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
        dispatch(getAllBlog());
    }, [dispatch]);

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
            title: Yup.string().required('Title is required'),
            subtitle: Yup.string().required('Sub Title is required'),
            description: Yup.string().required('Description is required'),
            tag: Yup.string().required('Tag is required'),
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
            title: '',
            subtitle: '',
            description: '',
            tag: '',
            count: '',
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
                    const result = await dispatch(updateBlog(payload));
                    if (updateBlog.fulfilled.match(result)) {
                        dispatch(setAlert({ text: "Blog updated successfully..!", color: 'success' }));
                        resetForm();
                        setIsAddModalOpen(false);
                        setIsEditMode(false);
                        setEditingItem(null);
                        dispatch(getAllBlog());
                    }
                } else {
                    const result = await dispatch(createBlog(values));
                    if (createBlog.fulfilled.match(result)) {
                        dispatch(setAlert({ text: "Blog created successfully..!", color: 'success' }));
                        resetForm();
                        setIsAddModalOpen(false);
                        setIsEditMode(false);
                        setEditingItem(null);
                        dispatch(getAllBlog());
                    }
                }
            } catch (error) {
                console.error('Error creating blog:', error);
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
            const result = await dispatch(deleteBlog({ id: itemToDelete._id || itemToDelete.id }));

            if (deleteBlog.fulfilled.match(result)) {
                dispatch(setAlert({ text: "Blog deleted successfully..!", color: 'success' }));
                dispatch(getAllBlog());
            }
        } catch (error) {
            dispatch(setAlert({ text: "Failed to delete blog", color: 'error' }));
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

    const stripHtmlTags = (htmlString = '') => {
        if (!htmlString) return '';
        const tempElement = document.createElement('div');
        tempElement.innerHTML = htmlString;
        return tempElement.textContent || tempElement.innerText || '';
    };

    // Filter bookings based on search term
    const filteredBookings = blog.filter((item) => {
        const searchLower = searchTerm.trim().toLowerCase();
        if (!searchLower) return true;

        const formattedDate = formatDate(item.date).toLowerCase();
        const isoCreatedAt = toIsoDate(item.createdAt).toLowerCase();
        const isoDate = toIsoDate(item.date).toLowerCase();
        const plainDescription = stripHtmlTags(item.description).toLowerCase();
        const countValue = item.count !== undefined && item.count !== null ? item.count.toString().toLowerCase() : '';

        return (
            item.title?.toLowerCase().includes(searchLower) ||
            item.subtitle?.toLowerCase().includes(searchLower) ||
            plainDescription.includes(searchLower) ||
            item.date?.toLowerCase().includes(searchLower) ||
            item.name?.toLowerCase().includes(searchLower) ||
            item.tag?.toLowerCase().includes(searchLower) ||
            countValue.includes(searchLower) ||
            (item?.createdAt && (formatDate(item.createdAt).toLowerCase().includes(searchTerm.toLowerCase()) || formatDate(item.createdAt).replace(/\//g, "-").toLowerCase().includes(searchTerm.toLowerCase()))) ||
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
                if (visibleColumns.image) {
                    row['Image'] = item.image ? item.image : '';
                }
                if (visibleColumns.title) {
                    row['Title'] = item.title || '';
                }
                if (visibleColumns.subtitle) {
                    row['Sub Title'] = item.subtitle || '';
                }
                if (visibleColumns.description) {
                    row['Description'] = stripHtmlTags(item.description);
                }
                if (visibleColumns.tag) {
                    row['Tag'] = item.tag || '';
                }
                if (visibleColumns.count) {
                    row['Count'] = item.count ?? 0;
                }
                return row;
            });

            // Create a new workbook
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Blog');

            // Auto-size columns
            const maxWidth = 20;
            const wscols = Object.keys(excelData[0] || {}).map(() => ({ wch: maxWidth }));
            worksheet['!cols'] = wscols;

            // Generate file name with current date
            const date = new Date();
            const fileName = `Blog_List_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;

            // Download the file
            XLSX.writeFile(workbook, fileName);
            dispatch(setAlert({ text: "Export completed..!", color: 'success' }));
        } catch (error) {
            dispatch(setAlert({ text: "Export failed..!", color: 'error' }));
        }
    };

    const handleRefresh = () => {
        dispatch(getAllBlog());
        setSearchTerm("");
        setCurrentPage(1);
    };


    return (
        <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">

            <section className="py-5">
                <h1 className="text-2xl font-semibold text-black">Blog</h1>
            </section>

            {/* Header */}
            <div className='bg-white rounded-lg shadow-md'>

                {/* Header */}
                <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
                    <div className='flex gap-2 md:gap-5 sm:justify-between'>
                        {/* <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">Blog</p> */}

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
                                onClick={() => navigate('/blog/addblog', { state: { mode: 'add' } })}
                                className="p-2 text-[#4CAF50] hover:text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded-lg transition-colors"
                                title="Add Blog"
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
                                {visibleColumns.image && (
                                    <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Image</th>
                                )}
                                {visibleColumns.title && (
                                    <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Title</th>
                                )}
                                {visibleColumns.subtitle && (
                                    <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Sub Title</th>
                                )}
                                {visibleColumns.description && (
                                    <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Description</th>
                                )}
                                {visibleColumns.tag && (
                                    <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Tag</th>
                                )}
                                {visibleColumns.count && (
                                    <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Count</th>
                                )}
                                {visibleColumns.date && (
                                    <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Date</th>
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

                                        {/* Guest Name */}
                                        {visibleColumns.image && (
                                            <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-11 h-11 rounded-full object-cover border-2 border-[#E3C78A] shadow-sm"
                                                        />
                                                        <div className="absolute -bottom-0 -right-0 w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(item.status) }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                        )}

                                        {/* title */}
                                        {visibleColumns.title && (
                                            <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    {item.title}
                                                </div>
                                            </td>
                                        )}

                                        {/* subtitle */}
                                        {visibleColumns.subtitle && (
                                            <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    {item.subtitle}
                                                </div>
                                            </td>
                                        )}

                                        {/* description */}
                                        {visibleColumns.description && (
                                            <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700 whitespace-normal break-words max-w-[160px]">
                                                <div
                                                    className="prose prose-sm max-w-none line-clamp-3"
                                                    dangerouslySetInnerHTML={{ __html: item.description || '' }}
                                                />
                                            </td>
                                        )}

                                        {/* tag */}
                                        {visibleColumns.tag && (
                                            <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{item.tag || ''}</td>
                                        )}

                                        {/* count */}
                                        {visibleColumns.count && (
                                            <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{item.count ?? 0}</td>
                                        )}
                                        {/* date */}
                                        {visibleColumns.date && (
                                            <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{item.createdAt ? formatDate(item.createdAt) : ''}</td>
                                        )}

                                        {/* Actions */}
                                        {visibleColumns.actions && (
                                            <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                <div className="mv_table_action flex">
                                                    <div onClick={() => handleViewClick(item)}><IoEyeSharp className='text-[18px] text-quaternary' /></div>
                                                    <div
                                                        onClick={() => {
                                                            setIsEditMode(true);
                                                            setEditingItem(item);
                                                            formik.setValues({
                                                                title: item.title || '',
                                                                subtitle: item.subtitle || '',
                                                                description: item.description || '',
                                                                tag: item.tag || '',
                                                                count: item.count || '',
                                                                image: null,
                                                            });
                                                            formik.setTouched({});
                                                            setIsAddModalOpen(true);
                                                            navigate('/blog/addblog', { state: { mode: 'edit', blog: item } });
                                                        }}
                                                    ><FiEdit className="text-[#6777ef] text-[18px]" /></div>
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
                <div className="flex items-center justify-between px-1 sm:px-3 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
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
                    <div className="fixed inset-0 bg-black/50" onClick={handleCloseModal}></div>

                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-[4px] bg-white text-left shadow-xl transition-all sm:my-8 sm:w-[80%] sm:max-w-xl">
                            {/* Modal Header */}
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                                <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
                                    <h3 className="text-lg font-semibold text-black">Blog Details</h3>
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
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Title:</span>
                                            <span className="text-gray-900">{selectedItem.title}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Sub Title:</span>
                                            <span className="text-gray-900 max-h-40 overflow-y-auto prose prose-sm max-w-none">{selectedItem.subtitle}</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Description:</span>
                                            <div
                                                className="text-gray-900 max-h-40 overflow-y-auto prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: selectedItem.description || '' }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Tag:</span>
                                            <span className="text-gray-900">{selectedItem.tag}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Count:</span>
                                            <span className="text-gray-900">{selectedItem.count ?? 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/50" onClick={handleDeleteModalClose}></div>
                    <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-black">Delete Blog</h2>
                            <button onClick={handleDeleteModalClose} className="text-gray-500 hover:text-gray-800">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-700 mb-8 text-center">Are you sure you want to delete this blog?</p>
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

export default Blog;