const User = require('../models/User');
const Donation = require('../models/Donation');

exports.getPublicStats = async (_req, res) => {
  try {
    const [totalUsers, totalDonations, delivered, pending, mealsAgg] = await Promise.all([
      User.countDocuments(),
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'delivered' }),
      Donation.countDocuments({ status: 'pending' }),
      Donation.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, meals: { $sum: '$quantity' } } },
      ]),
    ]);
    res.json({
      totalUsers,
      totalDonations,
      delivered,
      pending,
      mealsServed: mealsAgg[0]?.meals || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
