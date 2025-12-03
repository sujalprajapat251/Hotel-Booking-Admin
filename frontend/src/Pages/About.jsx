import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import "../Style/vaidik.css"
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit, FiPlusCircle } from "react-icons/fi";
import { IoEyeSharp } from 'react-icons/io5';
import { Search, Filter, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { getAllAbout, deleteAbout } from '../Redux/Slice/about.slice';
import * as XLSX from 'xlsx';
import { setAlert } from '../Redux/Slice/alert.slice';
import { IMAGE_URL } from '../Utils/baseUrl';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const dispatch = useDispatch();
  const {about} = useSelector((state) => state.about);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [visibleColumns, setVisibleColumns] = useState({
    no: true,
    image: true,
    title: true,
    description: true,
    actions: true,
  });

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
    dispatch(getAllAbout());
  }, [dispatch]);

  const handleViewClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const aboutList = Array.isArray(about) ? about : [];
  const filteredAbout = aboutList.filter(
    (item) =>
      item?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredAbout.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAbout.slice(startIndex, endIndex);

  const handleEditClick = (item) => {
    navigate('/about/addabout', { state: { mode: 'edit', about: item } });
  };

  const handleAddClick = () => {
    navigate('/about/addabout', { state: { mode: 'add' } });
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      const targetId = itemToDelete._id || itemToDelete.id;
      dispatch(deleteAbout({ id: targetId })).then(() => {
        dispatch(getAllAbout());
      });
    }
    setIsDeleteModalOpen(false);
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

  const stripHtmlTags = (htmlString = '') => {
      if (!htmlString) return '';
      const tempElement = document.createElement('div');
      tempElement.innerHTML = htmlString;
      return tempElement.textContent || tempElement.innerText || '';
    };

  const handleDownloadExcel = () => {
    try {
      if (filteredAbout.length === 0) {
        dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
        return;
      }
      const excelData = filteredAbout.map((item, index) => {
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
        if (visibleColumns.description) {
            row['Description'] = stripHtmlTags(item.description);
        }
        return row;
      });

      // Create a new workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'About List');

      // Auto-size columns
      const maxWidth = 20;
      const wscols = Object.keys(excelData[0] || {}).map(() => ({ wch: maxWidth }));
      worksheet['!cols'] = wscols;

      // Generate file name with current date
      const date = new Date();
      const fileName = `About_List_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, fileName);
      dispatch(setAlert({ text:"Export completed..!", color: 'success' }));
    } catch (error) {
        dispatch(setAlert({ text:"Export failed..!", color: 'error' }));
    }
  };
  
  const handleRefresh = () => {
    dispatch(getAllAbout());
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
      <section className="py-5">
          <h1 className="text-2xl font-semibold text-black">About</h1>
      </section>

      {/* Header */}
      <div className='bg-white rounded-lg shadow-md'>
          {/* Header */}
          <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
            <div className='flex gap-2 md:gap-5 sm:justify-between'>
              {/* <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">About</p> */}

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

            {/* Action Buttons */}
            <div className="flex items-center gap-1 justify-end mt-2">
              <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={handleAddClick}
                    className="p-2 text-[#4CAF50] hover:text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded-lg transition-colors"
                    title="Add About"
                  >
                      <FiPlusCircle size={20}/>
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
                  {visibleColumns.description && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Description</th>
                  )}
                  {visibleColumns.actions && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                  {currentData.map((item, index) => (
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
                              <div className="absolute -bottom-0 -right-0 w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(item.status) }}>
                              </div>
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

                      {/* description */}
                      {visibleColumns.description && (
                          <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700 whitespace-normal break-words max-w-[160px]">
                            <div
                              className="prose prose-sm max-w-none line-clamp-3"
                              dangerouslySetInnerHTML={{ __html: item.description || '' }}
                            />
                          </td>
                      )}
                      
                      {/* Actions */}
                      {visibleColumns.actions && (
                        <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                          <div className="mv_table_action flex">
                            <div onClick={() => handleViewClick(item)}><IoEyeSharp className='text-[18px] text-quaternary' /></div>
                            <div
                              onClick={() => handleEditClick(item)}
                              className="p-1 text-[#6777ef] hover:text-[#4255d4] rounded-lg transition-colors"
                              title="Edit About"
                            >
                              <FiEdit className="text-[18px]" />
                            </div>
                            <div onClick={() => handleDeleteClick(item)}><RiDeleteBinLine className="text-[#ff5200] text-[18px]" /></div>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
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
                  ) : null}
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
                {startIndex + 1} - {Math.min(endIndex, filteredAbout.length)} of {filteredAbout.length}
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
                  <h3 className="text-lg font-semibold text-black">About Details</h3>
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
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-gray-700 min-w-[120px]">Description:</span>
                      <div
                          className="text-gray-900"
                          dangerouslySetInnerHTML={{ __html: selectedItem.description || '' }}
                      />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl mx-5">
            <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-semibold text-black">Delete About</h2>
                <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <p className="text-gray-700 mb-8 text-center">Are you sure you want to delete?</p>
            <div className="flex items-center justify-center gap-3">
              <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
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

export default About;