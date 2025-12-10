const Room = require('../models/createRoomModel');
const RoomType = require('../models/roomtypeModel');
const Feature = require('../models/featuresModel');
const Booking = require('../models/bookingModel');
const { Types } = require('mongoose');
const { uploadToS3, deleteFromS3 } = require('../utils/s3Service');
const { refreshRoomStatus } = require('./bookingController');

const ACTIVE_BOOKING_STATUSES = ['Pending', 'Confirmed', 'CheckedIn'];

const formatRoom = (doc) => ({
  id: doc._id,
  roomNumber: doc.roomNumber,
  roomType: doc.roomType,
  floor: doc.floor,
  price: doc.price,
  capacity: doc.capacity,
  features: doc.features,
  bed: doc.bed,
  viewType: doc.viewType,
  images: doc.images,
  status: doc.status,
  isSmokingAllowed: doc.isSmokingAllowed,
  isPetFriendly: doc.isPetFriendly,
  maintenanceNotes: doc.maintenanceNotes,
  description: doc.description,
  cleanStatus: doc.cleanStatus,
  cleanassign: doc.cleanassign,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt
});

const formatBooking = (doc) => ({
  id: doc._id,
  room: doc.room,
  roomNumber: doc.roomNumber,
  status: doc.status,
  guest: doc.guest,
  reservation: doc.reservation,
  payment: doc.payment,
  notes: doc.notes,
  createdBy: doc.createdBy,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt
});

const createRoom = async (req, res) => {
  try {
    let imagePaths = [];
    let price, capacity, features, bed;

    if (typeof req.body.price === 'string') {
      price = JSON.parse(req.body.price);
    } else {
      price = req.body.price;
    }

    if (typeof req.body.capacity === 'string') {
      capacity = JSON.parse(req.body.capacity);
    } else {
      capacity = req.body.capacity;
    }

    if (typeof req.body.features === 'string') {
      features = JSON.parse(req.body.features);
    } else {
      features = req.body.features;
    }

    if (typeof req.body.bed === 'string') {
      bed = JSON.parse(req.body.bed);
    } else {
      bed = req.body.bed;
    }

    const {
      roomNumber,
      roomType,
      floor,
      viewType,
      images,
      status,
      maintenanceNotes,
      description
    } = req.body;

    // Parse boolean values from FormData (they come as strings)
    const isSmokingAllowed = req.body.isSmokingAllowed === 'true' || req.body.isSmokingAllowed === true;
    const isPetFriendly = req.body.isPetFriendly === 'true' || req.body.isPetFriendly === true;

    // Validation
    if (!roomNumber || !roomNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Room number is required' });
    }

    if (!roomType) {
      return res.status(400).json({ success: false, message: 'Room type is required' });
    }

    if (floor === undefined || floor === null) {
      return res.status(400).json({ success: false, message: 'Floor is required' });
    }

    if (!capacity || !capacity.adults) {
      return res.status(400).json({ success: false, message: 'Capacity (adults) is required' });
    }

    if (!bed || !bed.mainBed || !bed.mainBed.type || !bed.mainBed.count) {
      return res.status(400).json({ success: false, message: 'Bed information (mainBed type and count) is required' });
    }
    if (!bed.childBed || !bed.childBed.type || !bed.childBed.count) {
      return res.status(400).json({ success: false, message: 'Bed information (childBed type and count) is required' });
    }

    if (!viewType || !viewType.trim()) {
      return res.status(400).json({ success: false, message: 'View type is required' });
    }

    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber: roomNumber.trim() });
    if (existingRoom) {
      return res.status(409).json({ success: false, message: 'Room number already exists' });
    }

    // Verify room type exists
    const roomTypeExists = await RoomType.findById(roomType);
    if (!roomTypeExists) {
      return res.status(404).json({ success: false, message: 'Room type not found' });
    }

    // Verify features exist if provided
    if (features && features.length > 0) {
      const featuresExist = await Feature.find({ _id: { $in: features } });
      if (featuresExist.length !== features.length) {
        return res.status(404).json({ success: false, message: 'One or more features not found' });
      }
    }

    if (req.files && req.files.length > 0) {
      // Upload each file to S3
      for (const file of req.files) {
        const uploadedUrl = await uploadToS3(file, 'uploads/image');
        imagePaths.push(uploadedUrl);
      }
    } else if (images && Array.isArray(images)) {
      imagePaths = images;
    }

    const roomData = {
      roomNumber: roomNumber.trim(),
      roomType,
      floor: parseInt(floor),
      price: {
        base: parseFloat(price.base),
      },
      capacity: {
        adults: parseInt(capacity.adults),
        children: parseInt(capacity.children || 0)
      },
      features: features || [],
      bed: {
        mainBed: {
          type: bed.mainBed.type,
          count: parseInt(bed.mainBed.count)
        },
        childBed: {
          type: bed.childBed.type,
          count: parseInt(bed.childBed.count)
        }
      },
      viewType: viewType.trim(),
      images: imagePaths,
      status: status || 'Available',
      isSmokingAllowed: isSmokingAllowed || false,
      isPetFriendly: isPetFriendly || false,
      maintenanceNotes: maintenanceNotes || '',
      cleanStatus: 'Clean',
      description: description || '',
      cleanassign: null,
    };

    const created = await Room.create(roomData);
    const populated = await Room.findById(created._id)
      .populate({
        path: 'roomType',
        select: 'roomType description price bed capacity features images',
        populate: {
          path: 'features',
          select: 'feature'
        }
      })
      .populate('features', 'feature');

    return res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: formatRoom(populated)
    });
  } catch (error) {
    console.error('createRoom error:', error);
    res.status(500).json({ success: false, message: 'Failed to create room', error: error.message });
  }
};

