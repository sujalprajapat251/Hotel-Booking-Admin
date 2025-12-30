import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import "../Style/vaidik.css"
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit, FiPlusCircle } from "react-icons/fi";
import { Search, Filter, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import { setAlert } from '../Redux/Slice/alert.slice';
import { addRestaurantcategory, deleteRestaurantcategory, getAllRestaurantcategory, updateRestaurantcategory } from '../Redux/Slice/restaurantcategorySlice';

const Restaurantcategory = () => {

  const dispatch = useDispatch();
  const { restaurantcategory, loading } = useSelector((state) => state.restaurantcategory);

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

  const [visibleColumns, setVisibleColumns] = useState({
    no: true,
    restaurantcategoryname: true,
    actions: true,
  });

  const toggleColumn = useCallback((column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
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

  useEffect(() => {
    const shouldDisableScroll = isAddModalOpen || isDeleteModalOpen;
    if (shouldDisableScroll) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isAddModalOpen, isDeleteModalOpen]);

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Restaurant Category Name is required'),
    }),
    onSubmit: (values, { resetForm }) => {
      if (isEditMode && editingItem) {
        dispatch(updateRestaurantcategory({ restaurantcategorytId: editingItem._id, restaurantcategoryData: values }))
          .then(() => {
            dispatch(getAllRestaurantcategory());
            resetForm();
            setIsAddModalOpen(false);
            setEditingItem(null);
            setIsEditMode(false);
          });
      } else {
        dispatch(addRestaurantcategory(values))
          .then(() => {
            dispatch(getAllRestaurantcategory());
            resetForm();
            setIsAddModalOpen(false);
          });
      }
    }
  });

  const handleAddModalClose = useCallback(() => {
    setIsAddModalOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
    formik.resetForm();
  }, []);

  const handleDeleteClick = useCallback((item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteModalClose = useCallback(() => {
    setItemToDelete(null);
    setIsDeleteModalOpen(false);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (itemToDelete) {
      dispatch(deleteRestaurantcategory(itemToDelete._id))
        .then(() => {
          dispatch(getAllRestaurantcategory());
        });
    }
    handleDeleteModalClose();
  }, [dispatch, itemToDelete]);

  const filtereRestaurantcategory = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    return restaurantcategory.filter(item =>
      item.name?.toLowerCase().includes(searchLower)
    );
  }, [restaurantcategory, searchTerm]);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filtereRestaurantcategory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
      totalPages,
      startIndex,
      endIndex,
      currentData: filtereRestaurantcategory.slice(startIndex, endIndex),
    };
  }, [filtereRestaurantcategory, currentPage, itemsPerPage]);

  const { totalPages, startIndex, endIndex, currentData } = paginationData;


  const handleRefresh = useCallback(() => {
    dispatch(getAllRestaurantcategory());
    setSearchTerm("");
    setCurrentPage(1);
  }, [dispatch]);
  

  const handleDownloadExcel = useCallback(() => {
    try {
      if (filtereRestaurantcategory.length === 0) {
        dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
        return;
      }
      // Prepare data for Excel
      const excelData = filtereRestaurantcategory.map((user, index) => {
        const row = {};

        if (visibleColumns.no) {
          row['No.'] = index + 1;
        }
        if (visibleColumns.restaurantcategoryname) {
          row['Name'] = user.name || '';
        }
        return row;
      });

      // Create a new workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

      // Auto-size columns
      const maxWidth = 20;
      const wscols = Object.keys(excelData[0] || {}).map(() => ({ wch: maxWidth }));
      worksheet['!cols'] = wscols;

      // Generate file name with current date
      const date = new Date();
      const fileName = `Restaurant_Category_List_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, fileName);
      dispatch(setAlert({ text: "Export completed..!", color: 'success' }));
    } catch (error) {
      dispatch(setAlert({ text: "Export failed..!", color: 'error' }));
    }
  }, [filtereRestaurantcategory, dispatch]);
  

  useEffect(() => {
    dispatch(getAllRestaurantcategory());
  }, [dispatch])


  return (
    <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
      <section className="py-5">
        <h1 className="text-2xl font-semibold text-black">Restaurant Category</h1>
      </section>

      {/* Header */}
      <div className='bg-white rounded-lg shadow-md'>

        {/* Header */}
        <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
          <div className='flex gap-2 md:gap-5 sm:justify-between items-center min-w-0'>

            {/* Search Bar */}
            <div className="relative flex-1 min-w-0">
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
            <div className="relative inline-flex items-center" ref={dropdownRef}>
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setEditingItem(null);
                  formik.resetForm();
                  setIsAddModalOpen(true);
                }}
                className="p-2 text-[#4CAF50] hover:text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded-lg transition-colors flex-shrink-0"
                title="Add Restaurant Category"
              >
                <FiPlusCircle size={20} />
              </button>

              <div className='relative'>
                <button
                  onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                  className="p-2 text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors flex-shrink-0"
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
                            {column}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0" title="Refresh" onClick={handleRefresh}>
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors flex-shrink-0" title="Download" onClick={handleDownloadExcel}>
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

                {visibleColumns.restaurantcategoryname && (
                  <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Restaurant Category Name</th>
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
                      <p className="text-lg font-medium">Loading Restaurant Category...</p>
                    </div>
                  </td>
                </tr>
              ) : currentData.length > 0 ? (
                currentData.map((item, index) => (
                  <tr
                    key={item._id || index}
                    className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                  >
                    {visibleColumns.no && (
                      <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{startIndex + index + 1}</td>
                    )}
                    {/* title */}
                    {visibleColumns.restaurantcategoryname && (
                      <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700 capitalize">
                        <div className="flex items-center gap-2">
                          {item.name}
                        </div>
                      </td>
                    )}
                    {/* Actions */}
                    {visibleColumns.actions && (
                      <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                        <div className="mv_table_action flex">
                          <div onClick={() => {
                            setIsEditMode(true);
                            setEditingItem(item);
                            formik.setValues({ name: item.name });
                            setIsAddModalOpen(true);
                          }}><FiEdit className="text-[#6777ef] text-[18px]" /></div>
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
                      <p className="text-lg font-medium">No Restaurant Category available</p>
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
              {startIndex + 1} - {Math.min(endIndex, filtereRestaurantcategory.length)} of {filtereRestaurantcategory.length}
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

      {/* Add & Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleAddModalClose}></div>
          <div className="relative w-full max-w-lg rounded-md bg-white p-6 shadow-xl mx-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-black">
                {isEditMode ? 'Edit Restaurant Category' : 'Add Restaurant Category'}
              </h2>
              <button onClick={handleAddModalClose} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="" onSubmit={formik.handleSubmit}>
              <div className="flex flex-col mb-4">
                <label htmlFor="name" className="text-sm font-medium text-black mb-1">Restaurant Category Name</label>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleDeleteModalClose}></div>
          <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">Delete Restaurant Category</h2>
              <button onClick={handleDeleteModalClose} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 mb-8 text-center">Are you sure you want to delete this restaurant category?</p>
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

export default Restaurantcategory;