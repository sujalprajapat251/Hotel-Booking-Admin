import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Filter, RefreshCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { FiEdit, FiPlusCircle } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import { setAlert } from '../../Redux/Slice/alert.slice';
import { createCafeTable, deleteCafeTable, getAllCafeTable, updateCafeTable } from '../../Redux/Slice/cafeTable.slice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../Utils/baseUrl'

const HODTable = () => {
  const dispatch = useDispatch();
  const {cafeTable,loading} = useSelector((state) => state.cafeTable);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const dropdownRef = useRef(null);

  const [visibleColumns, setVisibleColumns] = useState({
    No: true,
    title: true,
    limit: true,
    status: true,
    actions: true
  });

  const filteredData = cafeTable.filter((item) => {
    const searchLower = searchTerm.trim().toLowerCase();
    if (!searchLower) return true;
    let matchesStatus = false;
    if ('available'.includes(searchLower) && (searchLower === 'available' || 'available'.startsWith(searchLower))) {
      matchesStatus = item.status === true;
    }
    if ('occupied'.includes(searchLower) && (searchLower === 'occupied' || 'occupied'.startsWith(searchLower))) {
      matchesStatus = item.status === false;
    }

    let statusString = '';
    if(item.status === true) statusString = 'available';
    else if(item.status === false) statusString = 'occupied';

    return (
      item.title?.toLowerCase().includes(searchLower) ||
      item.limit?.toString().toLowerCase().includes(searchLower) ||
      statusString.includes(searchLower) ||
      matchesStatus
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

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


  const validationSchema = useMemo(() => (
    Yup.object({
      title: Yup.string().required('Title is required'),
      limit: Yup.string().required('Limit is required'),
    })
  ), [isEditMode]);

  const formik = useFormik({
    initialValues: {
      title: '',
      limit: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (isEditMode && editingItem) {
          const payload = {
            ...values,
            id: editingItem._id || editingItem.id,
          };
          const result = await dispatch(updateCafeTable(payload));
          if (updateCafeTable.fulfilled.match(result)) {
            dispatch(setAlert({ text: "Cafe Table updated successfully..!", color: 'success' }));
            resetForm();
            setIsAddModalOpen(false);
            setIsEditMode(false);
            setEditingItem(null);
            dispatch(getAllCafeTable());
          }
        } else {
          const result = await dispatch(createCafeTable(values));
          if (createCafeTable.fulfilled.match(result)) {
            dispatch(setAlert({ text: "Cafe Table created successfully..!", color: 'success' }));
            resetForm();
            setIsAddModalOpen(false);
            setIsEditMode(false);
            setEditingItem(null);
            dispatch(getAllCafeTable());
          }
        }
      } catch (error) {
        console.error('Error creating Cafe Table:', error);
      }
    },
  });

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
    formik.resetForm();
  };

  const handleRefresh = () => {
    dispatch(getAllCafeTable());
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleDownloadExcel = () => {
    try {
      if (filteredData.length === 0) {
        dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
        return;
      }
      // Prepare data for Excel
      const excelData = filteredData.map((about, index) => {
        const row = {};

        if (visibleColumns.No) {
          row['No.'] = index + 1;
        }
        if (visibleColumns.title) {
          row['Title'] = about.title || '';
        }
        if (visibleColumns.limit) {
          row['Limit'] = about.limit || '';
        }
        if (visibleColumns.status) {
          const statusValue = about.status;
          if (statusValue === true || statusValue === 'true' || statusValue === 1) {
            row['Status'] = 'Available';
          } else {
            row['Status'] = 'Occupied';
          }
        }

        return row;
      });

      // Create a new workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Cafe_Tables');

      // Auto-size columns
      const maxWidth = 20;
      const wscols = Object.keys(excelData[0] || {}).map(() => ({ wch: maxWidth }));
      worksheet['!cols'] = wscols;

      // Generate file name with current date
      const date = new Date();
      const fileName = `Cafe_Tables_List_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, fileName);
      dispatch(setAlert({ text: "Export completed..!", color: 'success' }));
    } catch (error) {
      dispatch(setAlert({ text: "Export failed..!", color: 'error' }));
    }
  };

  useEffect(() => {
    dispatch(getAllCafeTable());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const s = io(SOCKET_URL, { auth: { token, userId }, transports: ['websocket','polling'], withCredentials: true });
    s.on('connect', () => { console.log('socket connected', s.id); });
    s.on('connect_error', (err) => { console.error('socket connect_error', err?.message || err); });
    s.on('error', (err) => { console.error('socket error', err?.message || err); });
    const refresh = () => dispatch(getAllCafeTable());
    s.on('cafe_order_changed', refresh);
    s.on('bar_order_changed', refresh);
    s.on('restaurant_order_changed', refresh);
    s.on('cafe_table_status_changed', refresh);
    s.on('bar_table_status_changed', refresh);
    s.on('restaurant_table_status_changed', refresh);
    return () => { s.disconnect(); };
  }, [dispatch]);

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
      const result = await dispatch(deleteCafeTable({ id: itemToDelete._id || itemToDelete.id }));

      if (deleteCafeTable.fulfilled.match(result)) {
        dispatch(setAlert({ text: "Cafe Table deleted successfully..!", color: 'success' }));
        dispatch(getAllCafeTable());
      }
    } catch (error) {
      dispatch(setAlert({ text: "Failed to delete Cafe Table", color: 'error' }));
    } finally {
      handleDeleteModalClose();
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
        case true:
            return 'border border-green-500 text-green-600 bg-green-50';
        case false:
            return 'border border-red-500 text-red-600 bg-red-50';
        default:
            return 'border border-red-500 text-red-600 bg-red-50';
    }
};

  return (
    <div className='p-3 md:p-4 lg:p-5 bg-[#F0F3FB] h-full'>
      <p className='text-[20px] font-semibold text-black mt-4 md:mt-3'>Table Management</p>
      <div className="w-full mt-3 md:mt-5">
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
                    onClick={() => {
                      setIsEditMode(false);
                      setEditingItem(null);
                      formik.resetForm();
                      setIsAddModalOpen(true);
                    }}
                    className="p-2 text-[#4CAF50] hover:text-[#4CAF50] hover:bg-[#ecffed] rounded-lg transition-colors"
                    title="Add Table"
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
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] sticky top-0 z-10">
                <tr>
                  {visibleColumns.No && (
                    <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">No.</th>
                  )}
                  {visibleColumns.title && (
                    <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Title</th>
                  )}
                  {visibleColumns.limit && (
                    <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Limit</th>
                  )}
                  {visibleColumns.status && (
                    <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Status</th>
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
                  ) : currentData?.length > 0 ? (
                  currentData.map((about, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                    >
                      {visibleColumns.No && (
                        <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{startIndex + index + 1}</td>
                      )}
                      {visibleColumns.title && (
                        <td className="px-5 py-2 md600:py-3 lg:px-6 capitalize">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-800">{about.title}</span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.limit && (
                        <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            {about.limit}
                          </div>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700 capitalize">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-xl text-sm font-medium ${getStatusStyle(about.status)}`}>
                              {about.status ? "Available" : "Occupied"}
                            </span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                          <div className="mv_table_action flex">
                            <div
                              onClick={() => {
                                setIsEditMode(true);
                                setEditingItem(about);
                                formik.setValues({
                                  title: about.title || '',
                                  limit: about.limit || ''
                                });
                                formik.setTouched({});
                                setIsAddModalOpen(true);
                              }}>
                              <FiEdit className="text-[#6777ef] text-[18px]" />
                            </div>
                            <div onClick={() => handleDeleteClick(about)}>
                              <RiDeleteBinLine className='text-[#ff5200] text-[18px]' />
                            </div>
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

            <div className="flex items-center gap-1 sm:gap-3 md600:gap-2 md:gap-3">
              <span className="text-sm text-gray-600">
                {filteredData.length > 0 ? `${startIndex + 1} - ${Math.min(endIndex, filteredData.length)} of ${filteredData.length}` : '0 - 0 of 0'}
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

          {/* Add Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={handleAddModalClose}></div>
              <div className="relative w-full md:max-w-xl max-w-[90%] rounded-[4px] bg-white p-6 shadow-xl">
                <div className="flex items-start justify-between mb-6 pb-2 border-b border-gray-200">
                  <h2 className="text-2xl font-semibold text-black">
                    {isEditMode ? 'Edit Cafe Table' : 'Add Cafe Table'}
                  </h2>
                  <button onClick={handleAddModalClose} className="text-gray-500 hover:text-gray-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form className="" onSubmit={formik.handleSubmit}>
                  <div className="flex flex-col mb-4">
                    <label htmlFor="title" className="text-sm font-medium text-black mb-1">Title</label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="Enter Title"
                      className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                      value={formik.values.title}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.title && formik.errors.title ? (
                      <p className="text-sm text-red-500">{formik.errors.title}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-col mb-4">
                    <label htmlFor="limit" className="text-sm font-medium text-black mb-1">Limit</label>
                    <input
                      id="limit"
                      name="limit"
                      type="text"
                      placeholder="Enter Sub Title"
                      className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                      value={formik.values.limit}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.limit && formik.errors.limit ? (
                      <p className="text-sm text-red-500">{formik.errors.limit}</p>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
              <div className="absolute inset-0 bg-black/50" onClick={handleDeleteModalClose}></div>
              <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-black">Delete Cafe Table</h2>
                  <button onClick={handleDeleteModalClose} className="text-gray-500 hover:text-gray-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-700 mb-8 text-center">Are you sure you want to delete this Table?</p>
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
      </div>
    </div>
  );
};

export default HODTable;
