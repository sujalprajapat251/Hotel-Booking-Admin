import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ChevronDown, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createRoom, clearRoomError, updateRoom } from '../Redux/Slice/createRoomSlice';
import { fetchRoomTypes } from '../Redux/Slice/roomtypesSlice';
import { fetchFeatures } from '../Redux/Slice/featuresSlice';
import { setAlert } from '../Redux/Slice/alert.slice';
import { IMAGE_URL } from '../Utils/baseUrl';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const statusOptions = ['Available', 'Occupied', 'Maintenance', 'Reserved'];
const defaultMainBedType = 'Queen';
const defaultChildBedType = 'Single';

const normalizeRoomTypeId = (roomType) => {
  if (!roomType) return '';
  if (typeof roomType === 'string') return roomType;
  return roomType.id || roomType._id || '';
};

const normalizeFeaturesToIds = (features = []) =>
  (features || [])
    .map((feature) => {
      if (!feature) return null;
      if (typeof feature === 'string') return feature;
      return feature.id || feature._id || null;
    })
    .filter(Boolean);

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${IMAGE_URL}${path.startsWith('/') ? path.slice(1) : path}`;
};

const CreateRoom = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error } = useSelector((state) => state.rooms);
  const { items: roomTypes } = useSelector((state) => state.roomtypes);

  const roomData = location?.state?.roomData || location?.state?.room || null;

  const [isEditMode, setIsEditMode] = useState(location?.state?.mode === 'edit');
  const [editingItem, setEditingItem] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [filteredFeatures, setFilteredFeatures] = useState([]);
  const [showRoomTypeDropdown, setShowRoomTypeDropdown] = useState(false);
  const [showMainBedTypeDropdown, setShowMainBedTypeDropdown] = useState(false);
  const [showChildBedTypeDropdown, setShowChildBedTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const roomTypeRef = useRef(null);
  const mainBedTypeRef = useRef(null);
  const childBedTypeRef = useRef(null);
  const statusRef = useRef(null);
  const roomTypeWatchRef = useRef(null);

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
  }), []);

  const quillFormats = useMemo(() => ([
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'color', 'background',
    'align', 'script', 'code-block'
  ]), []);

  useEffect(() => {
    dispatch(fetchRoomTypes());
  }, [dispatch]);

  useEffect(() => {
    if (isEditMode && roomData) {
      setEditingItem(roomData);
      setExistingImages(roomData.images || []);
      setImagePreviews([]);
    } else if (!isEditMode) {
      setEditingItem(null);
      setExistingImages([]);
      setImagePreviews([]);
    }
  }, [isEditMode, roomData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roomTypeRef.current && !roomTypeRef.current.contains(event.target)) {
        setShowRoomTypeDropdown(false);
      }
      if (mainBedTypeRef.current && !mainBedTypeRef.current.contains(event.target)) {
        setShowMainBedTypeDropdown(false);
      }
      if (childBedTypeRef.current && !childBedTypeRef.current.contains(event.target)) {
        setShowChildBedTypeDropdown(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const initialValues = useMemo(() => {
    const roomTypeId = normalizeRoomTypeId(editingItem?.roomType);
    return {
      roomNumber: editingItem?.roomNumber || '',
      roomType: roomTypeId,
      floor: editingItem?.floor !== undefined && editingItem?.floor !== null ? String(editingItem.floor) : '',
      viewType: editingItem?.viewType || '',
      status: editingItem?.status || 'Available',
      isSmokingAllowed: Boolean(editingItem?.isSmokingAllowed),
      isPetFriendly: Boolean(editingItem?.isPetFriendly),
      maintenanceNotes: editingItem?.maintenanceNotes || '',
      description: editingItem?.description || ''
    };
  }, [editingItem]);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        roomNumber: Yup.string().required('Room number is required'),
        roomType: Yup.string().required('Room type is required'),
        floor: Yup.number()
          .typeError('Floor must be a number')
          .integer('Floor must be a whole number')
          .min(0, 'Floor cannot be negative')
          .required('Floor is required'),
        viewType: Yup.string().required('View type is required'),
        status: Yup.string().required('Status is required'),
        description: Yup.string().notRequired(),
      }),
    [isEditMode, existingImages.length]
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      dispatch(clearRoomError());
      const payload = {
        roomNumber: values.roomNumber,
        roomType: values.roomType,
        floor: Number(values.floor),
        viewType: values.viewType,
        status: values.status,
        isSmokingAllowed: values.isSmokingAllowed,
        isPetFriendly: values.isPetFriendly,
        maintenanceNotes: values.maintenanceNotes,
        description: values.description || ''
      };

      try {
        if (isEditMode && editingItem) {
          const id = editingItem._id || editingItem.id;
          const result = await dispatch(updateRoom({ id, roomData: payload }));
          if (updateRoom.fulfilled.match(result)) {
            dispatch(setAlert({ text: 'Room updated successfully..!', color: 'success' }));
            setIsEditMode(false);
            setEditingItem(null);
            resetForm();
            navigate('/rooms/available');
          }
        } else {
          const result = await dispatch(createRoom(payload));
          if (createRoom.fulfilled.match(result)) {
            dispatch(setAlert({ text: 'Room created successfully..!', color: 'success' }));
            resetForm();
            navigate('/rooms/available');
          }
        }
      } catch (err) {
        console.error('Failed to submit room form', err);
      }
    }
  });

  const selectedRoomType = formik.values.roomType;

  const { setFieldValue } = formik;

  useEffect(() => {
    if (!selectedRoomType) {
      setFilteredFeatures([]);
      if (roomTypeWatchRef.current) {
        setFieldValue('features', []);
      }
      roomTypeWatchRef.current = selectedRoomType;
      return;
    }

    if (roomTypeWatchRef.current && roomTypeWatchRef.current !== selectedRoomType) {
      setFieldValue('features', []);
    }

    roomTypeWatchRef.current = selectedRoomType;

    let isSubscribed = true;
    dispatch(fetchFeatures(selectedRoomType)).then((result) => {
      if (isSubscribed && fetchFeatures.fulfilled.match(result)) {
        setFilteredFeatures(result.payload);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [dispatch, selectedRoomType, setFieldValue]);

  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const updatedFiles = [...(formik.values.images || []), ...files];
    formik.setFieldValue('images', updatedFiles);

    const previews = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
      )
    );
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (index) => {
    const updatedImages = (formik.values.images || []).filter((_, i) => i !== index);
    formik.setFieldValue('images', updatedImages);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleFeatureSelection = (featureId) => {
    const selected = formik.values.features || [];
    if (selected.includes(featureId)) {
      formik.setFieldValue(
        'features',
        selected.filter((id) => id !== featureId)
      );
    } else {
      formik.setFieldValue('features', [...selected, featureId]);
    }
  };

  const getRoomTypeLabel = () => {
    if (!formik.values.roomType) return 'Select Room Type';
    const match = roomTypes.find((type) => {
      const id = type.id || type._id;
      return id === formik.values.roomType;
    });
    return match?.roomType || 'Select Room Type';
  };

  const pageTitle = isEditMode ? 'Edit Room' : 'Create Room';

  return (
    <div className="bg-[#F0F3FB] h-full p-3 md:p-5 lg:p-8">
      <div className="w-full">
        <div className="w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] px-6 py-4">
            <h2 className="text-xl md:text-2xl font-bold text-black">{pageTitle}</h2>
          </div>

          <div className="p-6">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="roomNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="roomNumber"
                  name="roomNumber"
                  value={formik.values.roomNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter room number"
                  className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${
                    formik.touched.roomNumber && formik.errors.roomNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formik.touched.roomNumber && formik.errors.roomNumber && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.roomNumber}</p>
                )}
              </div>

              <div className="relative" ref={roomTypeRef}>
                <label htmlFor="roomType" className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Type <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowRoomTypeDropdown((prev) => !prev)}
                  onBlur={() => formik.setFieldTouched('roomType', true)}
                  className={`w-full px-4 py-2 bg-gray-100 border rounded-[4px] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982] ${
                    formik.touched.roomType && formik.errors.roomType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <span className={formik.values.roomType ? 'text-gray-800' : 'text-gray-400'}>{getRoomTypeLabel()}</span>
                  <ChevronDown size={18} className="text-gray-600" />
                </button>
                {showRoomTypeDropdown && (
                  <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg">
                    {roomTypes.map((type) => {
                      const optionId = type.id || type._id;
                      return (
                        <div
                          key={optionId}
                          onClick={() => {
                            formik.setFieldValue('roomType', optionId);
                            formik.setFieldTouched('roomType', true, false);
                            setShowRoomTypeDropdown(false);
                          }}
                          className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                        >
                          {type.roomType}
                        </div>
                      );
                    })}
                  </div>
                )}
                {formik.touched.roomType && formik.errors.roomType && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.roomType}</p>
                )}
              </div>

              <div>
                <label htmlFor="floor" className="block text-sm font-semibold text-gray-700 mb-2">
                  Floor <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="floor"
                  name="floor"
                  value={formik.values.floor}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter floor"
                  min="0"
                  className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${
                    formik.touched.floor && formik.errors.floor ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formik.touched.floor && formik.errors.floor && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.floor}</p>
                )}
              </div>

              <div>
                <label htmlFor="viewType" className="block text-sm font-semibold text-gray-700 mb-2">
                  View Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="viewType"
                  name="viewType"
                  value={formik.values.viewType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter view type"
                  className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${
                    formik.touched.viewType && formik.errors.viewType ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formik.touched.viewType && formik.errors.viewType && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.viewType}</p>
                )}
              </div>

              <div className="relative" ref={statusRef}>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowStatusDropdown((prev) => !prev)}
                  className={`w-full px-4 py-2 bg-gray-100 border rounded-[4px] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982] ${
                    formik.touched.status && formik.errors.status ? 'border-red-500' : 'border-gray-300'
                  }`}
                  onBlur={() => formik.setFieldTouched('status', true)}
                >
                  <span className="text-gray-800">{formik.values.status}</span>
                  <ChevronDown size={18} className="text-gray-600" />
                </button>
                {showStatusDropdown && (
                  <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg">
                    {statusOptions.map((status) => (
                      <div
                        key={status}
                        onClick={() => {
                          formik.setFieldValue('status', status);
                          formik.setFieldTouched('status', true, false);
                          setShowStatusDropdown(false);
                        }}
                        className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )}
                {formik.touched.status && formik.errors.status && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.status}</p>
                )}
              </div>


              {/* Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isSmokingAllowed"
                    checked={formik.values.isSmokingAllowed}
                    onChange={formik.handleChange}
                    className="w-4 h-4 text-[#B79982] focus:ring-[#B79982] border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Smoking Allowed</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPetFriendly"
                    checked={formik.values.isPetFriendly}
                    onChange={formik.handleChange}
                    className="w-4 h-4 text-[#B79982] focus:ring-[#B79982] border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Pet Friendly</span>
                </label>
              </div>

              {/* Maintenance Notes */}
              <div>
                <label htmlFor="maintenanceNotes" className="block text-sm font-semibold text-gray-700 mb-2">
                  Maintenance Notes
                </label>
                <textarea
                  id="maintenanceNotes"
                  name="maintenanceNotes"
                  value={formik.values.maintenanceNotes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Any maintenance notes or special instructions..."
                  rows="3"
                  className="w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] resize-none border-gray-300"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <div className={`w-full border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.description && formik.errors.description ? 'border-red-500' : 'border-gray-300'}`}>
                  <ReactQuill
                    className="custom-quill"
                    placeholder="Enter Description"
                    value={formik.values.description}
                    onChange={(val) => formik.setFieldValue('description', val)}
                    onBlur={() => formik.setFieldTouched('description', true)}
                    modules={quillModules}
                    formats={quillFormats}
                  />
                </div>
                {formik.touched.description && formik.errors.description && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.description}</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/rooms/available')}
                  className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
                >
                  {loading ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update Room' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;