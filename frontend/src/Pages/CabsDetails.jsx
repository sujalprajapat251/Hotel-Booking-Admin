import React, { useEffect, useMemo, useState } from "react";
import { FiPlusCircle, FiEdit, FiEye } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { Search, Filter, Download, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllCabs,
  updateCab,
  deleteCab,
  createCab,
} from "../Redux/Slice/cab.slice";

const CabsDetails = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const vehicleInventory = useSelector((state) => state.cab.cabs) || [];
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCab, setSelectedCab] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // new
  const [cabToDelete, setCabToDelete] = useState(null); // new
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addCabLoading, setAddCabLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const defaultCabFields = {
    modelName: "",
    registrationNumber: "",
    vehicleId: "",
    seatingCapacity: "",
    status: "Available",
    fuelType: "",
    driverAssigned: false,
    perKmCharge: "",
    description: "",
    cabImage: null,
  };

  const [newCab, setNewCab] = useState(defaultCabFields);

  useEffect(() => {
    dispatch(getAllCabs());
  }, [dispatch]);

  const filteredVehicles = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return vehicleInventory.filter((vehicle) => {
      const matchesSearch =
        vehicle.modelName?.toLowerCase().includes(search) ||
        vehicle.registrationNumber?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" ? true : vehicle.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vehicleInventory, searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVehicles.length / itemsPerPage)
  );
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage, itemsPerPage]);

  const startItem =
    filteredVehicles.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem =
    filteredVehicles.length === 0
      ? 0
      : Math.min(currentPage * itemsPerPage, filteredVehicles.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleDeleteCab = (cab) => {
    setCabToDelete(cab);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (cabToDelete && cabToDelete._id) {
      dispatch(deleteCab(cabToDelete._id));
    }
    setIsDeleteModalOpen(false);
    setCabToDelete(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setCabToDelete(null);
  };

  const handleAddInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setNewCab((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : files ? files[0] : value,
    }));
  };

  const handleAddCabSubmit = async (e) => {
    e.preventDefault();
    setAddCabLoading(true);
    try {
      await dispatch(createCab(newCab));
      setIsAddModalOpen(false);
      setNewCab(defaultCabFields);
    } finally {
      setAddCabLoading(false);
    }
  };

  const handleAddCabCancel = () => {
    setIsAddModalOpen(false);
    setNewCab(defaultCabFields);
  };

  return (
    <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 min-h-screen">
      <section className="py-5">
        <h1 className="text-2xl font-semibold text-black">Cab Inventory</h1>
      </section>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="flex flex-col gap-4 md600:flex-row md600:items-center md600:justify-between p-5 border-b border-gray-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <p className="text-[18px] font-semibold text-gray-900 whitespace-nowrap">Cab Items</p>
            <div className="relative max-w-md w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vehicle, type or number..."
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
              title="Add Vehicle"
              onClick={() => setIsAddModalOpen(true)}
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
                  {["All", "Available", "On Trip", "Maintenance"].map(
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
                {[
                  "No",
                  "Cab",
                  "Fuel Type",
                  "Per km Charge",
                  "Description",
                  "Status",
                  "Action",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-5 py-4 font-semibold whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedVehicles.map((vehicle, index) => (
                <tr
                  key={vehicle._id || vehicle.vehicleId}
                  className="border-b border-gray-100 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-4 text-gray-600 font-semibold">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full border border-gray-200 overflow-hidden bg-gray-100">
                        {vehicle.cabImage ? (
                          <img
                            src={vehicle.cabImage}
                            alt={vehicle.modelName}
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
                          {vehicle.modelName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {vehicle.registrationNumber}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {vehicle.fuelType || "—"}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900">
                    ₹{vehicle.perKmCharge || 0}
                  </td>
                  <td
                    className="px-5 py-4 text-gray-500 text-sm"
                    style={{ maxWidth: 280 }}
                  >
                    <span
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {vehicle.description || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {vehicle.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 text-lg">
                      <button
                        className="text-[#755647] hover:text-[#4B3A2F]"
                        title="View"
                        onClick={() => {
                          setSelectedCab(vehicle);
                          setEditModalOpen(true);
                        }}
                      >
                        <FiEye />
                      </button>
                      <button
                        className="text-[#6A4DFF] hover:text-[#4C2CC7]"
                        title="Edit"
                        onClick={() => {
                          setSelectedCab(vehicle);
                          setEditModalOpen(true);
                        }}
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="text-[#EF4444] hover:text-[#DC2626]"
                        title="Delete"
                        onClick={() => handleDeleteCab(vehicle)}
                      >
                        <RiDeleteBinLine />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedVehicles.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center" colSpan={7}>
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
                      <p className="text-lg font-medium">No vehicles found</p>
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
              {startItem} - {endItem} of {filteredVehicles.length}
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
                disabled={currentPage === totalPages}
                className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {editModalOpen && selectedCab && (
        <EditCabModal
          cab={selectedCab}
          onClose={() => setEditModalOpen(false)}
        />
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl mx-5">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">Delete Cab</h2>
              <button
                onClick={handleDeleteCancel}
                className="text-gray-500 hover:text-gray-800"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 mb-8 text-center">
              Are you sure you want to delete
              <span className="font-semibold mx-1">
                {cabToDelete?.modelName ||
                  cabToDelete?.registrationNumber ||
                  "this cab"}
              </span>
              ?
            </p>
            <div className="flex items-center justify-center gap-3">
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
      {/* Add Cab Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleAddCabCancel}
          ></div>
          <div className="relative w-full max-w-lg rounded-md bg-white p-6 shadow-xl mx-5">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">Add Cab</h2>
              <button
                onClick={handleAddCabCancel}
                className="text-gray-500 hover:text-gray-800"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddCabSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                name="modelName"
                value={newCab.modelName}
                onChange={handleAddInputChange}
                placeholder="Model Name"
                className="px-4 py-2 border rounded"
                required
              />
              <input
                type="text"
                name="registrationNumber"
                value={newCab.registrationNumber}
                onChange={handleAddInputChange}
                placeholder="Registration Number"
                className="px-4 py-2 border rounded"
                required
              />
              <input
                type="text"
                name="vehicleId"
                value={newCab.vehicleId}
                onChange={handleAddInputChange}
                placeholder="Vehicle ID"
                className="px-4 py-2 border rounded"
                required
              />
              <input
                type="number"
                name="seatingCapacity"
                value={newCab.seatingCapacity}
                onChange={handleAddInputChange}
                placeholder="Seating Capacity"
                className="px-4 py-2 border rounded"
                required
              />
              <select
                name="status"
                value={newCab.status}
                onChange={handleAddInputChange}
                className="px-4 py-2 border rounded"
                required
              >
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              <input
                type="text"
                name="fuelType"
                value={newCab.fuelType}
                onChange={handleAddInputChange}
                placeholder="Fuel Type"
                className="px-4 py-2 border rounded"
                required
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="driverAssigned"
                  checked={newCab.driverAssigned}
                  onChange={handleAddInputChange}
                />
                Driver Assigned
              </label>
              <input
                type="number"
                name="perKmCharge"
                value={newCab.perKmCharge}
                onChange={handleAddInputChange}
                placeholder="Per km Charge"
                className="px-4 py-2 border rounded"
                required
              />
              <textarea
                name="description"
                value={newCab.description}
                onChange={handleAddInputChange}
                placeholder="Description"
                className="px-4 py-2 border rounded"
              />
              <input
                type="file"
                accept="image/*"
                name="cabImage"
                onChange={handleAddInputChange}
                className="px-4 py-2 border rounded"
              />
              <div className="flex justify-end gap-3 mt-3">
                <button
                  type="button"
                  onClick={handleAddCabCancel}
                  className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]"
                  disabled={addCabLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
                  disabled={addCabLoading}
                >
                  {addCabLoading ? "Adding..." : "Add Cab"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CabsDetails;

function EditCabModal({ cab, onClose }) {
  const [form, setForm] = useState({
    ...cab,
    driverAssigned: !!cab.driverAssigned,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(cab.cabImage);
  const dispatch = useDispatch();
  // Prevent page scroll when modal is open
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(cab.cabImage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Remove cabImage from form data if we have a new file (to avoid sending old image path)
      const { cabImage: oldImage, ...formData } = form;
      const updateData = {
        ...formData,
        _id: cab._id,
      };

      // Only add new image file if one was selected
      if (imageFile) {
        updateData.cabImage = imageFile;
      }

      // Update the cab
      await dispatch(updateCab(updateData)).unwrap();

      // Refresh the cab list after successful update to get the latest data
      await dispatch(getAllCabs()).unwrap();

      // Close modal after successful update
      onClose();
    } catch (error) {
      console.error("Failed to update cab:", error);
    }
  };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 transition-opacity"
        style={{ backgroundColor: "#000000bf" }}
        onClick={onClose}
      ></div>
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className="relative transform overflow-hidden rounded-md bg-white text-left shadow-xl transition-all sm:my-8 sm:w-[90%] sm:max-w-2xl border-2"
          style={{
            borderColor: "#E3C78A",
            boxShadow:
              "0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div
            className="px-4 py-4 sm:p-6"
            style={{
              background:
                "linear-gradient(135deg, rgba(247, 223, 156, 0.08) 0%, rgba(227, 199, 138, 0.09) 100%)",
            }}
          >
            <div
              className="flex items-center justify-between border-b pb-3 mb-4"
              style={{ borderColor: "#E3C78A" }}
            >
              <h3 className="text-xl font-bold" style={{ color: "#755647" }}>
                Edit Cab
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center p-1 rounded-lg transition-colors"
                style={{ color: "#876B56" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(247,223,156,0.3)";
                  e.currentTarget.style.color = "#755647";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#876B56";
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
            >
              {/* Image Upload Section */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#755647" }}
                >
                  Cab Image
                </label>
                <div className="mb-3">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Cab Preview"
                      className="h-24 w-40 object-cover rounded-lg border-2"
                      style={{
                        minHeight: 60,
                        minWidth: 100,
                        borderColor: "#E3C78A",
                      }}
                    />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent text-sm"
                />
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#755647" }}
                  >
                    Model Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
                    name="modelName"
                    value={form.modelName}
                    onChange={handleChange}
                    placeholder="Model Name"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#755647" }}
                  >
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
                    name="registrationNumber"
                    value={form.registrationNumber}
                    onChange={handleChange}
                    placeholder="Registration Number"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#755647" }}
                  >
                    Vehicle ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
                    name="vehicleId"
                    value={form.vehicleId}
                    onChange={handleChange}
                    placeholder="Vehicle ID"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#755647" }}
                  >
                    Seating Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
                    name="seatingCapacity"
                    value={form.seatingCapacity}
                    onChange={handleChange}
                    placeholder="Seating Capacity"
                    type="number"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#755647" }}
                  >
                    Fuel Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
                    name="fuelType"
                    value={form.fuelType}
                    onChange={handleChange}
                    placeholder="Fuel Type"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "#755647" }}
                  >
                    Per Km Charge <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
                    name="perKmCharge"
                    value={form.perKmCharge}
                    onChange={handleChange}
                    placeholder="Per Km Charge"
                    type="number"
                    required
                  />
                </div>
              </div>

              {/* Description - Full Width */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#755647" }}
                >
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description"
                  rows="3"
                />
              </div>

              {/* Driver Assigned Checkbox */}
              <div
                className="flex items-center gap-2 p-2 rounded-lg transition-colors"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(247, 223, 156, 0.2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <input
                  type="checkbox"
                  name="driverAssigned"
                  checked={form.driverAssigned}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#876B56] bg-gray-100 border-gray-300 rounded focus:ring-[#B79982] focus:ring-2"
                />
                <label
                  className="text-sm font-semibold"
                  style={{ color: "#755647" }}
                >
                  Driver Assigned
                </label>
              </div>

              {/* Form Actions */}
              <div
                className="flex items-center justify-end gap-3 pt-4 border-t"
                style={{ borderColor: "#E3C78A" }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ color: "#755647" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg text-white transition-colors"
                  style={{ backgroundColor: "#876B56" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#755647")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#876B56")
                  }
                >
                  Update Cab
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
