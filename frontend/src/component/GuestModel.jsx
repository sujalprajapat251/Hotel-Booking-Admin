import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBooking } from "../Redux/Slice/bookingSlice";
import { createCabBooking } from "../Redux/Slice/cabBookingSlice";

const GuestModal = ({ onClose, room, onBooked }) => {
  const dispatch = useDispatch();
  const { creating, error } = useSelector((state) => state.booking || {});
  const { loading: cabBookingLoading } = useSelector((state) => state.cabBooking || {});
  const [activeTab, setActiveTab] = useState("personal");
  const [cabServiceEnabled, setCabServiceEnabled] = useState(false);
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    phone: "",
    idNumber: "",
    address: "",
    checkInDate: "",
    checkOutDate: "",
    paymentStatus: "Pending",
    paymentMethod: "Cash",
    totalAmount: room?.price?.base || "",
    notes: "",
    // Cab booking fields
    pickUpLocation: "Airport",
    pickUpTime: "",
    bookingDate: "",
    preferredSeatingCapacity: "4",
    estimatedDistance: "",
    estimatedFare: "",
    specialInstructions: "",
    cabNotes: "",
  });

  const CAB_FARE_RATE = 20; // Set your rate per km

  // Automatically update estimated fare when distance changes
  useEffect(() => {
    if (cabServiceEnabled && formState.estimatedDistance) {
      const fare = parseFloat(formState.estimatedDistance) * CAB_FARE_RATE;
      setFormState((prev) => ({
        ...prev,
        estimatedFare: fare ? fare.toFixed(2) : "",
      }));
    } else if (!formState.estimatedDistance) {
      setFormState((prev) => ({
        ...prev,
        estimatedFare: "",
      }));
    }
  }, [formState.estimatedDistance, cabServiceEnabled]);

  console.log(room,"room");

  const roomSummary = useMemo(() => {
    if (!room) return null;
    const bed = room?.bed?.mainBed?.type ? `${room.bed.mainBed.type} bed` : null;
    const capacity =
      (room?.capacity?.adults || 0) + (room?.capacity?.children || 0);
    return {
      label: `Room ${room.roomNumber}`,
      type: room.roomType?.roomType || "Room",
      bed,
      capacity,
      price: room?.price?.base,
    };
  }, [room]);

  // Auto-set booking date and pick-up time when check-in date changes (if cab service is enabled)
  useEffect(() => {
    if (cabServiceEnabled && formState.checkInDate) {
      setFormState((prev) => ({
        ...prev,
        bookingDate: prev.bookingDate || prev.checkInDate,
        pickUpTime: prev.pickUpTime || (prev.checkInDate ? `${prev.checkInDate}T10:00` : ""),
      }));
    }
  }, [formState.checkInDate, cabServiceEnabled]);

  const handleChange = (field) => (event) => {
    const { value, type, checked } = event.target;
    if (type === "checkbox") {
      setCabServiceEnabled(checked);
      // Reset cab booking fields when unchecked
      if (!checked) {
        setFormState((prev) => ({
          ...prev,
          pickUpLocation: "Airport",
          pickUpTime: "",
          bookingDate: "",
          preferredSeatingCapacity: "4",
          estimatedDistance: "",
          estimatedFare: "",
          specialInstructions: "",
          cabNotes: "",
        }));
      } else {
        // Auto-set booking date and pick-up time when enabling cab service
        setFormState((prev) => ({
          ...prev,
          bookingDate: prev.bookingDate || prev.checkInDate || "",
          pickUpTime: prev.pickUpTime || (prev.checkInDate ? `${prev.checkInDate}T10:00` : ""),
        }));
      }
    } else {
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!room?.id) return;

    // Validate cab booking fields if cab service is enabled
    if (cabServiceEnabled) {
      if (!formState.pickUpLocation) {
        alert("Please select a pick-up location for cab service");
        setActiveTab("reservation");
        return;
      }
      if (!formState.pickUpTime) {
        alert("Please select a pick-up time for cab service");
        setActiveTab("reservation");
        return;
      }
      if (!formState.preferredSeatingCapacity) {
        alert("Please select a seating capacity for cab service");
        setActiveTab("reservation");
        return;
      }
    }

    const payload = {
      roomId: room.id,
      guest: {
        fullName: formState.fullName,
        email: formState.email,
        phone: formState.phone,
        idNumber: formState.idNumber,
        address: formState.address,
      },
      reservation: {
        checkInDate: formState.checkInDate,
        checkOutDate: formState.checkOutDate,
        occupancy: {
          adults: room?.capacity?.adults || 1,
          children: room?.capacity?.children || 0,
        },
      },
      payment: {
        status: formState.paymentStatus,
        totalAmount: Number(formState.totalAmount || room?.price?.base || 0),
        method: formState.paymentMethod,
      },
      status: "Confirmed",
      notes: formState.notes,
    };

    try {
      const bookingResult = await dispatch(createBooking(payload)).unwrap();
      
      // Create cab booking if cab service is enabled
      if (cabServiceEnabled) {
        // Use id or _id (backend returns id from formatBooking function)
        const bookingId = bookingResult?.id || bookingResult?._id;
        
        if (!bookingId) {
          console.error("Booking ID not found in result:", bookingResult);
          throw new Error("Failed to get booking ID for cab booking");
        }

        // Validate required cab booking fields
        if (!formState.pickUpLocation) {
          throw new Error("Pick-up location is required for cab booking");
        }
        if (!formState.pickUpTime) {
          throw new Error("Pick-up time is required for cab booking");
        }

        const cabBookingPayload = {
          bookingId: bookingId,
          pickUpLocation: formState.pickUpLocation,
          pickUpTime: formState.pickUpTime,
          bookingDate: formState.bookingDate || formState.checkInDate || new Date().toISOString().split('T')[0],
          preferredSeatingCapacity: formState.preferredSeatingCapacity || "4",
          estimatedDistance: formState.estimatedDistance ? Number(formState.estimatedDistance) : null,
          estimatedFare: formState.estimatedFare ? Number(formState.estimatedFare) : null,
          specialInstructions: formState.specialInstructions || "",
          notes: formState.cabNotes || "",
        };
        
        console.log("Creating cab booking with payload:", cabBookingPayload);
        await dispatch(createCabBooking(cabBookingPayload)).unwrap();
      }
      
      if (onBooked) {
        onBooked(room);
      }
      onClose();
    } catch (err) {
      console.error("Error creating booking or cab booking:", err);
      setActiveTab("personal");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        className="bg-white w-[70%] max-h-[90vh] rounded-xl overflow-y-auto shadow-lg"
        onSubmit={handleSubmit}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-green-600 text-white rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold">Add New Guest</h2>
            {roomSummary && (
              <p className="text-sm text-green-100">
                {roomSummary.label} • {roomSummary.type}
                {roomSummary.bed ? ` • ${roomSummary.bed}` : ""} • Sleeps{" "}
                {roomSummary.capacity}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-3xl leading-none hover:text-gray-200"
          >
            ×
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b bg-gray-100">
          <button
            type="button"
            className={`flex-1 text-center py-3 font-medium ${
              activeTab === "personal"
                ? "border-b-4 border-green-600 bg-white"
                : "hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("personal")}
          >
            Personal Information
          </button>

          <button
            type="button"
            className={`flex-1 text-center py-3 font-medium ${
              activeTab === "reservation"
                ? "border-b-4 border-green-600 bg-white"
                : "hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("reservation")}
          >
            Reservation Details
          </button>
        </div>

        {/* ALERT */}
        {error && (
          <div className="px-6 py-3 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          {/* PERSONAL TAB */}
          {activeTab === "personal" && (
            <div>
              <h3 className="text-lg font-semibold border-l-4 border-green-600 pl-2 mb-4">
                Personal Details
              </h3>

              <div className="mb-4">
                <label className="block mb-1 text-sm">Full Name*</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  placeholder="Enter full name"
                  required
                  value={formState.fullName}
                  onChange={handleChange("fullName")}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 text-sm">Email Address</label>
                <input
                  type="email"
                  className="w-full border rounded-lg p-2"
                  placeholder="Enter email"
                  value={formState.email}
                  onChange={handleChange("email")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1 text-sm">Phone Number*</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2"
                    placeholder="Enter phone number"
                    required
                    value={formState.phone}
                    onChange={handleChange("phone")}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm">ID Number</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2"
                    placeholder="ID number"
                    value={formState.idNumber}
                    onChange={handleChange("idNumber")}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm">Address*</label>
                <textarea
                  className="w-full border rounded-lg p-2 h-24"
                  placeholder="Enter address"
                  required
                  value={formState.address}
                  onChange={handleChange("address")}
                ></textarea>
              </div>
            </div>
          )}

          {/* RESERVATION TAB */}
          {activeTab === "reservation" && (
            <div>
              <h3 className="text-lg font-semibold border-l-4 border-green-600 pl-2 mb-4">
                Booking Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm">Check-in Date*</label>
                  <input
                    type="date"
                    className="w-full border rounded-lg p-2"
                    required
                    value={formState.checkInDate}
                    onChange={handleChange("checkInDate")}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm">Check-out Date*</label>
                  <input
                    type="date"
                    className="w-full border rounded-lg p-2"
                    required
                    value={formState.checkOutDate}
                    onChange={handleChange("checkOutDate")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block mb-1 text-sm">Payment Status</label>
                  <select
                    className="w-full border rounded-lg p-2"
                    value={formState.paymentStatus}
                    onChange={handleChange("paymentStatus")}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>

              {/* Cab Service Checkbox */}
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cabServiceEnabled}
                    onChange={handleChange("cabService")}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Add Cab Service
                  </span>
                </label>
              </div>

              {/* Cab Booking Details - Show only if checkbox is checked */}
              {cabServiceEnabled && (
                <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                  <h4 className="text-md font-semibold border-l-4 border-blue-600 pl-2 mb-4">
                    Cab Booking Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm">Pick-up Location*</label>
                      <select
                        className="w-full border rounded-lg p-2"
                        required={cabServiceEnabled}
                        value={formState.pickUpLocation}
                        onChange={handleChange("pickUpLocation")}
                      >
                        <option value="Airport">Airport</option>
                        <option value="Railway Station">Railway Station</option>
                        <option value="Bus Station">Bus Station</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm">Pick-up Time*</label>
                      <input
                        type="datetime-local"
                        className="w-full border rounded-lg p-2"
                        required={cabServiceEnabled}
                        value={formState.pickUpTime}
                        onChange={handleChange("pickUpTime")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block mb-1 text-sm">Seating Capacity*</label>
                      <select
                        className="w-full border rounded-lg p-2"
                        required={cabServiceEnabled}
                        value={formState.preferredSeatingCapacity}
                        onChange={handleChange("preferredSeatingCapacity")}
                      >
                        <option value="4">4 Seater</option>
                        <option value="5">5 Seater</option>
                        <option value="6">6 Seater</option>
                        <option value="7">7 Seater</option>
                        <option value="8">8 Seater</option>
                        <option value="9">9 Seater</option>
                        <option value="10+">10+ Seater</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        A cab with matching or higher capacity will be automatically assigned
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block mb-1 text-sm">Booking Date</label>
                      <input
                        type="date"
                        className="w-full border rounded-lg p-2"
                        value={formState.bookingDate}
                        onChange={handleChange("bookingDate")}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm">Estimated Distance (km)</label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-2"
                        placeholder="0"
                        min="0"
                        step="0.1"
                        value={formState.estimatedDistance}
                        onChange={handleChange("estimatedDistance")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block mb-1 text-sm">Estimated Fare</label>
                      <input
                        type="number"
                        className="w-full border rounded-lg p-2"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={formState.estimatedFare}
                        readOnly // Make field read-only so it cannot be edited by user
                        onChange={handleChange("estimatedFare")}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block mb-1 text-sm">Special Instructions</label>
                    <textarea
                      className="w-full border rounded-lg p-2 h-20"
                      placeholder="Any special instructions for the driver"
                      value={formState.specialInstructions}
                      onChange={handleChange("specialInstructions")}
                    ></textarea>
                  </div>

                  <div className="mt-4">
                    <label className="block mb-1 text-sm">Cab Booking Notes</label>
                    <textarea
                      className="w-full border rounded-lg p-2 h-20"
                      placeholder="Additional notes for cab booking"
                      value={formState.cabNotes}
                      onChange={handleChange("cabNotes")}
                    ></textarea>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block mb-1 text-sm">Payment Method</label>
                  <select
                    className="w-full border rounded-lg p-2"
                    value={formState.paymentMethod}
                    onChange={handleChange("paymentMethod")}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm">Total Amount*</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg p-2"
                    placeholder="0.00"
                    required
                    min="0"
                    value={formState.totalAmount}
                    onChange={handleChange("totalAmount")}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block mb-1 text-sm">Notes</label>
                <textarea
                  className="w-full border rounded-lg p-2 h-20"
                  placeholder="Special requests or notes"
                  value={formState.notes}
                  onChange={handleChange("notes")}
                ></textarea>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-4 p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={creating || cabBookingLoading}
            className={`px-4 py-2 rounded-lg text-white ${
              creating || cabBookingLoading
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {creating || cabBookingLoading ? "Saving..." : "Save Guest Details"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuestModal;
