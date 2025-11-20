import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import "../Style/vaidik.css"
import { IoEyeSharp } from 'react-icons/io5';
import { getAllContact } from '../Redux/Slice/contactSlice';
import { Search, Filter, Download, ChevronLeft, ChevronRight, Phone, Mail, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { setAlert } from '../Redux/Slice/alert.slice';

const Contact = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
    const dispatch = useDispatch();
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showColumnDropdown, setShowColumnDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const contact = useSelector((state) => state.contact.contact)

    const [visibleColumns, setVisibleColumns] = useState({
      no: true,
      name: true,
      email: true,
      mobileno: true,
      message: true,
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
      const shouldDisableScroll = isModalOpen;
      if (shouldDisableScroll) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.body.style.overflow = '';
      };
    }, [isModalOpen]);

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
      dispatch(getAllContact());
    }, [dispatch]);

    const handleViewClick = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const filteredBookings = contact.filter((item) => {
      const searchLower = searchTerm.trim().toLowerCase();
      if (!searchLower) return true;

      const mobileValue = Array.isArray(item.mobileno)
        ? item.mobileno.join(' ').toLowerCase()
        : item.mobileno?.toString().toLowerCase() ?? '';

      return (
        item.name?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower) ||
        mobileValue.includes(searchLower) ||
        item.message?.toLowerCase().includes(searchLower) 
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
          const excelData = filteredBookings.map((user, index) => {
              const row = {};
              
              if (visibleColumns.no) {
                  row['No.'] = index + 1;
              }
              if (visibleColumns.name) {
                  row['Name'] = user.name || '';
              }
              if (visibleColumns.email) {
                  row['Email'] = user.email || '';
              }
              if (visibleColumns.mobileno) {
                row['Mobile No.'] = Array.isArray(user.mobileno)
                  ? user.mobileno.join(', ')
                  : user.mobileno || '';
            }
            if (visibleColumns.message) {
              row['Message'] = user.message || '';
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
          const fileName = `Contact_List_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;

          // Download the file
          XLSX.writeFile(workbook, fileName);
          dispatch(setAlert({ text:"Export completed..!", color: 'success' }));
      } catch (error) {
          dispatch(setAlert({ text:"Export failed..!", color: 'error' }));
      }
  };

  const handleRefresh = () => {
    dispatch(getAllContact());
    setSearchTerm("");
    setCurrentPage(1);
  };

    return (
        <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">

            <section className="py-5">
                <h1 className="text-2xl font-semibold text-black">Contact</h1>
            </section>

            <div className='bg-white rounded-lg shadow-md'>
                {/* Header */}
                <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
                  <div className='flex gap-2 md:gap-5 sm:justify-between'>
                    <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">Contact</p>

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
                </div>

                {/* Table */}
                <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-[#B79982] scrollbar-track-[#F7DF9C]/20 hover:scrollbar-thumb-[#876B56]">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] sticky top-0 z-10 shadow-sm">
                            <tr>
                              {visibleColumns.no && (
                                <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">No</th>
                              )}
                              {visibleColumns.name && (
                                <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Name</th>
                              )}
                              {visibleColumns.email && (
                                <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Email</th>
                              )}
                              {visibleColumns.mobileno && (
                                <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Mobile No.</th>
                              )}
                              {visibleColumns.message && (
                                <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Message</th>
                              )}
                              {visibleColumns.actions && (
                                <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">Action</th>
                              )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {currentData.length === 0 ? (
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
                            currentData.map((item, index) => (
                              <tr
                                  key={index}
                                  className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                              >
                                {visibleColumns.no && (
                                  <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{index + 1}</td>
                                )}

                                {/* Name */}
                                {visibleColumns.name && (
                                  <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                      <div className="flex items-center gap-3">
                                          <span className="text-sm text-gray-800">{item.name}</span>
                                      </div>
                                  </td>
                                )}

                                {/* email */}
                                {visibleColumns.email && (
                                  <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                      <div className="flex items-center gap-2">
                                          <Mail className="text-sm text-red-600" size={16} />
                                          {item.email}
                                      </div>
                                  </td>
                                )}

                                {/* email */}
                                {visibleColumns.mobileno && (
                                  <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                      <div className="flex items-center gap-2">
                                          <Phone className='text-sm text-green-600' size={16} />
                                          {Array.isArray(item.mobileno) ? item.mobileno.join(", ") : item.mobileno}
                                      </div>
                                  </td>
                                )}

                                {/* description */}
                                {visibleColumns.message && (
                                  <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{item.message}</td>
                                )}

                                {/* Actions */}
                                {visibleColumns.actions && (
                                  <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                      <div className="mv_table_action flex">
                                          <div onClick={() => handleViewClick(item)}><IoEyeSharp className='text-[18px]' /></div>
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
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Background Blur */}
                <div className="absolute inset-0 backdrop-blur-sm bg-black/40" onClick={handleCloseModal}></div>

                <div className="relative bg-white rounded-[4px] shadow-2xl w-full sm:w-[450px] max-h-[90vh] overflow-y-auto animate-fadeIn px-4 pt-5 pb-4 sm:p-6">        
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-800">Contact Details</h3>
                    </div>

                    <button
                      onClick={handleCloseModal}
                      className="p-1 rounded-full"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Image */}
                  <div className="space-y-4">

                    <div className="flex gap-3">
                      <span className="font-medium text-gray-600 min-w-[100px]">Name:</span>
                      <span className="text-gray-800">{selectedItem.name}</span>
                    </div>

                    <div className="flex gap-3">
                      <span className="font-medium text-gray-600 min-w-[100px]">Email:</span>
                      <span className="text-gray-800 break-all">{selectedItem.email}</span>
                    </div>

                    <div className="flex gap-3">
                      <span className="font-medium text-gray-600 min-w-[100px]">Mobile:</span>
                      <span className="text-gray-800">{Array.isArray(selectedItem.mobileno) ? selectedItem.mobileno.join(", ") : selectedItem.mobileno}</span>
                    </div>

                    <div className="flex gap-3">
                      <span className="font-medium text-gray-600 min-w-[100px]">Message:</span>
                      <span className="text-gray-800 break-words flex-1">{selectedItem.message}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

        </div>
    );
};

export default Contact;

