import React, { useMemo, useState } from "react";
import { FiPlusCircle, FiEdit } from "react-icons/fi";
import { IoEyeSharp } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";
import { Search, Filter, Download, RefreshCw, Star, MapPin, Phone } from "lucide-react";

const dummyDrivers = [
  {
    driverId: "DRV-001",
    profileImage:
      "https://randomuser.me/api/portraits/men/65.jpg",
    driverName: "Ramesh Patel",
    phoneNumber: "9876543210",
    licenseNumber: "GJ06-2021223344",
    licenseExpiry: "2025-12-30",
    assignedVehicleId: "CAB-002",
    rating: 4.7,
    status: "Available",
    emergencyContact: "9876512345",
    address: "Vasna, Ahmedabad",
  },
  {
    driverId: "DRV-002",
    profileImage:
      "https://randomuser.me/api/portraits/men/12.jpg",
    driverName: "Suresh Kumar",
    phoneNumber: "9876500122",
    licenseNumber: "DL11-9988773412",
    licenseExpiry: "2024-06-15",
    assignedVehicleId: "CAB-001",
    rating: 4.3,
    status: "On Trip",
    emergencyContact: "7523987432",
    address: "Dwarka, New Delhi",
  },
  {
    driverId: "DRV-003",
    profileImage:
      "https://randomuser.me/api/portraits/women/44.jpg",
    driverName: "Maya Bhosle",
    phoneNumber: "9765432189",
    licenseNumber: "MH02-8811992277",
    licenseExpiry: "2027-02-09",
    assignedVehicleId: "CAB-003",
    rating: 5.0,
    status: "Leave",
    emergencyContact: "9543221188",
    address: "Pimpri, Pune",
  },
  {
    driverId: "DRV-004",
    profileImage:
      "https://randomuser.me/api/portraits/men/24.jpg",
    driverName: "Harish Singh",
    phoneNumber: "9012563288",
    licenseNumber: "UP56-9988994422",
    licenseExpiry: "2024-10-11",
    assignedVehicleId: "CAB-005",
    rating: 3.8,
    status: "Available",
    emergencyContact: "9456123456",
    address: "Gomti Nagar, Lucknow",
  },
  {
    driverId: "DRV-005",
    profileImage:
      "https://randomuser.me/api/portraits/women/68.jpg",
    driverName: "Jyoti Vishwakarma",
    phoneNumber: "9900112233",
    licenseNumber: "KA41-5511883344",
    licenseExpiry: "2029-07-26",
    assignedVehicleId: "CAB-004",
    rating: 4.9,
    status: "On Trip",
    emergencyContact: "9988772233",
    address: "BTM Layout, Bangalore",
  },
];

const statusColors = {
  Available: "bg-green-50 text-green-600 border-green-200",
  "On Trip": "bg-blue-50 text-blue-600 border-blue-200",
  Leave: "bg-yellow-50 text-yellow-600 border-yellow-200",
};

const DriverDetails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filteredDrivers = useMemo(() => {
    return dummyDrivers.filter((d) => {
      const matchesSearch =
        d.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.driverId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phoneNumber.includes(searchTerm) ||
        d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.assignedVehicleId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" ? true : d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    return (
      <span className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} size={16} fill="#fbbf24" className="text-yellow-400" />
        ))}
        {halfStar && <Star size={16} fill="#fde68a" className="text-yellow-300" />}
        <span className="ml-1 text-xs text-gray-600 font-medium">{rating.toFixed(1)}</span>
      </span>
    );
  };

  return (
    <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 min-h-screen">
      <section className="py-5">
        <h1 className="text-2xl font-semibold text-black">All Drivers</h1>
      </section>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col gap-3 md600:flex-row md600:items-center md600:justify-between p-4 border-b border-gray-200">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <p className="text-[16px] font-semibold text-gray-800">Driver Details</p>
            <div className="relative max-w-md w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search driver, ID, phone, vehicle..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982]"
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-1 justify-end">
            <button
              className="p-2 text-[#4CAF50] hover:bg-[#4CAF50]/10 rounded-lg transition-colors"
              title="Add Driver"
            >
              <FiPlusCircle size={20} />
            </button>
            <div className="relative">
              <button
                className="p-2 text-[#6A4DFF] hover:bg-[#6A4DFF]/10 rounded-lg transition-colors"
                title="Filter Status"
                onClick={() => setShowFilterMenu((prev) => !prev)}
              >
                <Filter size={20} />
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {["All", "Available", "On Trip", "Leave"].map((status) => (
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
                  ))}
                </div>
              )}
            </div>
            <button
              className="p-2 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
            <button
              className="p-2 text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-lg transition-colors"
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
                  "Driver ID",
                  "Photo",
                  "Name",
                  "Phone",
                  "License #",
                  "Expiry",
                  "Assigned Cab",
                  "Rating",
                  "Status",
                  "Emergency Contact",
                  "Address",
                  "Action",
                ].map((header) => (
                  <th key={header} className="px-4 py-3 whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver, idx) => (
                <tr
                  key={driver.driverId}
                  className="border-b border-gray-100 text-gray-700 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {driver.driverId}
                  </td>
                  <td className="px-4 py-3">
                    <img
                      src={driver.profileImage}
                      alt={driver.driverName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#E3C78A]"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {driver.driverName}
                  </td>
                  <td className="px-4 py-3 text-green-600">
                    <span className="inline-flex items-center gap-1">
                      <Phone size={14} className="inline-block" />
                      {driver.phoneNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {driver.licenseNumber}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(driver.licenseExpiry).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3">{driver.assignedVehicleId}</td>
                  <td className="px-4 py-3">{renderRatingStars(driver.rating)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[driver.status]}`}
                    >
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{driver.emergencyContact}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} className="text-orange-600" />
                      {driver.address}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-lg">
                      <button className="text-[#3B82F6] hover:text-[#1D4ED8]" title="View">
                        <IoEyeSharp />
                      </button>
                      <button className="text-[#F59E0B] hover:text-[#D97706]" title="Edit">
                        <FiEdit />
                      </button>
                      <button className="text-[#EF4444] hover:text-[#DC2626]" title="Delete">
                        <RiDeleteBinLine />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDrivers.length === 0 && (
                <tr>
                  <td
                    colSpan={13}
                    className="text-center text-gray-500 py-6 text-sm"
                  >
                    No drivers match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between p-4 border-t border-gray-200 text-sm text-gray-600">
          <div>Showing {filteredDrivers.length} drivers</div>
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

export default DriverDetails;