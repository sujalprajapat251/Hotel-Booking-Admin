const Room = require("../models/createRoomModel");
const Housekeeping = require("../models/housekeepingModel");
const Staff = require("../models/staffModel");
const Department = require("../models/departmentModel");

// GET ALL DIRTY ROOMS
exports.getDirtyRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ cleanStatus: { $ne: "Clean" } }).populate("roomType").populate("cleanassign").sort({ updatedAt: -1 });

        return res.json({
            success: true,
            message: "Dirty rooms fetched successfully..! ",
            data: rooms
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

exports.getFreeWorkers = async (req, res) => {
    try {
        // Step 1: Get the department ID of Housekeeping
        const housekeepingDept = await Department.findOne({ name: "Housekeeping" });

        if (!housekeepingDept) {
            return res.status(404).json({
                success: false,
                message: "Housekeeping department not found"
            });
        }

        // Step 2: Find busy workers
        const busyWorkers = await Housekeeping.find({
            status: { $in: ["Pending", "In-Progress"] }
        }).distinct("workerId");

        // Step 3: Find free workers
        const freeWorkers = await Staff.find({
            department: housekeepingDept._id,
            _id: { $nin: busyWorkers }
        }).populate("department");

        return res.json({
            success: true,
            message: "Free housekeeping workers fetched successfully",
            data: freeWorkers
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

        // Check room exists
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }

        // Check if worker is already assigned to another task
        const activeTask = await Housekeeping.findOne({
            workerId,
            status: { $in: ["Pending", "In-Progress"] }
        });

        if (activeTask) {
            return res.status(400).json({
                success: false,
                message: "Worker is already assigned to another cleaning task"
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
            message: "Worker assigned successfully",
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


// GET ALL TASKS FOR ONE WORKER
exports.getWorkerTasks = async (req, res) => {
    try {
        const { workerId } = req.params;

        const tasks = await Housekeeping.find({ workerId })
            .populate("roomId")
            .populate("workerId")
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            message: "Worker tasks fetched successfully!",
            data: tasks
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};



