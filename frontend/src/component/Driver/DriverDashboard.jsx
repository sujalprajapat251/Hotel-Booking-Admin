import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import { IoEyeSharp } from "react-icons/io5";
import {
  getAllCabBookings,
  advanceCabBookingStatus,
} from "../../Redux/Slice/cabBookingSlice";
import { setAlert } from "../../Redux/Slice/alert.slice";

const statusColors = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Confirmed: "bg-blue-50 text-blue-600 border-blue-200",
  Assigned: "bg-indigo-50 text-indigo-600 border-indigo-200",
  InProgress: "bg-sky-50 text-sky-600 border-sky-200",
  Completed: "bg-green-50 text-green-600 border-green-200",
  Cancelled: "bg-red-50 text-red-600 border-red-200",
};

const DriverDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cabBookings, loading, isError, message } = useSelector(
    (state) => state.cabBooking
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  useEffect(() => {
    if (user && user.designation === "Driver") {
      dispatch(getAllCabBookings());
    }
  }, [dispatch, user]);

  if (!user || user.designation !== "Driver") return <div>Unauthorized</div>;

  // Support multiple assigned cabs if type is array, otherwise single
  const assignedCabs = Array.isArray(user.AssignedCab)
    ? user.AssignedCab
    : user.AssignedCab
    ? [user.AssignedCab]
    : [];

  // Filter bookings for this driver
  const driverBookings = (cabBookings || []).filter((b) => {
    if (!b.assignedDriver) return false;

    if (typeof b.assignedDriver === "object" && b.assignedDriver._id) {
      return b.assignedDriver._id.toString() === user._id.toString();
    }

    if (typeof b.assignedDriver === "string") {
      return b.assignedDriver.toString() === user._id.toString();
    }

    return false;
  });

  // Filter by search term
  const filteredBookings = driverBookings.filter((booking) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const guestName =
      booking.booking?.guest?.fullName || booking.booking?.guest?.name || "";
    const roomNumber =
      booking.booking?.roomNumber || booking.booking?.room?.roomNumber || "";
    const pickupLocation = booking.pickUpLocation || "";
    const dropLocation = booking.dropLocation?.address || "";
    const status = booking.status || "";

    return (
      guestName.toLowerCase().includes(searchLower) ||
      roomNumber.toLowerCase().includes(searchLower) ||
      pickupLocation.toLowerCase().includes(searchLower) ||
      dropLocation.toLowerCase().includes(searchLower) ||
      status.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalCount = filteredBookings.length;
  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = page;
  const showingStart = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const showingEnd = Math.min(page * limit, totalCount);
  const paginatedBookings = filteredBookings.slice(
    (page - 1) * limit,
    page * limit
  );

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    setPage(1);
  };

  const handleRefresh = () => {
    dispatch(getAllCabBookings());
  };

  const openView = (booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  const closeView = () => {
    setShowViewModal(false);
    setSelectedBooking(null);
  };

  const handleStatusUpdate = async (bookingId) => {
    setUpdatingStatusId(bookingId);
    try {
      await dispatch(advanceCabBookingStatus(bookingId)).unwrap();
      await dispatch(getAllCabBookings());
    } catch (error) {
      console.error("Status update error:", error);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      Pending: "InProgress",
      Confirmed: "InProgress",
      Assigned: "InProgress",
      InProgress: "Completed",
    };
    return statusFlow[currentStatus] || null;
  };

  const canUpdateStatus = (status) => {
    return ["Pending", "Confirmed", "Assigned", "InProgress"].includes(status);
  };

  return (
    <>
      <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
        <div className="bg-white rounded-lg shadow-md">
          <div className="md600:flex items-center justify-between p-3 border-b border-gray-200 gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1">
              <div className="relative max-w-md">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
                />
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 justify-end mt-2 md:mt-0">
              <button
                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title="Refresh"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw
                  size={20}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-300px)] scrollbar-thin scrollbar-thumb-[#B79982] scrollbar-track-[#F7DF9C]/20 hover:scrollbar-thumb-[#876B56]">
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
                    "Vehicle",
                    "Distance (KM)",
                    "Total Fare",
                    "Trip Status",
                    "Action",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647] whitespace-nowrap"
                    >
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
                ) : paginatedBookings?.length > 0 ? (
                  paginatedBookings.map((booking, idx) => {
                    const guestName =
                      booking.booking?.guest?.fullName ||
                      booking.booking?.guest?.name ||
                      "Walk-in Guest";
                    const roomNumber =
                      booking.booking?.roomNumber ||
                      booking.booking?.room?.roomNumber ||
                      "--";
                    const pickupLocation = booking.pickUpLocation || "Airport";
                    const dropLocation =
                      booking.dropLocation?.address || "Hotel";
                    const bookingDate = booking.bookingDate;
                    const pickupTime = booking.pickUpTime;
                    const vehicle = booking.assignedCab?.modelName
                      ? `${booking.assignedCab.modelName} (${booking.assignedCab.vehicleId})`
                      : "Not Assigned";
                    const distance = booking.estimatedDistance || "--";
                    const fare = booking.estimatedFare || "--";
                    const status = booking.status || "Pending";
                    const nextStatus = getNextStatus(status);
                    const canUpdate = canUpdateStatus(status);

                    return (
                      <tr
                        key={booking._id}
                        className="border-b border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                      >
                        <td className="px-4 py-3 text-gray-800">
                          {(page - 1) * limit + idx + 1}
                        </td>
                        <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                          {guestName}
                        </td>
                        <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                          {roomNumber}
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <MapPin size={14} className="text-blue-600" />
                            {pickupLocation}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={14} className="text-red-600" />
                            {dropLocation}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={14} />
                            {bookingDate
                              ? new Date(bookingDate).toLocaleDateString(
                                  "en-GB"
                                )
                              : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-800">
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <Clock size={14} />
                            {pickupTime
                              ? new Date(pickupTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                          {vehicle}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {distance}
                        </td>
                        <td className="px-4 py-3 text-[#15803D] font-semibold">
                          {fare === "--" ? "—" : `$${fare}`}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                              statusColors[status] ||
                              "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <div title="View">
                              <button
                                onClick={() => openView(booking)}
                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                              >
                                <IoEyeSharp className="text-[18px] text-quaternary" />
                              </button>
                            </div>
                            {canUpdate && (
                              <button
                                onClick={() => handleStatusUpdate(booking._id)}
                                disabled={updatingStatusId === booking._id}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 ${
                                  nextStatus === "InProgress"
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : "bg-green-500 text-white hover:bg-green-600"
                                }`}
                                title={`Update to ${nextStatus}`}
                              >
                                {updatingStatusId === booking._id ? (
                                  <>
                                    <RefreshCw
                                      size={14}
                                      className="animate-spin"
                                    />
                                    Updating...
                                  </>
                                ) : nextStatus === "InProgress" ? (
                                  <>
                                    <PlayCircle size={14} />
                                    Start Trip
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 size={14} />
                                    Complete
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center">
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
                        <p className="text-lg font-medium">No bookings found</p>
                        <p className="text-sm mt-1">
                          Try adjusting your search
                        </p>
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
                  <h3 className="text-xl font-semibold text-gray-900">
                    Cab Booking Details
                  </h3>
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
                      <span>Guest Information</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 text-[15px]">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 min-w-[110px]">
                          Name:
                        </span>
                        <span className="text-gray-900">
                          {selectedBooking.booking?.guest?.fullName ||
                            selectedBooking.booking?.guest?.name ||
                            "Walk-in Guest"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 min-w-[110px]">
                          Room / Guest ID:
                        </span>
                        <span className="text-gray-900">
                          {selectedBooking.booking?.roomNumber ||
                            selectedBooking.booking?.room?.roomNumber ||
                            "--"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <span>Booking Information</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 text-[15px]">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 min-w-[110px]">
                          Date:
                        </span>
                        <span className="text-gray-900">
                          {selectedBooking.bookingDate
                            ? new Date(
                                selectedBooking.bookingDate
                              ).toLocaleDateString("en-GB")
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 min-w-[110px]">
                          Time:
                        </span>
                        <span className="text-gray-900">
                          {selectedBooking.pickUpTime
                            ? new Date(
                                selectedBooking.pickUpTime
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 min-w-[110px]">
                          Status:
                        </span>
                        <span className="text-gray-900">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                              statusColors[selectedBooking.status] ||
                              "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                          >
                            {selectedBooking.status}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <span>Trip Details</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 text-[15px]">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 min-w-[110px]">
                          Pickup Location:
                        </span>
                        <span className="text-gray-900">
                          {selectedBooking.pickUpLocation || "Airport"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 min-w-[110px]">
                          Drop Location:
                        </span>
                        <span className="text-gray-900">
                          {selectedBooking.dropLocation?.address || "Hotel"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 min-w-[110px]">
                          Vehicle:
                        </span>
                        <span className="text-gray-900">
                          {selectedBooking.assignedCab?.modelName
                            ? `${selectedBooking.assignedCab.modelName} (${selectedBooking.assignedCab.vehicleId})`
                            : "Not Assigned"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 min-w-[110px]">
                          Distance (KM):
                        </span>
                        <span className="text-gray-900">
                          {selectedBooking.estimatedDistance ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <span>Payment Information</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10 text-[15px]">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 min-w-[130px]">
                          Total Fare:
                        </span>
                        <span className="text-gray-900">
                          {selectedBooking.estimatedFare === "--" ||
                          !selectedBooking.estimatedFare
                            ? "—"
                            : `$${selectedBooking.estimatedFare}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  {selectedBooking.notes && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <span>Additional Information</span>
                      </div>
                      <div className="grid grid-cols-1 gap-y-3 text-[15px]">
                        <div className="flex items-start gap-2">
                          <span className="text-gray-600 min-w-[110px]">
                            Notes:
                          </span>
                          <span className="text-gray-900 flex-1">
                            {selectedBooking.notes}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-3 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex items-center gap-1 sm:gap-3 md600:gap-2 md:gap-3">
              <span className="text-sm text-gray-600">Items per page:</span>
              <div className="relative">
                <select
                  value={limit}
                  onChange={handleLimitChange}
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
                  className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-1"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-1"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DriverDashboard;
