const cafeOrder = require('../models/cafeOrderModal');
const cafeTable = require('../models/cafeTableModel')
const { emitCafeOrderChanged } = require('../socketManager/socketManager');

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
        const orders = await cafeOrder.find().sort({ createdAt: -1 })
            .populate("items")
            .populate("table")
            .populate("room")
            .populate("items.product");

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
        emitCafeOrderChanged(updated.table?._id || updated.table, updated);
        return res.status(200).json({ status: 200, message: 'Item removed successfully', data: updated });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.addItemToTableOrder = async (req, res) => {
    try {
        const { product, qty, description, name, contact } = req.body;
        const { tableId } = req.params;

        if (!product) {
            return res.status(400).json({ status: 400, message: "Product is required" });
        }

        const existingOrder = await cafeOrder
            .findOne({ from: 'cafe', table: tableId, payment: 'Pending' })
            .sort({ createdAt: -1, _id: -1 });

        if (existingOrder) {
            existingOrder.items.push({ product, qty: qty || 1, description, status: 'Pending' });
            await existingOrder.save();

            const populated = await existingOrder.populate([
                { path: 'items.product', model: 'cafeitem' },
                { path: 'table', model: 'cafeTable' }
            ]);
            emitCafeOrderChanged(populated.table?._id || tableId, populated);
            return res.status(200).json({ status: 200, message: 'Item added to existing order', data: populated });
        }

        const created = await cafeOrder.create({
            from: 'cafe',
            table: tableId,
            name,
            contact,
            items: [{ product, qty: qty || 1, description, status: 'Pending' }]
        });

        const populated = await created.populate([
            { path: 'items.product', model: 'cafeitem' },
            { path: 'table', model: 'cafeTable' }
        ]);
        emitCafeOrderChanged(populated.table?._id || tableId, populated);
        return res.status(200).json({ status: 200, message: 'New order created and item added', data: populated });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getAllCafeItemsOrders = async (req, res) => {
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

exports.getAllOrderItemsStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const orders = await cafeOrder.find({ status: status }).populate("table")
            .populate("room")
            .populate("items.product")

        // Flatten all items from all orders
        const allItems = orders.flatMap(order =>
            order.items.map(item => ({
                orderId: order._id,
                product: item.product,
                qty: item.qty,
                description: item.description || '',
                status: item.status,
                from: order.from,
                table: order.table,
                room: order.room,
                createdAt: order.createdAt,
                preparedBy: item.preparedBy,
                _id:item._id
            }))
        );

        res.status(200).json({
            status: 200,
            data: allItems
        });

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getAllOrderItems = async (req, res) => {
    try {
        const orders = await cafeOrder.find().populate("table")
            .populate("room")
            .populate("items.product")

        // Flatten all items from all orders
        const allItems = orders.flatMap(order =>
            order.items.map(item => ({
                orderId: order._id,
                product: item.product,
                qty: item.qty,
                description: item.description || '',
                status: item.status,
                from: order.from,
                table: order.table,
                room: order.room,
                createdAt: order.createdAt,
                preparedBy: item.preparedBy,
                _id:item._id
            }))
        );

        res.status(200).json({
            status: 200,
            data: allItems
        });

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};
exports.UpdateOrderItemStatus = async (req, res) => {
    try {
        const { orderId, itemId } = req.body;
        const chefId = req.user?.id;

        // Find the order
        const order = await cafeOrder.findById(orderId);

        if (!order) {
            return res.status(404).json({
                status: 404,
                message: "Order not found"
            });
        }

        // Find the item inside the order
        const item = order.items.id(itemId);

        if (!item) {
            return res.status(404).json({
                status: 404,
                message: "Item not found in this order"
            });
        }

        if (item.status === "Preparing" && item.preparedBy && item.preparedBy.toString() !== chefId) {
            return res.status(400).json({
                status: 400,
                message: "This order is being prepared by another chef"
            });
        }

        // Define progression steps
        const steps = {
            "Pending": "Preparing",
            "Preparing": "Done",
            "Done": "Served",
            "Served": "Served"  // stays same
        };

        const currentStatus = item.status;
        const newStatus = steps[currentStatus];

        // If moving from Pending to Preparing, check if there are already items being prepared
        if (currentStatus === "Pending" && newStatus === "Preparing") {
            // Set the chef who is preparing this item
            item.preparedBy = chefId;
        }

        // Update the status
        item.status = newStatus;

        await order.save();

        // Populate the order with product details before sending response
        const populatedOrder = await cafeOrder.findById(orderId)
            .populate("table")
            .populate("room")
            .populate("items.product");
            emitCafeOrderChanged(populatedOrder.table?._id || populatedOrder.table, populatedOrder);
        res.status(200).json({
            status: 200,
            message: `Status updated: ${currentStatus} → ${newStatus}`,
            data: populatedOrder
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message
        });
    }
};


exports.cafePayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentMethod } = req.body;

        // Validate payment method
        if (!paymentMethod) {
            return res.status(400).json({
                status: 400,
                message: "Payment method is required"
            });
        }

        const updatedOrder = await cafeOrder.findByIdAndUpdate(
            orderId,
            {
                payment: "Paid",
                paymentMethod: paymentMethod
            },
            { new: true }
        )
            .populate("table")
            .populate("room")
            .populate("items.product");

        if (!updatedOrder) {
            return res.status(404).json({
                status: 404,
                message: "Order not found"
            });
        }
        if (updatedOrder.table?._id) {
            await cafeTable.findByIdAndUpdate(
                updatedOrder.table._id,
                { status: true },   // or "available: true" depending on your schema
                { new: true }
            );
        }
        emitCafeOrderChanged(updatedOrder.table?._id || updatedOrder.table, updatedOrder);
        res.status(200).json({
            status: 200,
            message: "Payment completed successfully",
            data: updatedOrder
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: error.message
        });
    }
};

exports.getAllCafeunpaid = async (req, res) => {
    try {
        const orders = await cafeOrder.find({ payment: "Pending" }).sort({ createdAt: -1 })
            .populate("items")
            .populate("table")
            .populate("room")
            .populate("items.product");
            
        res.status(200).json({
            status: 200,
            data: orders
        });

    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}