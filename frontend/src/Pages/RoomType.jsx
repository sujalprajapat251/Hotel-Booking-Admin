import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEdit2 } from 'react-icons/fi';
import { MdDelete } from 'react-icons/md';
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

  useEffect(() => {
    dispatch(fetchRoomTypes());
  }, [dispatch]);

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
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-senary">Room Types</h1>
        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-tertiary text-white rounded-lg font-medium hover:bg-quaternary transition-colors focus:outline-none focus:ring-2 focus:ring-tertiary focus:ring-offset-2"
        >
          <span className="text-lg leading-none">+</span>
          Add
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <p className="text-gray-500">Loading room types...</p>
        </div>
      )}

      {/* Table */}
      {!loading && roomTypes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#f5f7fb] text-[#555] uppercase text-xs font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">No</th>
                  <th className="py-3 px-4 text-left">Room Type Name</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roomTypes.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="py-4 px-4 text-gray-700">{index + 1}</td>
                    <td className="py-4 px-4 font-medium text-senary">{item.roomType}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <FiEdit2
                          className="text-[#3f51b5] cursor-pointer hover:text-[#303f9f] transition-colors"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        />
                        <MdDelete
                          className="text-[#f44336] cursor-pointer hover:text-[#d32f2f] transition-colors"
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && roomTypes.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">No room types added yet. Add your first room type above.</p>
        </div>
      )}

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