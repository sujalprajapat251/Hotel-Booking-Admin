import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import "../Style/vaidik.css"
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit, FiPlusCircle } from "react-icons/fi";
import { IoEyeSharp } from 'react-icons/io5';
import { Search, Filter, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType
} from '../Redux/Slice/roomtypesSlice';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import * as XLSX from 'xlsx';
import { setAlert } from '../Redux/Slice/alert.slice';
import { ChevronDown } from 'lucide-react';
import { fetchFeatures } from '../Redux/Slice/featuresSlice';

const bedTypes = ['Single', 'Double', 'Queen', 'King', 'Twin'];

const RoomType = () => {

  const dispatch = useDispatch();

  const { items: roomTypes, loading } = useSelector((state) => state.roomtypes);
  const { items: features, loading: featuresLoading } = useSelector((state) => state.features);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [imagePreview, setImagePreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // Track existing images from server
  const [removedImages, setRemovedImages] = useState([]); // Track removed existing image indices
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    no: true,
    roomType: true,
    description: true,
    price: true,
    availableRooms: true,
    capacity: true,
    features: true,
    image: true,
    actions: true,
  });

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

  const formik = useFormik({
    initialValues: {
      roomType: '',
      description: '',
      price: '',
      availableRooms: '',
      capacityAdults: '',
      capacityChildren: '',
      features: [],
      images: [],
      bedMainType: '',
      bedMainCount: '',
      bedChildType: '',
      bedChildCount: '',
    },
    validationSchema: Yup.object({
      roomType: Yup.string().trim().required('Room type name is required'),
      description: Yup.string().trim(),
      price: Yup.number().typeError('Price must be a number').min(0, 'Price must be 0 or more').required('Price is required'),
      availableRooms: Yup.number().typeError('Available rooms must be a number').integer('Available rooms must be an integer').min(0, 'Available rooms must be 0 or more').required('Available rooms are required'),
      capacityAdults: Yup.number().typeError('Adults must be a number').integer('Adults must be an integer').min(1, 'At least 1 adult').required('Adults are required'),
      capacityChildren: Yup.number().typeError('Children must be a number').integer('Children must be an integer').min(0, 'Children must be 0 or more'),
      bedMainType: Yup.string().required('Main bed type is required'),
      bedMainCount: Yup.number().typeError('Main bed count must be a number').integer('Main bed count must be an integer').min(1, 'At least 1 main bed is required').required('Main bed count is required'),
      bedChildType: Yup.string(),
      bedChildCount: Yup.number().typeError('Child bed count must be a number').integer('Child bed count must be an integer').min(0, 'Child bed count must be 0 or more')
    }),
    onSubmit: async (values, { resetForm }) => {
      // Build bed object - mainBed is required (validated by formik)
      const bedData = {
        mainBed: {
          type: values.bedMainType.trim(),
          count: Number(values.bedMainCount || 1)
        }
      };

      // childBed is optional - only include if both type and count are provided
      if (values.bedChildType && values.bedChildType.trim() && values.bedChildCount !== undefined && values.bedChildCount !== '') {
        bedData.childBed = {
          type: values.bedChildType.trim(),
          count: Number(values.bedChildCount || 0)
        };
      }

      // For editing: send existing images that weren't removed along with new images
      const payload = {
        roomType: values.roomType.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        availableRooms: Number(values.availableRooms),
        capacityAdults: Number(values.capacityAdults),
        capacityChildren: Number(values.capacityChildren || 0),
        features: values.features,
        images: values.images, // New images (File objects)
        existingImages: editingId ? existingImages : undefined, // Existing images to keep (only when editing)
        bed: bedData,
      };
      
      try {
        if (editingId) {
          await dispatch(updateRoomType({ id: editingId, ...payload })).unwrap();
        } else {
          await dispatch(createRoomType(payload)).unwrap();
        }
        resetForm();
        setImagePreview([]);
        setExistingImages([]);
        setRemovedImages([]);
        // Revoke all object URLs
        imagePreview.forEach(url => {
          if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        setEditingId(null);
        setIsAddModalOpen(false);
      } catch (err) {
        console.error(err);
      }
    }
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

  const handleImageChange = (event) => {
    const files = Array.from(event.currentTarget.files || []);
    if (files.length === 0) return;
    
    // Add new files to formik
    const currentFiles = formik.values.images || [];
    const newFiles = [...currentFiles, ...files];
    formik.setFieldValue('images', newFiles);
    
    // Create preview URLs for new files only
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setImagePreview([...imagePreview, ...newPreviews]);
    
    // Reset file input
    event.target.value = '';
  };

  const handleRemoveImage = (index, isExisting = false) => {
    if (isExisting) {
      // Remove existing image - mark it for removal
      setRemovedImages([...removedImages, index]);
      const updatedExisting = existingImages.filter((_, i) => i !== index);
      setExistingImages(updatedExisting);
    } else {
      // Remove new image - remove from both preview and formik
      // Revoke object URL to free memory first
      if (imagePreview[index]) {
        URL.revokeObjectURL(imagePreview[index]);
      }
      
      const newPreview = imagePreview.filter((_, i) => i !== index);
      setImagePreview(newPreview);
      
      // Remove corresponding file from formik.values.images
      // New images are stored in formik.values.images array
      const updatedFiles = formik.values.images.filter((_, i) => i !== index);
      formik.setFieldValue('images', updatedFiles);
    }
  };

  const handleEdit = (item) => {
    const roomTypeId = item._id || item.id;
    setEditingId(roomTypeId);
    setIsAddModalOpen(true);
    
    // Normalize features to array of IDs (handle both string IDs and objects with _id)
    const normalizeFeatureIds = (features) => {
      if (!Array.isArray(features)) return [];
      return features.map(f => {
        if (typeof f === 'string') return f;
        if (typeof f === 'object' && f !== null) return f._id || f.id || '';
        return '';
      }).filter(Boolean);
    };
    
    const featureIds = normalizeFeatureIds(item?.features);
    const existingImgs = item.images || [];
    
    formik.setValues({
      roomType: item.roomType || '',
      description: item.description || '',
      price: item.price ?? '',
      availableRooms: item.availableRooms ?? '',
      capacityAdults: item?.capacity?.adults ?? '',
      capacityChildren: item?.capacity?.children ?? '',
      features: featureIds, // Auto-select existing features
      images: [], // New images will be added here
      bedMainType: item?.bed?.mainBed?.type || '',
      bedMainCount: item?.bed?.mainBed?.count || '',
      bedChildType: item?.bed?.childBed?.type || '',
      bedChildCount: item?.bed?.childBed?.count || '',
    });
    setExistingImages(existingImgs);
    setImagePreview([]); // Clear preview for new images
    setRemovedImages([]); // Reset removed images
    formik.setTouched({});
    
    // Fetch features for this room type
    dispatch(fetchFeatures(roomTypeId));
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    setEditingId(null);
    formik.resetForm();
    setImagePreview([]);
    setExistingImages([]);
    setRemovedImages([]);
    // Revoke all object URLs to free memory
    imagePreview.forEach(url => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setShowMainBedTypeDropdown(false);
    setShowChildBedTypeDropdown(false);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    formik.resetForm();
    setImagePreview([]);
    setExistingImages([]);
    setRemovedImages([]);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setItemToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    dispatch(deleteRoomType(itemToDelete))
      .then(() => {
        dispatch(fetchRoomTypes());
      });
    handleDeleteModalClose();
  };

  const filteredRoomTypes = roomTypes.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.roomType?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredRoomTypes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoomTypes = filteredRoomTypes.slice(startIndex, endIndex);

  const handleRefresh = () => {
    dispatch(fetchRoomTypes());
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleDownloadExcel = () => {
    try {
      if (filteredRoomTypes.length === 0) {
        dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
        return;
      }
      // Prepare data for Excel
      const excelData = filteredRoomTypes.map((user, index) => {
        const row = {};
        row['No.'] = index + 1;
        row['Room Type'] = user.roomType || '';
        row['Description'] = user.description || '';
        row['Price'] = user.price ?? '';
        row['Available Rooms'] = user.availableRooms ?? '';
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
      const fileName = `Room_Type_List_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;

      // Download the file
      XLSX.writeFile(workbook, fileName);
      dispatch(setAlert({ text: "Export completed..!", color: 'success' }));
    } catch (error) {
      dispatch(setAlert({ text: "Export failed..!", color: 'error' }));
    }
  };

  useEffect(() => {
    dispatch(fetchRoomTypes());
  }, [dispatch])

    const handleViewClick = (item) => {
      setSelectedItem(item);
      setIsViewModalOpen(true);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setSelectedItem(null);
  };

  const [showMainBedTypeDropdown, setShowMainBedTypeDropdown] = useState(false);
  const [showChildBedTypeDropdown, setShowChildBedTypeDropdown] = useState(false);
  const mainBedTypeRef = useRef(null);
  const childBedTypeRef = useRef(null);
  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (mainBedTypeRef.current && !mainBedTypeRef.current.contains(event.target)) {
        setShowMainBedTypeDropdown(false);
      }
      if (childBedTypeRef.current && !childBedTypeRef.current.contains(event.target)) {
        setShowChildBedTypeDropdown(false);
      }
    }
    if (isAddModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isAddModalOpen]);

  useEffect(() => {
    if (isAddModalOpen) {
      if (editingId) {
        // When editing, fetch features for this specific room type
        dispatch(fetchFeatures(editingId));
      } else {
        // When creating, fetch all features
        dispatch(fetchFeatures());
      }
    }
  }, [isAddModalOpen, editingId, dispatch]);

  return (
    <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
      <section className="py-5">
        <h1 className="text-2xl font-semibold text-black">All Room Types</h1>
      </section>

      {/* Header */}
      <div className='bg-white rounded-lg shadow-md'>

        {/* Header */}
        <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
          <div className='flex gap-2 md:gap-5 sm:justify-between'>

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

          {/* Action Buttons */}
          <div className="flex items-center gap-1 justify-end mt-2">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleOpenAddModal}
                className="p-2 text-[#4CAF50] hover:text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded-lg transition-colors"
                title="Add Room Type"
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
            <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Refresh" onClick={handleRefresh}>
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors" title="Download" onClick={handleDownloadExcel}>
              <Download size={20} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] sticky top-0 z-10">
              <tr>
                {visibleColumns.no && (
                  <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">No.</th>
                )}
                {visibleColumns.roomType && (
                  <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Room Type Name</th>
                )}
                {visibleColumns.description && (
                  <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Description</th>
                )}
                {visibleColumns.price && (
                  <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Price</th>
                )}
                {visibleColumns.availableRooms && (
                  <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Available Rooms</th>
                )}
                {visibleColumns.capacity && (
                  <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Capacity</th>
                )}
                {visibleColumns.features && (
                  <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Features</th>
                )}
                {visibleColumns.image && (
                  <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Images</th>
                )}
                {visibleColumns.bed && (
                  <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Bed</th>
                )}
                {visibleColumns.actions && (
                  <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Action</th>
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
              ) : currentRoomTypes?.length > 0 ? (
                currentRoomTypes.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                  >
                    {visibleColumns.no && (
                      <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{startIndex + index + 1}</td>
                    )}
                    {visibleColumns.roomType && (
                      <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700 capitalize">
                        <div className="flex items-center gap-2">
                          {item.roomType}
                        </div>
                      </td>
                    )}
                    {visibleColumns.description && (
                      <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                        <div
                            className="description"
                            dangerouslySetInnerHTML={{ __html: item.description.slice(0, 50) + '...' }}
                          />
                      </td>
                    )}
                    {visibleColumns.price && (
                      <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                        {item.price !== undefined ? item.price : '-'}
                      </td>
                    )}
                    {visibleColumns.availableRooms && (
                      <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                        {item.availableRooms !== undefined ? item.availableRooms : '-'}
                        {item.totalRooms !== undefined ? ` / ${item.totalRooms}` : ''}
                      </td>
                    )}
                    {visibleColumns.capacity && (
                      <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                        {item?.capacity?.adults ?? '-'} A / {item?.capacity?.children ?? 0} C
                      </td>
                    )}
                    {visibleColumns.features && (
                      <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                        {Array.isArray(item?.features) ? item.features.length : 0}
                      </td>
                    )}
                    {visibleColumns.image && (
                      <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                        {item.images?.length ? (
                          <div className="flex items-center gap-2">
                            <img src={item.images[0]} alt={item.roomType} className="h-12 w-16 object-cover rounded-md border" />
                            
                          </div>
                        ) : (
                          <span className="text-gray-400">No image</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.bed && (
                      <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                        Main: {item?.bed?.mainBed?.type || '-'} x{item?.bed?.mainBed?.count || 0}<br/>
                        {item?.bed?.childBed?.count ? `Child: ${item.bed.childBed.type} x${item.bed.childBed.count}` : ''}
                      </td>
                    )}
                    {/* Actions */}
                    {visibleColumns.actions && (
                      <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                        <div className="mv_table_action flex">
                          <div onClick={() => handleViewClick(item)}><IoEyeSharp className="text-[#6777ef] text-[18px]" /></div>
                          <div onClick={() => handleEdit(item)}><FiEdit className="text-[#6777ef] text-[18px]" /></div>
                          <div onClick={() => handleDelete(item._id || item.id)}><RiDeleteBinLine className="text-[#ff5200] text-[18px]" /></div>
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
                      <p className="text-lg font-medium">No Room Types available</p>
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

          <div className="flex items-center gap-1 sm:gap-3  md600:gap-2 md:gap-3">
            <span className="text-sm text-gray-600">
              {startIndex + 1} - {Math.min(endIndex, filteredRoomTypes.length)} of {filteredRoomTypes.length}
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

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleAddModalClose}></div>
          <div className="relative w-full max-w-[1000px] rounded-md bg-white p-0 shadow-xl mx-3 flex flex-col max-h-[94vh] h-full">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-8 pb-4">
              <h2 className="text-2xl font-semibold text-black">
                {editingId ? 'Edit Room Type' : 'Add Room Type'}
              </h2>
              <button onClick={handleAddModalClose} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Modal Content (scrolls if needed) */}
            <div className="flex-1 overflow-y-auto px-8 pb-2">
              <form id="roomTypeForm" className="space-y-6" onSubmit={formik.handleSubmit}>
                {/* Row 1: Room Type Name */}
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-black mb-1">Room Type Name</label>
                  <input
                    id="name"
                    name="roomType"
                    type="text"
                    placeholder="Enter Name"
                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                    value={formik.values.roomType}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.roomType && formik.errors.roomType && (
                    <p className="text-sm text-red-500">{formik.errors.roomType}</p>
                  )}
                </div>
                {/* Row 2: Description (Quill) */}
                <div>
                  <label htmlFor="description" className="text-sm font-medium text-black mb-1">Description</label>
                  <ReactQuill
                    className="custom-quill"
                    placeholder="Enter Description"
                    value={formik.values.description}
                    onChange={(val) => formik.setFieldValue('description', val)}
                    onBlur={() => formik.setFieldTouched('description', true)}
                    modules={quillModules}
                    formats={quillFormats}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <p className="text-sm text-red-500 mt-2">{formik.errors.description}</p>
                  )}
                </div>
                {/* Row 3: Price + Available Rooms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col mb-2">
                    <label htmlFor="price" className="text-sm font-medium text-black mb-1">Price</label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      placeholder="Enter Price"
                      className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                      value={formik.values.price}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.price && formik.errors.price && (
                      <p className="text-sm text-red-500">{formik.errors.price}</p>
                    )}
                  </div>
                  <div className="flex flex-col mb-2">
                    <label htmlFor="availableRooms" className="text-sm font-medium text-black mb-1">Available Rooms</label>
                    <input
                      id="availableRooms"
                      name="availableRooms"
                      type="number"
                      placeholder="Enter Available Rooms"
                      className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                      value={formik.values.availableRooms}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.availableRooms && formik.errors.availableRooms && (
                      <p className="text-sm text-red-500">{formik.errors.availableRooms}</p>
                    )}
                  </div>
                </div>
                {/* Row 4: Capacity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col mb-2">
                    <label htmlFor="capacityAdults" className="text-sm font-medium text-black mb-1">Adults Capacity</label>
                    <input
                      id="capacityAdults"
                      name="capacityAdults"
                      type="number"
                      placeholder="Number of adults"
                      className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                      value={formik.values.capacityAdults}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.capacityAdults && formik.errors.capacityAdults && (
                      <p className="text-sm text-red-500">{formik.errors.capacityAdults}</p>
                    )}
                  </div>
                  <div className="flex flex-col mb-2">
                    <label htmlFor="capacityChildren" className="text-sm font-medium text-black mb-1">Children Capacity</label>
                    <input
                      id="capacityChildren"
                      name="capacityChildren"
                      type="number"
                      placeholder="Number of children"
                      className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                      value={formik.values.capacityChildren}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.capacityChildren && formik.errors.capacityChildren && (
                      <p className="text-sm text-red-500">{formik.errors.capacityChildren}</p>
                    )}
                  </div>
                </div>
                {/* Row 5: Features */}
                <div>
                  <label className="text-sm font-medium text-black mb-1">
                    Features (Select Multiple)
                    {editingId && (
                      <span className="text-gray-500 text-xs ml-2">(Features for this room type)</span>
                    )}
                  </label>
                  <div className="border border-gray-300 rounded-[4px] p-4 max-h-44 overflow-y-auto bg-gray-50">
                    {featuresLoading ? (
                      <div className="text-gray-400 text-sm">Loading features...</div>
                    ) : features?.length === 0 ? (
                      <div className="text-gray-400 text-sm">
                        {editingId ? 'No features available for this room type.' : 'No features available.'}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {features.map((feature) => {
                          const featureId = feature._id || feature.id;
                          const isChecked = formik.values.features.includes(featureId);
                          return (
                            <label key={featureId} className="flex items-center space-x-2 cursor-pointer hover:bg-[#F7DF9C]/20 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    formik.setFieldValue('features', formik.values.features.filter((x) => x !== featureId));
                                  } else {
                                    formik.setFieldValue('features', [...formik.values.features, featureId]);
                                  }
                                }}
                                className="w-4 h-4 text-[#B79982] focus:ring-[#B79982] border-gray-300 rounded"
                              />
                              <span className="text-gray-700">{feature.feature}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {/* Optionally add validation error */}
                  {formik.touched.features && formik.errors.features && (
                    <p className="text-sm text-red-500">{formik.errors.features}</p>
                  )}
                </div>
                {/* Row 6: Images */}
                <div>
                  <label htmlFor="images" className="text-sm font-medium text-black mb-1">Images</label>
                  <input
                    id="images"
                    name="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                  />
                  {(existingImages.length > 0 || imagePreview.length > 0) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {/* Existing Images */}
                      {existingImages.map((src, idx) => (
                        <div key={`existing-${idx}`} className="relative group">
                          <img 
                            src={src} 
                            alt={`Existing ${idx + 1}`} 
                            className="h-20 w-20 object-cover rounded-md border-2 border-gray-300" 
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx, true)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                            title="Remove image"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {/* New Image Previews */}
                      {imagePreview.map((src, idx) => (
                        <div key={`new-${idx}`} className="relative group">
                          <img 
                            src={src} 
                            alt={`Preview ${idx + 1}`} 
                            className="h-20 w-20 object-cover rounded-md border-2 border-blue-300" 
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx, false)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                            title="Remove image"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Row 7: Bed Config */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Main Bed Type Dropdown */}
                  <div className="flex flex-col mb-2 relative" ref={mainBedTypeRef}>
                    <label htmlFor="bedMainType" className="text-sm font-medium text-black mb-1">Main Bed Type</label>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMainBedTypeDropdown((prev) => !prev);
                        setShowChildBedTypeDropdown(false);
                      }}
                      className={`w-full px-4 py-2 bg-gray-100 border rounded-[4px] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982] ${
                        formik.touched.bedMainType && formik.errors.bedMainType ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <span className="text-gray-800">{formik.values.bedMainType || 'Select main bed type'}</span>
                      <ChevronDown size={18} className="text-gray-600" />
                    </button>
                    {formik.touched.bedMainType && formik.errors.bedMainType && (
                      <p className="text-sm text-red-500 mt-1">{formik.errors.bedMainType}</p>
                    )}
                    {showMainBedTypeDropdown && (
                      <div className="absolute z-[60] w-full bg-white border border-gray-300 rounded-[4px] shadow-lg mt-1 top-full">
                        {bedTypes.map((type) => (
                          <div
                            key={type}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              formik.setFieldValue('bedMainType', type);
                              formik.setFieldTouched('bedMainType', true);
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
                  {/* Main Bed Count */}
                  <div className="flex flex-col mb-2">
                    <label htmlFor="bedMainCount" className="text-sm font-medium text-black mb-1">Main Bed Count</label>
                    <input
                      id="bedMainCount"
                      name="bedMainCount"
                      type="number"
                      placeholder="Number of main beds"
                      className={`w-full rounded-[4px] border px-2 py-2 focus:outline-none bg-[#1414140F] ${
                        formik.touched.bedMainCount && formik.errors.bedMainCount ? 'border-red-500' : 'border-gray-200'
                      }`}
                      value={formik.values.bedMainCount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.bedMainCount && formik.errors.bedMainCount && (
                      <p className="text-sm text-red-500">{formik.errors.bedMainCount}</p>
                    )}
                  </div>
                  {/* Child Bed Type Dropdown */}
                  <div className="flex flex-col mb-2 relative" ref={childBedTypeRef}>
                    <label htmlFor="bedChildType" className="text-sm font-medium text-black mb-1">Child Bed Type (Optional)</label>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowChildBedTypeDropdown((prev) => !prev);
                        setShowMainBedTypeDropdown(false);
                      }}
                      className={`w-full px-4 py-2 bg-gray-100 border rounded-[4px] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982] ${
                        formik.touched.bedChildType && formik.errors.bedChildType ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <span className="text-gray-800">{formik.values.bedChildType || 'Select child bed type'}</span>
                      <ChevronDown size={18} className="text-gray-600" />
                    </button>
                    {formik.touched.bedChildType && formik.errors.bedChildType && (
                      <p className="text-sm text-red-500 mt-1">{formik.errors.bedChildType}</p>
                    )}
                    {showChildBedTypeDropdown && (
                      <div className="absolute z-[60] w-full bg-white border border-gray-300 rounded-[4px] shadow-lg mt-1 top-full">
                        {bedTypes.map((type) => (
                          <div
                            key={type}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              formik.setFieldValue('bedChildType', type);
                              formik.setFieldTouched('bedChildType', true);
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
                  {/* Child Bed Count */}
                  <div className="flex flex-col mb-2">
                    <label htmlFor="bedChildCount" className="text-sm font-medium text-black mb-1">Child Bed Count (Optional)</label>
                    <input
                      id="bedChildCount"
                      name="bedChildCount"
                      type="number"
                      placeholder="Number of child beds"
                      className={`w-full rounded-[4px] border px-2 py-2 focus:outline-none bg-[#1414140F] ${
                        formik.touched.bedChildCount && formik.errors.bedChildCount ? 'border-red-500' : 'border-gray-200'
                      }`}
                      value={formik.values.bedChildCount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.bedChildCount && formik.errors.bedChildCount && (
                      <p className="text-sm text-red-500">{formik.errors.bedChildCount}</p>
                    )}
                  </div>
                </div>
              </form>
            </div>
            {/* Modal Footer Buttons outside the scroll area! */}
            <div className="px-8 pt-3 pb-8 border-t flex-shrink-0 flex items-center justify-center gap-4 bg-white">
              <button
                type="button"
                onClick={handleAddModalClose}
                className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="roomTypeForm"
                onClick={(e) => {
                  e.preventDefault();
                  formik.handleSubmit();
                }}
                className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
              >
                {editingId ? 'Edit' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Type Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleDeleteModalClose}></div>
          <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl mx-5">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">Delete Room Type</h2>
              <button onClick={handleDeleteModalClose} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 mb-8 text-center">Are you sure you want to delete this room type?</p>
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

      {isViewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleViewModalClose}></div>
          <div className="relative w-full max-w-2xl rounded-md bg-white p-6 shadow-xl mx-5 max-h-[90vh] overflow-y-auto custom-modal-scroll">
            <div className="flex items-start justify-between mb-6 pb-4 border-b">
              <h2 className="text-2xl font-semibold text-black">Room Type Details</h2>
              <button onClick={handleViewModalClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {selectedItem ? (
              <div className="space-y-6">
                {/* Basic Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Room Type</span>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{selectedItem.roomType || '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</span>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {selectedItem.price !== undefined ? `$${selectedItem.price.toLocaleString()}` : '—'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Available Rooms</span>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {selectedItem.availableRooms !== undefined ? selectedItem.availableRooms : '—'}
                      {selectedItem.totalRooms !== undefined ? ` / ${selectedItem.totalRooms}` : ''}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Capacity</span>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {selectedItem?.capacity?.adults ?? '—'} Adults / {selectedItem?.capacity?.children ?? 0} Children
                    </p>
                  </div>
                </div>

                {/* Bed Configuration */}
                {selectedItem?.bed && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">Bed Configuration</span>
                    <div className="flex flex-wrap gap-4">
                      {selectedItem.bed.mainBed && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Main Bed:</span>
                          <span className="text-sm text-gray-900">
                            {selectedItem.bed.mainBed.type || '—'} x{selectedItem.bed.mainBed.count || 0}
                          </span>
                        </div>
                      )}
                      {selectedItem.bed.childBed && selectedItem.bed.childBed.count > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Child Bed:</span>
                          <span className="text-sm text-gray-900">
                            {selectedItem.bed.childBed.type || '—'} x{selectedItem.bed.childBed.count || 0}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">Features</span>
                  {selectedItem?.features?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.features.map((feature, i) => {
                        // Handle both populated feature objects and feature IDs
                        const featureName = typeof feature === 'object' && feature !== null 
                          ? (feature.feature || feature.name || feature._id || feature.id)
                          : (feature || 'Unknown');
                        return (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#F7DF9C] text-[#755647]"
                          >
                            {featureName}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">No features available</span>
                  )}
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">Description</span>
                  {selectedItem.description ? (
                    <div
                      className="text-sm text-gray-800 prose prose-sm max-w-none"
                      style={{
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        maxHeight: '200px',
                        overflowY: 'auto',
                      }}
                      dangerouslySetInnerHTML={{
                        __html: selectedItem.description,
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No description available</span>
                  )}
                </div>

                {/* Images */}
                {selectedItem.images?.length ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">Images</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedItem.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Room type ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-md border-2 border-gray-200 hover:border-[#B79982] transition-colors cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">Images</span>
                    <span className="text-gray-400 text-sm">No images available</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-sm text-center py-8">No details available.</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default RoomType;