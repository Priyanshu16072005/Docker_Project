const mongoose = require('mongoose');

const DELIVERY_STATUSES = ['assigned', 'in_transit', 'completed', 'failed'];

const deliverySchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      unique: true,
    },
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deliveryStatus: { type: String, enum: DELIVERY_STATUSES, default: 'assigned' },
    pickupTime: { type: Date },
    completedTime: { type: Date },
    deliveryNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Delivery', deliverySchema);
module.exports.DELIVERY_STATUSES = DELIVERY_STATUSES;
