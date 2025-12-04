const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'staff', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'department', required: false },
    type: { type: String, required: true },
    message: { type: String, required: true },
    payload: { type: Object, default: {} },
    seen: { type: Boolean, default: false }
  },
  { timestamps: true, versionKey: false }
);

notificationSchema.index({ user: 1, seen: 1, createdAt: -1 });

module.exports = mongoose.model('notification', notificationSchema);
