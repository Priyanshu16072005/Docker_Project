const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['donor', 'ngo', 'volunteer', 'admin'];

const badgeSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const certificateSchema = new mongoose.Schema(
  {
    level: Number,
    title: String,
    issuedAt: { type: Date, default: Date.now },
    downloadId: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ROLES, default: 'donor' },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    lat: { type: Number },
    lng: { type: Number },
    vehicleAvailability: { type: Number, default: 0, min: 0 },
    donationScore: { type: Number, default: 0 },
    badges: [badgeSchema],
    certificates: [certificateSchema],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
