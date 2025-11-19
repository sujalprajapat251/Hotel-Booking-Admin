import React from "react";

const STATUS_BADGE_MAP = {
  Confirmed: "bg-blue-100 text-blue-700",
  CheckedIn: "bg-green-100 text-green-700",
  CheckedOut: "bg-gray-200 text-gray-700",
  Cancelled: "bg-red-100 text-red-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Reserved: "bg-indigo-100 text-indigo-700",
  Occupied: "bg-purple-100 text-purple-700",
};

const PAYMENT_BADGE_MAP = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Overdue: "bg-red-100 text-red-700",
  Refunded: "bg-gray-100 text-gray-700",
};

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

const formatCurrency = (value, currency = "USD") => {
  if (value === undefined || value === null || value === "") return "—";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
    numeric
  );
};

function GuestDetailsModal({
  room,
  booking,
  loading = false,
  onClose,
  onCheckOut,
  onCancelRoom,
}) {
  if (!room && !booking) return null;

  const activeRoom = room || booking?.room || {};
  const guest = booking?.guest || {};
  const reservation = booking?.reservation || {};
  const payment = booking?.payment || {};
  const roomNumber = activeRoom?.roomNumber || booking?.roomNumber || "—";
  const bookingStatus = booking?.status || activeRoom?.status || "Unknown";
  const housekeepingStatus = activeRoom?.status || "Unknown";

  const occupancyText = reservation?.occupancy
    ? `${reservation.occupancy.adults ?? 0} Adults${
        reservation.occupancy.children
          ? `, ${reservation.occupancy.children} Children`
          : ""
      }`
    : activeRoom?.capacity
    ? `${activeRoom.capacity.adults ?? 0} Adults${
        activeRoom.capacity.children
          ? `, ${activeRoom.capacity.children} Children`
          : ""
      }`
    : "—";

  const roomType =
    activeRoom?.roomType?.roomType ||
    activeRoom?.roomType?.name ||
    activeRoom?.roomType ||
    "—";

  const bedConfiguration = activeRoom?.bed?.mainBed?.type
    ? `${activeRoom.bed.mainBed.type} Bed`
    : activeRoom?.bed?.type || "—";

  const amenitiesSource = Array.isArray(activeRoom?.features)
    ? activeRoom.features
    : Array.isArray(activeRoom?.amenities)
    ? activeRoom.amenities
    : [];

  const amenities = amenitiesSource
    .map((item) => {
      if (typeof item === "string") return item;
      if (item?.feature) return item.feature;
      if (item?.name) return item.name;
      return null;
    })
    .filter(Boolean);

  const lastUpdated = booking?.updatedAt || activeRoom?.updatedAt;
  const actionDisabled = !booking || loading;

  const handleCheckOut = () => {
    if (actionDisabled || !onCheckOut) return;
    const confirmed = window.confirm(
      "Mark this booking as checked out? This will free up the room."
    );
    if (!confirmed) return;
    onCheckOut();
  };

  const handleCancelRoom = () => {
    if (actionDisabled || !onCancelRoom) return;
    const confirmed = window.confirm(
      "Cancel this booking and return the room to inventory?"
    );
    if (!confirmed) return;
    onCancelRoom();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-purple-500 to-indigo-500 rounded-t-xl">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <span className="text-white text-xl font-semibold">
              Room {roomNumber} • Guest Details
            </span>
            <span
              className={`px-3 py-1 text-sm rounded-md ${
                STATUS_BADGE_MAP[bookingStatus] || "bg-gray-100 text-gray-700"
              }`}
            >
              {bookingStatus}
            </span>
            {reservation?.bookingReference && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-md">
                Ref: {reservation.bookingReference}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-white text-xl">
            ✕
          </button>
        </div>

        {loading && (
          <div className="px-6 py-3 bg-blue-50 text-blue-700 text-sm">
            Syncing booking details...
          </div>
        )}

        {!loading && !booking && (
          <div className="px-6 py-3 bg-yellow-50 text-yellow-700 text-sm">
            No active booking found for this room.
          </div>
        )}

        {/* BODY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6">
          {/* GUEST INFORMATION */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-bold mb-3 text-green-600">Guest Information</h3>
            <InfoItem label="Full Name" value={guest.fullName} />
            <InfoItem label="Address" value={guest.address} />
            <InfoItem label="Phone Number" value={guest.phone} />
            <InfoItem label="Email Address" value={guest.email} />
            <InfoItem label="ID Number" value={guest.idNumber} />
            <InfoItem label="Nationality" value={guest.nationality} />
          </div>

          {/* RESERVATION DETAILS */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-bold mb-3 text-blue-600">Reservation Details</h3>
            <InfoItem
              label="Check-In Date"
              value={formatDateTime(reservation.checkInDate)}
            />
            <InfoItem
              label="Check-Out Date"
              value={formatDateTime(reservation.checkOutDate)}
            />
            <InfoItem label="Booking Source" value={reservation.bookingSource} />
            <InfoItem
              label="Payment Status"
              value={payment.status}
              badgeColor={
                PAYMENT_BADGE_MAP[payment.status] || "bg-gray-100 text-gray-700"
              }
            />
            <InfoItem
              label="Total Amount"
              value={formatCurrency(payment.totalAmount, payment.currency)}
              textColor="text-green-600"
            />
            <InfoItem label="Notes" value={booking?.notes} />
          </div>

          {/* ROOM DETAILS */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-bold mb-3 text-orange-600">Room Details</h3>
            <InfoItem label="Room Type" value={roomType} />
            <InfoItem label="Bed Configuration" value={bedConfiguration} />
            <InfoItem label="Current Occupancy" value={occupancyText} />
            <InfoItem
              label="Room Rate"
              value={
                activeRoom?.price?.base
                  ? `${formatCurrency(activeRoom.price.base, payment.currency)}/night`
                  : formatCurrency(payment.totalAmount, payment.currency)
              }
              textColor="text-orange-600"
            />
            <InfoItem label="Floor" value={activeRoom?.floor} />
            <InfoItem
              label="Housekeeping Status"
              value={housekeepingStatus}
              badgeColor={
                STATUS_BADGE_MAP[housekeepingStatus] || "bg-gray-100 text-gray-700"
              }
            />

            {!!amenities.length && (
              <>
                <h4 className="mt-4 mb-2 font-semibold text-lg">Room Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-6 py-4 border-t bg-gray-50">
          <span className="text-gray-600 text-sm">
            Last updated: {formatDateTime(lastUpdated)}
          </span>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCheckOut}
              disabled={actionDisabled}
              className={`px-5 py-2 rounded-md text-white ${
                actionDisabled ? "bg-green-300 cursor-not-allowed" : "bg-green-600"
              }`}
            >
              {loading ? "Processing..." : "Check Out"}
            </button>
            <button
              onClick={handleCancelRoom}
              disabled={actionDisabled}
              className={`px-5 py-2 rounded-md text-white ${
                actionDisabled ? "bg-red-300 cursor-not-allowed" : "bg-red-500"
              }`}
            >
              {loading ? "Please wait..." : "Cancel Room"}
            </button>
            <button onClick={onClose} className="px-5 py-2 bg-gray-200 rounded-md">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestDetailsModal;

/* Reusable Component for Details */
function InfoItem({ label, value, textColor = "text-gray-800", badgeColor }) {
  const displayValue = value ?? "—";

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>

      {badgeColor ? (
        <span
          className={`px-3 py-1 text-sm rounded-md inline-block mt-1 ${badgeColor}`}
        >
          {displayValue}
        </span>
      ) : (
        <p className={`text-sm font-semibold mt-1 ${textColor}`}>{displayValue}</p>
      )}
    </div>
  );
}
