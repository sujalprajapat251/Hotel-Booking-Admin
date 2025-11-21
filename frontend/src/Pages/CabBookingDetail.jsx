import React, { useMemo, useState } from "react";
import { FiPlusCircle, FiEdit } from "react-icons/fi";
import { IoEyeSharp } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";
import { Search, Filter, Download, RefreshCw, MapPin, Calendar, Clock } from "lucide-react";

const dummyBookings = [
  {
    bookingId: "BK-1001",
    guestName: "Rajesh Sharma",
    roomNumber: "205",
    pickupLocation: "Hotel Main Gate",
    dropLocation: "Airport, Terminal 2",
    bookingDate: "2025-11-21",
    pickupTime: "16:00",
    assignedDriverId: "DRV-001",
    assignedVehicleId: "CAB-004",
    tripStatus: "Completed",
    distance: 24,
    totalFare: 950,
    paymentStatus: "Paid",
    paymentMethod: "UPI",
    notes: "Luggage: 2 bags, in a hurry",
  },
  {
    bookingId: "BK-1002",
    guestName: "Sneha Mehta",
    roomNumber: "407",
    pickupLocation: "Hotel Parking Lot",
    dropLocation: "Sabarmati Ashram",
    bookingDate: "2025-11-21",
    pickupTime: "11:30",
    assignedDriverId: "DRV-004",
    assignedVehicleId: "CAB-001",
    tripStatus: "Accepted",
    distance: 8,
    totalFare: 320,
    paymentStatus: "Pending",
    paymentMethod: "Cash",
    notes: "Guest uses wheelchair",
  },
  {
    bookingId: "BK-1003",
    guestName: "Ahmed Khan",
    roomNumber: "315",
    pickupLocation: "Hotel Main Gate",
    dropLocation: "Kankaria Lake",
    bookingDate: "2025-11-20",
    pickupTime: "18:10",
    assignedDriverId: "DRV-003",
    assignedVehicleId: "CAB-006",
    tripStatus: "Canceled",
    distance: 13,
    totalFare: 0,
    paymentStatus: "Pending",
    paymentMethod: "Card",
    notes: "",
  },
  {
    bookingId: "BK-1004",
    guestName: "Priya Desai",
    roomNumber: "121",
    pickupLocation: "Hotel Reception",
    dropLocation: "CG Road",
    bookingDate: "2025-11-22",
    pickupTime: "09:00",
    assignedDriverId: "DRV-002",
    assignedVehicleId: "CAB-002",
    tripStatus: "Pending",
    distance: 6,
    totalFare: 280,
    paymentStatus: "Pending",
    paymentMethod: "UPI",
    notes: "Baby seat required",
  },
  {
    bookingId: "BK-1005",
    guestName: "Luke Wilson",
    roomNumber: "502",
    pickupLocation: "Hotel Main Gate",
    dropLocation: "Science City",
    bookingDate: "2025-11-22",
    pickupTime: "14:45",
    assignedDriverId: "DRV-005",
    assignedVehicleId: "CAB-005",
    tripStatus: "Accepted",
    distance: 15,
    totalFare: 520,
    paymentStatus: "Paid",
    paymentMethod: "Card",
    notes: "Prefers English speaking driver",
  },
];

const statusColors = {
  Pending: "bg-yellow-50 text-yellow-600 border-yellow-200",
  Accepted: "bg-blue-50 text-blue-600 border-blue-200",
  Completed: "bg-green-50 text-green-600 border-green-200",
  Canceled: "bg-red-50 text-red-600 border-red-200",
};

const payStatusColors = {
  Paid: "bg-green-50 text-green-600 border-green-200",
  Pending: "bg-yellow-50 text-yellow-600 border-yellow-200",
};

const CabBookingDetail = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filteredBookings = useMemo(() => {
    return dummyBookings.filter((b) => {
      const matchesSearch =
        b.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.roomNumber.toString().includes(searchTerm) ||
        b.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.dropLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.assignedDriverId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.assignedVehicleId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : b.tripStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  return (
    <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 min-h-screen">
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
                  {["All", "Pending", "Accepted", "Completed", "Canceled"].map(
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
            <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Refresh">
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
                  "Booking ID",
                  "Guest Name",
                  "Room/Guest ID",
                  "Pickup Location",
                  "Drop Location",
                  "Date",
                  "Time",
                  "Driver",
                  "Vehicle",
                  "Trip Status",
                  "Distance (KM)",
                  "Total Fare",
                  "Payment Status",
                  "Method",
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
                <tr key={booking.bookingId} className="border-b border-gray-100 text-gray-700 hover:bg-gray-50">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{booking.bookingId}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{booking.guestName}</td>
                  <td className="px-4 py-3">{booking.roomNumber}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1">
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
                      {new Date(booking.bookingDate).toLocaleDateString("en-GB")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={14} />
                      {booking.pickupTime}
                    </span>
                  </td>
                  <td className="px-4 py-3">{booking.assignedDriverId}</td>
                  <td className="px-4 py-3">{booking.assignedVehicleId}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[booking.tripStatus]}`}>
                      {booking.tripStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{booking.distance}</td>
                  <td className="px-4 py-3 text-[#15803D] font-semibold">₹{booking.totalFare}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${payStatusColors[booking.paymentStatus]}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">{booking.paymentMethod}</td>
                  <td className="px-4 py-3 text-gray-600">{booking.notes}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-lg">
                      <button className="text-[#3B82F6] hover:text-[#1D4ED8]" title="View"><IoEyeSharp /></button>
                      <button className="text-[#F59E0B] hover:text-[#D97706]" title="Edit"><FiEdit /></button>
                      <button className="text-[#EF4444] hover:text-[#DC2626]" title="Delete"><RiDeleteBinLine /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={17} className="text-center text-gray-500 py-6 text-sm">No bookings match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between p-4 border-t border-gray-200 text-sm text-gray-600">
          <div>Showing {filteredBookings.length} bookings</div>
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
    </div>
  );
};
export default CabBookingDetail;