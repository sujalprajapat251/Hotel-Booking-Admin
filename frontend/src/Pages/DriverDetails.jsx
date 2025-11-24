import React, { useEffect, useState } from "react";
import { FiPlusCircle, FiEdit } from "react-icons/fi";
import { IoEyeSharp } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";
import { Search, Filter, Download, RefreshCw, Star, MapPin, Phone } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAllDrivers, createDriver, updateDriver, deleteDriver } from "../Redux/Slice/driverSlice";
import { getAllCabs } from "../Redux/Slice/cab.slice";

const statusColors = {
  Available: "bg-green-50 text-green-600 border-green-200",
  // Unvailable: "bg-blue-50 text-blue-600 border-blue-200",
  Unavailable: "bg-yellow-50 text-yellow-600 border-yellow-200",
};

const DriverDetails = () => {
  const dispatch = useDispatch();
  const { drivers, loading, error } = useSelector((state) => state.driver);
  const { cabs } = useSelector((state) => state.cab);

  // console.log(drivers);
  

  useEffect(() => {
    dispatch(getAllDrivers());
    dispatch(getAllCabs());
  }, [dispatch]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverModalMode, setDriverModalMode] = useState("add"); // "add" or "edit"
  const [driverLoading, setDriverLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  
  const defaultDriverFields = {
    _id: null,
    name: "",
    email: "",
    password: "",
    mobileno: "",
    address: "",
    gender: "",
    joiningdate: "",
    AssignedCab: "",
    status: "Available",
    image: null,
    existingImage: null,
  };

  const [driverForm, setDriverForm] = useState(defaultDriverFields);

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.mobileno?.includes(searchTerm) ||
      (d.AssignedCab?.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "All" ? true : d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isDriverModalOpen || isDeleteModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isDriverModalOpen, isDeleteModalOpen]);

  // Unified Driver Modal Handlers
  const handleOpenAddModal = () => {
    setDriverForm(defaultDriverFields);
    setDriverModalMode("add");
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
      address: driver.address || "",
      gender: driver.gender || "",
      joiningdate: joiningDate,
      AssignedCab: driver.AssignedCab?._id || "",
      status: driver.status || "Available",
      image: null,
      existingImage: driver.image || null,
    });
    setDriverModalMode("edit");
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

  return (
    <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 min-h-screen">
      <section className="py-5">
        <h1 className="text-2xl font-semibold text-black">All Drivers</h1>
      </section>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col gap-3 md600:flex-row md600:items-center md600:justify-between p-4 border-b border-gray-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <p className="text-[16px] font-semibold text-gray-800">Driver Details</p>
            <div className="relative max-w-md w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search driver, ID, phone, vehicle..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982]"
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-1 justify-end">
            <button
              className="p-2 text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded-lg transition-colors"
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
                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {["All", "Available","Unavailable"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        statusFilter === status
                          ? "text-[#6A4DFF] font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
            <button
              className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              title="Download"
            >
              <Download size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F7DF9C]/40 text-gray-600 uppercase text-xs">
              <tr>
                {[
                  "No",
                  "Photo",
                  "Name",
                  "Phone",
                  "Assigned Cab",
                  "Status",
                  "Emergency Contact",
                  "Address",
                  "Action",
                ].map((header) => (
                  <th key={header} className="px-4 py-3 whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver, idx) => (
                <tr
                  key={driver._id || idx}
                  className="border-b border-gray-100 text-gray-700 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3">
                    {driver.image ? (
                      <img
                        src={`http://localhost:5000/${driver.image.replace(/\\/g, '/')}`}
                        alt={driver.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#E3C78A]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-[#E3C78A] flex items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {driver.name}
                  </td>
                  <td className="px-4 py-3 text-green-600">
                    <span className="inline-flex items-center gap-1">
                      <Phone size={14} className="inline-block" />
                      {driver.mobileno}
                    </span>
                  </td>
                  <td className="px-4 py-3">{driver.AssignedCab?.vehicleId || "Not Assigned"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[driver.status]}`}
                    >
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">Hotel Number</td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} className="text-orange-600" />
                      {driver.address}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-lg">
                      <button 
                        className="text-[#F59E0B] hover:text-[#D97706]" 
                        title="Edit"
                        onClick={() => handleOpenEditModal(driver)}
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="text-[#EF4444] hover:text-[#DC2626]" 
                        title="Delete"
                        onClick={() => handleDeleteClick(driver)}
                      >
                        <RiDeleteBinLine />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDrivers.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center text-gray-500 py-6 text-sm"
                  >
                    No drivers match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between p-4 border-t border-gray-200 text-sm text-gray-600">
          <div>Showing {filteredDrivers.length} drivers</div>
          <div className="flex items-center gap-2">
            <span>Items per page</span>
            <select className="border border-gray-300 rounded-lg px-2 py-1 focus:ring-[#B79982] focus:border-[#B79982]">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Unified Add/Edit Driver Modal */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={handleDriverModalCancel}></div>
          <div className="relative w-full max-w-2xl rounded-md bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">
                {driverModalMode === "add" ? "Add Driver" : "Edit Driver"}
              </h2>
              <button onClick={handleDriverModalCancel} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleDriverSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={driverForm.name}
                    onChange={handleDriverInputChange}
                    placeholder="Driver Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={driverForm.email}
                    onChange={handleDriverInputChange}
                    placeholder="driver@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {driverModalMode === "add" ? "*" : ""}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={driverForm.password}
                    onChange={handleDriverInputChange}
                    placeholder={driverModalMode === "add" ? "Password" : "Leave blank to keep current password"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982]"
                    required={driverModalMode === "add"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobileno"
                    value={driverForm.mobileno}
                    onChange={handleDriverInputChange}
                    placeholder="1234567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    name="gender"
                    value={driverForm.gender}
                    onChange={handleDriverInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982]"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date *</label>
                  <input
                    type="date"
                    name="joiningdate"
                    value={driverForm.joiningdate}
                    onChange={handleDriverInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Cab</label>
                  <select
                    name="AssignedCab"
                    value={driverForm.AssignedCab}
                    onChange={handleDriverInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982]"
                  >
                    <option value="">Select Cab (Optional)</option>
                    {cabs && cabs.map((cab) => (
                      <option key={cab._id} value={cab._id}>
                        {cab.vehicleId} - {cab.modelName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    name="status"
                    value={driverForm.status}
                    onChange={handleDriverInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982]"
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea
                  name="address"
                  value={driverForm.address}
                  onChange={handleDriverInputChange}
                  placeholder="Driver Address"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                {driverModalMode === "edit" && driverForm.existingImage && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Current Image:</p>
                    <img
                      src={`http://localhost:5000/${driverForm.existingImage.replace(/\\/g, '/')}`}
                      alt="Current"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  name="image"
                  onChange={handleDriverInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982]"
                />
                {driverModalMode === "edit" && (
                  <p className="text-xs text-gray-500 mt-1">Leave blank to keep current image</p>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleDriverModalCancel}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={driverLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] text-gray-900 rounded-lg hover:from-[#E3C78A] hover:to-[#F7DF9C] transition-colors font-medium"
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={handleDeleteCancel}></div>
          <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl mx-5">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">Delete Driver</h2>
              <button onClick={handleDeleteCancel} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 mb-8 text-center">
              Are you sure you want to delete
              <span className="font-semibold mx-1">
                {driverToDelete?.name || "this driver"}
              </span>
              ?
            </p>
            <p className="text-sm text-gray-500 mb-8 text-center">
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-6 py-2 bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white rounded-lg hover:from-[#DC2626] hover:to-[#EF4444] transition-colors font-medium"
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