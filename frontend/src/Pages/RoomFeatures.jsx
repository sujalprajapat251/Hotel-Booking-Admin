import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEdit2 } from 'react-icons/fi';
import { MdDelete } from 'react-icons/md';
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

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-senary">Room Features</h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
          >
            <option value="">All Room Types</option>
            {roomTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.roomType}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 rounded-lg bg-tertiary px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-quaternary focus:outline-none focus:ring-2 focus:ring-tertiary focus:ring-offset-2"
          >
            <span className="text-lg leading-none">+</span>
            <span>Add</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      {features.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#f5f7fb] text-[#555] uppercase text-xs font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">No</th>
                  <th className="py-3 px-4 text-left">Feature Name</th>
                  <th className="py-3 px-4 text-left">Room Type</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {features.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="py-4 px-4 text-gray-700">{index + 1}</td>
                    <td className="py-4 px-4 font-medium text-senary">{item.feature}</td>
                    <td className="py-4 px-4 text-gray-700">
                      {item.roomType?.roomType || item.roomType || 'N/A'}
                    </td>
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
      {!loading && features.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">No room features added yet. Add your first room feature above.</p>
        </div>
      )}
      {loading && (
        <div className="text-gray-500">Loading features...</div>
      )}

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
