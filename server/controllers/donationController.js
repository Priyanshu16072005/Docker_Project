const Donation = require('../models/Donation');
const User = require('../models/User');
const { geocodeAddress } = require('../services/geocode');
const { findBestNgo } = require('../services/smartMatching');
const { applyDonorRewards } = require('../services/badges');

exports.createDonation = async (req, res) => {
  try {
    const { foodName, foodType, quantity, pickupAddress, expiryTime, pickupLat, pickupLng, notes } =
      req.body;

    if (!req.user.phone) {
      return res.status(400).json({ message: 'Contact phone is required on your profile' });
    }

    let lat = pickupLat != null ? Number(pickupLat) : null;
    let lng = pickupLng != null ? Number(pickupLng) : null;
    if ((lat == null || lng == null) && pickupAddress) {
      const coords = await geocodeAddress(pickupAddress);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
      }
    }

    const donation = await Donation.create({
      foodName,
      foodType,
      quantity,
      pickupAddress,
      expiryTime,
      pickupLat: lat,
      pickupLng: lng,
      notes,
      donorId: req.user._id,
    });

    const ngos = await User.find({ role: 'ngo' });
    const best = findBestNgo(ngos, donation);

    if (best) {
      donation.suggestedNgoId = best.ngoId;
      donation.smartMatch = {
        ngoId: best.ngoId,
        ngoName: best.ngoName,
        score: best.score,
        distanceKm: best.distanceKm,
        breakdown: best.breakdown,
      };
      await donation.save();
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { donationScore: 1 } });
    const rewards = await applyDonorRewards(req.user._id, User);

    const populated = await Donation.findById(donation._id)
      .populate('donorId', 'name email phone')
      .populate('suggestedNgoId', 'name phone address vehicleAvailability');

    res.status(201).json({
      donation: populated,
      smartMatch: donation.smartMatch,
      newBadges: rewards.newBadges,
      newCertificates: rewards.newCertificates,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDonations = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'donor') filter.donorId = req.user._id;
    if (req.query.status) filter.status = req.query.status;
    if (req.user.role === 'ngo' && req.query.nearby === 'true') {
      filter.status = 'pending';
    }

    const donations = await Donation.find(filter)
      .populate('donorId', 'name email phone')
      .populate('ngoId', 'name email phone')
      .populate('suggestedNgoId', 'name phone vehicleAvailability')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donorId', 'name email phone address')
      .populate('ngoId', 'name email phone')
      .populate('suggestedNgoId', 'name phone');
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    const { status, ngoId } = req.body;

    if (req.user.role === 'ngo' && status === 'accepted') {
      donation.status = 'accepted';
      donation.ngoId = req.user._id;
    } else if (req.user.role === 'admin') {
      Object.assign(donation, req.body);
    } else if (
      req.user.role === 'donor' &&
      donation.donorId.toString() === req.user._id.toString()
    ) {
      const allowed = ['foodName', 'foodType', 'quantity', 'pickupAddress', 'expiryTime', 'notes'];
      allowed.forEach((key) => {
        if (req.body[key] !== undefined) donation[key] = req.body[key];
      });
    } else {
      return res.status(403).json({ message: 'Not allowed to update this donation' });
    }

    if (ngoId) donation.ngoId = ngoId;
    await donation.save();
    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (req.user.role !== 'admin' && donation.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    await donation.deleteOne();
    res.json({ message: 'Donation removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
