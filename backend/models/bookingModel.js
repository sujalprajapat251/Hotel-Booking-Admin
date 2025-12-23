const mongoose = require("mongoose");

const GuestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    countrycode: {
      type: String,
      required: true
  },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    idNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const ReservationSchema = new mongoose.Schema(
  {
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    occupancy: {
      adults: {
        type: Number,
        default: 1,
        min: 1,
      },
      children: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    specialRequests: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const PaymentSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Partial",
        "Refunded",
      ],
      default: "Pending",
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      trim: true,
    },
    method: {
      type: String,
      default: "Cash",
      trim: true,
    },
    transactions: [
      {
        amount: {
          type: Number,
          min: 0,
        },
        method: {
          type: String,
          trim: true,
        },
        status: {
          type: String,
          trim: true,
        },
        paidAt: Date,
        reference: {
          type: String,
          trim: true,
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],
    paymentIntentId: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "room",
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "CheckedIn",
        "CheckedOut",
        "Cancelled",
        "NoShow",
      ],
      default: "Pending",
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    guest: GuestSchema,
    reservation: ReservationSchema,
    payment: PaymentSchema,
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

BookingSchema.index({
  room: 1,
  "reservation.checkInDate": 1,
  "reservation.checkOutDate": 1,
});
BookingSchema.index({ status: 1 });

module.exports = mongoose.model("booking", BookingSchema);