const getRooms = async (req, res) => {
  try {
    const list = await Room.find()
      .populate({
        path: 'roomType',
        select: 'roomType description price features',
        populate: {
          path: 'features',
          select: 'feature'
        }
      })
      .populate('features', 'feature')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: list.map(formatRoom)
    });
  } catch (error) {
    console.error('getRooms error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch rooms' });
  }
};

const getRoomsWithPagination = async (req, res) => {
  try {
    // Parse query params
    let {
      page = 1,
      limit = 12,
      search,
      roomType,
      status,
      floor,
      bedSize,
      cleanStatus,
      checkInFrom,
      checkOutTo
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // Parse date filters
    const parseDate = (value) => {
      if (!value) return null;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    };

    const checkInDate = parseDate(checkInFrom);
    const checkOutDate = parseDate(checkOutTo);
    const hasDateFilter = !!(checkInDate && checkOutDate);
    const hasCheckInOnly = !!(checkInDate && !checkOutDate);
    const hasCheckOutOnly = !!(!checkInDate && checkOutDate);

    // Build query
    const query = {};

    // Filter by roomType (accept both ids and human readable names)
    if (roomType && roomType !== 'all' && roomType !== 'All Types') {
      if (Types.ObjectId.isValid(roomType)) {
        query.roomType = roomType;
      } else {
        const normalizedRoomType = typeof roomType === 'string' ? roomType.trim() : roomType;
        const matchedRoomType = await RoomType.findOne({ roomType: normalizedRoomType });
        if (matchedRoomType) {
          query.roomType = matchedRoomType._id;
        }
      }
    }

    // Status filter
    if (status && status !== 'All Status') {
      query.status = status;
    } else if (hasDateFilter) {
      // When a range date filter is applied and status not provided, show only Available rooms
      query.status = 'Available';
    }

    // Housekeeping filter (maps to cleanStatus field)
    if (cleanStatus && cleanStatus !== 'All Status') {
      query.cleanStatus = cleanStatus;
    }

    // Floor filter
    if (floor && floor !== 'All Floors') {
      const floorNum = parseInt(floor, 10);
      if (!Number.isNaN(floorNum)) {
        query.floor = floorNum;
      }
    }

    // Bed Size filter
    if (bedSize && bedSize !== 'All Bed Sizes') {
      query['bed.mainBed.type'] = bedSize;
    }

    // Search by roomNumber or floor
    if (search && search.trim() !== '') {
      const term = search.trim();
      const regex = new RegExp(term, 'i');
      const searchConditions = [{ roomNumber: { $regex: regex } }];
      const asNumber = Number(term);

      if (!Number.isNaN(asNumber)) {
        searchConditions.push({ floor: asNumber });
      }

      query.$or = searchConditions;
    }

    // Date filter behavior per requirements
    if (hasDateFilter || hasCheckInOnly || hasCheckOutOnly) {
      const ACTIVE_BOOKING_STATUSES = ['Pending', 'Confirmed', 'CheckedIn'];

      const dayRange = (d) => ({
        start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0),
        end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
      });

      if (hasDateFilter) {
        // Show rooms available in the range: exclude rooms with overlapping bookings
        const overlappingBookings = await Booking.find({
          status: { $in: ACTIVE_BOOKING_STATUSES },
          'reservation.checkInDate': { $lt: checkOutDate },
          'reservation.checkOutDate': { $gt: checkInDate }
        }).select('room').lean();

        const bookedRoomIds = [...new Set(overlappingBookings.map(b => b.room?.toString()).filter(Boolean))];
        if (bookedRoomIds.length > 0) {
          const bookedObjectIds = bookedRoomIds
            .filter(id => Types.ObjectId.isValid(id))
            .map(id => new Types.ObjectId(id));
          if (bookedObjectIds.length > 0) {
            query._id = { $nin: bookedObjectIds };
          }
        }
      } else if (hasCheckInOnly) {
        // Show rooms that have bookings starting on the given check-in date
        const { start, end } = dayRange(checkInDate);
        const bookings = await Booking.find({
          status: { $in: ACTIVE_BOOKING_STATUSES },
          'reservation.checkInDate': { $gte: start, $lte: end }
        }).select('room').lean();

        const matchRoomIds = [...new Set(bookings.map(b => b.room?.toString()).filter(Boolean))];
        if (matchRoomIds.length > 0) {
          const matchObjectIds = matchRoomIds
            .filter(id => Types.ObjectId.isValid(id))
            .map(id => new Types.ObjectId(id));
          if (matchObjectIds.length > 0) {
            query._id = { $in: matchObjectIds };
          }
        } else {
          // No rooms match: force empty result
          query._id = { $in: [] };
        }
      } else if (hasCheckOutOnly) {
        // Show rooms that have bookings ending on the given check-out date
        const { start, end } = dayRange(checkOutDate);
        const bookings = await Booking.find({
          status: { $in: ACTIVE_BOOKING_STATUSES },
          'reservation.checkOutDate': { $gte: start, $lte: end }
        }).select('room').lean();

        const matchRoomIds = [...new Set(bookings.map(b => b.room?.toString()).filter(Boolean))];
        if (matchRoomIds.length > 0) {
          const matchObjectIds = matchRoomIds
            .filter(id => Types.ObjectId.isValid(id))
            .map(id => new Types.ObjectId(id));
          if (matchObjectIds.length > 0) {
            query._id = { $in: matchObjectIds };
          }
        } else {
          query._id = { $in: [] };
        }
      }
    }

    // Count total documents for pagination
    const total = await Room.countDocuments(query);

    // Build status statistics
    const normalizeStatusKey = (status) => {
      if (!status || typeof status !== 'string') return status;
      const normalized = status.trim().toLowerCase();
      const statusMap = {
        available: 'Available',
        occupied: 'Occupied',
        reserved: 'Reserved',
        maintenance: 'Maintenance',
        'not ready': 'Maintenance',
        housekeeping: 'Maintenance'
      };
      return statusMap[normalized] || status.trim();
    };

    const statusAggregation = await Room.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = {
      Occupied: 0,
      Reserved: 0,
      Available: 0,
      Maintenance: 0
    };

    let totalFiltered = 0;
    statusAggregation.forEach((item) => {
      const key = normalizeStatusKey(item?._id);
      if (!key) return;

      statusStats[key] = item?.count || 0;
      totalFiltered += item?.count || 0;
    });

    // Ensure total reflects at least the filtered documents when aggregation returns nothing
    if (totalFiltered === 0) {
      totalFiltered = total;
    }

    const occupancyRate =
      totalFiltered > 0
        ? Math.round((statusStats.Occupied / totalFiltered) * 100)
        : 0;

    // Fetch paginated rooms with sorting
    const rooms = await Room.find(query)
      .populate({
        path: 'roomType',
        select: 'roomType description price bed mainBed childBed capacity features images',
        populate: {
          path: 'features',
          select: 'feature'
        }
      })
      .populate('features', 'feature')
      .collation({ locale: 'en', numericOrdering: true }) 
      .sort({ floor: 1, roomNumber: 1 })                  
      .skip((page - 1) * limit)
      .limit(limit);

    // For each room, attach its current active booking (Pending, Confirmed, CheckedIn, and overlaps today)
    const today = new Date();
    const ACTIVE_BOOKING_STATUSES = ['Pending', 'Confirmed', 'CheckedIn'];

    // We want to do this efficiently so we fetch all bookings for these rooms in one go
    const roomIds = rooms.map(r => r._id);

    const roomBookings = await Booking.find({
      room: { $in: roomIds },
      status: { $in: ACTIVE_BOOKING_STATUSES },
      'reservation.checkInDate': { $lte: today },
      'reservation.checkOutDate': { $gte: today }
    })
      .lean();

    // Build a roomId -> booking map (1 booking per room, even if multiple overlap)
    const currentBookingMap = {};
    for (const booking of roomBookings) {
      const roomIdStr = String(booking.room);
      // If multiple, prefer the first; only one booking per room
      if (!currentBookingMap[roomIdStr]) {
        currentBookingMap[roomIdStr] = booking;
      }
    }

    //  Fetch all floors (unique)
    const floors = await Room.distinct("floor");

    res.json({
      success: true,
      data: rooms.map(room => {
        const formatted = formatRoom(room);
        // Attach currentBooking if any
        const booking = currentBookingMap[String(room._id)] || null;
        return { ...formatted, currentBooking: booking };
      }),
      total,
      page,
      totalPages: Math.ceil(total / (limit || 1)),
      floors: floors.sort((a, b) => a - b),
      stats: {
        total: totalFiltered,
        available: statusStats.Available,
        occupied: statusStats.Occupied,
        reserved: statusStats.Reserved,
        maintenance: statusStats.Maintenance,
        occupancyRate,
      },
    });
  } catch (error) {
    console.error('getRoomsWithPagination error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch rooms' });
  }
};


