const User = require('../models/User');
const Donation = require('../models/Donation');
const Delivery = require('../models/Delivery');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalDonations, delivered, pending, topDonors] = await Promise.all([
      User.countDocuments(),
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'delivered' }),
      Donation.countDocuments({ status: 'pending' }),
      User.find({ role: 'donor' })
        .sort({ donationScore: -1 })
        .limit(5)
        .select('name donationScore email phone badges certificates'),
    ]);

    const byStatus = await Donation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      totalUsers,
      totalDonations,
      delivered,
      pending,
      byStatus,
      topDonors,
      activeDeliveries: await Delivery.countDocuments({
        deliveryStatus: { $in: ['assigned', 'in_transit'] },
      }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
