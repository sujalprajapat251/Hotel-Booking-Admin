import React, { useState, useEffect, useRef } from 'react';
import { RiDeleteBinLine } from 'react-icons/ri';
import { FiEdit, FiPlusCircle } from 'react-icons/fi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllTerms, createTerms, updateTerms, deleteTerms } from '../Redux/Slice/terms.slice';

const TermsTable = () => {

  const dispatch = useDispatch();
  const { terms, loading } = useSelector((state) => state.terms);

  const [search, setSearch] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const dropdownRef = useRef(null);

  const [visibleColumns, setVisibleColumns] = useState({
    title: true,
    description: true,
    actions: true,
  });
  const visibleColumnCount = Object.values(visibleColumns).filter(Boolean).length || 1;

  // 🔹 Initial API Call
  useEffect(() => {
    dispatch(getAllTerms());
  }, [dispatch]);

  // Prevent background scrolling when add/edit/delete modals are open
  useEffect(() => {
    const anyModalOpen = isAddModalOpen || isDeleteModalOpen;
    if (anyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAddModalOpen, isDeleteModalOpen]);

  const filteredTerms = (terms ?? []).filter(
    (item) =>
      item?.title?.toLowerCase().includes(search.toLowerCase()) ||
      item?.description?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const calculatedPages = Math.max(1, Math.ceil(filteredTerms.length / itemsPerPage));
    setCurrentPage((prev) => Math.min(prev, calculatedPages));
  }, [filteredTerms.length, itemsPerPage]);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      description: Yup.string().required('Description is required'),
    }),
    onSubmit: (values, { resetForm }) => {
      if (isEditMode) {
        const targetId = editingItem?._id || editingItem?.id;
        dispatch(updateTerms({ id: targetId, ...values })).then(() => {
          dispatch(getAllTerms());
        });
      } else {
        dispatch(createTerms(values)).then(() => {
          dispatch(getAllTerms());
        });
      }
      resetForm();
      setIsAddModalOpen(false);
      setIsEditMode(false);
      setEditingItem(null);
    },
  });

  const handleEditClick = (item) => {
    setIsEditMode(true);
    setEditingItem(item);
    formik.setValues({
      title: item.title,
      description: item.description,
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      const targetId = itemToDelete._id || itemToDelete.id;
      dispatch(deleteTerms({ id: targetId })).then(() => {
        dispatch(getAllTerms());
      });
    }
    setIsDeleteModalOpen(false);
  };

  const totalItems = filteredTerms.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = totalItems === 0 ? 0 : Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filteredTerms.slice(startIndex, endIndex);
  const displayStart = totalItems === 0 ? 0 : startIndex + 1;
  const displayEnd = totalItems === 0 ? 0 : endIndex;

  const handleRefresh = () => {
    dispatch(getAllTerms());
    setSearch("");
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
      <section className="py-5">
        <h1 className="text-2xl font-semibold text-black">Terms & Conditions</h1>
      </section>

      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-200">
          <div className='flex gap-2 md:gap-6 sm:justify-between'>

            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <div className='flex mt-2 whitespace-nowrap'>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setEditingItem(null);
                  formik.resetForm();
                  setIsAddModalOpen(true);
                }}
                className="p-2 text-[#4CAF50] hover:text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded-lg transition-colors"
                title="Add Terms"
              >
                <FiPlusCircle size={20} />
              </button>
              <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Refresh" onClick={handleRefresh}>
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-[#B79982] scrollbar-track-[#F7DF9C]/20 hover:scrollbar-thumb-[#876B56]">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">No</th>
                <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Title</th>
                <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Description</th>
                <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <RefreshCw className="w-12 h-12 mb-4 text-[#B79982] animate-spin" />
                      <p className="text-lg font-medium">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : currentData.length > 0 ? (
                currentData.map((item, index) => (
                  <tr key={index} className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10">
                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{startIndex + index + 1}</td>
                    <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{item.title}</td>
                    <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                      <div className="line-clamp-3">
                        {item.description || ''}
                      </div>
                    </td>
                    <td className="px-2 py-6 align-top">
                      <div className="mv_table_action flex">
                        <div onClick={() => handleEditClick(item)}>
                          <FiEdit className="text-[#6777ef] text-[18px]" /></div>
                        <div onClick={() => handleDeleteClick(item)}><RiDeleteBinLine className="text-[#ff5200] text-[18px]" /></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center">
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
        <div className="flex items-center justify-between px-1 sm:px-3 py-3 border-t border-gray-200 bg-gray-50">
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
              {displayStart} - {displayEnd} of {totalItems}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={safeCurrentPage === 1}
                className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={safeCurrentPage === totalPages || totalItems === 0}
                className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-lg rounded-md bg-white p-6 shadow-xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">
                {isEditMode ? 'Edit Terms & Conditions' : 'Add Terms & Conditions'}
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-800">
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
                <label htmlFor="description" className="text-sm font-medium text-black mb-1">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  placeholder="Enter Description"
                  className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                ></textarea>
                {formik.touched.description && formik.errors.description ? (
                  <p className="text-sm text-red-500">{formik.errors.description}</p>
                ) : null}
              </div>

              <div className="flex items-center justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">Delete Terms</h2>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 mb-8 text-center">Are you sure you want to delete?</p>
            <div className="flex items-center justify-center gap-3">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]">Cancel</button>
              <button type="button" onClick={handleDeleteConfirm} className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsTable;