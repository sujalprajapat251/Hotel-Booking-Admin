import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiPlusCircle, FiEdit } from "react-icons/fi";
import { IoEyeSharp } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";
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
  X,
} from "lucide-react";
import * as XLSX from 'xlsx';
import { setAlert } from '../Redux/Slice/alert.slice';
import { getAllCabBookings } from "../Redux/Slice/cabBookingSlice";

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
  const [editForm, setEditForm] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBooking, setDeleteBooking] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const loading = false;

  useEffect(() => {
    dispatch(getAllCabBookings());
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
    setCabBookings(staticCabBookings.map((booking) => ({ ...booking })));
    setStatusFilter("All");
    setSearchTerm("");
    setDebouncedSearch("");
    setPage(1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
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
            <p className="text-[16px] font-semibold text-gray-800 text-nowrap">All Cab Bookings</p>
            <div className="relative max-w-md w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bookings..."
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
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${payStatusColors[booking.paymentStatus] || "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800">{booking.paymentMethod}</td>
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
                        {/* <div className="p-1 text-[#6777ef] hover:text-[#4255d4] rounded-lg transition-colors" title="Edit">
                        <FiEdit className="text-[18px]" />
                      </div> */}
                        <div title="Delete">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 md:p-6">
            <div className="w-full max-w-[90%] md:max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] border-b border-[#B79982]">
                <h3 className="text-xl font-semibold text-[#755647]">Booking Details</h3>
                <button 
                  onClick={closeView} 
                  className="p-1 rounded text-[#755647] hover:text-[#876B56] hover:bg-white/30 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-3 md:p-6 overflow-y-auto bg-[#F0F3FB]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[15px]">
                  <div className="bg-white rounded-lg p-3 border border-[#B79982]">
                    <div className="flex items-start">
                      <div className="w-32 md:w-36 font-semibold text-[#755647]">Guest Name:</div>
                      <div className="font-medium text-gray-800">{selectedBooking.guestName}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-[#B79982]">
                    <div className="flex items-start">
                      <div className="w-32 font-semibold text-[#755647]">Room/Guest ID:</div>
                      <div className="font-medium text-gray-800">{selectedBooking.roomNumber}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-[#B79982]">
                    <div className="flex items-start">
                      <div className="w-32 md:w-36 font-semibold text-[#755647]">Pickup Location:</div>
                      <div className="font-medium text-gray-800">{selectedBooking.pickupLocation}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-[#B79982]">
                    <div className="flex items-start">
                      <div className="w-32 font-semibold text-[#755647]">Drop Location:</div>
                      <div className="font-medium text-gray-800">{selectedBooking.dropLocation}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-[#B79982]">
                    <div className="flex items-start">
                      <div className="w-32 md:w-36 font-semibold text-[#755647]">Date:</div>
                      <div className="font-medium text-gray-800">{selectedBooking.bookingDate ? new Date(selectedBooking.bookingDate).toLocaleDateString('en-GB') : '—'}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-[#B79982]">
                    <div className="flex items-start">
                      <div className="w-32 font-semibold text-[#755647]">Time:</div>
                      <div className="font-medium text-gray-800">{selectedBooking.pickupTime ? new Date(selectedBooking.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-[#B79982]">
                    <div className="flex items-start">
                      <div className="w-32 md:w-36 font-semibold text-[#755647]">Driver:</div>
                      <div className="font-medium text-gray-800">{selectedBooking.driver}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-[#B79982]">
                    <div className="flex items-start">
                      <div className="w-32 font-semibold text-[#755647]">Vehicle:</div>
                      <div className="font-medium text-gray-800">{selectedBooking.vehicle}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-[#B79982]">
                    <div className="flex items-start">
                      <div className="w-32 md:w-36 font-semibold text-[#755647]">Distance(KM):</div>
                      <div className="font-medium text-gray-800">{selectedBooking.distance ?? '—'}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-[#B79982]">
                    <div className="flex items-start">
                      <div className="w-32 font-semibold text-[#755647]">Total Fare:</div>
                      <div className="font-medium text-gray-800">{selectedBooking.fare === '--' ? '—' : `₹${selectedBooking.fare}`}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-[#B79982]">
                    <div className="flex items-start">
                      <div className="w-32 md:w-36 font-semibold text-[#755647]">Payment Status:</div>
                      <div className="font-medium text-gray-800">{selectedBooking.paymentStatus}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-[#B79982]">
                    <div className="flex items-start">
                      <div className="w-32 font-semibold text-[#755647]">Method:</div>
                      <div className="font-medium text-gray-800">{selectedBooking.paymentMethod}</div>
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-white rounded-lg p-3 border border-[#B79982]">
                    <div className="flex items-start">
                      <div className="w-28 md:w-32 font-semibold text-[#755647]">Notes:</div>
                      <div className="ml-4 font-medium text-gray-800 flex-1">{selectedBooking.notes}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 md:p-6">
            <div className="w-full max-w-[90%] md:max-w-xl bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] border-b border-[#B79982]">
                <h3 className="text-xl font-semibold text-[#755647]">Edit Cab Booking</h3>
                <button 
                  onClick={() => setShowEditModal(false)} 
                  className="p-1 rounded text-[#755647] hover:text-[#876B56] hover:bg-white/30 transition-colors"
                  disabled={isUpdating}
                >
                  <X size={20} />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!editBooking) return;
                  setIsUpdating(true);
                  try {
                    const bookingDateValue = editForm.bookingDate
                      ? new Date(editForm.bookingDate).toISOString()
                      : editBooking.bookingDate;
                    const pickupTimeValue = editForm.pickupTime
                      ? new Date(editForm.pickupTime).toISOString()
                      : editBooking.pickupTime;
                    const distanceValue =
                      editForm.estimatedDistance === "" || editForm.estimatedDistance === undefined
                        ? editBooking.distance
                        : Number(editForm.estimatedDistance);
                    const fareValue =
                      editForm.estimatedFare === "" || editForm.estimatedFare === undefined
                        ? editBooking.fare
                        : Number(editForm.estimatedFare);

                    setCabBookings((prev) =>
                      prev.map((booking) =>
                        booking.id === editBooking.id
                          ? {
                              ...booking,
                              pickupLocation: editForm.pickupLocation || "Airport",
                              dropLocation: editForm.dropLocation || "Hotel",
                              bookingDate: bookingDateValue,
                              pickupTime: pickupTimeValue,
                              distance: distanceValue,
                              fare: fareValue,
                              notes: editForm.notes || "",
                            }
                          : booking
                      )
                    );
                    dispatch(setAlert({ text: "Booking updated!", color: "success" }));
                    setShowEditModal(false);
                    setEditBooking(null);
                  } catch (err) {
                    console.error("Update error:", err);
                    dispatch(setAlert({ text: "Update failed!", color: "error" }));
                  } finally {
                    setIsUpdating(false);
                  }
                }}
                className="p-4 md:p-6 space-y-4 bg-[#F0F3FB]"
              >
                <div>
                  <label className="block font-semibold mb-2 text-[#755647]">Pickup Location</label>
                  <select
                    className="w-full border border-[#B79982] rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent bg-white text-gray-800"
                    value={editForm.pickupLocation}
                    onChange={e => setEditForm(f => ({ ...f, pickupLocation: e.target.value }))}
                    disabled={isUpdating}
                  >
                    <option value="Airport">Airport</option>
                    <option value="Railway Station">Railway Station</option>
                    <option value="Bus Station">Bus Station</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-[#755647]">Drop Location</label>
                  <input
                    type="text"
                    className="w-full border border-[#B79982] rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent bg-white text-gray-800"
                    value={editForm.dropLocation}
                    onChange={e => setEditForm(f => ({ ...f, dropLocation: e.target.value }))}
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-[#755647]">Booking Date</label>
                  <input
                    type="date"
                    className="w-full border border-[#B79982] rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent bg-white text-gray-800"
                    value={editForm.bookingDate}
                    onChange={e => setEditForm(f => ({ ...f, bookingDate: e.target.value }))}
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-[#755647]">Pickup Time</label>
                  <input
                    type="datetime-local"
                    className="w-full border border-[#B79982] rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent bg-white text-gray-800"
                    value={editForm.pickupTime}
                    onChange={e => setEditForm(f => ({ ...f, pickupTime: e.target.value }))}
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-[#755647]">Estimated Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full border border-[#B79982] rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent bg-white text-gray-800"
                    value={editForm.estimatedDistance}
                    onChange={e => setEditForm(f => ({ ...f, estimatedDistance: e.target.value }))}
                    disabled={isUpdating}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-[#755647]">Estimated Fare</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full border border-[#B79982] rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent bg-white text-gray-800"
                    value={editForm.estimatedFare}
                    onChange={e => setEditForm(f => ({ ...f, estimatedFare: e.target.value }))}
                    disabled={isUpdating}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-[#755647]">Notes</label>
                  <textarea
                    rows={3}
                    className="w-full border border-[#B79982] rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent bg-white text-gray-800 resize-none"
                    value={editForm.notes}
                    onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                    disabled={isUpdating}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#B79982]">
                  <button 
                    type="button" 
                    onClick={() => setShowEditModal(false)} 
                    className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] text-[#755647] hover:from-[#E3C78A] hover:to-[#D4B87A] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deleteBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 md:p-6">
            <div className="w-full max-w-[90%] md:max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] border-b border-[#B79982]">
                <h3 className="text-xl font-semibold text-[#755647]">Confirm Delete</h3>
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className="p-1 rounded text-[#755647] hover:text-[#876B56] hover:bg-white/30 transition-colors"
                  disabled={isDeleting}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 md:p-6 bg-[#F0F3FB]">
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                      <RiDeleteBinLine className="text-red-600 text-3xl" />
                    </div>
                  </div>
                  <p className="text-center text-gray-800 font-medium mb-2">
                    Are you sure you want to delete this cab booking?
                  </p>
                  <div className="bg-white rounded-lg p-3 mt-4 border border-[#B79982]">
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold text-[#755647]">Guest:</span> {deleteBooking.guestName}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold text-[#755647]">Pickup:</span> {deleteBooking.pickupLocation}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-[#755647]">Drop:</span> {deleteBooking.dropLocation}
                    </p>
                  </div>
                  <p className="text-center text-sm text-red-600 mt-4 font-medium">
                    This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#B79982]">
                  <button 
                    type="button" 
                    onClick={() => setShowDeleteModal(false)} 
                    className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      if (!deleteBooking) return;
                      setIsDeleting(true);
                      try {
                        const updatedBookings = cabBookings.filter((booking) => booking.id !== deleteBooking.id);
                        setCabBookings(updatedBookings);
                        const newTotalPages = Math.max(1, Math.ceil(updatedBookings.length / limit));
                        if (page > newTotalPages) {
                          setPage(newTotalPages);
                        }
                        dispatch(setAlert({ text: "Booking deleted!", color: "success" }));
                        setShowDeleteModal(false);
                        setDeleteBooking(null);
                      } catch (err) {
                        console.error("Delete error:", err);
                        dispatch(setAlert({ text: "Delete failed!", color: "error" }));
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <RiDeleteBinLine size={16} />
                        Delete
                      </>
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
    </div>
  );
};
export default CabBookingDetail;