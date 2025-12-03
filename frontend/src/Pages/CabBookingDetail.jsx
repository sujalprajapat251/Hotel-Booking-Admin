import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiPlusCircle, FiEdit} from "react-icons/fi";
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

const CabBookingDetail = () => {
  const dispatch = useDispatch();
  const {
    cabBookings = [],
    loading = false,
    totalCount = 0,
  } = useSelector((state) => state.cabBooking || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / limit));
  const showingStart = cabBookings.length ? (page - 1) * limit + 1 : 0;
  const showingEnd = (page - 1) * limit + cabBookings.length;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const params = { page, limit };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter !== "All") params.status = statusFilter;
    dispatch(getAllCabBookings(params));
  }, [dispatch, page, limit, debouncedSearch, statusFilter]);

  const handleRefresh = () => {
    setSearchTerm("");         // clear search input
    setDebouncedSearch("");    // clear debounced search
    setStatusFilter("All");    // reset filter
    setPage(1);                // reset page
    dispatch(getAllCabBookings({ page: 1, limit }));
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const filteredBookings = useMemo(() => {
    return cabBookings.map((booking) => {
      const guest = booking.booking?.guest;
      const roomNumber =
        booking.booking?.roomNumber ||
        booking.booking?.room?.roomNumber ||
        "--";
      const payment = booking.booking?.payment;
      return {
        id: booking._id,
        bookingReference:
          booking.booking?.reservation?.bookingReference ||
          booking.booking?._id,
        guestName: guest?.fullName || "Walk-in Guest",
        roomNumber,
        pickupLocation: booking.pickUpLocation || "Airport",
        dropLocation: booking.dropLocation?.address || "Hotel",
        bookingDate: booking.bookingDate,
        pickupTime: booking.pickUpTime,
        driver: booking.assignedDriver?.name || "Unassigned",
        vehicle:
          booking.assignedCab?.modelName ||
          booking.assignedCab?.vehicleId ||
          "Unassigned",
        distance: booking.estimatedDistance ?? "--",
        fare: booking.estimatedFare ?? "--",
        paymentStatus:
          booking.paymentStatus || payment?.status || "Pending",
        paymentMethod: payment?.method || "N/A",
        notes: booking.notes || "—",
        status: booking.status || "Pending",
      };
    });
  }, [cabBookings]);

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
        <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex gap-2 md:gap-5 sm:justify-between">
            {/* <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">All Cab Bookings</p> */}
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-1 justify-end mt-2">
            <button className="p-2 text-[#4CAF50] hover:text-[#4CAF50] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors" title="Add Booking">
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
                  {statusFilterOptions.map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setPage(1);
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
                  "Payment Status",
                  "Method",
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
              {filteredBookings.map((booking, idx) => (
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
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        payStatusColors[booking.paymentStatus] || "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-800">{booking.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        statusColors[booking.status] || "bg-gray-50 text-gray-600 border-gray-200"
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
                      <div className="p-1 text-[#6777ef] hover:text-[#4255d4] rounded-lg transition-colors" title="Edit">
                        <FiEdit className="text-[18px]" />
                      </div>
                      <div title="Delete">
                        <RiDeleteBinLine className="text-[#ff5200] text-[18px]" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={16} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-lg font-medium">No bookings found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}  
              {/* {loading && (
                <tr>
                  <td colSpan={16} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                        <RefreshCw className="w-12 h-12 mb-4 text-[#B79982] animate-spin" />
                        <p className="text-lg font-medium">Loading bookings...</p>
                    </div>
                </td>
                </tr>
              )} */}
            </tbody>
          </table>
        </div>

        {/* View Modal */}
        {showViewModal && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 md:p-6">
            <div className="w-full max-w-[90%] md:max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="text-xl font-semibold text-black mt-2 ml-3">Booking Details</h3>
                <button onClick={closeView} className="p-1 rounded text-gray-800 hover:text-gray-950">
                  <X size={20} />
                </button>
              </div>
              <div className="p-3 md:p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 space-y-2 md:space-y-3 text-[15px]">
                  <div>
                    <div className="flex items-start mt-3">
                      <div className="w-32 md:w-36 font-semibold text-black">Guest Name:</div>
                      <div className="font-medium text-black">{selectedBooking.guestName}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start">
                      <div className="w-32 font-semibold text-black">Room/Guest ID:</div>
                      <div className="font-medium text-black">{selectedBooking.roomNumber}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start">
                      <div className="w-32 md:w-36 font-semibold text-black">Pickup Location:</div>
                      <div className="font-medium text-black">{selectedBooking.pickupLocation}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start">
                      <div className="w-32 font-semibold text-black">Drop Location:</div>
                      <div className="font-medium text-black">{selectedBooking.dropLocation}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start">
                      <div className="w-32 md:w-36 font-semibold text-black">Date:</div>
                      <div className="font-medium text-black">{selectedBooking.bookingDate ? new Date(selectedBooking.bookingDate).toLocaleDateString('en-GB') : '—'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start">
                      <div className="w-32 font-semibold text-black">Time:</div>
                      <div className="font-medium text-black">{selectedBooking.pickupTime ? new Date(selectedBooking.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start">
                      <div className="w-32 md:w-36 font-semibold text-black">Driver:</div>
                      <div className="font-medium text-black">{selectedBooking.driver}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start">
                      <div className="w-32 font-semibold text-black">Vehicle:</div>
                      <div className="font-medium text-black">{selectedBooking.vehicle}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start">
                      <div className="w-32 md:w-36 font-semibold text-black">Distance(KM):</div>
                      <div className="font-medium text-black">{selectedBooking.distance ?? '—'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start">
                      <div className="w-32 font-semibold text-black">Total Fare:</div>
                      <div className="font-medium text-black">{selectedBooking.fare === '--' ? '—' : `₹${selectedBooking.fare}`}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start">
                      <div className="w-32 md:w-36 font-semibold text-black">Payment Status:</div>
                      <div className="font-medium text-black">{selectedBooking.paymentStatus}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start">
                      <div className="w-32 font-semibold text-black">Method:</div>
                      <div className="font-medium text-black">{selectedBooking.paymentMethod}</div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-start">
                      <div className="w-28 md:w-32 font-semibold text-black">Notes:</div>
                      <div className="ml-4 font-medium text-black text-right">{selectedBooking.notes}</div>
                    </div>
                  </div>
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
                disabled={page === 1}
                className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
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