const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Room.findById(id)
      .populate({
        path: 'roomType',
        select: 'roomType description price bed capacity features images',
        populate: {
          path: 'features',
          select: 'feature'
        }
      })
      .populate('features', 'feature');

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const now = new Date();

    const currentBooking = await Booking.findOne({
      room: id,
      status: { $in: ACTIVE_BOOKING_STATUSES },
      'reservation.checkInDate': { $lte: now },
      'reservation.checkOutDate': { $gt: now }
    })
      .populate('createdBy', 'fullName email role')
      .sort({ 'reservation.checkInDate': 1 });

    const futureBookings = await Booking.find({
      room: id,
      status: { $in: ACTIVE_BOOKING_STATUSES },
      'reservation.checkInDate': { $gt: now }
    })
      .populate('createdBy', 'fullName email role')
      .sort({ 'reservation.checkInDate': 1 });

    res.json({
      success: true,
      data: {
        ...formatRoom(doc),
        currentBooking: currentBooking ? formatBooking(currentBooking) : null,
        futureBookings: futureBookings.map(formatBooking)
      },
    });
  } catch (error) {
    console.error('getRoomById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch room' });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    // Parse JSON strings from FormData
    let price, capacity, features, bed;

    if (typeof req.body.price === 'string') {
      price = JSON.parse(req.body.price);
    } else {
      price = req.body.price;
    }

    if (typeof req.body.capacity === 'string') {
      capacity = JSON.parse(req.body.capacity);
    } else {
      capacity = req.body.capacity;
    }

    if (typeof req.body.features === 'string') {
      features = JSON.parse(req.body.features);
    } else {
      features = req.body.features;
    }

    if (typeof req.body.bed === 'string') {
      bed = JSON.parse(req.body.bed);
    } else {
      bed = req.body.bed;
    }

    const {
      roomNumber,
      roomType,
      floor,
      viewType,
      images,
      status,
      maintenanceNotes,
      description
    } = req.body;

    // Parse boolean values from FormData (they come as strings)
    const isSmokingAllowed = req.body.isSmokingAllowed !== undefined
      ? (req.body.isSmokingAllowed === 'true' || req.body.isSmokingAllowed === true)
      : undefined;
    const isPetFriendly = req.body.isPetFriendly !== undefined
      ? (req.body.isPetFriendly === 'true' || req.body.isPetFriendly === true)
      : undefined;

    const existingRoom = await Room.findById(id);
    if (!existingRoom) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check if room number is being changed and if it already exists
    if (roomNumber && roomNumber.trim() !== existingRoom.roomNumber) {
      const roomNumberExists = await Room.findOne({ roomNumber: roomNumber.trim() });
      if (roomNumberExists) {
        return res.status(409).json({ success: false, message: 'Room number already exists' });
      }
    }

    // Verify room type exists if being updated
    if (roomType) {
      const roomTypeExists = await RoomType.findById(roomType);
      if (!roomTypeExists) {
        return res.status(404).json({ success: false, message: 'Room type not found' });
      }
    }

    // Verify features exist if being updated
    if (features && features.length > 0) {
      const featuresExist = await Feature.find({ _id: { $in: features } });
      if (featuresExist.length !== features.length) {
        return res.status(404).json({ success: false, message: 'One or more features not found' });
      }
    }

    let imagesToKeep = [];
    if (images && Array.isArray(images)) {
      imagesToKeep = images;
    } else if (typeof images === 'string') {
      try {
        imagesToKeep = JSON.parse(images);
      } catch {
        imagesToKeep = [];
      }
    } else {
      imagesToKeep = existingRoom.images || [];
    }

    let imagePaths = imagesToKeep;

    // Handle new uploads (req.files)
    if (req.files && req.files.length > 0) {
      // Upload new images, append to imagePaths
      const uploadedImages = [];
      for (const file of req.files) {
        const uploadedUrl = await uploadToS3(file, 'uploads/image');
        uploadedImages.push(uploadedUrl);
      }
      imagePaths = [...imagesToKeep, ...uploadedImages];
    }

    // Delete from S3 only images that are in existingRoom.images and NOT in the new imagePaths
    const toRemove = (existingRoom.images || []).filter(oldImg => !imagePaths.includes(oldImg));
    for (const oldImg of toRemove) {
      await deleteFromS3(oldImg);
    }

    const updateData = {};
    if (roomNumber) updateData.roomNumber = roomNumber.trim();
    if (roomType) updateData.roomType = roomType;
    if (floor !== undefined) updateData.floor = parseInt(floor);
    if (price) {
      updateData.price = {
        base: parseFloat(price.base)
      };
    }
    if (capacity) {
      updateData.capacity = {
        adults: parseInt(capacity.adults),
        children: parseInt(capacity.children || 0)
      };
    }
    if (features) updateData.features = features;
    if (bed) {
      updateData.bed = {
        mainBed: {
          type: bed.mainBed.type,
          count: parseInt(bed.mainBed.count)
        },
        childBed: {
          type: bed.childBed.type,
          count: parseInt(bed.childBed.count)
        }
      };
    }
    if (viewType) updateData.viewType = viewType.trim();
    updateData.images = imagePaths;
    if (status) updateData.status = status;
    if (isSmokingAllowed !== undefined) updateData.isSmokingAllowed = isSmokingAllowed;
    if (isPetFriendly !== undefined) updateData.isPetFriendly = isPetFriendly;
    if (maintenanceNotes !== undefined) updateData.maintenanceNotes = maintenanceNotes;
    if (description !== undefined) updateData.description = description;
    const updated = await Room.findByIdAndUpdate(id, updateData, { new: true })
      .populate({
        path: 'roomType',
        select: 'roomType description price bed capacity features images',
        populate: {
          path: 'features',
          select: 'feature'
        }
      })
      .populate('features', 'feature');

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: formatRoom(updated)
    });
  } catch (error) {
    console.error('updateRoom error:', error);
    res.status(500).json({ success: false, message: 'Failed to update room', error: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.images && room.images.length > 0) {
      for (const img of room.images) {
        await deleteFromS3(img);
      }
    }

    await Room.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Room deleted successfully',
      data: formatRoom(room)
    });

  } catch (error) {
    console.error('deleteRoom error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete room', error: error.message });
  }
};

