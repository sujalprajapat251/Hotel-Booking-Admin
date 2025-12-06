const Driver = require("../models/driverModel");
const CabBooking = require("../models/cabBookingModel");

const ACTIVE_BOOKING_STATUSES = ["Pending", "Confirmed", "Assigned", "InProgress"];

const normalizeIds = (ids = []) =>
    ids
        .filter(Boolean)
        .map((value) => value.toString());

const buildBaseAvailabilityQuery = (excludeDriverIds = []) => {
    const query = { status: "Available" };

    if (excludeDriverIds.length) {
        query._id = { $nin: excludeDriverIds };
    }

    return query;
};


const findAvailableDriver = async ({ preferredCabId = null, excludeDriverIds = [] } = {}) => {
    const normalizedExcludeIds = normalizeIds(excludeDriverIds);
    const baseQuery = buildBaseAvailabilityQuery(normalizedExcludeIds);

    if (preferredCabId) {
        const cabMatchedDriver = await Driver.findOne({
            ...baseQuery,
            AssignedCab: preferredCabId
        }).sort({ updatedAt: 1 });

        if (cabMatchedDriver) {
            return cabMatchedDriver;
        }
    }

    return Driver.findOne(baseQuery).sort({ updatedAt: 1 });
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

module.exports = {
    ACTIVE_BOOKING_STATUSES,
    findAvailableDriver,
    reassignBookingsForDriver
};

