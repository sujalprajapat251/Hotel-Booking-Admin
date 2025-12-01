const cafeOrder = require('../models/cafeOrderModal.js');
const barOrder = require('../models/barOrderModal.js');
const restroOrder = require('../models/restaurantOrderModal.js');


// exports.addItemTocafeOrder = async (req, res) => {
//     try {
//         const { product, qty, description, name, contact, roomId } = req.body;
//         if (!product) {
//             return res.status(400).json({ status: 400, message: "Product is required" });
//         }
//         const fromValue = 'room';

//         const existingOrder = await cafeOrder
//             .findOne({ from: fromValue, room: roomId, payment: 'Pending' })
//             .sort({ createdAt: -1, _id: -1 });

//         if (existingOrder) {
//             existingOrder.items.push({ product, qty: qty || 1, description, status: 'Pending' });
//             await existingOrder.save();

//             const populated = await existingOrder.populate([
//                 { path: 'items.product' },
//                 { path: 'room' }
//             ]);
//             // if (nameDept === 'cafe') {
//             //     emitCafeOrderChanged(populated.table?._id || tableId, populated);
//             // }
//             return res.status(200).json({ status: 200, message: 'Item added to existing order', data: populated });
//         }

//         const created = await cafeOrder.create({
//             from: fromValue,
//             room: roomId,
//             name,
//             contact,
//             items: [{ product, qty: qty || 1, description, status: 'Pending' }]
//         });

//         const populated = await created.populate([
//             { path: 'items.product' },
//             { path: 'room' }
//         ]);
//         // if (nameDept === 'cafe') {
//         //     emitCafeOrderChanged(populated.table?._id || tableId, populated);
//         // }
//         return res.status(200).json({ status: 200, message: 'New order created and item added', data: populated });
//     } catch (error) {
//         return res.status(500).json({ status: 500, message: error.message });
//     }
// };

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




// exports.addItemTobarOrder = async (req, res) => {
//     try {
//         const { product, qty, description, name, contact, roomId } = req.body;

//         if (!product) {
//             return res.status(400).json({ status: 400, message: "Product is required" });
//         }

//         const fromValue = 'room';

//         const existingOrder = await barOrder
//             .findOne({ from: fromValue, room: roomId, payment: 'Pending' })
//             .sort({ createdAt: -1, _id: -1 });

//         if (existingOrder) {
//             existingOrder.items.push({ product, qty: qty || 1, description, status: 'Pending' });
//             await existingOrder.save();

//             const populated = await existingOrder.populate([
//                 { path: 'items.product' },
//                 { path: 'room' }
//             ]);
//             // if (nameDept === 'cafe') {
//             //     emitCafeOrderChanged(populated.table?._id || tableId, populated);
//             // }
//             return res.status(200).json({ status: 200, message: 'Item added to existing order', data: populated });
//         }

//         const created = await barOrder.create({
//             from: fromValue,
//             room: roomId,
//             name,
//             contact,
//             items: [{ product, qty: qty || 1, description, status: 'Pending' }]
//         });

//         const populated = await created.populate([
//             { path: 'items.product' },
//             { path: 'room' }
//         ]);
//         // if (nameDept === 'cafe') {
//         //     emitCafeOrderChanged(populated.table?._id || tableId, populated);
//         // }
//         return res.status(200).json({ status: 200, message: 'New order created and item added', data: populated });
//     } catch (error) {
//         return res.status(500).json({ status: 500, message: error.message });
//     }
// };

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


// exports.addItemTorestroOrder = async (req, res) => {
//     try {
//         const { product, qty, description, name, contact, roomId } = req.body;

//         if (!product) {
//             return res.status(400).json({ status: 400, message: "Product is required" });
//         }

//         const fromValue = 'room';

//         const existingOrder = await restroOrder
//             .findOne({ from: fromValue, room: roomId, payment: 'Pending' })
//             .sort({ createdAt: -1, _id: -1 });

//         if (existingOrder) {
//             existingOrder.items.push({ product, qty: qty || 1, description, status: 'Pending' });
//             await existingOrder.save();

//             const populated = await existingOrder.populate([
//                 { path: 'items.product' },
//                 { path: 'room' }
//             ]);
//             // if (nameDept === 'cafe') {
//             //     emitCafeOrderChanged(populated.table?._id || tableId, populated);
//             // }
//             return res.status(200).json({ status: 200, message: 'Item added to existing order', data: populated });
//         }

//         const created = await restroOrder.create({
//             from: fromValue,
//             room: roomId,
//             name,
//             contact,
//             items: [{ product, qty: qty || 1, description, status: 'Pending' }]
//         });

//         const populated = await created.populate([
//             { path: 'items.product' },
//             { path: 'room' }
//         ]);
//         // if (nameDept === 'cafe') {
//         //     emitCafeOrderChanged(populated.table?._id || tableId, populated);
//         // }
//         return res.status(200).json({ status: 200, message: 'New order created and item added', data: populated });
//     } catch (error) {
//         return res.status(500).json({ status: 500, message: error.message });
//     }
// };

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

// removed

exports.createOrder = async (req, res) => {
    try {
        const { type, roomId, items, name, contact } = req.body;
        if (!type) return res.status(400).json({ status: 400, message: 'type is required' });
        if (!roomId) return res.status(400).json({ status: 400, message: 'roomId is required' });
        const key = String(type).trim().toLowerCase();
        let Model = null;
        if (key === 'cafe') Model = cafeOrder;
        else if (key === 'bar') Model = barOrder;
        else if (key === 'restaurant' || key === 'restro') Model = restroOrder;
        if (!Model) {
            return res.status(400).json({ status: 400, message: `Unsupported type: ${type}` });
        }

        let normalized = Array.isArray(items) ? items : [];
        normalized = normalized.filter(i => i && i.product).map(i => ({ product: i.product, qty: i.qty || 1, description: i.description, status: 'Pending' }));
        if (normalized.length === 0) {
            return res.status(400).json({ status: 400, message: 'Items array with at least one product is required' });
        }

        const fromValue = 'room';
        const created = await Model.create({
            from: fromValue,
            room: roomId,
            name,
            contact,
            items: normalized
        });
        const populated = await created.populate([
            { path: 'items.product' },
            { path: 'room' }
        ]);
        return res.status(200).json({ status: 200, message: 'Order created', data: populated });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

