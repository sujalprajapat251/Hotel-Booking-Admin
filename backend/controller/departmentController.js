const Department = require("../models/departmentModel");

exports.createDepartment = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Department name is required"
            });
        }

        const newDept = await Department.create({ name });

        res.status(200).json({
            success: true,
            message: "Department created successfully..!",
            data: newDept
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: departments
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        res.status(200).json({
            success: true,
            data: department
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        const { name } = req.body;

        const updatedDept = await Department.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true, runValidators: true }
        );

        if (!updatedDept) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Department updated successfully..!",
            data: updatedDept
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const dept = await Department.findById(req.params.id);

        if (!dept) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        await Department.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Department deleted successfully..!"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
