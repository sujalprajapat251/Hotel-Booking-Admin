import React, { useEffect, useMemo, useState, useRef } from "react";
import { FiPlusCircle, FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { Search, Filter, Download, RefreshCw, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { IoEyeSharp } from 'react-icons/io5';
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from 'xlsx';
import { setAlert } from '../Redux/Slice/alert.slice';
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
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // new
  const [cabToDelete, setCabToDelete] = useState(null); // new
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addCabLoading, setAddCabLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const statusOptions = ["Available", "On Trip", "Maintenance"];
  const statusDropdownRef = useRef(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

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

  const handleRefresh = () => {
    dispatch(getAllCabs());
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleDownloadExcel = () => {
    try {
      if (filteredVehicles.length === 0) {
        dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
        return;
      }
      // Prepare rows matching the table columns
      const excelData = filteredVehicles.map((item, idx) => ({
        No: idx + 1,
        "Model Name": item.modelName || "",
        "Registration Number": item.registrationNumber || "",
        "Vehicle ID": item.vehicleId || "",
        "Seating Capacity": item.seatingCapacity || "",
        "Fuel Type": item.fuelType || "",
        "Per Km Charge": item.perKmCharge != null ? item.perKmCharge : "",
        Description: item.description || "",
        Status: item.status || "",
        Image: item.cabImage || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "CabList");

      // simple column width heuristic
      const headers = Object.keys(excelData[0] || {});
      const wscols = headers.map(() => ({ wch: 20 }));
      worksheet["!cols"] = wscols;

      const date = new Date();
      const fileName = `Cab_List_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      dispatch(setAlert({ text: "Export completed..!", color: "success" }));
    } catch (error) {
      console.error("Export failed", error);
      dispatch(setAlert({ text: "Export failed..!", color: "error" }));
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available':
          return 'border border-green-500 text-green-600 bg-green-50';
      case 'On Trip':
          return 'border border-yellow-500 text-yellow-600 bg-yellow-50';
      default:  
          return 'border border-red-500 text-red-600 bg-red-50';
    }
  };

  return (  
    <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
      <section className="py-5">
        <h1 className="text-2xl font-semibold text-black">Cab Inventory</h1>
      </section>

      <div className="bg-white rounded-lg shadow-md">
        <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex gap-2 md:gap-5 sm:justify-between">
            <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">Cab Items</p>
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
              title="Refresh" onClick={handleRefresh}
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
                    className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]"
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
                  className="border-b border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200 transition-colors"
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
                        <p className="text-sm font-medium text-black">
                          {vehicle.modelName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {vehicle.registrationNumber}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-black">
                    {vehicle.fuelType || "—"}
                  </td>
                  <td className="px-5 py-4 text-black">
                    ₹{vehicle.perKmCharge || 0}
                  </td>
                  <td
                    className="px-5 py-4 text-black"
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
                      <span className={`inline-flex items-center justify-center w-24 h-8 rounded-xl text-xs font-semibold ${getStatusStyle(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="mv_table_action flex">
                      <div
                        title="View"
                        onClick={() => {
                          setSelectedCab(vehicle);
                          setViewModalOpen(true);
                        }}
                        className="mr-2 cursor-pointer"
                      >
                        <IoEyeSharp className='text-[18px] text-quaternary' />
                      </div>
                      <div  
                        className="p-1 text-[#6777ef] hover:text-[#4255d4] rounded-lg transition-colors"
                        title="Edit"
                        onClick={() => {
                          setSelectedCab(vehicle);
                          setEditModalOpen(true);
                        }}
                      >
                        <FiEdit className="text-[18px]" />
                      </div>
                      <div
                        title="Delete"
                        onClick={() => handleDeleteCab(vehicle)}
                      >
                        <RiDeleteBinLine className="text-[#ff5200] text-[18px]"/>
                      </div>
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
          <div className="flex items-center gap-1 sm:gap-3 md600:gap-2 md:gap-3">
            <span className="text-sm text-gray-600">
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
      {viewModalOpen && selectedCab && (
        <ViewCabModal cab={selectedCab} onClose={() => setViewModalOpen(false)} />
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
          <div className="relative w-full md:max-w-xl max-w-[90%] rounded-[4px] bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
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
            <form onSubmit={handleAddCabSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-sm font-medium text-black mb-1"
                  >
                    Model Name
                  </label>
                  <input
                    type="text"
                    name="modelName"
                    value={newCab.modelName}
                    onChange={handleAddInputChange}
                    placeholder="Model Name"
                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                    required
                  />
                </div>
                <div>
                  <label
                    className="text-sm font-medium text-black mb-1"
                  >
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={newCab.registrationNumber}
                    onChange={handleAddInputChange}
                    placeholder="Registration Number"
                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                    required
                  />
                </div>
              <div>
                <label
                  className="text-sm font-medium text-black mb-1"
                >
                  Vehicle ID
                </label>
                <input
                  type="text"
                  name="vehicleId"
                  value={newCab.vehicleId}
                  onChange={handleAddInputChange}
                  placeholder="Vehicle ID"
                  className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                  required
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium text-black mb-1"
                >
                  Seating Capacity
                </label>
                <input
                  type="number"
                  name="seatingCapacity"
                  value={newCab.seatingCapacity}
                  onChange={handleAddInputChange}
                  placeholder="Seating Capacity"
                  className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-black mb-1">
                  Status
                </label>
                <div className="relative" ref={statusDropdownRef}>
                  <button
                    name="status"
                    type="button"
                    onClick={() => setShowStatusDropdown((prev) => !prev)}
                    value={newCab.status}
                    onChange={handleAddInputChange}
                    className="w-full rounded-[4px] border px-2 py-2 focus:outline-none bg-[#1414140F] flex items-center justify-between"
                    required
                  >
                    <span className="text-sm truncate">{newCab.status}</span>
                    <ChevronDown size={18} className={`text-gray-600 transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showStatusDropdown && (
                    <ul className="absolute z-50 w-full rounded-md bg-white border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
                      {statusOptions.map((opt) => (
                        <li
                          key={opt}
                          onClick={() => {
                            handleAddInputChange({ target: { name: 'status', value: opt } });
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
              <div>
                <label className="text-sm font-medium text-black mb-1">
                  Fuel Type
                </label>
                <input
                  type="text"
                  name="fuelType"
                  value={newCab.fuelType}
                  onChange={handleAddInputChange}
                  placeholder="Fuel Type"
                  className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="driverAssigned"
                  checked={newCab.driverAssigned}
                  onChange={handleAddInputChange}
                />
                Driver Assigned
              </label>
            </div>
            <div>
              <label className="text-sm font-medium text-black mb-1">
                Per Km Charge
              </label>
              <input
                type="number"
                name="perKmCharge"
                value={newCab.perKmCharge}
                onChange={handleAddInputChange}
                placeholder="Per km Charge"
                className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-black mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={newCab.description}
                onChange={handleAddInputChange}
                placeholder="Description"
                className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-black mb-1">
                Cab Image
              </label>
              <label className="flex w-full cursor-pointer items-center justify-between rounded-[4px] border border-gray-200 px-2 py-2 text-gray-500 bg-[#1414140F]">
                <span className="truncate">
                  {newCab.cabImage ? newCab.cabImage.name : 'Choose file'}
                </span>
                <span className="rounded-[4px] bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] px-4 py-1 text-black text-sm">Browse</span>
                <input
                  type="file"
                  accept="image/*"
                  name="cabImage"
                  className="hidden"
                  onChange={handleAddInputChange}
                />
              </label>
            </div>
              <div className="flex items-center justify-center gap-3 pt-4 border-t">
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
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      ></div>
      <div className="flex min-h-full items-center justify-center p-2 md:p-4 text-center sm:p-0">
        <div
          className="relative transform overflow-hidden rounded-md bg-white text-left shadow-xl transition-all sm:my-8 sm:w-[90%] sm:max-w-2xl border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="px-4 py-4 sm:p-6">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-xl font-bold text-black">
                Edit Cab
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center p-1 rounded-lg transition-colors"
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
                <label className="text-sm font-medium text-black mb-1">
                  Cab Image 
                </label>
                <div className="mb-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Cab Preview"
                      className="h-24 w-40 object-cover rounded-lg border-2"
                      style={{
                        minHeight: 60,
                        minWidth: 100,
                      }}
                    />
                  )}
                </div>
                <label className="flex w-full cursor-pointer items-center justify-between rounded-[4px] border border-gray-200 px-2 py-2 text-gray-500 bg-[#1414140F]">
                  <span className="truncate">
                    {imageFile
                      ? imageFile.name
                      : (cab && cab.cabImage ? cab.cabImage.split('/').pop() : 'Choose file')}
                  </span>
                  <span className="rounded-[4px] bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] px-4 py-1 text-black text-sm">Browse</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="text-sm font-medium text-black mb-1"
                  >
                    Model Name 
                  </label>
                  <input
                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                    name="modelName"
                    value={form.modelName}
                    onChange={handleChange}
                    placeholder="Model Name"
                    required
                  />
                </div>

                <div>
                  <label
                    className="text-sm font-medium text-black mb-1"
                  >
                    Registration Number 
                  </label>
                  <input
                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                    name="registrationNumber"
                    value={form.registrationNumber}
                    onChange={handleChange}
                    placeholder="Registration Number"
                    required
                  />
                </div>

                <div>
                  <label
                    className="text-sm font-medium text-black mb-1"
                  >
                    Vehicle ID 
                  </label>
                  <input
                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                    name="vehicleId"
                    value={form.vehicleId}
                    onChange={handleChange}
                    placeholder="Vehicle ID"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-black mb-1">
                    Seating Capacity 
                  </label>
                  <input
                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
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
                    className="text-sm font-medium text-black mb-1"
                  >
                    Fuel Type 
                  </label>
                  <input
                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                    name="fuelType"
                    value={form.fuelType}
                    onChange={handleChange}
                    placeholder="Fuel Type"
                    required
                  />
                </div>

                <div>
                  <label
                    className="text-sm font-medium text-black mb-1"
                  >
                    Per Km Charge 
                  </label>
                  <input
                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
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
                  className="text-sm font-medium text-black mb-1"
                >
                  Description
                </label>
                <textarea
                  className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description"
                  rows="3"
                />
              </div>

              {/* Driver Assigned Checkbox */}
              <div
                className="flex items-center gap-2 rounded-lg transition-colors"
              >
                <input
                  type="checkbox"
                  name="driverAssigned"
                  checked={form.driverAssigned}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#876B56] bg-gray-100 border-gray-300 rounded focus:ring-[#B79982] focus:ring-2"
                />
                <label
                  className="text-sm font-medium text-black"
                >
                  Driver Assigned
                </label>
              </div>

              {/* Form Actions */}
              <div
                className="flex items-center justify-center gap-2 pt-4 border-t"
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
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

function ViewCabModal({ cab, onClose }) {
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, []);

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available':
          return 'border border-green-500 text-green-600 bg-green-50';
      case 'On Trip':
            return 'border border-yellow-500 text-yellow-600 bg-yellow-50';
      default:
          return 'border border-red-500 text-red-600 bg-red-50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl rounded-md bg-white p-6 shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-semibold text-black">Cab Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-100 mb-3" style={{width: 112, height: 112}}>
            {cab.cabImage ? (
              <img
                src={cab.cabImage}
                alt={cab.modelName}
                className="block"
                style={{width: '100%', height: '100%', objectFit: 'cover', maxWidth: 112, maxHeight: 112}}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">No Image</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[15px] text-black">
          <div className="flex items-start">
            <span className="w-36 font-semibold text-black">Model Name:</span>
            <span className="truncate">{cab.modelName || '—'}</span>
          </div>
          <div className="flex items-start">
            <span className="w-36 font-semibold text-black">Registration No.:</span>
            <span>{cab.registrationNumber || '—'}</span>
          </div>

          <div className="flex items-start">
            <span className="w-36 font-semibold text-black">Vehicle ID:</span>
            <span>{cab.vehicleId || '—'}</span>
          </div>
          <div className="flex items-start">
            <span className="w-36 font-semibold text-black">Seating Capacity:</span>
            <span>{cab.seatingCapacity || '—'}</span>
          </div>

          <div className="flex items-start">
            <span className="w-36 font-semibold text-black">Fuel Type:</span>
            <span>{cab.fuelType || '—'}</span>
          </div>
          <div className="flex items-start">
            <span className="w-36 font-semibold text-black">Per Km Charge:</span>
            <span>₹{cab.perKmCharge != null ? cab.perKmCharge : '—'}</span>
          </div>

          <div className="flex items-start">
            <span className="w-36 font-semibold text-black">Driver Assigned:</span>
            <span>{cab.driverAssigned ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-start">
            <span className="w-36 font-semibold text-black">Status:</span>
            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold ${getStatusStyle(cab.status)}`}>
              {cab.status || '—'}
            </span>
          </div>

          <div className="flex items-start">
            <span className="w-36 font-semibold text-black">Created At:</span>
            <span>{formatDate(cab.createdAt)}</span>
          </div>
          <div className="flex items-start">
            <span className="w-36 font-semibold text-black">Updated At:</span>
            <span>{formatDate(cab.updatedAt)}</span>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-start">
              <span className="w-36 font-semibold text-black">Description:</span>
              <div className="text-black max-h-24 overflow-y-auto break-words" style={{whiteSpace: 'pre-wrap'}}>{cab.description || '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}