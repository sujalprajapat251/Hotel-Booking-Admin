const Notification = require('../models/notificationModel');

const getMyNotifications = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 401, message: 'Unauthorized' });
    }
    const items = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    const unread = await Notification.countDocuments({ user: req.user._id, seen: false });
    return res.status(200).json({ status: 200, data: items, unread });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const markSeen = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 401, message: 'Unauthorized' });
    }
    const { id } = req.params;
    const updated = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { seen: true },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ status: 404, message: 'Notification not found' });
    }
    return res.status(200).json({ status: 200, data: updated });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const clearAll = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 401, message: 'Unauthorized' });
    }
    await Notification.deleteMany({ user: req.user._id });
    return res.status(200).json({ status: 200, message: 'Notifications cleared' });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

module.exports = { getMyNotifications, markSeen, clearAll };
