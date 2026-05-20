const Delivery = require('../models/Delivery');
const Donation = require('../models/Donation');

exports.assignVolunteer = async (req, res) => {
  try {
    const { donationId, volunteerId } = req.body;
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    const vid = volunteerId || req.user._id;
    const isVolunteerSelf = req.user.role === 'volunteer';

    if (isVolunteerSelf && !['accepted', 'assigned'].includes(donation.status)) {
      return res.status(400).json({ message: 'Donation must be accepted by an NGO first' });
    }
    if (!isVolunteerSelf && req.user.role !== 'admin' && !['accepted', 'assigned'].includes(donation.status)) {
      return res.status(400).json({ message: 'Donation must be accepted before assigning volunteer' });
    }
    const delivery = await Delivery.findOneAndUpdate(
      { donationId },
      {
        donationId,
        volunteerId: vid,
        ngoId: donation.ngoId || req.user._id,
        deliveryStatus: 'assigned',
      },
      { upsert: true, new: true }
    ).populate('volunteerId', 'name email phone');

    donation.status = 'assigned';
    await donation.save();
    res.status(201).json(delivery);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Volunteer already assigned to this donation' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.getDeliveries = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'volunteer') filter.volunteerId = req.user._id;
    if (req.user.role === 'ngo') filter.ngoId = req.user._id;

    const deliveries = await Delivery.find(filter)
      .populate('donationId')
      .populate('volunteerId', 'name email phone')
      .sort({ updatedAt: -1 });
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryStatus, deliveryNotes } = req.body;
    const delivery = await Delivery.findById(req.params.id).populate('donationId');
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    const isVolunteer = delivery.volunteerId.toString() === req.user._id.toString();
    const isNgoOrAdmin = ['ngo', 'admin'].includes(req.user.role);
    if (!isVolunteer && !isNgoOrAdmin) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    delivery.deliveryStatus = deliveryStatus;
    if (deliveryNotes) delivery.deliveryNotes = deliveryNotes;

    const statusMap = {
      in_transit: 'picked_up',
      completed: 'delivered',
    };

    if (deliveryStatus === 'in_transit') delivery.pickupTime = new Date();
    if (deliveryStatus === 'completed') delivery.completedTime = new Date();

    await delivery.save();

    if (statusMap[deliveryStatus] && delivery.donationId) {
      await Donation.findByIdAndUpdate(delivery.donationId._id, {
        status: statusMap[deliveryStatus],
      });
    }

    res.json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.pickTask = async (req, res) => {
  req.body.volunteerId = req.user._id;
  return exports.assignVolunteer(req, res);
};
