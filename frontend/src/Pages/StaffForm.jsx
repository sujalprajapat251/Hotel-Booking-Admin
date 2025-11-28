import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Upload, ChevronDown, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createStaff, getAllStaff, updateStaff } from '../Redux/Slice/staff.slice';
import { getAllDepartment } from '../Redux/Slice/department.slice';
import { IMAGE_URL } from '../Utils/baseUrl';

const BASE_DESIGNATIONS = [
  'Manager',
  'Supervisor',
  'Executive',
  'Assistant',
  'Coordinator',
  'Officer',
  'Staff',
  'Intern'
];

const DEPARTMENT_DESIGNATION_MAP = {
  Cafe: ['Chef', 'Waiter','Accountant'],
  Transport: ['Driver'],
  Restaurant :['Chef', 'Waiter','Accountant'],
  Bar :['Chef', 'Waiter','Accountant'],
  Housekeeping: ['Worker']
};

const StaffForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditMode = location?.state?.mode === 'edit';
  const staffData = location?.state?.staff || null;
  const pageTitle = isEditMode ? 'Edit New Staff' : 'Add New Staff';

  const departments = useSelector((state) => state.department.departments);

  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);
  const [showDesignationDropdown, setShowDesignationDropdown] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('');

  const departmentRef = useRef(null);
  const genderRef = useRef(null);
  const designationRef = useRef(null);
  const countryCodeRef = useRef(null);
  const calendarRef = useRef(null);
  const fileInputRef = useRef(null);

  const genders = ['Male', 'Female', 'Other'];


  const countryCodes = [
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+91', country: 'India' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japan' },
    { code: '+49', country: 'Germany' },
    { code: '+33', country: 'France' },
    { code: '+61', country: 'Australia' }
  ];

  // Validation Schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name must be less than 50 characters')
      .required('Name is required'),
    image: isEditMode
      ? Yup.mixed()
        .test('fileSize', 'File size must be less than 5MB', (value) => {
          if (!value || typeof value === 'string') return true;
          return value.size <= 5242880;
        })
        .test('fileType', 'Only JPG, JPEG, PNG formats are allowed', (value) => {
          if (!value || typeof value === 'string') return true;
          return ['image/jpg', 'image/jpeg', 'image/png'].includes(value.type);
        })
      : Yup.mixed()
        .required('Image is required')
        .test('fileSize', 'File size must be less than 5MB', (value) => {
          if (!value) return false;
          return value.size <= 5242880;
        })
        .test('fileType', 'Only JPG, JPEG, PNG formats are allowed', (value) => {
          if (!value) return false;
          return ['image/jpg', 'image/jpeg', 'image/png'].includes(value.type);
        }),
    department: Yup.string().required('Department is required'),
    designation: Yup.string().required('Designation is required'),
    gender: Yup.string().required('Gender is required'),
    address: Yup.string()
      .min(10, 'Address must be at least 10 characters')
      .max(200, 'Address must be less than 200 characters')
      .required('Address is required'),
    countryCode: Yup.string().required('Country code is required'),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
      .required('Mobile number is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: isEditMode
      ? Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .matches(/[@$!%*?&#]/, 'Password must contain at least one special character')
      : Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .matches(/[@$!%*?&#]/, 'Password must contain at least one special character')
        .required('Password is required'),
    joiningDate: Yup.date()
      .max(new Date(), 'Joining date cannot be in the future')
      .required('Joining date is required')
  });

  // Helper function to extract country code and mobile from mobileno
  const extractMobileAndCode = (mobileno) => {
    if (!mobileno) return { countryCode: '+91', mobile: '' };
    const mobilenoStr = String(mobileno);
    // If mobileno starts with country code, extract it
    if (mobilenoStr.startsWith('+')) {
      const codeMatch = mobilenoStr.match(/^(\+\d{1,3})/);
      if (codeMatch) {
        return {
          countryCode: codeMatch[1],
          mobile: mobilenoStr.replace(codeMatch[1], '').trim()
        };
      }
    }
    // Otherwise, assume it's just the mobile number
    return { countryCode: '+91', mobile: mobilenoStr.slice(-10) };
  };

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      name: staffData?.name || '',
      image: staffData?.image || null,
      department: staffData?.department?._id || staffData?.department || '',
      designation: staffData?.designation || '',
      gender: staffData?.gender || '',
      address: staffData?.address || '',
      countryCode: extractMobileAndCode(staffData?.mobileno).countryCode,
      mobile: extractMobileAndCode(staffData?.mobileno).mobile,
      email: staffData?.email || '',
      password: '',
      joiningDate: staffData?.joiningdate ? new Date(staffData.joiningdate).toISOString().split('T')[0] : ''
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      if (isSubmitting) return;

      setIsSubmitting(true);
      try {
        const submitData = {
          name: values.name,
          email: values.email,
          mobileno: values.mobile,
          address: values.address,
          department: values.department,
          designation: values.designation,
          gender: values.gender,
          joiningdate: values.joiningDate,
        };

        // Only include password if provided (for edit mode)
        if (values.password) {
          submitData.password = values.password;
        }

        // Only include image if it's a new file (not a string URL)
        if (values.image && values.image instanceof File) {
          submitData.image = values.image;
        }

        if (isEditMode && staffData?._id) {
          await dispatch(updateStaff({ staffId: staffData._id, staffData: submitData })).unwrap();
        } else {
          await dispatch(createStaff(submitData)).unwrap();
        }

        await dispatch(getAllStaff());
        navigate('/staff');
      } catch (error) {
        console.error(`Error ${isEditMode ? 'updating' : 'creating'} staff:`, error);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const resolvedDepartmentName = useMemo(() => {
    if (selectedDepartmentName) return selectedDepartmentName;
    const matchedDept = departments?.find((dept) => dept._id === formik.values.department);
    return matchedDept?.name || '';
  }, [departments, formik.values.department, selectedDepartmentName]);

  const designationOptions = useMemo(() => {
    const specific = DEPARTMENT_DESIGNATION_MAP[resolvedDepartmentName] || [];
    const combined = [...specific, 'Head of Department'];
    return [...new Set(combined)];
  }, [resolvedDepartmentName]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDateSelect = (date) => {
    formik.setFieldValue('joiningDate', date);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    formik.handleSubmit();
  };

  useEffect(() => {
    dispatch(getAllDepartment());
  }, [dispatch]);

  // Populate form when staffData is available (edit mode)
  useEffect(() => {
    if (isEditMode && staffData) {
      // Set department name for display
      if (staffData.department) {
        const deptName = staffData.department?.name || staffData.department;
        setSelectedDepartmentName(deptName);
      }

      // Set image preview if image exists
      if (staffData.image && typeof staffData.image === 'string') {
        setImagePreview(`${IMAGE_URL}${staffData.image}`);
      }
    }
  }, [isEditMode, staffData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (departmentRef.current && !departmentRef.current.contains(event.target)) {
        setShowDepartmentDropdown(false);
      }
      if (genderRef.current && !genderRef.current.contains(event.target)) {
        setShowGenderDropdown(false);
      }
      if (countryCodeRef.current && !countryCodeRef.current.contains(event.target)) {
        setShowCountryCodeDropdown(false);
      }
      if (designationRef.current && !designationRef.current.contains(event.target)) {
        setShowDesignationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className='p-3 md:p-4 lg:p-5 bg-[#F0F3FB] h-full max-h-[90vh]'>
        {/* <p className=' text-[20px] font-semiboldtext-black '>Add New Staff</p> */}
        <div className="w-full ">
          <div className="w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] px-6 py-4">
              <h2 className="text-xl md:text-2xl font-bold text-black">{pageTitle}</h2>
            </div>

            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 xl:gap-6 justify-between">
                <div className="lg:w-1/3 xl:w-1/4">
                  <div className="flex flex-col items-center">
                    <label className="text-sm font-semibold text-gray-700 mb-2">
                      Profile Image {isEditMode ? '(Click to change)' : '*'}
                    </label>
                    <div className="relative w-48 h-48 border-2 border-dashed border-[#B79982] rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors">
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              formik.setFieldValue('image', null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="text-[#B79982] mb-2" size={32} />
                          <span className="text-sm text-gray-600">Click to upload</span>
                          <span className="text-xs text-gray-500 mt-1">JPG, PNG (Max 5MB)</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpg,image/jpeg,image/png"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                    {formik.touched.image && formik.errors.image && (
                      <div className="text-red-500 text-xs mt-2">{formik.errors.image}</div>
                    )}
                  </div>
                </div>

                <div className="lg:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter full name"
                        className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {formik.touched.name && formik.errors.name && (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
                      )}
                    </div>

                    <div className="relative" ref={departmentRef}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                      <button
                        type="button"
                        onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                        className={`w-full px-4 py-2 bg-gray-100 border rounded-[4px] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.department && formik.errors.department ? 'border-red-500' : 'border-gray-300'
                          }`}
                      >
                        <span className={selectedDepartmentName || formik.values.department ? 'text-gray-800' : 'text-gray-400'}>
                          {selectedDepartmentName || formik.values.department || 'Select department'}
                        </span>
                        <ChevronDown size={18} className="text-gray-600" />
                      </button>
                      {showDepartmentDropdown && (
                        <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg max-h-48 overflow-y-auto">
                          {departments && departments.length > 0 ? (
                            [...departments].reverse().map((dept) => (
                              <div
                                key={dept._id}
                                onClick={() => {
                                  formik.setFieldValue('department', dept._id);
                                  setSelectedDepartmentName(dept.name);
                                  setShowDepartmentDropdown(false);
                                  formik.setFieldValue('designation', '');
                                  setShowDesignationDropdown(false);
                                }}
                                className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                              >
                                {dept.name}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">No departments available</div>
                          )}
                        </div>
                      )}
                      {formik.touched.department && formik.errors.department && (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.department}</div>
                      )}
                    </div>

                    <div className="relative" ref={designationRef}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Designation *</label>
                      <button
                        type="button"
                        onClick={() => {
                          if (!formik.values.department) return;
                          setShowDesignationDropdown(!showDesignationDropdown);
                        }}
                        className={`w-full px-4 py-2 bg-gray-100 border rounded-[4px] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.designation && formik.errors.designation ? 'border-red-500' : 'border-gray-300'} ${!formik.values.department ? 'cursor-not-allowed opacity-60' : ''}`}
                        disabled={!formik.values.department}
                      >
                        <span className={formik.values.designation ? 'text-gray-800' : 'text-gray-400'}>
                          {formik.values.designation || (formik.values.department ? 'Select designation' : 'Select department first')}
                        </span>
                        <ChevronDown size={18} className="text-gray-600" />
                      </button>
                      {showDesignationDropdown && (
                        <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg max-h-48 overflow-y-auto">
                          {designationOptions.length > 0 ? (
                            designationOptions.map((designation) => (
                              <div
                                key={designation}
                                onClick={() => {
                                  formik.setFieldValue('designation', designation);
                                  setShowDesignationDropdown(false);
                                }}
                                className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                              >
                                {designation}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">No designations available</div>
                          )}
                        </div>
                      )}
                      {formik.touched.designation && formik.errors.designation && (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.designation}</div>
                      )}
                    </div>

                    <div className="relative" ref={genderRef}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                      <button
                        type="button"
                        onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                        className={`w-full px-4 py-2 bg-gray-100 border rounded-[4px] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.gender && formik.errors.gender ? 'border-red-500' : 'border-gray-300'
                          }`}
                      >
                        <span className={formik.values.gender ? 'text-gray-800' : 'text-gray-400'}>
                          {formik.values.gender || 'Select gender'}
                        </span>
                        <ChevronDown size={18} className="text-gray-600" />
                      </button>
                      {showGenderDropdown && (
                        <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg">
                          {genders.map((gender) => (
                            <div
                              key={gender}
                              onClick={() => {
                                formik.setFieldValue('gender', gender);
                                setShowGenderDropdown(false);
                              }}
                              className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                            >
                              {gender}
                            </div>
                          ))}
                        </div>
                      )}
                      {formik.touched.gender && formik.errors.gender && (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.gender}</div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                      <textarea
                        name="address"
                        value={formik.values.address}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter full address"
                        rows="3"
                        className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] resize-none ${formik.touched.address && formik.errors.address ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {formik.touched.address && formik.errors.address && (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.address}</div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number *</label>
                      <div className="flex gap-2">
                        <div className="relative w-16" ref={countryCodeRef}>
                          <button
                            type="button"
                            onClick={() => setShowCountryCodeDropdown(!showCountryCodeDropdown)}
                            className="w-16 px-2 py-2.5 bg-gray-100 border border-gray-300 rounded-[4px] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982]"
                          >
                            <span className="text-gray-800 text-sm">{formik.values.countryCode}</span>
                            <ChevronDown size={16} className="text-gray-600" />
                          </button>
                          {showCountryCodeDropdown && (
                            <div className="absolute z-50 w-28 mt-1 bg-white border border-gray-300 rounded-[4px] shadow-lg max-h-48 overflow-y-auto">
                              {countryCodes.map((item) => (
                                <div
                                  key={item.code}
                                  onClick={() => {
                                    formik.setFieldValue('countryCode', item.code);
                                    setShowCountryCodeDropdown(false);
                                  }}
                                  className="px-3 py-2 hover:bg-[#F7DF9C]/20 cursor-pointer text-sm"
                                >
                                  <span className="font-medium">{item.code}</span>
                                  <span className="text-gray-600 ml-2">{item.country}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            name="mobile"
                            value={formik.values.mobile}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Enter 10 digit mobile number"
                            maxLength="10"
                            className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.mobile && formik.errors.mobile ? 'border-red-500' : 'border-gray-300'
                              }`}
                          />
                        </div>
                      </div>
                      {formik.touched.mobile && formik.errors.mobile && (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.mobile}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter email address"
                        className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password {isEditMode ? '(Leave blank to keep current password)' : '*'}
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder={isEditMode ? 'Enter new password (optional)' : 'Enter password'}
                        className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {formik.touched.password && formik.errors.password && (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
                      )}
                    </div>

                    <div className="md:col-span-2 relative" ref={calendarRef}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Joining Date *</label>
                      <div className="relative">
                        <input
                          type="date"
                          name="joiningDate"
                          value={formik.values.joiningDate}
                          max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => handleDateSelect(e.target.value)}
                          onBlur={formik.handleBlur}
                          className={`w-full px-4 py-2 border  bg-gray-100  rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.joiningDate && formik.errors.joiningDate ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                      </div>
                      {formik.touched.joiningDate && formik.errors.joiningDate && (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.joiningDate}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/staff')}
                  className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
                >
                  Submit
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffForm;