import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiPlusCircle, FiEdit } from "react-icons/fi";
import { IoEyeSharp } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";
import { GoDotFill } from "react-icons/go";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import * as XLSX from 'xlsx';
import { setAlert } from '../Redux/Slice/alert.slice';
import { deleteCabBooking, getAllCabBookings, updateCabBooking } from "../Redux/Slice/cabBookingSlice";
import { getAllDrivers } from "../Redux/Slice/driverSlice";
import { getAllCabs } from "../Redux/Slice/cab.slice";

const statusColors = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Confirmed: "bg-blue-50 text-blue-600 border-blue-200",
  Assigned: "bg-indigo-50 text-indigo-600 border-indigo-200",
  InProgress: "bg-sky-50 text-sky-600 border-sky-200",
  Completed: "bg-green-50 text-green-600 border-green-200",
  Cancelled: "bg-red-50 text-red-600 border-red-200",
};

const payStatusColors = {
  Paid: "bg-green-50 text-green-600 border-green-200",
  Pending: "bg-yellow-50 text-yellow-600 border-yellow-200",
  Partial: "bg-blue-50 text-blue-600 border-blue-200",
  Refunded: "bg-purple-50 text-purple-600 border-purple-200",
};

const statusFilterOptions = ["All", "Pending", "Confirmed", "Assigned", "InProgress", "Completed", "Cancelled"];

const normalizeBooking = (raw) => ({
  id: raw._id,
  bookingReference: raw.booking?._id ?? "--",
  guestName: raw.booking?.guest?.fullName ?? "Walk-in Guest",
  roomNumber: raw.booking?.roomNumber ?? "--",
  pickupLocation: raw.pickUpLocation ?? "Airport",
  dropLocation: raw.dropLocation?.address ?? "Hotel",
  bookingDate: raw.bookingDate ?? null,
  pickupTime: raw.pickUpTime ?? null,
  driver: raw.assignedDriver?.name ?? "Unassigned",
  vehicle: raw.assignedCab?.modelName ?? "Unassigned",
  distance: raw.estimatedDistance ?? "--",
  fare: raw.estimatedFare ?? "--",
  paymentStatus: raw.paymentStatus ?? "Pending",
  paymentMethod: raw.paymentMethod ?? "N/A",
  notes: raw.notes ?? "—",
  status: raw.status ?? "Pending",
});

const CabBookingDetail = () => {
  const dispatch = useDispatch();
  const staticCabBookings = useSelector((state) => state.cabBooking.cabBookings);
  const { drivers } = useSelector((state) => state.driver);
  const { cabs } = useSelector((state) => state.cab);
  const [cabBookings, setCabBookings] = useState(staticCabBookings.map(normalizeBooking));
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBooking, setEditBooking] = useState(null);
  const [editBookingRaw, setEditBookingRaw] = useState(null); // Store raw booking data for IDs
  const [editForm, setEditForm] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBooking, setDeleteBooking] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showPickupLocationDropdown, setShowPickupLocationDropdown] = useState(false);
  const loading = useSelector((state) => state.cabBooking.loading);

  useEffect(() => {
    dispatch(getAllCabBookings());
    dispatch(getAllDrivers());
    dispatch(getAllCabs());
  }, [dispatch]);

  useEffect(() => {
    setCabBookings(staticCabBookings.map(normalizeBooking));
  }, [staticCabBookings]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleRefresh = () => {
    setCabBookings(staticCabBookings.map(normalizeBooking));
    setStatusFilter("All");
    setSearchTerm("");
    setDebouncedSearch("");
    setPage(1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleDeleteClick = (staffItem) => {
    setItemToDelete(staffItem);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete && itemToDelete.id) {
      try {
        await dispatch(deleteCabBooking(itemToDelete.id)).unwrap();
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    }
  };

  const filteredBookings = useMemo(() => {
    // flat normalized data, search can access all direct keys
    const normalized = cabBookings;
    const statusFiltered =
      statusFilter === "All"
        ? normalized
        : normalized.filter((booking) => booking.status === statusFilter);
    // Always trim the search term before using
    const searchValue = debouncedSearch.trim().toLowerCase();
    if (!searchValue) return statusFiltered;
    return statusFiltered.filter((row) => {
      const searchableValues = [
        row.bookingReference,
        row.guestName,
        row.roomNumber,
        row.pickupLocation,
        row.dropLocation,
        row.driver,
        row.vehicle,
        row.distance,
        row.fare,
        row.paymentStatus,
        row.paymentMethod,
        row.notes,
        row.status,
        row.bookingDate
          ? new Date(row.bookingDate).toLocaleDateString("en-GB")
          : "",
        row.pickupTime
          ? new Date(row.pickupTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
      ];
      return searchableValues
        .filter((value) => value !== undefined && value !== null)
        .some((value) =>
          value.toString().toLowerCase().includes(searchValue)
        );
    });
  }, [cabBookings, statusFilter, debouncedSearch]);

  const totalCount = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);
  const currentPage = Math.min(page, totalPages);
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredBookings.slice(start, start + limit);
  }, [filteredBookings, currentPage, limit]);
  const showingStart = paginatedBookings.length ? (currentPage - 1) * limit + 1 : 0;
  const showingEnd = (currentPage - 1) * limit + paginatedBookings.length;

  const handleDownloadExcel = () => {
    try {
      if (filteredBookings.length === 0) {
        dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
        return;
      }

      const excelData = filteredBookings.map((item, idx) => {
        const dateStr = item.bookingDate ? new Date(item.bookingDate).toLocaleDateString('en-GB') : "";
        const timeStr = item.pickupTime
          ? new Date(item.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : "";
        const fareVal = item.fare === "--" || item.fare == null ? "" : item.fare;

        return {
          No: idx + 1,
          'Guest Name': item.guestName || "",
          'Room/Guest ID': item.roomNumber || "",
          'Pickup Location': item.pickupLocation || "",
          'Drop Location': item.dropLocation || "",
          Date: dateStr,
          Time: timeStr,
          Driver: item.driver || "",
          Vehicle: item.vehicle || "",
          'Distance (KM)': item.distance != null ? item.distance : "",
          'Total Fare': fareVal,
          'Payment Status': item.paymentStatus || "",
          Method: item.paymentMethod || "",
          'Trip Status': item.status || "",
          Notes: item.notes || "",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "CabBookings");

      // set reasonable column widths per header
      const headers = Object.keys(excelData[0] || {});
      const wscols = headers.map((h) => {
        if (["Guest Name", "Pickup Location", "Drop Location", "Notes"].includes(h)) return { wch: 30 };
        if (["Room/Guest ID", "Driver", "Vehicle"].includes(h)) return { wch: 18 };
        if (["Total Fare", "Distance (KM)"].includes(h)) return { wch: 12 };
        return { wch: 14 };
      });
      worksheet["!cols"] = wscols;

      const date = new Date();
      const fileName = `Cab_Bookings_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      dispatch(setAlert({ text: "Export completed..!", color: "success" }));
    } catch (error) {
      console.error("Export failed", error);
      dispatch(setAlert({ text: "Export failed..!", color: "error" }));
    }
  };

  const openView = (booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  const closeView = () => {
    setSelectedBooking(null);
    setShowViewModal(false);
  };

  return (
    <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
      <section className="py-5">
        <h1 className="text-2xl font-semibold text-black">Cab Bookings</h1>
      </section>
      <div className="bg-white rounded-lg shadow-md">
        <div className="md600:flex items-center justify-between p-3 border-b border-gray-200 gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1">
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-1 justify-end mt-2 md:mt-0">
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
                  {statusFilterOptions.map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setPage(1);
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
              disabled={loading}
            >
              <RefreshCw size={20} />
            </button>
            <button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors" title="Download" onClick={handleDownloadExcel}>
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
                  "Guest Name",
                  "Room/Guest ID",
                  "Pickup Location",
                  "Drop Location",
                  "Date",
                  "Time",
                  "Driver",
                  "Vehicle",
                  "Distance (KM)",
                  "Total Fare",
                  "Trip Status",
                  "Notes",
                  "Action",
                ].map((header) => (
                  <th key={header} className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647] whitespace-nowrap">
                    {header}
                  </th>
                ))}
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
              ) : filteredBookings?.length > 0 ? (
                filteredBookings.map((booking, idx) => (
                  <tr key={booking.id} className="border-b border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200">
                    <td className="px-4 py-3 text-gray-800">{(page - 1) * limit + idx + 1}</td>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{booking.guestName}</td>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{booking.roomNumber}</td>
                    <td className="px-4 py-3 text-gray-800">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <MapPin size={14} className="text-blue-600" />
                        {booking.pickupLocation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={14} className="text-red-600" />
                        {booking.dropLocation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={14} />
                        {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString("en-GB") : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <Clock size={14} />
                        {booking.pickupTime ? new Date(booking.pickupTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{booking.driver}</td>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{booking.vehicle}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{booking.distance}</td>
                    <td className="px-4 py-3 text-[#15803D] font-semibold">
                      {booking.fare === "--" ? "—" : `$${booking.fare}`}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[booking.status] || "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{booking.notes}</td>
                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                      <div className="mv_table_action flex items-center gap-2">
                        <div title="View">
                          <button onClick={() => openView(booking)} className="p-1 rounded">
                            <IoEyeSharp className="text-[18px] text-quaternary" />
                          </button>
                        </div>
                        <div className="p-1 text-[#6777ef] hover:text-[#4255d4] rounded-lg transition-colors" title="Edit" onClick={() => {
                          // Find the raw booking data to get IDs
                          const rawBooking = staticCabBookings.find(b => b._id === booking.id);
                          setEditBooking(booking);
                          setEditBookingRaw(rawBooking);
                          setEditForm({
                            pickupLocation: booking.pickupLocation || "Airport",
                            dropLocation: booking.dropLocation || "Hotel",
                            bookingDate: booking.bookingDate
                              ? new Date(booking.bookingDate).toISOString().split('T')[0]
                              : "",
                            pickupTime: booking.pickupTime
                              ? new Date(booking.pickupTime).toISOString().slice(0, 16)
                              : "",
                            estimatedDistance: booking.distance && booking.distance !== "--" ? booking.distance : "",
                            estimatedFare: booking.fare && booking.fare !== "--" ? booking.fare : "",
                            notes: booking.notes || "",
                            assignedDriver: rawBooking?.assignedDriver?._id || rawBooking?.assignedDriver || "",
                            assignedCab: rawBooking?.assignedCab?._id || rawBooking?.assignedCab || "",
                            status: booking.status || "Pending",
                          });
                          setShowEditModal(true);
                        }}>
                        <FiEdit className="text-[18px]" />
                      </div>
                        <div title="Delete" onClick={() => handleDeleteClick(booking)}>
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

        {/* View Modal */}
        {showViewModal && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-6">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl border border-gray-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Cab Booking Details</h3>
                <button
                  onClick={closeView}
                  className="p-2 rounded text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-5 md:px-8 py-5 md:py-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Guest Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <GoDotFill className="text-gray-700" size={18} />
                    <span>Guest Information</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 text-[15px]">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 min-w-[110px]">Name:</span>
                      <span className="text-gray-900">{selectedBooking.guestName}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 min-w-[110px]">Room / Guest ID:</span>
                      <span className="text-gray-900">{selectedBooking.roomNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <GoDotFill className="text-gray-700" size={18} />
                    <span>Booking Information</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 text-[15px]">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 min-w-[110px]">Date:</span>
                      <span className="text-gray-900">
                        {selectedBooking.bookingDate
                          ? new Date(selectedBooking.bookingDate).toLocaleDateString("en-GB")
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 min-w-[110px]">Time:</span>
                      <span className="text-gray-900">
                        {selectedBooking.pickupTime
                          ? new Date(selectedBooking.pickupTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 min-w-[110px]">Status:</span>
                      <span className="text-gray-900">{selectedBooking.status}</span>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <GoDotFill className="text-gray-700" size={18} />
                    <span>Trip Details</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 text-[15px]">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 min-w-[110px]">Pickup Location:</span>
                      <span className="text-gray-900">{selectedBooking.pickupLocation}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 min-w-[110px]">Drop Location:</span>
                      <span className="text-gray-900">{selectedBooking.dropLocation}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 min-w-[110px]">Driver:</span>
                      <span className="text-gray-900">{selectedBooking.driver}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 min-w-[110px]">Vehicle:</span>
                      <span className="text-gray-900">{selectedBooking.vehicle}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 min-w-[110px]">Distance (KM):</span>
                      <span className="text-gray-900">{selectedBooking.distance ?? "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <GoDotFill className="text-gray-700" size={18} />
                    <span>Payment Information</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 text-[15px]">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 min-w-[130px]">Payment Status:</span>
                      <span className="text-gray-900">{selectedBooking.paymentStatus}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 min-w-[130px]">Total Fare:</span>
                      <span className="text-gray-900">
                        {selectedBooking.fare === "--" ? "—" : `₹${selectedBooking.fare}`}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 min-w-[130px]">Payment Method:</span>
                      <span className="text-gray-900">{selectedBooking.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <GoDotFill className="text-gray-700" size={18} />
                    <span>Additional Information</span>
                  </div>
                  <div className="grid grid-cols-1 gap-y-3 text-[15px]">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 min-w-[110px]">Notes:</span>
                      <span className="text-gray-900 flex-1">{selectedBooking.notes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-6">
            <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Edit Cab Booking</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setShowPickupLocationDropdown(false);
                    setEditBooking(null);
                    setEditBookingRaw(null);
                  }}
                  className="p-2 rounded text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                  disabled={isUpdating}
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!editBooking || !editBookingRaw) return;
                  setIsUpdating(true);
                  try {
                    const updateData = {
                      pickUpLocation: editForm.pickupLocation || "Airport",
                      dropLocation: {
                        address: editForm.dropLocation || "Hotel"
                      },
                      bookingDate: editForm.bookingDate
                        ? new Date(editForm.bookingDate).toISOString()
                        : editBookingRaw.bookingDate,
                      pickUpTime: editForm.pickupTime
                        ? new Date(editForm.pickupTime).toISOString()
                        : editBookingRaw.pickUpTime,
                      estimatedDistance: editForm.estimatedDistance === "" || editForm.estimatedDistance === undefined
                        ? undefined
                        : Number(editForm.estimatedDistance),
                      estimatedFare: editForm.estimatedFare === "" || editForm.estimatedFare === undefined
                        ? undefined
                        : Number(editForm.estimatedFare),
                      notes: editForm.notes || "",
                    };

                    // Add driver assignment if changed
                    if (editForm.assignedDriver !== undefined) {
                      updateData.assignedDriver = editForm.assignedDriver && editForm.assignedDriver !== "" 
                        ? editForm.assignedDriver 
                        : null;
                    }

                    // Add cab assignment if changed
                    if (editForm.assignedCab !== undefined) {
                      updateData.assignedCab = editForm.assignedCab && editForm.assignedCab !== "" 
                        ? editForm.assignedCab 
                        : null;
                    }

                    // Add status if changed
                    if (editForm.status !== undefined) {
                      updateData.status = editForm.status;
                    }

                    // Call the update API
                    await dispatch(updateCabBooking({ 
                      id: editBookingRaw._id, 
                      updateData 
                    })).unwrap();

                    // Refresh the bookings list
                    await dispatch(getAllCabBookings());
                    
                    setShowEditModal(false);
                    setShowPickupLocationDropdown(false);
                    setEditBooking(null);
                    setEditBookingRaw(null);
                  } catch (err) {
                    console.error("Update error:", err);
                    dispatch(setAlert({ text: err?.message || "Update failed!", color: "error" }));
                  } finally {
                    setIsUpdating(false);
                  }
                }}
                className="px-6 md:px-8 py-5 space-y-6 max-h-[80vh] overflow-y-auto bg-white"
              >
                {/* Trip Information */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Trip Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Pickup Location</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => !isUpdating && setShowPickupLocationDropdown(!showPickupLocationDropdown)}
                          disabled={isUpdating}
                          className="w-full bg-[#F5F5F5] border border-gray-200 rounded-[4px] px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent disabled:opacity-60 flex items-center justify-between"
                        >
                          <span className="text-left">
                            {editForm.pickupLocation || 'Select pickup location'}
                          </span>
                          <ChevronDown size={18} className="text-gray-600" />
                        </button>
                        {showPickupLocationDropdown && (
                          <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg max-h-48 overflow-y-auto">
                            {['Airport', 'Railway Station', 'Bus Station'].map((location) => (
                              <div
                                key={location}
                                onClick={() => {
                                  setEditForm(f => ({ ...f, pickupLocation: location }));
                                  setShowPickupLocationDropdown(false);
                                }}
                                className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                              >
                                {location}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Drop Location</label>
                      <input
                        type="text"
                        className="w-full bg-[#F5F5F5] border border-gray-200 rounded-[4px] px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent disabled:opacity-60"
                        value={editForm.dropLocation}
                        onChange={e => setEditForm(f => ({ ...f, dropLocation: e.target.value }))}
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Schedule</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Booking Date</label>
                      <input
                        type="date"
                        className="w-full bg-[#F5F5F5] border border-gray-200 rounded-[4px] px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent disabled:opacity-60"
                        value={editForm.bookingDate}
                        onChange={e => setEditForm(f => ({ ...f, bookingDate: e.target.value }))}
                        disabled={isUpdating}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Pickup Time</label>
                      <input
                        type="datetime-local"
                        className="w-full bg-[#F5F5F5] border border-gray-200 rounded-[4px] px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent disabled:opacity-60"
                        value={editForm.pickupTime}
                        onChange={e => setEditForm(f => ({ ...f, pickupTime: e.target.value }))}
                        disabled={isUpdating}
                      />
                    </div>
                  </div>
                </div>

                {/* Assignment Details */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Assignment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Assigned Driver</label>
                      <select
                        className="w-full bg-[#F5F5F5] border border-gray-200 rounded-[4px] px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent disabled:opacity-60"
                        value={editForm.assignedDriver || ""}
                        onChange={e => setEditForm(f => ({ ...f, assignedDriver: e.target.value || null }))}
                        disabled={isUpdating}
                      >
                        <option value="">Unassigned</option>
                        {drivers && drivers.map((driver) => (
                          <option key={driver._id} value={driver._id}>
                            {driver.name} {driver.status === "Available" ? "(Available)" : `(${driver.status})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Assigned Cab</label>
                      <select
                        className="w-full bg-[#F5F5F5] border border-gray-200 rounded-[4px] px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent disabled:opacity-60"
                        value={editForm.assignedCab || ""}
                        onChange={e => setEditForm(f => ({ ...f, assignedCab: e.target.value || null }))}
                        disabled={isUpdating}
                      >
                        <option value="">Unassigned</option>
                        {cabs && cabs.map((cab) => (
                          <option key={cab._id} value={cab._id}>
                            {cab.vehicleId} - {cab.modelName} {cab.status === "Available" ? "(Available)" : `(${cab.status})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <select
                        className="w-full bg-[#F5F5F5] border border-gray-200 rounded-[4px] px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent disabled:opacity-60"
                        value={editForm.status || "Pending"}
                        onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                        disabled={isUpdating}
                      >
                        {statusFilterOptions.filter(s => s !== "All").map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Fare Details */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Fare Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Estimated Distance (km)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        className="w-full bg-[#F5F5F5] border border-gray-200 rounded-[4px] px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent disabled:opacity-60"
                        value={editForm.estimatedDistance}
                        onChange={e => setEditForm(f => ({ ...f, estimatedDistance: e.target.value }))}
                        disabled={isUpdating}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Estimated Fare</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full bg-[#F5F5F5] border border-gray-200 rounded-[4px] px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent disabled:opacity-60"
                        value={editForm.estimatedFare}
                        onChange={e => setEditForm(f => ({ ...f, estimatedFare: e.target.value }))}
                        disabled={isUpdating}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <h4 className="text-lg font-semibold text-gray-900">Notes</h4>
                  <textarea
                    rows={4}
                    className="w-full bg-[#F5F5F5] border border-gray-200 rounded-[4px] px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent disabled:opacity-60 resize-none"
                    value={editForm.notes}
                    onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                    disabled={isUpdating}
                    placeholder="Add any additional instructions"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setShowPickupLocationDropdown(false);
                      setEditBooking(null);
                      setEditBookingRaw(null);
                    }}
                    className="px-5 py-2.5 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-md bg-[#D6B782] text-[#4A372B] hover:bg-[#c8a76f] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Booking"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deleteBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-6">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200">
              <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Delete Booking</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-2 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  disabled={isDeleting}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-5 py-5 space-y-5">
                <p className="text-sm text-gray-800">
                  Are you sure you want to delete the booking for{" "}
                  <span className="font-semibold">{deleteBooking.guestName}</span>?
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!deleteBooking) return;
                      setIsDeleting(true);
                      try {
                        const updatedBookings = cabBookings.filter((booking) => booking.id !== deleteBooking.id);
                        setCabBookings(updatedBookings);
                        const newTotalPages = Math.max(1, Math.ceil(updatedBookings.length / limit));
                        if (page > newTotalPages) {
                          setPage(newTotalPages);
                        }
                        setShowDeleteModal(false);
                        setDeleteBooking(null);
                      } catch (err) {
                        console.error("Delete error:", err);
                        dispatch(setAlert({ text: "Delete failed!", color: "error" }));
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-[#E9D08C] text-gray-900 hover:bg-[#dec57f] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-3 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex items-center gap-1 sm:gap-3 md600:gap-2 md:gap-3">
            <span className="text-sm text-gray-600">Items per page:</span>
            <div className="relative">
              <select
                value={limit}
                onChange={(e) => handleLimitChange(e)}
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
              {showingStart} - {showingEnd} of {totalCount}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={handleDeleteModalClose}></div>
            <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-black">Delete Cab Booking</h2>
                <button className="text-gray-500 hover:text-gray-800" onClick={handleDeleteModalClose}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-700 mb-8 text-center">
                Are you sure you want to delete this cab booking?
              </p>
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
    </div>
  );
};
export default CabBookingDetail;