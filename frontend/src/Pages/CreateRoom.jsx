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

const bedTypes = ['Single', 'Double', 'Queen', 'King', 'Twin'];
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
      price: {
        base: editingItem?.price?.base !== undefined && editingItem?.price?.base !== null ? String(editingItem.price.base) : '',
        weekend:
          editingItem?.price?.weekend !== undefined && editingItem?.price?.weekend !== null
            ? String(editingItem.price.weekend)
            : ''
      },
      capacity: {
        adults:
          editingItem?.capacity?.adults !== undefined && editingItem?.capacity?.adults !== null
            ? String(editingItem.capacity.adults)
            : '',
        children:
          editingItem?.capacity?.children !== undefined && editingItem?.capacity?.children !== null
            ? String(editingItem.capacity.children)
            : ''
      },
      features: normalizeFeaturesToIds(editingItem?.features),
      bed: {
        mainBed: {
          type: editingItem?.bed?.mainBed?.type || defaultMainBedType,
          count:
            editingItem?.bed?.mainBed?.count !== undefined && editingItem?.bed?.mainBed?.count !== null
              ? String(editingItem.bed.mainBed.count)
              : ''
        },
        childBed: {
          type: editingItem?.bed?.childBed?.type || defaultChildBedType,
          count:
            editingItem?.bed?.childBed?.count !== undefined && editingItem?.bed?.childBed?.count !== null
              ? String(editingItem.bed.childBed.count)
              : ''
        }
      },
      viewType: editingItem?.viewType || '',
      status: editingItem?.status || 'Available',
      isSmokingAllowed: Boolean(editingItem?.isSmokingAllowed),
      isPetFriendly: Boolean(editingItem?.isPetFriendly),
      maintenanceNotes: editingItem?.maintenanceNotes || '',
      images: []
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
        price: Yup.object({
          base: Yup.number()
            .typeError('Base price must be a number')
            .min(0, 'Base price cannot be negative')
            .required('Base price is required'),
          weekend: Yup.number()
            .typeError('Weekend price must be a number')
            .min(0, 'Weekend price cannot be negative')
            .required('Weekend price is required')
        }),
        capacity: Yup.object({
          adults: Yup.number()
            .typeError('Adults capacity must be a number')
            .min(1, 'At least one adult is required')
            .required('Adults capacity is required'),
          children: Yup.number()
            .typeError('Children capacity must be a number')
            .min(0, 'Children cannot be negative')
            .notRequired()
            .nullable()
            .transform((value, originalValue) => (originalValue === '' ? null : value))
        }),
        bed: Yup.object({
          mainBed: Yup.object({
            type: Yup.string().required('Main bed type is required'),
            count: Yup.number()
              .typeError('Main bed count must be a number')
              .min(1, 'Main bed count must be at least 1')
              .required('Main bed count is required')
          }),
          childBed: Yup.object({
            type: Yup.string().required('Child bed type is required'),
            count: Yup.number()
              .typeError('Child bed count must be a number')
              .min(1, 'Child bed count must be at least 1')
              .required('Child bed count is required')
          })
        }),
        viewType: Yup.string().required('View type is required'),
        status: Yup.string().required('Status is required'),
        images: Yup.array().test('required', 'At least one image is required', function (value) {
          if (isEditMode) {
            return existingImages.length > 0 || Boolean(value && value.length);
          }
          return Boolean(value && value.length);
        })
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
        price: {
          base: Number(values.price.base),
          weekend: Number(values.price.weekend)
        },
        capacity: {
          adults: Number(values.capacity.adults),
          children: values.capacity.children === '' || values.capacity.children === null ? 0 : Number(values.capacity.children)
        },
        features: values.features || [],
        bed: {
          mainBed: {
            type: values.bed.mainBed.type,
            count: Number(values.bed.mainBed.count)
          },
          childBed: {
            type: values.bed.childBed.type,
            count: Number(values.bed.childBed.count)
          }
        },
        viewType: values.viewType,
        status: values.status,
        isSmokingAllowed: values.isSmokingAllowed,
        isPetFriendly: values.isPetFriendly,
        maintenanceNotes: values.maintenanceNotes,
        images: values.images || [],
        imagesToKeep: existingImages
      };

      try {
        if (isEditMode && editingItem) {
          const id = editingItem._id || editingItem.id;
          if (!payload.images.length) {
            delete payload.images;
          }
          const result = await dispatch(updateRoom({ id, roomData: payload }));
          if (updateRoom.fulfilled.match(result)) {
            dispatch(setAlert({ text: 'Room updated successfully..!', color: 'success' }));
            setIsEditMode(false);
            setEditingItem(null);
            setExistingImages([]);
            setImagePreviews([]);
            resetForm();
            navigate('/rooms/available');
          }
        } else {
          const result = await dispatch(createRoom(payload));
          if (createRoom.fulfilled.match(result)) {
            dispatch(setAlert({ text: 'Room created successfully..!', color: 'success' }));
            setImagePreviews([]);
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
                  placeholder="e.g., 203"
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
                  placeholder="e.g., 2"
                  min="0"
                  className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${
                    formik.touched.floor && formik.errors.floor ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formik.touched.floor && formik.errors.floor && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.floor}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price.base" className="block text-sm font-semibold text-gray-700 mb-2">
                    Base Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price.base"
                    name="price.base"
                    value={formik.values.price.base}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., 2000"
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${
                      formik.touched.price?.base && formik.errors.price?.base ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formik.touched.price?.base && formik.errors.price?.base && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.price.base}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="price.weekend" className="block text-sm font-semibold text-gray-700 mb-2">
                    Weekend Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price.weekend"
                    name="price.weekend"
                    value={formik.values.price.weekend}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., 2500"
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${
                      formik.touched.price?.weekend && formik.errors.price?.weekend ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formik.touched.price?.weekend && formik.errors.price?.weekend && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.price.weekend}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="capacity.adults" className="block text-sm font-semibold text-gray-700 mb-2">
                    Adults <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="capacity.adults"
                    name="capacity.adults"
                    value={formik.values.capacity.adults}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., 2"
                    min="1"
                    className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${
                      formik.touched.capacity?.adults && formik.errors.capacity?.adults ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formik.touched.capacity?.adults && formik.errors.capacity?.adults && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.capacity.adults}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="capacity.children" className="block text-sm font-semibold text-gray-700 mb-2">
                    Children
                  </label>
                  <input
                    type="number"
                    id="capacity.children"
                    name="capacity.children"
                    value={formik.values.capacity.children}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., 1"
                    min="0"
                    className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${
                      formik.touched.capacity?.children && formik.errors.capacity?.children
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  {formik.touched.capacity?.children && formik.errors.capacity?.children && (
                    <p className="text-red-500 text-sm mt-1">{formik.errors.capacity.children}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Features (Select Multiple)
                  {!formik.values.roomType && (
                    <span className="text-gray-500 text-sm ml-2">(Please select a room type first)</span>
                  )}
                </label>
                <div className="border border-gray-300 rounded-[4px] p-4 max-h-48 overflow-y-auto bg-gray-50">
                  {!formik.values.roomType ? (
                    <p className="text-gray-500 text-sm">Please select a room type to view available features.</p>
                  ) : filteredFeatures.length === 0 ? (
                    <p className="text-gray-500 text-sm">No features available for this room type.</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredFeatures.map((feature) => {
                        const featureId = feature.id || feature._id;
                        return (
                          <label key={featureId} className="flex items-center space-x-2 cursor-pointer hover:bg-[#F7DF9C]/20 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={(formik.values.features || []).includes(featureId)}
                              onChange={() => toggleFeatureSelection(featureId)}
                              className="w-4 h-4 text-[#B79982] focus:ring-[#B79982] border-gray-300 rounded"
                            />
                            <span className="text-gray-700">{feature.feature}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Main Bed</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative" ref={mainBedTypeRef}>
                    <label htmlFor="bed.mainBed.type" className="block text-sm font-semibold text-gray-700 mb-2">
                      Main Bed Type <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMainBedTypeDropdown((prev) => !prev)}
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-[4px] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982]"
                    >
                      <span className="text-gray-800">{formik.values.bed.mainBed.type}</span>
                      <ChevronDown size={18} className="text-gray-600" />
                    </button>
                    {showMainBedTypeDropdown && (
                      <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg">
                        {bedTypes.map((type) => (
                          <div
                            key={type}
                            onClick={() => {
                              formik.setFieldValue('bed.mainBed.type', type);
                              setShowMainBedTypeDropdown(false);
                            }}
                            className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                          >
                            {type}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="bed.mainBed.count" className="block text-sm font-semibold text-gray-700 mb-2">
                      Main Bed Count <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="bed.mainBed.count"
                      name="bed.mainBed.count"
                      value={formik.values.bed.mainBed.count}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g., 1"
                      min="1"
                      className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${
                        formik.touched.bed?.mainBed?.count && formik.errors.bed?.mainBed?.count
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {formik.touched.bed?.mainBed?.count && formik.errors.bed?.mainBed?.count && (
                      <p className="text-red-500 text-sm mt-1">{formik.errors.bed.mainBed.count}</p>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-4">Child Bed</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative" ref={childBedTypeRef}>
                    <label htmlFor="bed.childBed.type" className="block text-sm font-semibold text-gray-700 mb-2">
                      Child Bed Type <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowChildBedTypeDropdown((prev) => !prev)}
                      className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-[4px] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982]"
                    >
                      <span className="text-gray-800">{formik.values.bed.childBed.type}</span>
                      <ChevronDown size={18} className="text-gray-600" />
                    </button>
                    {showChildBedTypeDropdown && (
                      <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg">
                        {bedTypes.map((type) => (
                          <div
                            key={type}
                            onClick={() => {
                              formik.setFieldValue('bed.childBed.type', type);
                              setShowChildBedTypeDropdown(false);
                            }}
                            className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                          >
                            {type}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="bed.childBed.count" className="block text-sm font-semibold text-gray-700 mb-2">
                      Child Bed Count <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="bed.childBed.count"
                      name="bed.childBed.count"
                      value={formik.values.bed.childBed.count}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g., 1"
                      min="1"
                      className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${
                        formik.touched.bed?.childBed?.count && formik.errors.bed?.childBed?.count
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {formik.touched.bed?.childBed?.count && formik.errors.bed?.childBed?.count && (
                      <p className="text-red-500 text-sm mt-1">{formik.errors.bed.childBed.count}</p>
                    )}
                  </div>
                </div>
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
                  placeholder="e.g., City View, Ocean View"
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

              <div>
                <label htmlFor="images" className="block text-sm font-semibold text-gray-700 mb-2">
                  Room Images {isEditMode ? '(optional)' : <span className="text-red-500">*</span>}
                </label>
                <label className="flex w-full cursor-pointer items-center justify-between rounded-[4px] border border-gray-300 px-3 py-2 text-gray-500 bg-gray-100">
                  <span className="truncate text-sm">
                    {imagePreviews.length > 0
                      ? `${imagePreviews.length} file${imagePreviews.length > 1 ? 's' : ''} selected`
                      : 'Choose file'}
                  </span>
                  <span className="rounded-[4px] bg-[#F5DEB3] hover:bg-[#EDD5A8] px-6 py-1 text-gray-800 text-sm font-medium transition-colors ml-2">
                    Browse
                  </span>
                  <input
                    type="file"
                    id="images"
                    name="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    onBlur={() => formik.setFieldTouched('images', true)}
                    className="hidden"
                  />
                </label>
                {formik.touched.images && formik.errors.images && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.images}</p>
                )}

                {existingImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Existing Images</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingImages.map((imagePath, index) => (
                        <div key={`${imagePath}-${index}`} className="relative group">
                          <img
                            src={getImageUrl(imagePath)}
                            alt={`Room existing ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Remove existing image ${index + 1}`}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Remove any image you no longer need, then upload replacements below.</p>
                  </div>
                )}

                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg border-2 border-gray-300" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
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

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/rooms/available')}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-[4px] hover:bg-gradient-to-r hover:from-[#F7DF9C] hover:to-[#E3C78A] hover:border-transparent transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] text-[#755647] rounded-[4px] hover:from-white hover:to-white hover:border-2 hover:border-[#E3C78A] transition-all font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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