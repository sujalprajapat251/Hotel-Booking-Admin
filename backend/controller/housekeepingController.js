const Room = require("../models/createRoomModel");
const Housekeeping = require("../models/housekeepingModel");

// GET ALL DIRTY ROOMS
exports.getDirtyRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ cleanStatus: "Dirty" }).populate("roomType").populate("cleanassign").sort({ updatedAt: -1 });

        return res.json({
            success: true,
            message: "Dirty rooms fetched successfully..! ",
            data: rooms
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};


// ASSIGN WORKER TO DIRTY ROOM
exports.assignWorker = async (req, res) => {
    try {
        const { roomId, workerId } = req.body;

        if (!roomId || !workerId) {
            return res.status(400).json({
                success: false,
                message: "roomId and workerId are required"
            });
        }

        // Create housekeeping task
        const task = await Housekeeping.create({
            roomId,
            workerId,
            status: "Pending"
        });

        // Update room clean status
        await Room.findByIdAndUpdate(roomId, {
            cleanStatus: "Pending",
            cleanassign: workerId
        });

        return res.json({
            success: true,
            message: "Worker assigned successfully..! ",
            data: task
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// WORKER START CLEANING
exports.startCleaning = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Housekeeping.findById(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        task.status = "In-Progress";
        await task.save();

        // Update room cleanStatus
        await Room.findByIdAndUpdate(task.roomId, {
            cleanStatus: "In-Progress"
        });

        return res.json({
            success: true,
            message: "Cleaning marked as In-Progress..! ",
            data: task
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// WORKER COMPLETES CLEANING
exports.completeCleaning = async (req, res) => {
    try {
        const { id } = req.params; // task id
        const { notes } = req.body;

        const task = await Housekeeping.findById(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        task.status = "Completed";
        task.notes = notes;
        await task.save();

        await Room.findByIdAndUpdate(task.roomId, {
            cleanStatus: "Completed"
        });

        return res.json({
            success: true,
            message: "Cleaning task completed..!",
            data: task
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// HEAD SUPERVISOR APPROVES CLEANING (FINAL CLEAN)
exports.approveCleaning = async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        room.cleanStatus = "Clean";
        room.cleanassign = null;

        await room.save();

        return res.json({
            success: true,
            message: "Room approved as CLEAN..! ",
            data: room
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllHousekeepignData = async (req, res) => {
    try {
        const tasks = await Housekeeping.find()
            .populate("roomId")
            .populate("workerId");

        return res.json({
            success: true,
            message: "House Keeping Data successfully..! ",
            data: tasks
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};


