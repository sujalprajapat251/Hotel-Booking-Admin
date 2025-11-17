import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEdit2 } from 'react-icons/fi';
import { MdDelete } from 'react-icons/md';
import { IoAddCircleOutline } from "react-icons/io5";
import { Search, Filter, RefreshCw, Download } from 'lucide-react';
import {
  fetchFeatures,
  createFeature,
  updateFeature,
  deleteFeature
} from '../Redux/Slice/featuresSlice';
import { fetchRoomTypes } from '../Redux/Slice/roomtypesSlice';

const RoomFeatures = () => {
  const dispatch = useDispatch();
  const { items: features, loading, error } = useSelector((state) => state.features);
  const { items: roomTypes } = useSelector((state) => state.roomtypes);
  const [feature, setFeature] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    No: true,
    feature: true,
    roomType: true,
    actions: true
  });
  const dropdownRef = useRef(null);
  const isEditing = editingId !== null;

  useEffect(() => {
    dispatch(fetchRoomTypes());
    dispatch(fetchFeatures());
  }, [dispatch]);

  useEffect(() => {
    if (selectedRoomType) {
      dispatch(fetchFeatures(selectedRoomType));
    } else {
      dispatch(fetchFeatures());
    }
  }, [dispatch, selectedRoomType]);

  const resetForm = () => {
    setFeature('');
    setSelectedRoomType('');
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = feature.trim();
    if (!payload) return;
    
    if (!selectedRoomType) {
      alert('Please select a room type');
      return;
    }

    try {
      if (isEditing) {
        await dispatch(updateFeature({ id: editingId, feature: payload, roomType: selectedRoomType })).unwrap();
      } else {
        await dispatch(createFeature({ feature: payload, roomType: selectedRoomType })).unwrap();
      }
      const currentRoomType = selectedRoomType;
      resetForm();
      // Refresh features list for the selected room type
      if (currentRoomType) {
        dispatch(fetchFeatures(currentRoomType));
        setSelectedRoomType(currentRoomType);
      } else {
        dispatch(fetchFeatures());
      }
    } catch (submitError) {
      console.error('handleSubmit error:', submitError);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFeature(item.feature);
    setSelectedRoomType(item.roomType?.id || item.roomType || '');
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room feature?')) {
      return;
    }
    try {
      await dispatch(deleteFeature(id)).unwrap();
      if (editingId === id) {
        resetForm();
      }
    } catch (deleteError) {
      console.error('handleDelete error:', deleteError);
    }
  };

  const toggleColumn = (column) => {
    setVisibleColumns((prev) => ({
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

  const filteredFeatures = features.filter((item) =>
    item.feature?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFeatures.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFeatures = filteredFeatures.slice(startIndex, endIndex);

  useEffect(() => {
    // Ensure currentPage stays within bounds if data size changes
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="p-3 md:p-4 lg:p-5 bg-[#F0F3FB]">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">     
          <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
            <div className="flex gap-2 md:gap-5 sm:justify-between items-center">
              <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">All Room Features</p>
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
                {/* Add Feature Button */}
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFeature('');
                  setSelectedRoomType('');
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-1 text-green-600"
                title="Add Feature"
              >
                <span className="text-lg leading-none"><IoAddCircleOutline size={20} /></span>
              </button>
                <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Refresh">
                  <RefreshCw size={20} />
                </button>
                <button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors" title="Download">
                  <Download size={20} />
                </button>
              </div>
            </div>
          </div>
        {error && (
          <div className="mx-3 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Table */}
        {currentFeatures.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] text-left text-xs font-semibold uppercase text-[#755647]">
                  <tr>
                    {visibleColumns.No && <th className="px-5 py-3">No.</th>}
                    {visibleColumns.feature && <th className="px-5 py-3">Feature Name</th>}
                    {visibleColumns.roomType && <th className="px-5 py-3">Room Type</th>}
                    {visibleColumns.actions && <th className="px-5 py-3">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentFeatures.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-colors"
                    >
                      {visibleColumns.No && (
                        <td className="px-5 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                      )}
                      {visibleColumns.feature && (
                        <td className="px-5 py-3 text-sm font-medium text-gray-800">{item.feature}</td>
                      )}
                      {visibleColumns.roomType && (
                        <td className="px-5 py-3 text-sm">
                          <span className="inline-flex items-center rounded-full bg-[#F7DF9C]/50 px-3 py-1 text-xs font-semibold text-[#755647]">
                            {item.roomType?.roomType || item.roomType || 'N/A'}
                          </span>
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 rounded-lg"
                              title="Edit"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 rounded-lg"
                              title="Delete"
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-3 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B79982] bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {filteredFeatures.length === 0
                    ? '0 of 0'
                    : `${startIndex + 1} - ${Math.min(endIndex, filteredFeatures.length)} of ${
                        filteredFeatures.length
                      }`}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || filteredFeatures.length === 0}
                    className="px-2 py-1 text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty / Loading */}
        {!loading && filteredFeatures.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">
            No room features added yet. Add your first room feature above.
          </div>
        )}
        {loading && (
          <div className="p-6 text-center text-gray-500">Loading features...</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-senary">
                {isEditing ? 'Edit Feature' : 'Add Feature'}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-500 transition-colors hover:text-gray-700"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="roomType" className="mb-2 block text-sm font-medium text-senary">
                  Room Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="roomType"
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 transition-colors focus:border-secondary focus:outline-none"
                  required
                >
                  <option value="">Select Room Type</option>
                  {roomTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.roomType}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="feature" className="mb-2 block text-sm font-medium text-senary">
                  Room Feature Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="feature"
                  value={feature}
                  onChange={(e) => setFeature(e.target.value)}
                  placeholder="Enter room feature name"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 transition-colors focus:border-secondary focus:outline-none"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-tertiary hover:bg-quaternary focus:ring-tertiary'
                  }`}
                >
                  {isEditing ? 'Update' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomFeatures;
