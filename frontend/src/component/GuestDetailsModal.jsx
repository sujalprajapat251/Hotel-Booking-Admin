import React, { useEffect } from "react";

const STATUS_BADGE_MAP = {
  Confirmed: "bg-primary/40 text-senary",
  CheckedIn: "bg-green-100 text-green-700",
  CheckedOut: "bg-tertiary/40 text-senary",
  Cancelled: "bg-red-100 text-red-700",
  Pending: "bg-secondary/60 text-senary",
  Reserved: "bg-quaternary/40 text-white",
  Occupied: "bg-senary/80 text-primary",
};

const PAYMENT_BADGE_MAP = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-secondary/60 text-senary",
  Overdue: "bg-red-100 text-red-700",
  Refunded: "bg-tertiary/40 text-senary",
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

  useEffect(() => {
    const scrollY = window.scrollY;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-[0_25px_60px_rgba(117,86,71,0.25)] border border-primary/40 backdrop-blur-md scrollbar-hide">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-quaternary to-senary text-white rounded-t-2xl shadow-inner">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <span className="text-white text-xl font-semibold">
              Room {roomNumber} • Guest Details
            </span>
            <span
              className={`px-3 py-1 text-sm rounded-md ${
                STATUS_BADGE_MAP[bookingStatus] || "bg-primary/40 text-senary"
              }`}
            >
              {bookingStatus}
            </span>
            {reservation?.bookingReference && (
              <span className="px-3 py-1 bg-secondary/60 text-senary text-sm rounded-md">
                Ref: {reservation.bookingReference}
              </span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-white text-3xl leading-none hover:text-gray-200 transition-colors"
          >
            ×
          </button>
        </div>

        {loading && (
          <div className="px-6 py-3 bg-primary/20 text-senary text-sm border-b border-primary/40">
            Syncing booking details...
          </div>
        )}

        {!loading && !booking && (
          <div className="px-6 py-3 bg-secondary/30 text-senary text-sm border-b border-primary/40">
            No active booking found for this room.
          </div>
        )}

        {/* BODY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6">
          {/* GUEST INFORMATION */}
          <div className="border border-primary/40 rounded-lg p-4 bg-white/50 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 border-l-4 border-senary pl-2 text-senary">
              Guest Information
            </h3>
            <InfoItem label="Full Name" value={guest.fullName} />
            <InfoItem label="Address" value={guest.address} />
            <InfoItem label="Phone Number" value={guest.phone} />
            <InfoItem label="Email Address" value={guest.email} />
            <InfoItem label="ID Number" value={guest.idNumber} />
            <InfoItem label="Nationality" value={guest.nationality} />
          </div>

          {/* RESERVATION DETAILS */}
          <div className="border border-primary/40 rounded-lg p-4 bg-white/50 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 border-l-4 border-senary pl-2 text-senary">
              Reservation Details
            </h3>
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
                PAYMENT_BADGE_MAP[payment.status] || "bg-primary/40 text-senary"
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
          <div className="border border-primary/40 rounded-lg p-4 bg-white/50 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 border-l-4 border-senary pl-2 text-senary">
              Room Details
            </h3>
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
              textColor="text-quaternary"
            />
            <InfoItem label="Floor" value={activeRoom?.floor} />
            <InfoItem
              label="Housekeeping Status"
              value={housekeepingStatus}
              badgeColor={
                STATUS_BADGE_MAP[housekeepingStatus] || "bg-primary/40 text-senary"
              }
            />

            {!!amenities.length && (
              <>
                <h4 className="mt-4 mb-2 font-semibold text-lg text-senary">Room Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-3 py-1 bg-primary/40 text-senary rounded-md text-sm"
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
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-6 py-4 border-t border-primary/40 bg-primary/10">
          <span className="text-quinary text-sm">
            Last updated: {formatDateTime(lastUpdated)}
          </span>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCheckOut}
              disabled={actionDisabled}
              className={`px-5 py-2 rounded-lg text-white transition shadow-sm ${
                actionDisabled 
                  ? "bg-quaternary/40 cursor-not-allowed" 
                  : "bg-green-600 hover:bg-green-700 shadow-lg"
              }`}
            >
              {loading ? "Processing..." : "Check Out"}
            </button>
            <button
              onClick={handleCancelRoom}
              disabled={actionDisabled}
              className={`px-5 py-2 rounded-lg text-white transition shadow-sm ${
                actionDisabled 
                  ? "bg-quaternary/40 cursor-not-allowed" 
                  : "bg-red-500 hover:bg-red-600 shadow-lg"
              }`}
            >
              {loading ? "Please wait..." : "Cancel Room"}
            </button>
            <button 
              onClick={onClose} 
              className="px-5 py-2 bg-secondary/40 text-quinary hover:bg-secondary/60 rounded-lg transition shadow-sm"
            >
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
function InfoItem({ label, value, textColor = "text-senary", badgeColor }) {
  const displayValue = value ?? "—";

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase text-quinary/70">{label}</p>

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
