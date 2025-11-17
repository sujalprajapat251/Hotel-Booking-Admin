import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEdit2 } from 'react-icons/fi';
import { MdDelete } from 'react-icons/md';
import { IoAddCircleOutline } from 'react-icons/io5';
import { Search, Filter, RefreshCw, Download } from 'lucide-react';
import {
  fetchRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType
} from '../Redux/Slice/roomtypesSlice';

const RoomType = () => {
  const dispatch = useDispatch();
  const { items: roomTypes, loading, error } = useSelector((state) => state.roomtypes);
  const [roomType, setRoomType] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    No: true,
    roomType: true,
    actions: true
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchRoomTypes());
  }, [dispatch]);

  const filteredRoomTypes = roomTypes.filter((item) =>
    item.roomType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRoomTypes.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoomTypes = filteredRoomTypes.slice(startIndex, endIndex);

  useEffect(() => {
    // Ensure currentPage stays within bounds if data size changes
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomType.trim()) return;

    try {
      if (editingId) {
        await dispatch(updateRoomType({ id: editingId, roomType: roomType.trim() })).unwrap();
      } else {
        await dispatch(createRoomType({ roomType: roomType.trim() })).unwrap();
      }
      setRoomType('');
      setEditingId(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setRoomType(item.roomType);
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setRoomType('');
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setRoomType('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room type?')) return;
    try {
      await dispatch(deleteRoomType(id)).unwrap();
      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-3 md:p-4 lg:p-5 bg-[#F0F3FB]">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-gray-200">
          <div className="md600:flex items-center justify-between w-full">
            <div className="flex gap-2 md:gap-5 sm:justify-between items-center">
              <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">
                All Room Types
              </p>
              {/* Search Bar */}
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
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
                              {column}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Add Room Type Button (icon) */}
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="inline-flex items-center px-1 text-green-600"
                  title="Add Room Type"
                >
                  <span className="text-lg leading-none">
                    <IoAddCircleOutline size={20} />
                  </span>
                </button>
                <button
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Refresh"
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    dispatch(fetchRoomTypes());
                  }}
                >
                  <RefreshCw size={20} />
                </button>
                <button
                  className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Download"
                  type="button"
                  onClick={() => {
                    // Simple CSV download of current filtered room types
                    const header = ['No', 'Room Type'];
                    const rows = filteredRoomTypes.map((item, index) => [
                      index + 1,
                      item.roomType
                    ]);
                    const csvContent =
                      [header, ...rows]
                        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
                        .join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'room-types.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-6 text-center text-gray-500">Loading room types...</div>
        )}

        {/* Table */}
        {!loading && currentRoomTypes.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] text-left text-xs font-semibold uppercase text-[#755647]">
                  <tr>
                    {visibleColumns.No && <th className="px-5 py-3">No.</th>}
                    {visibleColumns.roomType && <th className="px-5 py-3">Room Type Name</th>}
                    {visibleColumns.actions && <th className="px-5 py-3">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentRoomTypes.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-colors"
                    >
                      {visibleColumns.No && (
                        <td className="px-5 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                      )}
                      {visibleColumns.roomType && (
                        <td className="px-5 py-3 text-sm font-medium text-gray-800">{item.roomType}</td>
                      )}
                      {visibleColumns.actions && (
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                              title="Edit"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
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
                  {filteredRoomTypes.length === 0
                    ? '0 of 0'
                    : `${startIndex + 1} - ${Math.min(endIndex, filteredRoomTypes.length)} of ${
                        filteredRoomTypes.length
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
                    disabled={currentPage === totalPages || filteredRoomTypes.length === 0}
                    className="px-2 py-1 text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && roomTypes.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">
            No room types added yet. Add your first room type above.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold text-senary mb-4">
              {editingId ? 'Update Room Type' : 'Add New Room Type'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="roomType" className="block text-sm font-medium text-senary mb-2">
                  Room Type Name
                </label>
                <input
                  type="text"
                  id="roomType"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  placeholder="Enter room type name"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-tertiary text-white rounded-lg font-medium hover:bg-quaternary transition-colors focus:outline-none focus:ring-2 focus:ring-tertiary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {editingId ? 'Update' : 'Submit'}
                </button>
              </div>
            </form>
            {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomType;