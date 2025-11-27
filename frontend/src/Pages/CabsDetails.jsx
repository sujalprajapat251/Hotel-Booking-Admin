import React, { useEffect, useMemo, useState } from "react";
import { FiPlusCircle, FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { Search, Filter, Download, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCabs, updateCab, deleteCab, createCab } from "../Redux/Slice/cab.slice";
import { IoMdClose } from "react-icons/io";


const statusColors = {
  Available: "bg-green-50 text-green-600 border-green-200",
  "On Trip": "bg-blue-50 text-blue-600 border-blue-200",
  Maintenance: "bg-yellow-50 text-yellow-600 border-yellow-200",
};

const CabsDetails = () => {

  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const vehicleInventory = useSelector((state) => state.cab.cabs);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCab, setSelectedCab] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // new
  const [cabToDelete, setCabToDelete] = useState(null); // new
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addCabLoading, setAddCabLoading] = useState(false);
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
  
  const filteredVehicles = vehicleInventory.filter((vehicle) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      vehicle.modelName?.toLowerCase().includes(search) ||
      vehicle.registrationNumber?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" ? true : vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col gap-3 md600:flex-row md600:items-center md600:justify-between p-4 border-b border-gray-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <p className="text-[16px] font-semibold text-gray-800">
              Cab Details
            </p>

            <div className="relative max-w-md w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vehicle, type or number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982]"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 justify-end">
            <button
              className="p-2 text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded-lg transition-colors"
              title="Add Vehicle"
              onClick={() => setIsAddModalOpen(true)}
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
                  {["All", "Available", "On Trip", "Maintenance"].map(
                    (status) => (
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
            <thead className="bg-[#F7DF9C]/40 text-gray-600 uppercase text-xs">
              <tr>
                {[
                  "No",
                  "Image",
                  "Vehicle ID",
                  "Model Name",
                  "Registration No.",
                  "Seats",
                  "Status",
                  "Fuel Type",
                  "Driver Assigned",
                  "Per km Charge",
                  // "Base Fare",
                  // "Documents",
                  "Description",
                  "Action",
                ].map((header) => (
                  <th key={header} className="px-4 py-3 whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle, index) => (
                <tr
                  key={vehicle._id || vehicle.vehicleId}
                  className="border-b border-gray-100 text-gray-700 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">
                    {vehicle.cabImage && (
                      <img
                        src={vehicle.cabImage}
                        alt={vehicle.modelName}
                        className="h-10 w-16 object-cover rounded"
                        style={{ minWidth: 40, minHeight: 25 }}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {vehicle.vehicleId}
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {vehicle.modelName}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-600">
                    {vehicle.registrationNumber}
                  </td>
                  <td className="px-4 py-3">{vehicle.seatingCapacity}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[vehicle.status]}`}
                    >
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{vehicle.fuelType}</td>
                  <td className="px-4 py-3">{vehicle.driverAssigned ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-gray-900 font-semibold">
                    ₹{vehicle.perKmCharge}/km
                  </td>
                  {/* <td className="px-4 py-3 text-gray-900 font-semibold">
                    ₹{vehicle.baseFare}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vehicle.documents}
                  </td> */}
                  <td className="px-4 py-3 text-gray-600">
                    {vehicle.description}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-lg">
                      <button
                        className="text-[#F59E0B] hover:text-[#D97706]"
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
              {filteredVehicles.length === 0 && (
                <tr>
                  <td
                    colSpan={15}
                    className="text-center text-gray-500 py-6 text-sm"
                  >
                    No vehicles match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between p-4 border-t border-gray-200 text-sm text-gray-600">
          <div>Showing {filteredVehicles.length} vehicles</div>
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
              <button onClick={handleDeleteCancel} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 mb-8 text-center">
              Are you sure you want to delete
              <span className="font-semibold mx-1">
                {cabToDelete?.modelName || cabToDelete?.registrationNumber || "this cab"}
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
          <div className="absolute inset-0 bg-black/40" onClick={handleAddCabCancel}></div>
          <div className="relative w-full max-w-lg rounded-md bg-white p-6 shadow-xl mx-5">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">Add Cab</h2>
              <button onClick={handleAddCabCancel} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
  const [imagePreview, setImagePreview] = useState(cab.cabImage ? `http://localhost:5000/${cab.cabImage.replace(/\\/g, '/')}` : '');
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
      setImagePreview(cab.cabImage ? `http://localhost:5000/${cab.cabImage.replace(/\\/g, '/')}` : '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = { ...form };
    if (imageFile) data.cabImage = imageFile;

    dispatch(updateCab({ ...data, _id: cab._id }))
      .unwrap()
      .then(onClose)
      .catch(console.error);
  };
console.log("form --->", form);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-lg relative">
        <button
          type="button"
          className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          <IoMdClose />
        </button>
        <h2 className="text-lg font-semibold mb-4 text-center">Edit Cab</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block mb-1 font-medium">Current Image</label>
            <div className="mb-2">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Cab Preview"
                  className="h-20 w-32 object-cover rounded border"
                  style={{ minHeight: 50, minWidth: 80 }}
                />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full border p-1 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Model Name</label>
            <input
              className="border p-2 rounded w-full"
              name="modelName"
              value={form.modelName}
              onChange={handleChange}
              placeholder="Model Name"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Registration Number</label>
            <input
              className="border p-2 rounded w-full"
              name="registrationNumber"
              value={form.registrationNumber}
              onChange={handleChange}
              placeholder="Registration Number"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Vehicle ID</label>
            <input
              className="border p-2 rounded w-full"
              name="vehicleId"
              value={form.vehicleId}
              onChange={handleChange}
              placeholder="Vehicle ID"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Seating Capacity</label>
            <input
              className="border p-2 rounded w-full"
              name="seatingCapacity"
              value={form.seatingCapacity}
              onChange={handleChange}
              placeholder="Seating Capacity"
              type="number"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Fuel Type</label>
            <input
              className="border p-2 rounded w-full"
              name="fuelType"
              value={form.fuelType}
              onChange={handleChange}
              placeholder="Fuel Type"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Per Km Charge</label>
            <input
              className="border p-2 rounded w-full"
              name="perKmCharge"
              value={form.perKmCharge}
              onChange={handleChange}
              placeholder="Per Km Charge"
              type="number"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              className="border p-2 rounded w-full"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
            />
          </div>
          <div>
            <label className="flex gap-2 items-center font-medium mb-1">
              <input
                type="checkbox"
                name="driverAssigned"
                checked={form.driverAssigned}
                onChange={handleChange}
              />
              Driver Assigned
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="text-gray-600 underline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              type="submit"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
