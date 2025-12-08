const Staff = require("../models/staffModel");
const CabBooking = require("../models/cabBookingModel");

const ACTIVE_BOOKING_STATUSES = ["Pending", "Confirmed", "Assigned", "InProgress"];

const normalizeIds = (ids = []) =>
    ids
        .filter(Boolean)
        .map((value) => value.toString());

const buildBaseAvailabilityQuery = (excludeDriverIds = []) => {
    const query = { 
        designation: "Driver",
        status: "Available" 
    };

    if (excludeDriverIds.length) {
        query._id = { $nin: excludeDriverIds };
    }

    return query;
};


const findAvailableDriver = async ({ preferredCabId = null, excludeDriverIds = [] } = {}) => {
    const normalizedExcludeIds = normalizeIds(excludeDriverIds);
    const baseQuery = buildBaseAvailabilityQuery(normalizedExcludeIds);

    if (preferredCabId) {
        const cabMatchedDriver = await Staff.findOne({
            ...baseQuery,
            AssignedCab: preferredCabId
        }).sort({ updatedAt: 1 });

        if (cabMatchedDriver) {
            return cabMatchedDriver;
        }
    }

    return Staff.findOne(baseQuery).sort({ updatedAt: 1 });
};


const reassignBookingsForDriver = async (driverId) => {
    if (!driverId) return;

    const activeBookings = await CabBooking.find({
        assignedDriver: driverId,
        status: { $in: ACTIVE_BOOKING_STATUSES }
    });

    for (const booking of activeBookings) {
        const replacementDriver = await findAvailableDriver({
            preferredCabId: booking.assignedCab,
            excludeDriverIds: [driverId]
        });

        if (replacementDriver) {
            booking.assignedDriver = replacementDriver._id;
        } else {
            booking.assignedDriver = null;
        }

        await booking.save();
    }
};

/**
 * Assigns drivers to cab bookings that have a cab but no driver assigned.
 * This is useful for fixing existing bookings or as a maintenance task.
 */
const assignDriversToUnassignedBookings = async () => {
    const unassignedBookings = await CabBooking.find({
        assignedCab: { $ne: null },
        assignedDriver: null,
        status: { $in: ACTIVE_BOOKING_STATUSES }
    });

    let assignedCount = 0;
    for (const booking of unassignedBookings) {
        const driver = await findAvailableDriver({
            preferredCabId: booking.assignedCab
        });

        if (driver) {
            booking.assignedDriver = driver._id;
            // Update status to "Assigned" if both cab and driver are now assigned
            if (booking.status === "Pending" || booking.status === "Confirmed") {
                booking.status = "Assigned";
            }
            await booking.save();
            assignedCount++;
        }
    }

    return {
        total: unassignedBookings.length,
        assigned: assignedCount,
        unassigned: unassignedBookings.length - assignedCount
    };
};

module.exports = {
    ACTIVE_BOOKING_STATUSES,
    findAvailableDriver,
    reassignBookingsForDriver,
    assignDriversToUnassignedBookings
};

