import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createRoom, clearRoomError } from '../Redux/Slice/createRoomSlice';
import { fetchRoomTypes } from '../Redux/Slice/roomtypesSlice';
import { fetchFeatures } from '../Redux/Slice/featuresSlice';

const CreateRoom = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.rooms);
  const { items: roomTypes } = useSelector((state) => state.roomtypes);
  const { items: features } = useSelector((state) => state.features);

  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: '',
    floor: '',
    price: {
      base: '',
      weekend: ''
    },
    capacity: {
      adults: '',
      children: ''
    },
    features: [],
    bed: {
      mainBed: {
        type: 'Queen',
        count: ''
      },
      childBed: {
        type: 'Single',
        count: ''
      }
    },
    viewType: '',
    images: [],
    status: 'Available',
    isSmokingAllowed: false,
    isPetFriendly: false,
    maintenanceNotes: ''
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [filteredFeatures, setFilteredFeatures] = useState([]);

  useEffect(() => {
    dispatch(fetchRoomTypes());
    dispatch(fetchFeatures());
  }, [dispatch]);

  // Filter features when room type changes
  useEffect(() => {
    if (formData.roomType) {
      // Fetch features for the selected room type
      dispatch(fetchFeatures(formData.roomType)).then((result) => {
        if (result.payload) {
          setFilteredFeatures(result.payload);
        }
      });
      // Clear selected features when room type changes
      setSelectedFeatures([]);
    } else {
      setFilteredFeatures([]);
      setSelectedFeatures([]);
    }
  }, [formData.roomType, dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        // Handle one level nesting (e.g., price.base)
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }));
      } else if (parts.length === 3) {
        // Handle two level nesting (e.g., bed.mainBed.type)
        const [parent, middle, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [middle]: {
              ...prev[parent][middle],
              [child]: type === 'checkbox' ? checked : value
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFeatureChange = (featureId) => {
    setSelectedFeatures(prev => {
      const isSelected = prev.includes(featureId);
      if (isSelected) {
        return prev.filter(id => id !== featureId);
      } else {
        return [...prev, featureId];
      }
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearRoomError());

    // Validate required fields
    if (!formData.roomNumber || !formData.roomType || !formData.floor || 
        !formData.price.base || !formData.price.weekend || 
        !formData.capacity.adults || !formData.bed.mainBed.count || !formData.bed.childBed.count || !formData.viewType) {
      alert('Please fill in all required fields');
      return;
    }

    const roomData = {
      ...formData,
      floor: parseInt(formData.floor),
      price: {
        base: parseFloat(formData.price.base),
        weekend: parseFloat(formData.price.weekend)
      },
      capacity: {
        adults: parseInt(formData.capacity.adults),
        children: parseInt(formData.capacity.children || 0)
      },
      features: selectedFeatures,
      bed: {
        mainBed: {
          type: formData.bed.mainBed.type,
          count: parseInt(formData.bed.mainBed.count)
        },
        childBed: {
          type: formData.bed.childBed.type,
          count: parseInt(formData.bed.childBed.count)
        }
      }
    };

    try {
      await dispatch(createRoom(roomData)).unwrap();
      alert('Room created successfully!');
      // Reset form
      setFormData({
        roomNumber: '',
        roomType: '',
        floor: '',
        price: { base: '', weekend: '' },
        capacity: { adults: '', children: '' },
        features: [],
        bed: {
          mainBed: { type: 'Queen', count: '' },
          childBed: { type: 'Single', count: '' }
        },
        viewType: '',
        images: [],
        status: 'Available',
        isSmokingAllowed: false,
        isPetFriendly: false,
        maintenanceNotes: ''
      });
      setSelectedFeatures([]);
      setImagePreviews([]);
    } catch (err) {
      console.error('Error creating room:', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-senary mb-6">Create Room</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Number */}
          <div>
            <label htmlFor="roomNumber" className="block text-sm font-medium text-senary mb-2">
              Room Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="roomNumber"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleInputChange}
              placeholder="e.g., 203"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
              required
            />
          </div>

          {/* Room Type Dropdown */}
          <div>
            <label htmlFor="roomType" className="block text-sm font-medium text-senary mb-2">
              Room Type <span className="text-red-500">*</span>
            </label>
            <select
              id="roomType"
              name="roomType"
              value={formData.roomType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
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

          {/* Floor */}
          <div>
            <label htmlFor="floor" className="block text-sm font-medium text-senary mb-2">
              Floor <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="floor"
              name="floor"
              value={formData.floor}
              onChange={handleInputChange}
              placeholder="e.g., 2"
              min="0"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
              required
            />
          </div>

          {/* Price Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price.base" className="block text-sm font-medium text-senary mb-2">
                Base Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price.base"
                name="price.base"
                value={formData.price.base}
                onChange={handleInputChange}
                placeholder="e.g., 2000"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
                required
              />
            </div>
            <div>
              <label htmlFor="price.weekend" className="block text-sm font-medium text-senary mb-2">
                Weekend Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price.weekend"
                name="price.weekend"
                value={formData.price.weekend}
                onChange={handleInputChange}
                placeholder="e.g., 2500"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
                required
              />
            </div>
          </div>

          {/* Capacity Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="capacity.adults" className="block text-sm font-medium text-senary mb-2">
                Adults <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="capacity.adults"
                name="capacity.adults"
                value={formData.capacity.adults}
                onChange={handleInputChange}
                placeholder="e.g., 2"
                min="1"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
                required
              />
            </div>
            <div>
              <label htmlFor="capacity.children" className="block text-sm font-medium text-senary mb-2">
                Children
              </label>
              <input
                type="number"
                id="capacity.children"
                name="capacity.children"
                value={formData.capacity.children}
                onChange={handleInputChange}
                placeholder="e.g., 1"
                min="0"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
          </div>

          {/* Features Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-senary mb-2">
              Features (Select Multiple)
              {!formData.roomType && (
                <span className="text-gray-500 text-sm ml-2">(Please select a room type first)</span>
              )}
            </label>
            <div className="border-2 border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
              {!formData.roomType ? (
                <p className="text-gray-500 text-sm">Please select a room type to view available features.</p>
              ) : filteredFeatures.length === 0 ? (
                <p className="text-gray-500 text-sm">No features available for this room type. Please add features first.</p>
              ) : (
                <div className="space-y-2">
                  {filteredFeatures.map((feature) => (
                    <label key={feature.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feature.id)}
                        onChange={() => handleFeatureChange(feature.id)}
                        className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                      />
                      <span className="text-senary">{feature.feature}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bed Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-senary">Main Bed</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="bed.mainBed.type" className="block text-sm font-medium text-senary mb-2">
                  Main Bed Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="bed.mainBed.type"
                  name="bed.mainBed.type"
                  value={formData.bed.mainBed.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
                  required
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Queen">Queen</option>
                  <option value="King">King</option>
                  <option value="Twin">Twin</option>
                </select>
              </div>
              <div>
                <label htmlFor="bed.mainBed.count" className="block text-sm font-medium text-senary mb-2">
                  Main Bed Count <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="bed.mainBed.count"
                  name="bed.mainBed.count"
                  value={formData.bed.mainBed.count}
                  onChange={handleInputChange}
                  placeholder="e.g., 1"
                  min="1"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
                  required
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-senary mt-4">Child Bed</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="bed.childBed.type" className="block text-sm font-medium text-senary mb-2">
                  Child Bed Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="bed.childBed.type"
                  name="bed.childBed.type"
                  value={formData.bed.childBed.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
                  required
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Queen">Queen</option>
                  <option value="King">King</option>
                  <option value="Twin">Twin</option>
                </select>
              </div>
              <div>
                <label htmlFor="bed.childBed.count" className="block text-sm font-medium text-senary mb-2">
                  Child Bed Count <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="bed.childBed.count"
                  name="bed.childBed.count"
                  value={formData.bed.childBed.count}
                  onChange={handleInputChange}
                  placeholder="e.g., 1"
                  min="1"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* View Type */}
          <div>
            <label htmlFor="viewType" className="block text-sm font-medium text-senary mb-2">
              View Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="viewType"
              name="viewType"
              value={formData.viewType}
              onChange={handleInputChange}
              placeholder="e.g., City View, Ocean View"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-senary mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
              required
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Reserved">Reserved</option>
            </select>
          </div>

          {/* Images Upload */}
          <div>
            <label htmlFor="images" className="block text-sm font-medium text-senary mb-2">
              Room Images
            </label>
            <input
              type="file"
              id="images"
              name="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
            />
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="isSmokingAllowed"
                checked={formData.isSmokingAllowed}
                onChange={handleInputChange}
                className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded"
              />
              <span className="text-senary">Smoking Allowed</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="isPetFriendly"
                checked={formData.isPetFriendly}
                onChange={handleInputChange}
                className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded"
              />
              <span className="text-senary">Pet Friendly</span>
            </label>
          </div>

          {/* Maintenance Notes */}
          <div>
            <label htmlFor="maintenanceNotes" className="block text-sm font-medium text-senary mb-2">
              Maintenance Notes
            </label>
            <textarea
              id="maintenanceNotes"
              name="maintenanceNotes"
              value={formData.maintenanceNotes}
              onChange={handleInputChange}
              placeholder="Any maintenance notes or special instructions..."
              rows="4"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-tertiary text-white rounded-lg font-medium hover:bg-quaternary transition-colors focus:outline-none focus:ring-2 focus:ring-tertiary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
