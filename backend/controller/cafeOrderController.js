const cafeOrder = require('../models/cafeOrderModal');

exports.createCafeOrder = async (req, res) => {
    try {
        const { name, contact, items, from, table, room } = req.body;
        if (!items || !from) {
            return res.status(400).json({
                status: 400,
                message: "All fields are required"
            });
        }
        const newTable = await cafeOrder.create({
            name,
            contact,
            items,
            from,
            table: from === 'cafe' ? table : null,  // store table only for cafe
            room: from === 'hotel' ? room : null    // store room only for hotel
        });
        res.status(200).json({
            status: 200,
            message: "Cafe Table created successfully..!",
            data: newTable
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message
        });
    }
}

exports.getAllCafeOrders = async (req, res) => {
    try {
        const orders = await cafeOrder.find()
            .populate("items")
            .populate("table")
            .populate("room");

        res.status(200).json({
            status: 200,
            data: orders
        });

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};


exports.getCafeOrderById = async (req, res) => {
    try {
        const order = await cafeOrder.findById(req.params.id)
            .populate("items")
            .populate("table")
            .populate("room");

        if (!order) {
            return res.status(404).json({ status: 404, message: "Order not found" });
        }

        res.status(200).json({ status: 200, data: order });

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};


exports.updateCafeOrder = async (req, res) => {
    try {
        const updated = await cafeOrder.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ status: 404, message: "Order not found" });
        }

        res.status(200).json({
            status: 200,
            message: "Order updated successfully",
            data: updated
        });

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};


exports.cancelCafeOrder = async (req, res) => {
    try {
        const deleted = await cafeOrder.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ status: 404, message: "Order not found" });
        }

        res.status(200).json({
            status: 200,
            message: "Order cancelled successfully"
        });

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};


exports.addItemToOrder = async (req, res) => {
    try {
        const { itemId } = req.body;

        const updatedOrder = await cafeOrder.findByIdAndUpdate(
            req.params.id,
            { $push: { items: itemId } },
            { new: true }
        );

        res.status(200).json({
            status: 200,
            message: "Item added successfully",
            data: updatedOrder
        });

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};


exports.removeItemFromOrder = async (req, res) => {
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
            .populate({ path: 'items.product', model: 'cafeitem' })
            .populate({ path: 'table', model: 'cafeTable' });

        return res.status(200).json({ status: 200, message: 'Item removed successfully', data: updated });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.addItemToTableOrder = async (req, res) => {
    try {
        const { product, qty, decription, name, contact } = req.body;
        const { tableId } = req.params;

        if (!product) {
            return res.status(400).json({ status: 400, message: "Product is required" });
        }

        const existingOrder = await cafeOrder
            .findOne({ from: 'cafe', table: tableId, payment: 'Pending' })
            .sort({ createdAt: -1, _id: -1 });

        if (existingOrder) {
            existingOrder.items.push({ product, qty: qty || 1, decription, status: 'Pending' });
            await existingOrder.save();

            const populated = await existingOrder.populate([
                { path: 'items.product', model: 'cafeitem' },
                { path: 'table', model: 'cafeTable' }
            ]);

            return res.status(200).json({ status: 200, message: 'Item added to existing order', data: populated });
        }

        const created = await cafeOrder.create({
            from: 'cafe',
            table: tableId,
            name,
            contact,
            items: [{ product, qty: qty || 1, decription, status: 'Pending' }]
        });

        const populated = await created.populate([
            { path: 'items.product', model: 'cafeitem' },
            { path: 'table', model: 'cafeTable' }
        ]);

        return res.status(200).json({ status: 200, message: 'New order created and item added', data: populated });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

