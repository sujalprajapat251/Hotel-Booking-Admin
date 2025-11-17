const mongoose = require("mongoose");

const FeatureSchema = mongoose.Schema(
  {
    feature: {
      type: String,
      required: true,
    },
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'roomType',
      required: true
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("feature", FeatureSchema);
