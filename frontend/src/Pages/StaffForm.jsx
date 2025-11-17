import React, { useState, useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Upload, Calendar, ChevronDown, X } from 'lucide-react';

const StaffForm = () => {
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const departmentRef = useRef(null);
  const genderRef = useRef(null);
  const countryCodeRef = useRef(null);
  const calendarRef = useRef(null);
  const fileInputRef = useRef(null);

  const departments = [
    'Kitchen',
    'Front Desk',
    'Housekeeping',
    'Security',
    'Management',
    'Maintenance',
    'Food & Beverage',
    'Human Resources'
  ];

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
    image: Yup.mixed()
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
    password: Yup.string()
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

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      name: '',
      image: null,
      department: '',
      gender: '',
      address: '',
      countryCode: '+91',
      mobile: '',
      email: '',
      password: '',
      joiningDate: ''
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log('Form Values:', values);
      alert('Form submitted successfully! Check console for values.');
    }
  });

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
    setShowCalendar(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    formik.handleSubmit();
  };

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
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className='p-3 md:p-4 lg:p-5  bg-[#F0F3FB]'>
        {/* <p className=' text-[20px] font-semiboldtext-black '>Add New Staff</p> */}
        <div className="w-full ">
          <div className="w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] px-6 py-4">
              <h2 className="text-xl md:text-2xl font-bold text-[#755647]">Add New Staff</h2>
            </div>

            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/4">
                  <div className="flex flex-col items-center">
                    <label className="text-sm font-semibold text-gray-700 mb-2">Profile Image *</label>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter full name"
                        className={`w-full px-4 py-2 border bg-[#FFF9E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-gray-300'
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
                        className={`w-full px-4 py-2 bg-[#FFF9E6] border rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.department && formik.errors.department ? 'border-red-500' : 'border-gray-300'
                          }`}
                      >
                        <span className={formik.values.department ? 'text-gray-800' : 'text-gray-400'}>
                          {formik.values.department || 'Select department'}
                        </span>
                        <ChevronDown size={18} className="text-gray-600" />
                      </button>
                      {showDepartmentDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {departments.map((dept) => (
                            <div
                              key={dept}
                              onClick={() => {
                                formik.setFieldValue('department', dept);
                                setShowDepartmentDropdown(false);
                              }}
                              className="px-4 py-2 hover:bg-[#F7DF9C]/20 cursor-pointer text-sm text-gray-800"
                            >
                              {dept}
                            </div>
                          ))}
                        </div>
                      )}
                      {formik.touched.department && formik.errors.department && (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.department}</div>
                      )}
                    </div>

                    <div className="relative" ref={genderRef}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                      <button
                        type="button"
                        onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                        className={`w-full px-4 py-2 bg-[#FFF9E6] border rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.gender && formik.errors.gender ? 'border-red-500' : 'border-gray-300'
                          }`}
                      >
                        <span className={formik.values.gender ? 'text-gray-800' : 'text-gray-400'}>
                          {formik.values.gender || 'Select gender'}
                        </span>
                        <ChevronDown size={18} className="text-gray-600" />
                      </button>
                      {showGenderDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                          {genders.map((gender) => (
                            <div
                              key={gender}
                              onClick={() => {
                                formik.setFieldValue('gender', gender);
                                setShowGenderDropdown(false);
                              }}
                              className="px-4 py-2 hover:bg-[#F7DF9C]/20 cursor-pointer text-sm text-gray-800"
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
                        className={`w-full px-4 py-2 border bg-[#FFF9E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] resize-none ${formik.touched.address && formik.errors.address ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {formik.touched.address && formik.errors.address && (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.address}</div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number *</label>
                      <div className="flex gap-2">
                        <div className="relative w-32" ref={countryCodeRef}>
                          <button
                            type="button"
                            onClick={() => setShowCountryCodeDropdown(!showCountryCodeDropdown)}
                            className="w-full px-3 py-2 bg-[#FFF9E6] border border-gray-300 rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982]"
                          >
                            <span className="text-gray-800 text-sm">{formik.values.countryCode}</span>
                            <ChevronDown size={16} className="text-gray-600" />
                          </button>
                          {showCountryCodeDropdown && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
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
                            className={`w-full px-4 py-2 border bg-[#FFF9E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.mobile && formik.errors.mobile ? 'border-red-500' : 'border-gray-300'
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
                        className={`w-full px-4 py-2 border bg-[#FFF9E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                      <input
                        type="password"
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter password"
                        className={`w-full px-4 py-2 border bg-[#FFF9E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300'
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
                          className={`w-full px-4 py-2 border  bg-[#FFF9E6]  rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.joiningDate && formik.errors.joiningDate ? 'border-red-500' : 'border-gray-300'
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

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    formik.resetForm();
                    setImagePreview(null);
                  }}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] text-[#755647] rounded-lg hover:from-[#E3C78A] hover:to-[#F7DF9C] transition-all font-semibold shadow-md"
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