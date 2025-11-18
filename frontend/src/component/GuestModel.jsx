import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBooking } from "../Redux/Slice/bookingSlice";

const generateReference = () =>
  `BK${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const GuestModal = ({ onClose, room, onBooked }) => {
  const dispatch = useDispatch();
  const { creating, error } = useSelector((state) => state.booking || {});
  const [activeTab, setActiveTab] = useState("personal");
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    phone: "",
    idNumber: "",
    address: "",
    checkInDate: "",
    checkOutDate: "",
    bookingReference: generateReference(),
    bookingSource: "Direct",
    paymentStatus: "Pending",
    paymentMethod: "Cash",
    totalAmount: room?.price?.base || "",
    notes: "",
  });

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

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!room?.id) return;

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
        bookingSource: formState.bookingSource,
        bookingReference: formState.bookingReference,
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
      await dispatch(createBooking(payload)).unwrap();
      if (onBooked) {
        onBooked(room);
      }
      onClose();
    } catch (err) {
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

              <div className="mt-4">
                <label className="block mb-1 text-sm">Booking Reference</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2 bg-gray-100"
                  value={formState.bookingReference}
                  readOnly
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block mb-1 text-sm">Booking Source</label>
                  <select
                    className="w-full border rounded-lg p-2"
                    value={formState.bookingSource}
                    onChange={handleChange("bookingSource")}
                  >
                    <option value="Direct">Direct</option>
                    <option value="Online">Online</option>
                    <option value="Agent">Agent</option>
                  </select>
                </div>

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
            disabled={creating}
            className={`px-4 py-2 rounded-lg text-white ${
              creating
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {creating ? "Saving..." : "Save Guest Details"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuestModal;