const bedRules = {
  "deluxe": [
    { mainBed: { type: "Single", count: 1 }, childBed: { type: "Single", count: 1 } },
    { mainBed: { type: "Single", count: 2 }, childBed: { type: "Single", count: 1 } },
    { mainBed: { type: "Double", count: 1 }, childBed: { type: "Single", count: 1 } },
    { mainBed: { type: "Double", count: 2 }, childBed: { type: "Single", count: 1 } },
  ],

  "Super Deluxe Room": [
    {
      mainBed: { type: "Queen", count: 1 },
      childBed: { type: "Single", count: 1 }
    }
  ],

  "premium": [
    { mainBed: { type: "King", count: 1 }, childBed: { type: "Single", count: 1 } },
    {
      mainBed: { type: "Twin", count: 2 },
      childBed: { type: "Double", count: 1 }
    }
  ]
};

const autoUpdateRoomBeds = async (req, res) => {
  try {
    const rooms = await Room.find({}).populate("roomType");

    let updated = [];

    for (let room of rooms) {
      const typeName = room.roomType.roomType; 

      if (!bedRules[typeName]) continue;

      // choose random rule if multiple
      const ruleSet = bedRules[typeName];
      const selectedRule = ruleSet[Math.floor(Math.random() * ruleSet.length)];

      await Room.updateOne(
        { _id: room._id },
        {
          $set: {
            bed: selectedRule,
            capacity: {
              adults: selectedRule.mainBed.count === 2 ? 2 : 1,
              children: selectedRule.childBed.count
            }
          }
        }
      );

      updated.push({
        roomNumber: room.roomNumber,
        roomType: typeName,
        bed: selectedRule
      });
    }

    res.status(200).json({
      message: "Updated all rooms successfully!",
      updatedCount: updated.length,
      updatedRooms: updated
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Utility controller: refresh status for all rooms
const refreshAllRoomsStatus = async (req, res) => {
  try {
    const rooms = await Room.find();
    for (const room of rooms) {
      await refreshRoomStatus(room._id);
    }
    res.json({ success: true, message: 'All room statuses refreshed successfully' });
  } catch (error) {
    console.error('refreshAllRoomsStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to refresh all room statuses', error: error.message });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomsWithPagination,
  getRoomById,
  updateRoom,
  deleteRoom,
  autoUpdateRoomBeds,
  refreshAllRoomsStatus
};

