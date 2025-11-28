const cafeOrder = require('../models/cafeOrderModal.js');
const barOrder = require('../models/barOrderModal.js');
const restroOrder = require('../models/restaurantOrderModal.js');
exports.addItemTocafeOrder = async (req, res) => {
    try {
        const { product, qty, description, name, contact, roomId } = req.body;

        if (!product) {
            return res.status(400).json({ status: 400, message: "Product is required" });
        }
        // if (!req.user) {
        //     return res.status(401).json({ status: 401, message: 'Unauthorized' });
        // }
        // const Department = require('../models/departmentModel.js');
        // const dept = await Department.findById(req.user.department);
        // if (!dept || !dept.name) {
        //     return res.status(400).json({ status: 400, message: 'User department not found' });
        // }
        // const nameDept = String(dept.name).trim().toLowerCase();
        // let OrderModel = null;
        // if (nameDept === 'cafe') OrderModel = cafeOrder;
        // else if (nameDept === 'bar') OrderModel = barOrder;
        // else if (nameDept === 'restaurant' || nameDept === 'restro') OrderModel = restroOrder;
        // if (!OrderModel) {
        //     return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        // }

        const fromValue = 'room';

        const existingOrder = await cafeOrder
            .findOne({ from: fromValue, room: roomId, payment: 'Pending' })
            .sort({ createdAt: -1, _id: -1 });

        if (existingOrder) {
            existingOrder.items.push({ product, qty: qty || 1, description, status: 'Pending' });
            await existingOrder.save();

            const populated = await existingOrder.populate([
                { path: 'items.product' },
                { path: 'room' }
            ]);
            // if (nameDept === 'cafe') {
            //     emitCafeOrderChanged(populated.table?._id || tableId, populated);
            // }
            return res.status(200).json({ status: 200, message: 'Item added to existing order', data: populated });
        }

        const created = await cafeOrder.create({
            from: fromValue,
            room: roomId,
            name,
            contact,
            items: [{ product, qty: qty || 1, description, status: 'Pending' }]
        });

        const populated = await created.populate([
            { path: 'items.product' },
            { path: 'room' }
        ]);
        // if (nameDept === 'cafe') {
        //     emitCafeOrderChanged(populated.table?._id || tableId, populated);
        // }
        return res.status(200).json({ status: 200, message: 'New order created and item added', data: populated });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getOrdercafeByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const lastUnpaidOrder = await cafeOrder
            .findOne({ from: 'room', room: roomId, payment: 'Pending' })
            .sort({ createdAt: -1, _id: -1 })
            .populate({ path: 'items.product', model: 'cafeitem' });
        return res.status(200).json({ status: 200, data: lastUnpaidOrder });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
}

exports.removeItemCafeOrder = async (req, res) => {
    try {
        const { id, itemId } = { id: req.params.id, itemId: req.params.itemId };

        const order = await cafeOrder.findById(id);
        if (!order) {
            return res.status(404).json({ status: 404, message: 'Order not found' });
        }
        const item = order.items.id(itemId);
        if (!item) {
            return res.status(404).json({ status: 404, message: 'Order item not found' });
        }

        if (item.status !== 'Pending') {
            return res.status(400).json({ status: 400, message: 'Only pending items can be removed' });
        }

        await cafeOrder.findByIdAndUpdate(
            id,
            { $pull: { items: { _id: itemId } } },
            { new: true }
        );

        const updated = await cafeOrder.findById(id)
            .populate({ path: 'items.product' })
            .populate({ path: 'table' });
        // if (name === 'cafe') {
        //     emitCafeOrderChanged(updated.table?._id || updated.table, updated);
        // }
        return res.status(200).json({ status: 200, message: 'Item removed successfully', data: updated });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};



exports.addItemTobarOrder = async (req, res) => {
    try {
        const { product, qty, description, name, contact, roomId } = req.body;

        if (!product) {
            return res.status(400).json({ status: 400, message: "Product is required" });
        }

        const fromValue = 'room';

        const existingOrder = await barOrder
            .findOne({ from: fromValue, room: roomId, payment: 'Pending' })
            .sort({ createdAt: -1, _id: -1 });

        if (existingOrder) {
            existingOrder.items.push({ product, qty: qty || 1, description, status: 'Pending' });
            await existingOrder.save();

            const populated = await existingOrder.populate([
                { path: 'items.product' },
                { path: 'room' }
            ]);
            // if (nameDept === 'cafe') {
            //     emitCafeOrderChanged(populated.table?._id || tableId, populated);
            // }
            return res.status(200).json({ status: 200, message: 'Item added to existing order', data: populated });
        }

        const created = await barOrder.create({
            from: fromValue,
            room: roomId,
            name,
            contact,
            items: [{ product, qty: qty || 1, description, status: 'Pending' }]
        });

        const populated = await created.populate([
            { path: 'items.product' },
            { path: 'room' }
        ]);
        // if (nameDept === 'cafe') {
        //     emitCafeOrderChanged(populated.table?._id || tableId, populated);
        // }
        return res.status(200).json({ status: 200, message: 'New order created and item added', data: populated });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getOrderbarByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const lastUnpaidOrder = await barOrder
            .findOne({ from: 'room', room: roomId, payment: 'Pending' })
            .sort({ createdAt: -1, _id: -1 })
            .populate({ path: 'items.product', model: 'baritem' });
        return res.status(200).json({ status: 200, data: lastUnpaidOrder });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
}

exports.removeItembarOrder = async (req, res) => {
    try {
        const { id, itemId } = { id: req.params.id, itemId: req.params.itemId };

        const order = await barOrder.findById(id);
        if (!order) {
            return res.status(404).json({ status: 404, message: 'Order not found' });
        }
        const item = order.items.id(itemId);
        if (!item) {
            return res.status(404).json({ status: 404, message: 'Order item not found' });
        }

        if (item.status !== 'Pending') {
            return res.status(400).json({ status: 400, message: 'Only pending items can be removed' });
        }

        await barOrder.findByIdAndUpdate(
            id,
            { $pull: { items: { _id: itemId } } },
            { new: true }
        );

        const updated = await barOrder.findById(id)
            .populate({ path: 'items.product' })
            .populate({ path: 'table' });
        // if (name === 'cafe') {
        //     emitCafeOrderChanged(updated.table?._id || updated.table, updated);
        // }
        return res.status(200).json({ status: 200, message: 'Item removed successfully', data: updated });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};


exports.addItemTorestroOrder = async (req, res) => {
    try {
        const { product, qty, description, name, contact, roomId } = req.body;

        if (!product) {
            return res.status(400).json({ status: 400, message: "Product is required" });
        }

        const fromValue = 'room';

        const existingOrder = await restroOrder
            .findOne({ from: fromValue, room: roomId, payment: 'Pending' })
            .sort({ createdAt: -1, _id: -1 });

        if (existingOrder) {
            existingOrder.items.push({ product, qty: qty || 1, description, status: 'Pending' });
            await existingOrder.save();

            const populated = await existingOrder.populate([
                { path: 'items.product' },
                { path: 'room' }
            ]);
            // if (nameDept === 'cafe') {
            //     emitCafeOrderChanged(populated.table?._id || tableId, populated);
            // }
            return res.status(200).json({ status: 200, message: 'Item added to existing order', data: populated });
        }

        const created = await restroOrder.create({
            from: fromValue,
            room: roomId,
            name,
            contact,
            items: [{ product, qty: qty || 1, description, status: 'Pending' }]
        });

        const populated = await created.populate([
            { path: 'items.product' },
            { path: 'room' }
        ]);
        // if (nameDept === 'cafe') {
        //     emitCafeOrderChanged(populated.table?._id || tableId, populated);
        // }
        return res.status(200).json({ status: 200, message: 'New order created and item added', data: populated });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getOrderrestroByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const lastUnpaidOrder = await restroOrder
            .findOne({ from: 'room', room: roomId, payment: 'Pending' })
            .sort({ createdAt: -1, _id: -1 })
            .populate({ path: 'items.product', model: 'restaurantitem' });
        return res.status(200).json({ status: 200, data: lastUnpaidOrder });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
}

exports.removeItemrestroOrder = async (req, res) => {
    try {
        const { id, itemId } = { id: req.params.id, itemId: req.params.itemId };

        const order = await restroOrder.findById(id);
        if (!order) {
            return res.status(404).json({ status: 404, message: 'Order not found' });
        }
        const item = order.items.id(itemId);
        if (!item) {
            return res.status(404).json({ status: 404, message: 'Order item not found' });
        }

        if (item.status !== 'Pending') {
            return res.status(400).json({ status: 400, message: 'Only pending items can be removed' });
        }

        await restroOrder.findByIdAndUpdate(
            id,
            { $pull: { items: { _id: itemId } } },
            { new: true }
        );

        const updated = await barOrder.findById(id)
            .populate({ path: 'items.product' })
            .populate({ path: 'table' });
        // if (name === 'cafe') {
        //     emitCafeOrderChanged(updated.table?._id || updated.table, updated);
        // }
        return res.status(200).json({ status: 200, message: 'Item removed successfully', data: updated });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

