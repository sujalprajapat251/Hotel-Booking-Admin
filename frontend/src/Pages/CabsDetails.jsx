import React, { useMemo, useState } from "react";
import { FiPlusCircle, FiEdit } from "react-icons/fi";
import { IoEyeSharp } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";
import { Search, Filter, Download, RefreshCw } from "lucide-react";

const vehicleInventory = [
  {
    vehicleId: "CAB-001",
    vehicleType: "Sedan",
    modelName: "Honda City ZX",
    registrationNumber: "GJ 01 AB 4521",
    seatingCapacity: 4,
    status: "Available",
    fuelType: "Petrol",
    driverAssigned: "Yes",
    perKmCharge: 18,
    baseFare: 250,
    documents: "RC, Insurance, PUC",
    description: "Premium sedan with leather seats and dual airbags.",
  },
  {
    vehicleId: "CAB-002",
    vehicleType: "SUV",
    modelName: "Toyota Innova Crysta",
    registrationNumber: "GJ 05 CD 9810",
    seatingCapacity: 6,
    status: "On Trip",
    fuelType: "Diesel",
    driverAssigned: "Yes",
    perKmCharge: 22,
    baseFare: 400,
    documents: "RC, Insurance, Fitness",
    description: "Spacious SUV ideal for family airport transfers.",
  },
  {
    vehicleId: "CAB-003",
    vehicleType: "Mini",
    modelName: "Suzuki Wagon R",
    registrationNumber: "MH 12 XY 3232",
    seatingCapacity: 4,
    status: "Maintenance",
    fuelType: "CNG",
    driverAssigned: "No",
    perKmCharge: 14,
    baseFare: 180,
    documents: "RC, PUC",
    description: "Budget friendly mini cab with excellent mileage.",
  },
  {
    vehicleId: "CAB-004",
    vehicleType: "Luxury",
    modelName: "Mercedes E-Class",
    registrationNumber: "DL 01 CC 1122",
    seatingCapacity: 4,
    status: "Available",
    fuelType: "Petrol",
    driverAssigned: "Yes",
    perKmCharge: 45,
    baseFare: 1200,
    documents: "RC, Insurance, Chauffeur License",
    description: "Executive transport with complimentary refreshments.",
  },
  {
    vehicleId: "CAB-005",
    vehicleType: "SUV",
    modelName: "Mahindra XUV700",
    registrationNumber: "RJ 14 MN 6754",
    seatingCapacity: 6,
    status: "Available",
    fuelType: "Diesel",
    driverAssigned: "No",
    perKmCharge: 24,
    baseFare: 420,
    documents: "RC, Insurance, PUC, Fitness",
    description: "Latest connected SUV with panoramic sunroof.",
  },
  {
    vehicleId: "CAB-006",
    vehicleType: "Electric",
    modelName: "Tata Nexon EV",
    registrationNumber: "KA 03 EV 9988",
    seatingCapacity: 4,
    status: "On Trip",
    fuelType: "Electric",
    driverAssigned: "Yes",
    perKmCharge: 20,
    baseFare: 300,
    documents: "RC, Insurance, Charging Log",
    description: "Zero-emission city rides with fast charging support.",
  },
];

const statusColors = {
  Available: "bg-green-50 text-green-600 border-green-200",
  "On Trip": "bg-blue-50 text-blue-600 border-blue-200",
  Maintenance: "bg-yellow-50 text-yellow-600 border-yellow-200",
};

const CabsDetails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filteredVehicles = useMemo(() => {
    return vehicleInventory.filter((vehicle) => {
      const matchesSearch =
        vehicle.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.registrationNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : vehicle.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

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
                  "Vehicle ID",
                  "Vehicle Type",
                  "Model Name",
                  "Registration No.",
                  "Seats",
                  "Status",
                  "Fuel Type",
                  "Driver Assigned",
                  "Per km Charge",
                  "Base Fare",
                  "Documents",
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
                  key={vehicle.vehicleId}
                  className="border-b border-gray-100 text-gray-700 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {vehicle.vehicleId}
                  </td>
                  <td className="px-4 py-3">{vehicle.vehicleType}</td>
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
                  <td className="px-4 py-3">{vehicle.driverAssigned}</td>
                  <td className="px-4 py-3 text-gray-900 font-semibold">
                    ₹{vehicle.perKmCharge}/km
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-semibold">
                    ₹{vehicle.baseFare}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vehicle.documents}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {vehicle.description}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-lg">
                      <button
                        className="text-[#3B82F6] hover:text-[#1D4ED8] text-quaternary"
                        title="View"
                      >
                        <IoEyeSharp />
                      </button>
                      <button
                        className="text-[#F59E0B] hover:text-[#D97706]"
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="text-[#EF4444] hover:text-[#DC2626]"
                        title="Delete"
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
                    colSpan={14}
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
    </div>
  );
};

export default CabsDetails;
