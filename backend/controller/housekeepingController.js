const Room = require("../models/Room");
const Housekeeping = require("../models/housekeeping");

// GET ALL DIRTY ROOMS
exports.getDirtyRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ status: "Dirty" });

        return res.json({
            success: true,
            message: "Dirty rooms fetched successfully..!",
            data: rooms
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// ASSIGN WORKER TO ROOM
exports.assignWorker = async (req, res) => {
    try {
        const { roomId, workerId } = req.body;

        if (!roomId || !workerId) {
            return res.status(400).json({
                success: false,
                message: "roomId and workerId are required"
            });
        }

        // Create new task
        const task = await Housekeeping.create({
            roomId,
            workerId,
            status: "Pending"
        });

        // Update room status
        await Room.findByIdAndUpdate(roomId, {
            status: "Pending",
            assignedTo: workerId
        });

        return res.json({
            success: true,
            message: "Worker assigned successfully..!",
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

        await Room.findByIdAndUpdate(task.roomId, {
            status: "In-Progress"
        });

        return res.json({
            success: true,
            message: "Cleaning marked as In-Progress..!",
            data: task
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// WORKER COMPLETES CLEANING
exports.completeCleaning = async (req, res) => {
    try {
        const { id } = req.params;
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
            status: "Completed"
        });

        return res.json({
            success: true,
            message: "Cleaning completed successfully..!",
            data: task
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// HEAD APPROVES CLEANING
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

        room.status = "Clean";
        room.assignedTo = null;

        await room.save();

        return res.json({
            success: true,
            message: "Room approved as CLEAN..!",
            data: room
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// GET ALL ASSIGNED TASKS (Pending + In-Progress)
exports.getAssignedTasks = async (req, res) => {
    try {
        const tasks = await Housekeeping.find({
            status: { $in: ["Pending", "In-Progress"] }
        })
        .populate("roomId")
        .populate("workerId");

        return res.json({
            success: true,
            message: "Assigned tasks fetched successfully..!",
            data: tasks
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// GET COMPLETED TASKS (Waiting for approval)
exports.getCompletedTasks = async (req, res) => {
    try {
        const tasks = await Housekeeping.find({ status: "Completed" })
            .populate("roomId")
            .populate("workerId");

        return res.json({
            success: true,
            message: "Completed tasks fetched successfully..!",
            data: tasks
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
