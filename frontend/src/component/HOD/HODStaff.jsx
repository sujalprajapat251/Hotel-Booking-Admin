import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, RefreshCw, Download, ChevronLeft, ChevronRight, MapPin, Phone, Mail } from 'lucide-react';
import { FiEdit, FiPlusCircle } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteStaff } from '../../Redux/Slice/staff.slice';
import { IMAGE_URL } from '../../Utils/baseUrl';
import * as XLSX from 'xlsx';
import { setAlert } from '../../Redux/Slice/alert.slice';
import { getAllHODStaff } from '../../Redux/Slice/hod.slice';
import { IoEyeSharp } from 'react-icons/io5';

const HODStaff = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {staff,loading} = useSelector((state) => state.hod)

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    No: true,
    image: true,
    name: true,
    designation: true,
    department:true,
    mobileno: true,
    email: true,
    gender: true,
    joiningDate: true,
    address: true,
    actions: true
  });

  const handleViewClick = useCallback((staff) => {
    setSelectedItem(staff);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItem(null);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return (staff || []).filter(st =>
      st?.name?.toLowerCase().includes(q) ||
      st?.email?.toLowerCase().includes(q) ||
      st?.gender?.toLowerCase().includes(q) ||
      st?.mobileno?.toString().includes(searchTerm) ||
      st?.designation?.toLowerCase().includes(q) ||
      (st?.joiningdate && (formatDate(st.joiningdate).toLowerCase().includes(q) || formatDate(st.joiningdate).replace(/\//g, "-").toLowerCase().includes(q))) ||
      st?.address?.toLowerCase().includes(q)
    );
  }, [staff, searchTerm, formatDate]);

  const totalPages = useMemo(() => Math.ceil(filteredData.length / itemsPerPage), [filteredData, itemsPerPage]);
  const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage, itemsPerPage]);
  const endIndex = useMemo(() => startIndex + itemsPerPage, [startIndex, itemsPerPage]);
  const currentData = useMemo(() => filteredData.slice(startIndex, endIndex), [filteredData, startIndex, endIndex]);

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

  const handleRefresh = useCallback(() => {
    dispatch(getAllHODStaff());
    setSearchTerm("");
    setCurrentPage(1);
  }, [dispatch]);

  const handleDownloadExcel = useCallback(() => {
    try {
      if (filteredData.length === 0) {
        dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
        return;
      }
      const excelData = filteredData.map((st, index) => {
        const row = {};
        if (visibleColumns.No) row['No.'] = index + 1;
        if (visibleColumns.image) row['Image'] = st.image ? `${IMAGE_URL}${st.image}` : '';
        if (visibleColumns.name) row['Name'] = st.name || '';
        if (visibleColumns.designation) row['Designation'] = st.designation || '';
        if (visibleColumns.department) row['Department'] = st.department?.name || '';
        if (visibleColumns.mobileno) {
          const code = st.countrycode || "+91";
          row['Mobile No.'] = `${code} ${st.mobileno}` || '';
        }
        if (visibleColumns.email) row['Email'] = st.email || '';
        if (visibleColumns.gender) row['Gender'] = st.gender || '';
        if (visibleColumns.joiningDate) row['Date'] = st.joiningdate ? formatDate(st.joiningdate) : '';
        if (visibleColumns.address) row['Address'] = st.address || '';
        row['Department'] = st.department?.name || '';
        return row;
      });
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
      const maxWidth = 20;
      const wscols = Object.keys(excelData[0] || {}).map(() => ({ wch: maxWidth }));
      worksheet['!cols'] = wscols;
      const date = new Date();
      const fileName = `Staff_List_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      dispatch(setAlert({ text: "Export completed..!", color: 'success' }));
    } catch {
      dispatch(setAlert({ text: "Export failed..!", color: 'error' }));
    }
  }, [filteredData, visibleColumns, dispatch, formatDate]);

  const handleDeleteClick = useCallback((staffItem) => {
    setItemToDelete(staffItem);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (itemToDelete && itemToDelete._id) {
      try {
        await dispatch(deleteStaff(itemToDelete._id)).unwrap();
        await dispatch(getAllHODStaff());
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
      } catch {}
    }
  }, [itemToDelete, dispatch]);

  useEffect(() => {
    dispatch(getAllHODStaff());
  }, [dispatch]);

  // Prevent background scrolling when any modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isModalOpen || isDeleteModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isModalOpen, isDeleteModalOpen]);

  return (
    <>
      <div className='p-3 md:p-4 lg:p-5 bg-[#F0F3FB] h-full'>
        <p className='text-[20px] font-semibold text-black mt-4 md:mt-3'>All Staffs</p>
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
                      onClick={() => navigate('/hod/addstaff', { state: { mode: 'add' } })}
                      className="p-2 text-[#4CAF50] hover:text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded-lg transition-colors"
                      title="Add New Staff"
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
                    {visibleColumns.name && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Name</th>
                    )}
                    {visibleColumns.designation && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Designation</th>
                    )}
                    {visibleColumns.department && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Department</th>
                    )}
                    {visibleColumns.mobileno && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Mobile No.</th>
                    )}
                    {visibleColumns.email && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Email</th>
                    )}
                    {visibleColumns.gender && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Gender</th>
                    )}
                    {visibleColumns.joiningDate && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Joining Date</th>
                    )}
                    {visibleColumns.address && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Address</th>
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
                    currentData.reverse().map((staff, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                      >
                        {visibleColumns.No && (
                          <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{startIndex + index + 1}</td>
                        )}
                        {visibleColumns.name && (
                          <td className="px-5 py-2 md600:py-3 lg:px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={`${staff.image}`}
                                alt={staff.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-[#E3C78A]"
                              />
                              <span className="text-sm font-medium text-gray-800 capitalize">{staff.name}</span>
                            </div>
                          </td>
                        )}
                        {visibleColumns.designation && (
                          <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700 capitalize">{staff.designation}</td>
                        )}
                        {visibleColumns.department && (
                          <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700 capitalize">{staff?.department?.name}</td>
                        )}
                        {visibleColumns.mobileno && (
                          <td className="px-5 py-2 md600:py-3 lg:px-6">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Phone size={16} className='text-green-600' />
                              {staff.countrycode ? staff.countrycode : ""} {staff.mobileno}
                            </div>
                          </td>
                        )}
                        {visibleColumns.email && (
                          <td className="px-5 py-2 md600:py-3 lg:px-6">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Mail size={16} className='text-red-600' />
                              {staff.email}
                            </div>
                          </td>
                        )}
                        {visibleColumns.gender && (
                          <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700 capitalize">{staff.gender}</td>
                        )}
                        {visibleColumns.joiningDate && (
                          <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{staff?.joiningdate ? formatDate(staff?.joiningdate) : ''}</td>
                        )}
                        {visibleColumns.address && (
                          <td className="px-5 py-2 md600:py-3 lg:px-6">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <MapPin size={16} className='text-orange-600' />
                              {staff.address}
                            </div>
                          </td>
                        )}
                        {visibleColumns.actions && (
                          <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                            <div className="mv_table_action flex">
                            <div onClick={() => handleViewClick(staff)}><IoEyeSharp className='text-[18px] text-quaternary' /></div>
                              <div
                                onClick={() => navigate('/hod/addstaff', { state: { mode: 'edit', staff } })}
                              >
                                <FiEdit className="text-[#6777ef] text-[18px]" />
                              </div>
                              {/* <div
                                onClick={() => handleDeleteClick(staff)}
                              >
                                <RiDeleteBinLine className="text-[#ff5200] text-[18px]" />
                              </div> */}
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
          </div>
        </div>

        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
            <div className="absolute inset-0 bg-black/50" onClick={handleDeleteModalClose}></div>
            <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-black">Delete Staff</h2>
                <button className="text-gray-500 hover:text-gray-800" onClick={handleDeleteModalClose}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-700 mb-8 text-center">
                Are you sure you want to delete{' '}
                <span className="font-semibold">{itemToDelete?.name || 'this staff member'}</span>?
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
                  onClick={handleDeleteConfirm}
                  className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {isModalOpen && selectedItem && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={handleCloseModal}
            ></div>

            <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
              <div className="relative transform overflow-hidden rounded-md bg-white text-left shadow-xl transition-all w-full sm:my-8 sm:w-[95%] md:w-[80%] sm:max-w-xl border">
                {/* Modal Header */}
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sticky top-0 z-10 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                    <h3 className="text-lg font-semibold text-black">Staff Details</h3>
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
                  <div className="">

                    {/* Image */}
                    <div className="flex items-center mb-4">
                      <img
                        src={selectedItem.image}
                        alt={selectedItem.name}
                        className="min-w-32 h-32 m-auto rounded-lg border-2"
                      />
                    </div>

                    {/* Details */}
                    <div className="space-y-3 overflow-y-auto">
                      <div className="flex items-center gap-3 rounded-lg transition-colors">
                        <span className="font-semibold text-black min-w-[120px]">Name:</span>
                        <span className='capitalize'>{selectedItem.name}</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg transition-colors">
                        <span className="font-semibold text-black min-w-[120px]">Designation:</span>
                        <span className='capitalize'>{selectedItem.designation}</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg transition-colors">
                        <span className="font-semibold text-black min-w-[120px]">Department:</span>
                        <span className='capitalize'>{selectedItem?.department?.name}</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg transition-colors">
                        <span className="font-semibold text-black min-w-[120px]">Mobile No.:</span>
                        <span>{selectedItem.countrycode ? selectedItem.countrycode : ""} {selectedItem.mobileno}</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg transition-colors">
                        <span className="font-semibold text-black min-w-[120px]">Email:</span>
                        <span>{selectedItem.email}</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg transition-colors">
                        <span className="font-semibold text-black min-w-[120px]">Gender:</span>
                        <span className='capitalize'>{selectedItem.gender}</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg transition-colors">
                        <span className="font-semibold text-black min-w-[120px]">Joining Date:</span>
                        <span>
                          {selectedItem.joiningdate
                            ? (() => {
                                const dateObj = new Date(selectedItem.joiningdate);
                                const day = dateObj.getDate().toString().padStart(2, '0');
                                const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                                const year = dateObj.getFullYear();
                                return `${day}/${month}/${year}`;
                              })()
                            : ''}
                        </span>
                      </div>
                      <div className="flex items-start gap-3 rounded-lg transition-colors">
                        <span className="font-semibold text-black min-w-[120px]">Address:</span>
                        <div
                          dangerouslySetInnerHTML={{ __html: selectedItem.address || '' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(HODStaff);
