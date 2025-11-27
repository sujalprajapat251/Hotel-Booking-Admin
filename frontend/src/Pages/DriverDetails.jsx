import React, { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAllDrivers, createDriver, updateDriver, deleteDriver } from "../Redux/Slice/driverSlice";
import { getAllCabs } from "../Redux/Slice/cab.slice";

const statusColors = {
  Available: "bg-green-50 text-green-600 border-green-200",
  Leave: "bg-blue-50 text-blue-600 border-blue-200",
  Unavailable: "bg-yellow-50 text-yellow-600 border-yellow-200",
};

const DriverDetails = () => {
  const dispatch = useDispatch();
  const { drivers, loading, error } = useSelector((state) => state.driver);
  const { cabs } = useSelector((state) => state.cab);

  console.log(drivers);
  

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
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

  const filteredDrivers = useMemo(() => {
    return (drivers || []).filter((d) => {
      const matchesSearch =
        d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="flex flex-col gap-4 md600:flex-row md600:items-center md600:justify-between p-5 border-b border-gray-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <p className="text-[18px] font-semibold text-gray-900 whitespace-nowrap">
              Driver Items
            </p>
            <div className="relative max-w-md w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search driver, phone or cab..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982]"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              className="p-2 text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded-lg transition-colors"
              title="Add Driver"
              onClick={handleOpenAddModal}
            >
              <FiPlusCircle size={20} />
            </button>
            <div className="relative">
              <button
                className="p-2 text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/30 rounded-lg transition-colors"
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
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F7DF9C]/30 ${
                          statusFilter === status
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
            <thead className="bg-[#F7DF9C] text-[#4B3A2F] uppercase text-xs tracking-wide">
              <tr>
                {["No", "Driver", "Contact", "Assigned Cab", "Status", "Address" ,"Action"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-5 py-4 font-semibold whitespace-nowrap"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedDrivers.map((driver, idx) => (
                <tr
                  key={driver._id || idx}
                  className="border-b border-gray-100 text-gray-700 hover:bg-gray-50"
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
                        <p className="font-semibold text-gray-900">
                          {driver.name || "—"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {driver.email || "no-email"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    <div className="flex flex-col text-sm">
                      <span className="inline-flex items-center gap-1 text-gray-800 font-medium">
                        <Phone size={14} />
                        {driver.mobileno || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {driver.AssignedCab?.vehicleId || "Not Assigned"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[driver.status] || "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                    >
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    <div className="flex flex-col text-sm">
                      <span className="inline-flex items-center gap-1 text-gray-800 font-medium">
                        <MapPin size={14} className="text-orange-500" />
                        {driver.address || "Address not set"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 text-lg">
                      <button
                        className="text-[#755647] hover:text-[#4B3A2F]"
                        title="View"
                        onClick={() => handleOpenEditModal(driver)}
                      >
                        <IoEyeSharp />
                      </button>
                      <button
                        className="text-[#6A4DFF] hover:text-[#4C2CC7]"
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
              {paginatedDrivers.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center" colSpan={6}>
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <svg
                        className="w-16 h-16 mb-4 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-lg font-medium">No drivers found</p>
                      <p className="text-sm mt-1">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-5 border-t border-gray-100 text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-medium">Items per page</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#B79982] focus:border-[#B79982]"
            >
              {[6, 10, 20, 50].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
                    <option value="Leave">Leave</option>
                    <option value="onTrip">onTrip</option>
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
                      src={driverForm.existingImage}
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