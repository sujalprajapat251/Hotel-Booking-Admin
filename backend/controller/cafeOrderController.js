const cafeOrder = require('../models/cafeOrderModal');
const barOrder = require('../models/barOrderModal');
const restroOrder = require('../models/restaurantOrderModal');
const cafeTable = require('../models/cafeTableModel');
const barTable = require("../models/barTableModel");
const restroTable = require("../models/restaurantTableModel.js");
const { emitCafeOrderChanged } = require('../socketManager/socketManager');

// exports.createCafeOrder = async (req, res) => {
//     try {
//         const { name, contact, items, from, table, room } = req.body;
//         if (!items || !from) {
//             return res.status(400).json({
//                 status: 400,
//                 message: "All fields are required"
//             });
//         }
//         const newTable = await cafeOrder.create({
//             name,
//             contact,
//             items,
//             from,
//             table: from === 'cafe' ? table : null,  // store table only for cafe
//             room: from === 'hotel' ? room : null    // store room only for hotel
//         });
//         res.status(200).json({
//             status: 200,
//             message: "Cafe Table created successfully..!",
//             data: newTable
//         });

//     } catch (error) {
//         res.status(500).json({
//             status: 500,
//             message: error.message
//         });
//     }
// }

exports.getAllCafeOrders = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }
        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }

        const name = String(dept.name).trim().toLowerCase();
        let Model = null;
        if (name === 'cafe') Model = cafeOrder;
        else if (name === 'bar') Model = barOrder;
        else if (name === 'restaurant' || name === 'restro') Model = restroOrder;
        if (!Model) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        const orders = await Model.find().sort({ createdAt: -1 })
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
        if (!req.user) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }
        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }
        const name = String(dept.name).trim().toLowerCase();
        let Model = null;
        if (name === 'cafe') Model = cafeOrder;
        else if (name === 'bar') Model = barOrder;
        else if (name === 'restaurant' || name === 'restro') Model = restroOrder;
        if (!Model) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        const order = await Model.findById(req.params.id)
            .populate("items")
            .populate("table")
            .populate("room")
            .populate("items.product");

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
        if (!req.user) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }
        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }
        const name = String(dept.name).trim().toLowerCase();
        let Model = null;
        if (name === 'cafe') Model = cafeOrder;
        else if (name === 'bar') Model = barOrder;
        else if (name === 'restaurant' || name === 'restro') Model = restroOrder;
        if (!Model) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        const updated = await Model.findByIdAndUpdate(
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
        if (!req.user) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }
        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }
        const name = String(dept.name).trim().toLowerCase();
        let Model = null;
        if (name === 'cafe') Model = cafeOrder;
        else if (name === 'bar') Model = barOrder;
        else if (name === 'restaurant' || name === 'restro') Model = restroOrder;
        if (!Model) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        const deleted = await Model.findByIdAndDelete(req.params.id);

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


// exports.addItemToOrder = async (req, res) => {
//     try {
//         const { itemId } = req.body;

//         const updatedOrder = await cafeOrder.findByIdAndUpdate(
//             req.params.id,
//             { $push: { items: itemId } },
//             { new: true }
//         );

//         res.status(200).json({
//             status: 200,
//             message: "Item added successfully",
//             data: updatedOrder
//         });

//     } catch (error) {
//         res.status(500).json({ status: 500, message: error.message });
//     }
// };


 

