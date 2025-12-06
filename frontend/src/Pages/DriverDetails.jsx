import React, { useEffect, useMemo, useState, useRef } from "react";
import { FiPlusCircle, FiEdit } from "react-icons/fi";
import { IoEyeSharp } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import * as XLSX from "xlsx";
import { setAlert } from "../Redux/Slice/alert.slice";
import { useDispatch, useSelector } from "react-redux";
import { getAllDrivers, createDriver, updateDriver, deleteDriver } from "../Redux/Slice/driverSlice";
import { getAllCabs } from "../Redux/Slice/cab.slice";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const statusColors = (status) => {
  switch (status) {
    case 'Available':
      return 'border border-green-500 text-green-600 bg-green-50';
    case 'Leave':
      return 'border border-red-500 text-red-600 bg-red-50';
    case 'OnTrip':
      return 'border border-yellow-500 text-yellow-600 bg-yellow-50';
    default:
      return 'border border-gray-500 text-gray-600 bg-gray-50';
  }
};

const DriverDetails = () => {
  const dispatch = useDispatch();
  const { drivers, loading, error } = useSelector((state) => state.driver);
  const { cabs } = useSelector((state) => state.cab);

  useEffect(() => {
    dispatch(getAllDrivers());
    dispatch(getAllCabs());
  }, [dispatch]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverModalMode, setDriverModalMode] = useState("add"); 
  const [driverLoading, setDriverLoading] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewDriver, setViewDriver] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const gender = ["Male", "Female", "Other"];
  const genderDropdownRef = useRef(null);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const assignedDropdownRef = useRef(null);
  const [showAssignedDropdown, setShowAssignedDropdown] = useState(false);
  const statusOptions = ["Available", "Unavailable", "Leave", "OnTrip"];
  const statusDropdownRef = useRef(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const defaultDriverFields = {
    _id: null,
    name: "",
    email: "",
    password: "",
    mobileno: "",
    countrycode: "+91",
    fullMobile: "",
    address: "",
    gender: "",
    joiningdate: "",
    AssignedCab: "",
    status: "Available",
    image: null,
    existingImage: null,
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const [driverForm, setDriverForm] = useState(defaultDriverFields);

  const filteredDrivers = useMemo(() => {
    return (drivers || []).filter((d) => {
      const matchesSearch =
        d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.mobileno?.includes(searchTerm) ||
        d.AssignedCab?.vehicleId
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" ? true : d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDrivers.length / itemsPerPage)
  );

  const paginatedDrivers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDrivers.slice(start, start + itemsPerPage);
  }, [filteredDrivers, currentPage, itemsPerPage]);

  const startItem =
    filteredDrivers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem =
    filteredDrivers.length === 0
      ? 0
      : Math.min(currentPage * itemsPerPage, filteredDrivers.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isDriverModalOpen || isDeleteModalOpen || isViewModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isDriverModalOpen, isDeleteModalOpen, isViewModalOpen]);

  // Unified Driver Modal Handlers
  const handleOpenAddModal = () => {
    setDriverForm(defaultDriverFields);
    setDriverModalMode("add");
    setShowGenderDropdown(false);
    setShowAssignedDropdown(false);
    setShowStatusDropdown(false);
    setIsDriverModalOpen(true);
  };

  const handleOpenEditModal = (driver) => {
    // Format joining date for input field (YYYY-MM-DD)
    const joiningDate = driver.joiningdate
      ? new Date(driver.joiningdate).toISOString().split('T')[0]
      : "";

    setDriverForm({
      _id: driver._id,
      name: driver.name || "",
      email: driver.email || "",
      password: "", // Don't pre-fill password
      mobileno: driver.mobileno || "",
      countrycode: "+91",
      fullMobile: driver.mobileno || "",
      address: driver.address || "",
      gender: driver.gender || "",
      joiningdate: joiningDate,
      AssignedCab: driver.AssignedCab?._id || "",
      status: driver.status || "Available",
      image: null,
      existingImage: driver.image || null,
    });
    setDriverModalMode("edit");
    setShowGenderDropdown(false);
    setShowAssignedDropdown(false);
    setShowStatusDropdown(false);
    setIsDriverModalOpen(true);
  };

  const handleDriverInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setDriverForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setDriverLoading(true);
    try {
      if (driverModalMode === "add") {
        // Add mode - create new driver
        await dispatch(createDriver(driverForm));
      } else {
        // Edit mode - update existing driver
        const driverData = { ...driverForm };
        // Remove empty password and image if not changed
        if (!driverData.password || driverData.password.trim() === "") {
          delete driverData.password;
        }
        if (!driverData.image) {
          delete driverData.image;
        }
        delete driverData.existingImage; // Remove preview field

        await dispatch(updateDriver(driverData));
      }
      setIsDriverModalOpen(false);
      setDriverForm(defaultDriverFields);
      dispatch(getAllDrivers()); // Refresh the list
    } finally {
      setDriverLoading(false);
    }
  };

  const handleDriverModalCancel = () => {
    setIsDriverModalOpen(false);
    setDriverForm(defaultDriverFields);
    setShowGenderDropdown(false);
    setShowAssignedDropdown(false);
    setShowStatusDropdown(false);
  };

  // Close any open custom dropdown when clicking outside of them
  useEffect(() => {
    function handleClickOutside(e) {
      if (!showGenderDropdown && !showAssignedDropdown && !showStatusDropdown) return;
      const target = e.target;
      const insideGender = genderDropdownRef.current && genderDropdownRef.current.contains(target);
      const insideAssigned = assignedDropdownRef.current && assignedDropdownRef.current.contains(target);
      const insideStatus = statusDropdownRef.current && statusDropdownRef.current.contains(target);
      if (!insideGender && !insideAssigned && !insideStatus) {
        setShowGenderDropdown(false);
        setShowAssignedDropdown(false);
        setShowStatusDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showGenderDropdown, showAssignedDropdown, showStatusDropdown]);

  // View Driver Handlers
  const handleOpenViewModal = (driver) => {
    setViewDriver(driver);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewDriver(null);
  };

  // Delete Driver Handlers
  const handleDeleteClick = (driver) => {
    setDriverToDelete(driver);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (driverToDelete && driverToDelete._id) {
      await dispatch(deleteDriver(driverToDelete._id));
      dispatch(getAllDrivers()); // Refresh the list
    }
    setIsDeleteModalOpen(false);
    setDriverToDelete(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDriverToDelete(null);
  };

  const handleRefresh = () => {
    dispatch(getAllDrivers());
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleDownloadExcel = () => {
    try {
      if (filteredDrivers.length === 0) {
        dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
        return;
      }

      // Prepare rows matching the table columns
      const excelData = filteredDrivers.map((d, idx) => ({
        No: idx + 1,
        Name: d.name || "",
        Gender: d.gender || "",
        Email: d.email || "",
        "Mobile No.": `${d.countrycode ? d.countrycode : ''}${d.countrycode && d.mobileno ? ' ' : ''}${d.mobileno ? d.mobileno : ''}`,
        "Assigned Cab": d.AssignedCab?.vehicleId || "Not Assigned",
        Status: d.status || "",
        Address: d.address || "",
        "Joining Date": d.joiningdate ? new Date(d.joiningdate).toLocaleDateString() : "",
        Image: d.image || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Drivers");

      // simple column width heuristic
      const headers = Object.keys(excelData[0] || {});
      const wscols = headers.map(() => ({ wch: 20 }));
      worksheet["!cols"] = wscols;

      const date = new Date();
      const fileName = `Driver_List_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      dispatch(setAlert({ text: "Export completed..!", color: "success" }));
    } catch (error) {
      console.error("Driver export failed", error);
      dispatch(setAlert({ text: "Export failed..!", color: "error" }));
    }
  };

  return (
    <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
      <section className="py-5">
        <h1 className="text-2xl font-semibold text-black">All Drivers</h1>
      </section>

      <div className="bg-white rounded-lg shadow-md">
        <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex gap-2 md:gap-5 sm:justify-between">
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 justify-end mt-2">
            <button
              className="p-2 text-[#4CAF50] hover:text-[#4CAF50] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors"
              title="Add Driver"
              onClick={handleOpenAddModal}
            >
              <FiPlusCircle size={20} />
            </button>
            <div className="relative">
              <button
                className="p-2 text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors"
                title="Filter Status"
                onClick={() => setShowFilterMenu((prev) => !prev)}
              >
                <Filter size={20} />
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                  {["All", "Available", "Leave", "Unavailable"].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F7DF9C]/30 ${statusFilter === status
                          ? "text-[#755647] font-semibold"
                          : "text-gray-700"
                          }`}
                      >
                        {status}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
            <button
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="Refresh"
              onClick={handleRefresh}
            >
              <RefreshCw size={20} />
            </button>
            <button
              className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              title="Download"
              onClick={handleDownloadExcel}
            >
              <Download size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-[#B79982] scrollbar-track-[#F7DF9C]/20 hover:scrollbar-thumb-[#876B56]">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] z-10 shadow-sm">
              <tr>
                {["No", "Driver", "Contact", "Assigned Cab", "Status", "Address", "Action"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <RefreshCw className="w-12 h-12 mb-4 text-[#B79982] animate-spin" />
                      <p className="text-lg font-medium">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedDrivers?.length > 0 ? (
                paginatedDrivers.map((driver, idx) => (
                  <tr
                    key={driver._id || idx}
                    className="border-b border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                  >
                    <td className="px-5 py-4 text-gray-600 font-semibold">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full border border-gray-200 overflow-hidden bg-gray-100">
                          {driver.image ? (
                            <img
                              src={driver.image}
                              alt={driver.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">
                            {driver.name || "—"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {driver.email || "no-email"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-black">
                      <div className="flex flex-col text-sm">
                        <span className="inline-flex items-center gap-1 text-gray-800 font-medium">
                          <Phone size={16} className='text-green-600' />
                          {driver.countrycode ? driver.countrycode : ""} {driver.mobileno || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-800">
                      {driver.AssignedCab?.vehicleId || "Not Assigned"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${statusColors(driver.status)}`}
                      >
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-800 whitespace-normal break-words max-w-[160px]">
                      <div className="flex flex-col text-sm">
                        <span className="inline-flex items-center gap-1 text-gray-800 font-medium line-clamp-3">
                          <MapPin size={14} className="text-orange-500" />
                          {driver.address || "Address not set"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="mv_table_action flex">
                        <div
                          title="View"
                          className="p-1 text-[#16a34a] hover:text-[#0f9b3a] rounded-lg transition-colors cursor-pointer"
                          onClick={() => handleOpenViewModal(driver)}
                        >
                          <IoEyeSharp className='text-[18px] text-quaternary' />
                        </div>
                        <div
                          className="p-1 text-[#6777ef] hover:text-[#4255d4] rounded-lg transition-colors"
                          title="Edit"
                          onClick={() => handleOpenEditModal(driver)}
                        >
                          <FiEdit className="text-[18px]" />
                        </div>
                        <div
                          title="Delete"
                          onClick={() => handleDeleteClick(driver)}
                        >
                          <RiDeleteBinLine className="text-[#ff5200] text-[18px]" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-lg font-medium">No data available</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-1 sm:px-3 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {startItem} - {endItem} of {filteredDrivers.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || filteredDrivers.length === 0}
                className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Add/Edit Driver Modal */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleDriverModalCancel}></div>
          <div className="relative w-full md:max-w-2xl max-w-[90%] rounded-[4px] bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-black">
                {driverModalMode === "add" ? "Add Driver" : "Edit Driver"}
              </h2>
              <button onClick={handleDriverModalCancel} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleDriverSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-black mb-1">Name </label>
                  <input
                    type="text"
                    name="name"
                    value={driverForm.name}
                    onChange={handleDriverInputChange}
                    placeholder="Driver Name"
                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-black mb-1">Email </label>
                  <input
                    type="email"
                    name="email"
                    value={driverForm.email}
                    onChange={handleDriverInputChange}
                    placeholder="driver@example.com"
                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-black mb-1">
                    Password {driverModalMode === "add" ? "" : ""}
                  </label>
                  <div className="input-field flex items-center w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982]">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={driverForm.password}
                      onChange={handleDriverInputChange}
                      placeholder={driverModalMode === "add" ? "Password" : "Leave blank to keep current password"}
                      className="bg-transparent focus-visible:outline-none w-full"
                      required={driverModalMode === "add"}
                    />
                    <span className="text-gray-400 ms-auto" onClick={togglePasswordVisibility}>{showPassword ? <IoMdEye /> : <IoMdEyeOff />}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-black mb-1">
                    Mobile Number
                  </label>
                  <PhoneInput
                    country={"in"}
                    enableSearch={true}
                    value={driverForm.fullMobile || ""}
                    onChange={(value, country) => {
                      const nextValue = value || "";
                      const dialCode = country?.dialCode || "";
                      const mobileOnly = nextValue.slice(dialCode.length);
                      setDriverForm((prev) => ({
                        ...prev,
                        countrycode: dialCode ? `+${dialCode}` : "",
                        mobileno: mobileOnly,
                        fullMobile: nextValue,
                      }));
                    }}
                    placeholder="Enter mobile number"
                    inputProps={{
                      name: "mobileno",
                      required: true,
                    }}
                    containerStyle={{
                      width: "100%",
                    }}
                    buttonStyle={{
                      backgroundColor: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      width: "50px",
                    }}
                    inputStyle={{
                      width: "100%",
                      backgroundColor: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      paddingLeft: "55px",
                      height: "42px",
                    }}
                    dropdownStyle={{
                      width: "260px",
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-black mb-1">Gender </label>
                  <div className="relative" ref={genderDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowGenderDropdown((prev) => !prev)}
                      name="gender"
                      value={driverForm.gender}
                      onChange={handleDriverInputChange}
                      className="w-full rounded-[4px] border px-2 py-2 focus:outline-none bg-[#1414140F] flex items-center justify-between "
                      required
                    >
                      <span className="text-sm truncate">
                        {driverForm.gender ? driverForm.gender : 'Select Gender'}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-600 transition-transform duration-200 ${showGenderDropdown ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {showGenderDropdown && (
                      <ul className="absolute z-50 w-full rounded-md bg-white border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
                        {gender.map((option) => (
                          <li
                            key={option}
                            onClick={() => {
                              handleDriverInputChange({ target: { name: "gender", value: option } });
                              setShowGenderDropdown(false);
                            }}
                            className="hover:bg-[#F7DF9C] cursor-pointer px-4 py-2"
                          >
                            {option}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-black mb-1">Joining Date </label>
                  <input
                    type="date"
                    name="joiningdate"
                    value={driverForm.joiningdate}
                    onChange={handleDriverInputChange}
                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-black mb-1">Assigned Cab</label>
                  <div className="relative" ref={assignedDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowAssignedDropdown((prev) => !prev)}
                      name="AssignedCab"
                      className="w-full rounded-[4px] border px-2 py-2 focus:outline-none bg-[#1414140F] flex items-center justify-between"
                    >
                      <span className="text-sm truncate">
                        {driverForm.AssignedCab
                          ? (() => {
                            const sel = (cabs || []).find((c) => c._id === driverForm.AssignedCab);
                            return sel ? `${sel.vehicleId} - ${sel.modelName}` : 'Select Cab (Optional)';
                          })()
                          : 'Select Cab (Optional)'}
                      </span>
                      <ChevronDown size={18} className={`text-gray-600 transition-transform duration-200 ${showAssignedDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showAssignedDropdown && (
                      <ul className="absolute z-50 w-full rounded-md bg-white border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
                        <li
                          onClick={() => {
                            handleDriverInputChange({ target: { name: 'AssignedCab', value: '' } });
                            setShowAssignedDropdown(false);
                          }}
                          className="hover:bg-[#F7DF9C] cursor-pointer px-4 py-2"
                        >
                          Select Cab (Optional)
                        </li>
                        {cabs && cabs.map((cab) => (
                          <li
                            key={cab._id}
                            onClick={() => {
                              handleDriverInputChange({ target: { name: 'AssignedCab', value: cab._id } });
                              setShowAssignedDropdown(false);
                            }}
                            className="hover:bg-[#F7DF9C] cursor-pointer px-4 py-2"
                          >
                            {cab.vehicleId} - {cab.modelName}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-black mb-1">Status </label>
                  <div className="relative" ref={statusDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowStatusDropdown((prev) => !prev)}
                      name="status"
                      className="w-full rounded-[4px] border px-2 py-2 focus:outline-none bg-[#1414140F] flex items-center justify-between"
                      required
                    >
                      <span className="text-sm truncate">{driverForm.status}</span>
                      <ChevronDown size={18} className={`text-gray-600 transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showStatusDropdown && (
                      <ul className="absolute z-50 w-full rounded-md bg-white border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
                        {statusOptions.map((opt) => (
                          <li
                            key={opt}
                            onClick={() => {
                              handleDriverInputChange({ target: { name: 'status', value: opt } });
                              setShowStatusDropdown(false);
                            }}
                            className="hover:bg-[#F7DF9C] cursor-pointer px-4 py-2"
                          >
                            {opt}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-black mb-1">Address </label>
                <textarea
                  name="address"
                  value={driverForm.address}
                  onChange={handleDriverInputChange}
                  placeholder="Driver Address"
                  rows="3"
                  className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-black mb-1">Profile Image</label>
                {driverModalMode === "edit" && driverForm.existingImage && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Current Image:</p>
                    <img
                      src={driverForm.existingImage}
                      alt="Current"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                  </div>
                )}
                <label className="flex w-full cursor-pointer items-center justify-between rounded-[4px] border border-gray-200 px-2 py-2 text-gray-500 bg-[#1414140F]">
                  <span className="truncate">
                    {driverForm.image
                      ? driverForm.image.name
                      : (driverModalMode === "edit" && driverForm.existingImage
                        ? driverForm.existingImage.split('/').pop()
                        : 'Choose file')}
                  </span>
                  <span className="rounded-[4px] bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] px-4 py-1 text-black text-sm">Browse</span>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleDriverInputChange}
                  />
                </label>
                {driverModalMode === "edit" && (
                  <p className="text-xs text-gray-500 mt-1">Leave blank to keep current image</p>
                )}
              </div>
              <div className="flex items-center justify-center pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleDriverModalCancel}
                  className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]"
                  disabled={driverLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
                  disabled={driverLoading}
                >
                  {driverLoading
                    ? (driverModalMode === "add" ? "Adding..." : "Updating...")
                    : (driverModalMode === "add" ? "Add Driver" : "Update Driver")
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Driver Modal */}
      {isViewModalOpen && viewDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseViewModal}></div>
          <div className="relative w-full md:max-w-2xl max-w-[90%] rounded-md bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
              <h2 className="text-2xl font-semibold text-black">Driver Details</h2>
              <button onClick={handleCloseViewModal} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="h-28 w-28 rounded-full overflow-hidden border bg-gray-100">
                {viewDriver.image ? (
                  <img src={viewDriver.image} alt={viewDriver.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">No Image</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[15px]">
              <div className="flex items-start gap-2">
                <span className="font-semibold w-32 text-black">Name:</span>
                <span>{viewDriver.name || '—'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold w-32 text-black">Email:</span>
                <span>{viewDriver.email || '—'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold w-32 text-black">Mobile:</span>
                <span>{viewDriver.countrycode ? viewDriver.countrycode : ""} {viewDriver.mobileno || '—'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold w-32 text-black">Assigned Cab:</span>
                <span>{viewDriver.AssignedCab?.vehicleId || 'Not Assigned'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold w-32 text-black">Gender:</span>
                <span>{viewDriver.gender || '—'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold w-32 text-black">Status:</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${statusColors(viewDriver.status)}`}>
                  {viewDriver.status || '—'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold w-32 text-black">Joining Date:</span>
                <span>{viewDriver.joiningdate ? new Date(viewDriver.joiningdate).toLocaleDateString() : '—'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold w-32 text-black">Updated At:</span>
                <span>{viewDriver.updatedAt ? new Date(viewDriver.updatedAt).toLocaleDateString() : '—'}</span>
              </div>
              <div className="flex items-start gap-2 md:col-span-2">
                <span className="font-semibold w-32 text-black">Address:</span>
                <div className="text-black max-h-24 overflow-y-auto break-words" style={{ whiteSpace: 'pre-wrap' }}>{viewDriver.address || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleDeleteCancel}></div>
          <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">Delete Driver</h2>
              <button onClick={handleDeleteCancel} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 mb-4 text-center">
              Are you sure you want to delete
              <span className="font-semibold mx-1">
                {driverToDelete?.name || "this driver"}
              </span>
              ?
            </p>
            <p className="text-sm text-gray-500 mb-6 text-center">
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleDeleteCancel}
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
    </div>
  );
};

export default DriverDetails;