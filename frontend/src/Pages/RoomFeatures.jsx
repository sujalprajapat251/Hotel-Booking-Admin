import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import "../Style/vaidik.css"
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit, FiPlusCircle } from "react-icons/fi";
import { Search, Filter, ChevronLeft, ChevronRight, RefreshCw, ChevronDown, Download } from 'lucide-react';
import { setAlert } from '../Redux/Slice/alert.slice';
import { fetchFeatures, createFeature, updateFeature, deleteFeature } from '../Redux/Slice/featuresSlice';
import { fetchRoomTypes } from '../Redux/Slice/roomtypesSlice';
import * as XLSX from 'xlsx';

const RoomFeatures = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const roomTypeDropdownRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const dispatch = useDispatch();
  const { items: features } = useSelector((state) => state.features);
  const { items: roomTypes } = useSelector((state) => state.roomtypes);

  const [visibleColumns, setVisibleColumns] = useState({
    no: true,
    feature: true,
    roomType: true,
    actions: true,
  });

  const toggleColumn = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const [showRoomTypeDropdown, setShowRoomTypeDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowColumnDropdown(false);
      }
      if (roomTypeDropdownRef.current && !roomTypeDropdownRef.current.contains(event.target)) {
        setShowRoomTypeDropdown(false);
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

  useEffect(() => {
    dispatch(fetchFeatures());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchRoomTypes());
  }, [dispatch]);

  const validationSchema = useMemo(() => (
    Yup.object({
      feature: Yup.string().required('Feature name is required'),
      roomType: Yup.string().required('Room type is required'),
    })
  ), []);

  const formik = useFormik({
    initialValues: {
      feature: '',
      roomType: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (isEditMode && editingItem) {
          const payload = {
            id: editingItem._id || editingItem.id,
            feature: values.feature,
            roomType: values.roomType,
          };
          const result = await dispatch(updateFeature(payload));
          if (updateFeature.fulfilled.match(result)) {
            dispatch(setAlert({ text: "Feature updated successfully..!", color: 'success' }));
            resetForm();
            setIsAddModalOpen(false);
            setIsEditMode(false);
            setEditingItem(null);
            dispatch(fetchFeatures());
          }
        } else {
          const result = await dispatch(createFeature(values));
          if (createFeature.fulfilled.match(result)) {
            dispatch(setAlert({ text: "Feature created successfully..!", color: 'success' }));
            resetForm();
            setIsAddModalOpen(false);
            setIsEditMode(false);
            setEditingItem(null);
            dispatch(fetchFeatures());
          }
        }
      } catch (error) {
        console.error('Error saving feature:', error);
      }
    },
  });

  const selectedRoomTypeLabel = useMemo(() => {
    if (!formik.values.roomType) return '';
    const selected = roomTypes.find(
      (type) =>
        type._id === formik.values.roomType ||
        type.id === formik.values.roomType
    );
    return selected?.roomType || '';
  }, [formik.values.roomType, roomTypes]);

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
    formik.resetForm();
    setShowRoomTypeDropdown(false);
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
      const result = await dispatch(deleteFeature(itemToDelete._id || itemToDelete.id));

      if (deleteFeature.fulfilled.match(result)) {
        dispatch(setAlert({ text: "Feature deleted successfully..!", color: 'success' }));
        dispatch(fetchFeatures());
      }
    } catch (error) {
      dispatch(setAlert({ text: "Failed to delete feature", color: 'error' }));
    } finally {
      handleDeleteModalClose();
    }
  };

  // Filter bookings based on search term
  const filteredFeatures = features.filter((item) => {
    const searchLower = searchTerm.trim().toLowerCase();
    if (!searchLower) return true;

    return (
      item.feature?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.roomType?.roomType?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredFeatures.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFeatures = filteredFeatures.slice(startIndex, endIndex);

  const handleDownloadExcel = () => {
      try {
          // Prepare data for Excel
          const excelData = filteredFeatures.map((item, index) => {
            console.log("asd",item)
              const row = {};
                  row['No.'] = startIndex + index + 1;
                  row['Feature Name'] = item.feature || '';
                  row['Room Type'] = item.roomType.roomType || '';
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
          const fileName = `Feature_List_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;

          // Download the file
          XLSX.writeFile(workbook, fileName);
          dispatch(setAlert({ text: "Export completed..!", color: 'success' }));
      } catch (error) {
          dispatch(setAlert({ text: "Export failed..!", color: 'error' }));
      }
  };

  const handleRefresh = () => {
    dispatch((fetchFeatures()));
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">

      <section className="py-5">
        <h1 className="text-2xl font-semibold text-black">Room Features</h1>
      </section>

      <div className='bg-white rounded-lg shadow-md overflow-hidden'>

        {/* Header */}
        <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
          <div className='flex gap-2 md:gap-5 sm:justify-between'>
            <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">Room Features</p>

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
          <div className="flex items-center gap-1 justify-end mt-2">
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
                {visibleColumns.feature && (
                  <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Feature Name</th>
                )}
                {visibleColumns.roomType && (
                  <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Room Type</th>
                )}
                {visibleColumns.actions && (
                  <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentFeatures.length === 0 ? (
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
              ) : (
                currentFeatures.map((item, index) => (
                  <tr
                    key={item._id || index}
                    className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                  >
                    {visibleColumns.no && (
                      <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{startIndex + index + 1}</td>
                    )}
                    {visibleColumns.feature && (
                      <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          {item.feature}
                        </div>
                      </td>
                    )}
                    {visibleColumns.roomType && (
                      <td className="px-5 py-3 text-sm">
                        <span className="inline-flex items-center rounded-[4px] bg-[#F7DF9C]/50 px-3 py-1 text-xs font-semibold text-[#755647]">
                          {item.roomType?.roomType || item.roomType || 'N/A'}
                        </span>
                      </td>
                    )}
                    {/* Actions */}
                    {visibleColumns.actions && (
                      <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                        <div className="mv_table_action flex">
                          <div onClick={() => {
                            setIsEditMode(true);
                            setEditingItem(item);
                            formik.setValues({
                              feature: item.feature || '',
                              roomType:
                                (item.roomType && item.roomType._id) ||
                                item.roomTypeId ||
                                (typeof item.roomType === 'string' ? item.roomType : '') ||
                                '',
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
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-3 py-3 border-t border-gray-200 bg-gray-50">
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
              {startIndex + 1} - {Math.min(endIndex, filteredFeatures.length)} of {filteredFeatures.length}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleAddModalClose}></div>
          <div className="relative w-full md:max-w-xl max-w-[90%] rounded-[4px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-black">
                {isEditMode ? 'Edit Feature' : 'Add Feature'}
              </h2>
              <button onClick={handleAddModalClose} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="" onSubmit={formik.handleSubmit}>
              <div className="flex flex-col mb-4">
                <label htmlFor="feature" className="text-sm font-medium text-black mb-1">Room Feature Name</label>
                <input
                  id="feature"
                  name="feature"
                  type="text"
                  placeholder="Enter Name"
                  className={`w-full rounded-[4px] border px-2 py-2 focus:outline-none bg-[#1414140F] ${
                    formik.touched.feature && formik.errors.feature ? 'border-red-500' : 'border-gray-200'
                  }`}
                  value={formik.values.feature}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.feature && formik.errors.feature ? (
                  <p className="text-sm text-red-500">{formik.errors.feature}</p>
                ) : null}
              </div>
              <div className="flex flex-col mb-4">
                <label htmlFor="roomType" className="text-sm font-medium text-black mb-1">Room Type</label>
                <div className="relative" ref={roomTypeDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowRoomTypeDropdown((prev) => !prev)}
                    className={`w-full rounded-[4px] border px-2 py-2 focus:outline-none bg-[#1414140F] flex items-center justify-between ${
                      formik.touched.roomType && formik.errors.roomType ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <span className={selectedRoomTypeLabel ? 'text-black' : 'text-gray-400'}>
                      {selectedRoomTypeLabel || 'Select Room Type'}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-gray-600 transition-transform ${showRoomTypeDropdown ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {showRoomTypeDropdown && (
                    <div className="absolute z-50 w-full bg-white border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
                      {roomTypes.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-500">No room types available</div>
                      ) : (
                        roomTypes.map((type) => {
                          const typeId = type._id || type.id;
                          const isSelected = formik.values.roomType === typeId;
                          return (
                            <div
                              key={typeId}
                              onClick={() => {
                                formik.setFieldValue('roomType', typeId);
                                setShowRoomTypeDropdown(false);
                              }}
                              className={`px-4 py-1 cursor-pointer text-sm transition-colors hover:bg-[#F7DF9C] ${
                                isSelected ? 'bg-[#F7DF9C] text-black font-medium' : 'text-black'
                              }`}
                            >
                              {type.roomType}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
                {formik.touched.roomType && formik.errors.roomType ? (
                  <p className="text-sm text-red-500 mt-1">{formik.errors.roomType}</p>
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
          <div className="absolute inset-0 bg-black/40" onClick={handleDeleteModalClose}></div>
          <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl">
            <div className="flex items- justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">Delete Feature</h2>
              <button onClick={handleDeleteModalClose} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 mb-8 text-center">Are you sure you want to delete this feature?</p>
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

export default RoomFeatures;