exports.addItemToTableOrder = async (req, res) => {
    try {
        const { product, qty, description, name, contact } = req.body;
        const { tableId } = req.params;

        if (!product) {
            return res.status(400).json({ status: 400, message: "Product is required" });
        }
        if (!req.user) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }
        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }
        const nameDept = String(dept.name).trim().toLowerCase();
        let OrderModel = null;
        if (nameDept === 'cafe') OrderModel = cafeOrder;
        else if (nameDept === 'bar') OrderModel = barOrder;
        else if (nameDept === 'restaurant' || nameDept === 'restro') OrderModel = restroOrder;
        if (!OrderModel) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        const fromValue = nameDept === 'restro' ? 'restaurant' : nameDept;

        const existingOrder = await OrderModel
            .findOne({ from: fromValue, table: tableId, payment: 'Pending' })
            .sort({ createdAt: -1, _id: -1 });

        if (existingOrder) {
            existingOrder.items.push({ product, qty: qty || 1, description, status: 'Pending' });
            await existingOrder.save();

            const populated = await existingOrder.populate([
                { path: 'items.product' },
                { path: 'table' }
            ]);
            if (nameDept === 'cafe') {
                emitCafeOrderChanged(populated.table?._id || tableId, populated);
            }
            return res.status(200).json({ status: 200, message: 'Item added to existing order', data: populated });
        }

        const created = await OrderModel.create({
            from: fromValue,
            table: tableId,
            name,
            contact,
            items: [{ product, qty: qty || 1, description, status: 'Pending' }]
        });

        const populated = await created.populate([
            { path: 'items.product' },
            { path: 'table' }
        ]);
        if (nameDept === 'cafe') {
            emitCafeOrderChanged(populated.table?._id || tableId, populated);
        }
        return res.status(200).json({ status: 200, message: 'New order created and item added', data: populated });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.removeItemFromOrder = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }
        const { id, itemId } = { id: req.params.id, itemId: req.params.itemId };

        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }
        const name = String(dept.name).trim().toLowerCase();
        let Model = null;
        if (name === 'cafe') Model = cafeOrder;
        else if (name === 'bar') Model = barOrder;
        else if (name === 'restaurant' || name === 'restro') Model = restroOrder;
        if (!Model) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        const order = await Model.findById(id);
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

        await Model.findByIdAndUpdate(
            id,
            { $pull: { items: { _id: itemId } } },
            { new: true }
        );

        const updated = await Model.findById(id)
            .populate({ path: 'items.product' })
            .populate({ path: 'table' });
        if (name === 'cafe') {
            emitCafeOrderChanged(updated.table?._id || updated.table, updated);
        }
        return res.status(200).json({ status: 200, message: 'Item removed successfully', data: updated });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getAllCafeItemsOrders = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }
        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }
        const name = String(dept.name).trim().toLowerCase();
        let Model = null;
        if (name === 'cafe') Model = cafeOrder;
        else if (name === 'bar') Model = barOrder;
        else if (name === 'restaurant' || name === 'restro') Model = restroOrder;
        if (!Model) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        const orders = await Model.find()
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
        if (!req.user) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }
        const { status } = req.params;
        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }
        const name = String(dept.name).trim().toLowerCase();
        let Model = null;
        if (name === 'cafe') Model = cafeOrder;
        else if (name === 'bar') Model = barOrder;
        else if (name === 'restaurant' || name === 'restro') Model = restroOrder;
        if (!Model) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        const orders = await Model.find({ status: status }).populate("table")
            .populate("room")
            .populate("items.product");

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
                _id: item._id
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
        if (!req.user) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }
        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }
        const name = String(dept.name).trim().toLowerCase();
        let Model = null;
        if (name === 'cafe') Model = cafeOrder;
        else if (name === 'bar') Model = barOrder;
        else if (name === 'restaurant' || name === 'restro') Model = restroOrder;
        if (!Model) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        const orders = await Model.find().populate("table")
            .populate("room")
            .populate("items.product");

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
                _id: item._id
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
        if (!req.user) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }
        const { orderId, itemId } = req.body;
        const chefId = req.user?.id;

        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }
        const name = String(dept.name).trim().toLowerCase();
        let Model = null;
        if (name === 'cafe') Model = cafeOrder;
        else if (name === 'bar') Model = barOrder;
        else if (name === 'restaurant' || name === 'restro') Model = restroOrder;
        if (!Model) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        const order = await Model.findById(orderId);

        if (!order) {
            return res.status(404).json({
                status: 404,
                message: "Order not found"
            });
        }

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

        const steps = {
            "Pending": "Preparing",
            "Preparing": "Done",
            "Done": "Served",
            "Served": "Served"
        };

        const currentStatus = item.status;
        const newStatus = steps[currentStatus];

        if (currentStatus === "Pending" && newStatus === "Preparing") {
            item.preparedBy = chefId;
        }

        item.status = newStatus;

        await order.save();

        const populatedOrder = await Model.findById(orderId)
            .populate("table")
            .populate("room")
            .populate("items.product");
        if (name === 'cafe') {
            emitCafeOrderChanged(populatedOrder.table?._id || populatedOrder.table, populatedOrder);
        }
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
        if (!req.user) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }
        const { orderId } = req.params;
        const { paymentMethod } = req.body;

        if (!paymentMethod) {
            return res.status(400).json({
                status: 400,
                message: "Payment method is required"
            });
        }

        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }
        const name = String(dept.name).trim().toLowerCase();
        let OrderModel = null;
        let TableModel = null;
        if (name === 'cafe') { OrderModel = cafeOrder; TableModel = cafeTable; }
        else if (name === 'bar') { OrderModel = barOrder; TableModel = barTable; }
        else if (name === 'restaurant' || name === 'restro') { OrderModel = restroOrder; TableModel = restroTable; }
        if (!OrderModel || !TableModel) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        const updatedOrder = await OrderModel.findByIdAndUpdate(
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
            await TableModel.findByIdAndUpdate(
                updatedOrder.table._id,
                { status: true },
                { new: true }
            );
        }
        if (name === 'cafe') {
            emitCafeOrderChanged(updatedOrder.table?._id || updatedOrder.table, updatedOrder);
        }
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
        if (!req.user) {
            return res.status(401).json({ status: 401, message: 'Unauthorized' });
        }
        const Department = require('../models/departmentModel');
        const dept = await Department.findById(req.user.department);
        if (!dept || !dept.name) {
            return res.status(400).json({ status: 400, message: 'User department not found' });
        }
        const name = String(dept.name).trim().toLowerCase();
        let Model = null;
        if (name === 'cafe') Model = cafeOrder;
        else if (name === 'bar') Model = barOrder;
        else if (name === 'restaurant' || name === 'restro') Model = restroOrder;
        if (!Model) {
            return res.status(400).json({ status: 400, message: `Unsupported department: ${dept.name}` });
        }

        const orders = await Model.find({ payment: "Pending" }).sort({ createdAt: -1 })
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