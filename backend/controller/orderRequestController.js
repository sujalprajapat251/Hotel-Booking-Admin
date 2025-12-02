const OrderRequest = require('../models/orderRequest');
const staff = require('../models/staffModel');

exports.getPendingOrderRequests = async (req, res) => {
    try {
        const requests = await OrderRequest.find({ status: 'Pending' })
            .populate('roomId')
            .populate('orderId')
            .populate('workerId')
            .populate({
                path: "orderId",
                populate: {
                    path: "items.product",
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            status: 200,
            data: requests
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message
        });
    }
};

exports.getWorkerOrderRequests = async (req, res) => {
    try {
        const { workerId } = req.params;
        if (!workerId) {
            return res.status(400).json({ status: 400, message: 'workerId is required' });
        }

        const requests = await OrderRequest.find({ workerId })
            .populate('roomId')
            .populate('orderId')
            .populate({
                path: "orderId",
                populate: {
                    path: "items.product",
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            status: 200,
            data: requests
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message
        });
    }
};

exports.assignWorkerToOrderRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { workerId } = req.body;

        if (!workerId) {
            return res.status(400).json({ status: 400, message: 'workerId is required' });
        }

        const worker = await staff.findById(workerId);
        if (!worker) {
            return res.status(404).json({ status: 404, message: 'Worker not found' });
        }

        const request = await OrderRequest.findByIdAndUpdate(
            id,
            { workerId },
            { new: true }
        ).populate('roomId');

        if (!request) {
            return res.status(404).json({ status: 404, message: 'OrderRequest not found' });
        }

        return res.status(200).json({
            status: 200,
            message: 'Worker assigned successfully',
            data: request
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.advanceOrderRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await OrderRequest.findById(id).populate('roomId');
        if (!request) {
            return res.status(404).json({ status: 404, message: 'OrderRequest not found' });
        }

        const steps = {
            'Pending': 'In-Progress',
            'In-Progress': 'Completed',
            'Completed': 'Completed'
        };

        const current = request.status;
        const next = steps[current];
        request.status = next;
        await request.save();

        return res.status(200).json({
            status: 200,
            message: `Status updated: ${current} → ${next}`,
            data: request
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};
