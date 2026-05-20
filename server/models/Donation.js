const mongoose = require('mongoose');

const STATUSES = ['pending', 'accepted', 'assigned', 'picked_up', 'delivered', 'cancelled'];

const matchInfoSchema = new mongoose.Schema(
  {
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ngoName: String,
    score: Number,
    distanceKm: Number,
    breakdown: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const donationSchema = new mongoose.Schema(
  {
    foodName: { type: String, required: true },
    foodType: { type: String },
    quantity: { type: Number, required: true },
    pickupAddress: { type: String, required: true },
    pickupLat: { type: Number },
    pickupLng: { type: Number },
    expiryTime: { type: Date, required: true },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    suggestedNgoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    smartMatch: matchInfoSchema,
    status: { type: String, enum: STATUSES, default: 'pending' },
    notes: { type: String },
  },
  { timestamps: true }
);

donationSchema.index({ status: 1, expiryTime: 1 });
donationSchema.index({ pickupLat: 1, pickupLng: 1 });

module.exports = mongoose.model('Donation', donationSchema);
module.exports.STATUSES = STATUSES;
