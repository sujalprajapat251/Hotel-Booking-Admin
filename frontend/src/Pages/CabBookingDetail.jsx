import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiPlusCircle, FiEdit } from "react-icons/fi";
import { IoEyeSharp } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";
import { Search, Filter, Download, RefreshCw, MapPin, Calendar, Clock } from "lucide-react";
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
    const params = { page, limit };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter !== "All") params.status = statusFilter;
    dispatch(getAllCabBookings(params));
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const filteredBookings = cabBookings.map((booking) => {
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

  return (
    <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
      <section className="py-5">
        <h1 className="text-2xl font-semibold text-black">Cab Bookings</h1>
      </section>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col gap-3 md600:flex-row md600:items-center md600:justify-between p-4 border-b border-gray-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <p className="text-[16px] font-semibold text-gray-800">All Cab Bookings</p>
            <div className="relative max-w-md w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by guest/room ID/driver/cab/location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982]"
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-1 justify-end">
            <button className="p-2 text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded-lg transition-colors" title="Add Booking">
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
                  {statusFilterOptions.map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setPage(1);
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
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={20} />
            </button>
            <button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors" title="Download">
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
                  <th key={header} className="px-4 py-3 whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking, idx) => (
                <tr key={booking.id} className="border-b border-gray-100 text-gray-700 hover:bg-gray-50">
                  <td className="px-4 py-3">{(page - 1) * limit + idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{booking.guestName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.roomNumber}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      <MapPin size={14} className="text-blue-600" />
                      {booking.pickupLocation}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} className="text-red-600" />
                      {booking.dropLocation}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={14} />
                      {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString("en-GB") : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      <Clock size={14} />
                      {booking.pickupTime ? new Date(booking.pickupTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.driver}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.vehicle}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{booking.distance}</td>
                  <td className="px-4 py-3 text-[#15803D] font-semibold">
                    {booking.fare === "--" ? "—" : `₹${booking.fare}`}
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
                  <td className="px-4 py-3">{booking.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        statusColors[booking.status] || "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{booking.notes}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-lg">
                      <button className="text-[#F59E0B] hover:text-[#D97706]" title="Edit"><FiEdit /></button>
                      <button className="text-[#EF4444] hover:text-[#DC2626]" title="Delete"><RiDeleteBinLine /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={17} className="text-center text-gray-500 py-6 text-sm">No bookings match your filters.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={17} className="text-center text-gray-500 py-6 text-sm">Loading cab bookings...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between p-4 border-t border-gray-200 text-sm text-gray-600">
          <div>
            Showing {filteredBookings.length ? `${showingStart}-${showingEnd}` : 0} of {totalCount || 0} bookings
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-2">
              <span>Items per page</span>
              <select
                className="border border-gray-300 rounded-lg px-2 py-1 focus:ring-[#B79982] focus:border-[#B79982]"
                value={limit}
                onChange={handleLimitChange}
              >
                {[10, 20, 50].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || loading}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CabBookingDetail;