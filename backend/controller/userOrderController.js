const cafeOrder = require('../models/cafeOrderModal.js');
const barOrder = require('../models/barOrderModal.js');
const restroOrder = require('../models/restaurantOrderModal.js');
const CafeItem = require('../models/cafeitemModel');
const BarItem = require('../models/baritemModel');
const RestaurantItem = require('../models/restaurantitemModel');
let stripe = null;

try {
    const Stripe = require('stripe');
    stripe = Stripe(process.env.STRIPE_SECRET);
} catch {}

exports.getOrdercafeByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const lastUnpaidOrder = await cafeOrder
            .findOne({ from: 'room', room: roomId, payment: 'Paid' })
            .sort({ createdAt: -1, _id: -1 })
            .populate({ path: 'items.product', model: 'cafeitem' });
        return res.status(200).json({ status: 200, data: lastUnpaidOrder });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
}

exports.getOrderbarByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const lastUnpaidOrder = await barOrder
            .findOne({ from: 'room', room: roomId, payment: 'Paid' })
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

        return res.status(200).json({ status: 200, message: 'Item removed successfully', data: updated });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.getOrderrestroByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const lastUnpaidOrder = await restroOrder
            .findOne({ from: 'room', room: roomId, payment: 'Paid' })
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
        const { type, roomId, items, name, contact, paymentIntentId } = req.body;
        if (!type) return res.status(400).json({ status: 400, message: 'type is required' });
        if (!roomId) return res.status(400).json({ status: 400, message: 'roomId is required' });
        if (!paymentIntentId) return res.status(400).json({ status: 400, message: 'paymentIntentId is required' });
        if (!stripe) return res.status(500).json({ status: 500, message: 'Stripe SDK not initialized on server' });
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

        // const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        // if (!pi || pi.status !== 'succeeded') {
        //     return res.status(402).json({ status: 402, message: 'Payment not completed. Order not created.' });
        // }

        const fromValue = 'room';
        const created = await Model.create({
            from: fromValue,
            room: roomId,
            name,
            contact,
            items: normalized,
            paymentIntentId : paymentIntentId,
        });
        const populated = await created.populate([
            { path: 'items.product' },
            { path: 'room' }
        ]);
        const totalAmount = await calculateTotalAmount(type, normalized);
        populated.payment = 'Paid';
        populated.paymentMethod = 'Card';
        populated.total = totalAmount;
        await populated.save();
        return res.status(200).json({ status: 200, message: 'Order created with successful payment', data: populated });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

async function calculateTotalAmount(type, items) {
    const key = String(type).trim().toLowerCase();
    let ItemModel = null;
    if (key === 'cafe') ItemModel = CafeItem;
    else if (key === 'bar') ItemModel = BarItem;
    else if (key === 'restaurant' || key === 'restro') ItemModel = RestaurantItem;
    if (!ItemModel) return 0;

    const ids = items.map(i => i.product);
    const products = await ItemModel.find({ _id: { $in: ids } }).select('_id price');
    const priceMap = new Map(products.map(p => [String(p._id), Number(p.price) || 0]));
    return items.reduce((sum, i) => sum + (priceMap.get(String(i.product)) || 0) * (Number(i.qty) || 1), 0);
}

exports.createOrderPaymentIntent = async (req, res) => {
    try {
        const { type, items, } = req.body;
        if (!stripe) return res.status(500).json({ status: 500, message: 'Stripe SDK not initialized on server' });
        if (!type) return res.status(400).json({ status: 400, message: 'type is required' });
        let normalized = Array.isArray(items) ? items : [];
        normalized = normalized.filter(i => i && i.product).map(i => ({ product: i.product, qty: i.qty || 1 }));
        if (normalized.length === 0) return res.status(400).json({ status: 400, message: 'Items array with at least one product is required' });

        const totalAmount = await calculateTotalAmount(type, normalized);
        const amountMinor = Math.round(totalAmount * 100);
        const intent = await stripe.paymentIntents.create({
            amount: amountMinor,
            currency: 'usd',
            payment_method_types: ['card']
        });
        return res.status(200).json({ status: 200, clientSecret: intent.client_secret, paymentIntentId: intent.id, amount: totalAmount });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message });
    }
};

