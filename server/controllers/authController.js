const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address,
  donationScore: user.donationScore,
  badges: user.badges || [],
  certificates: user.certificates || [],
  vehicleAvailability: user.vehicleAvailability,
});

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      lat,
      lng,
      vehicleAvailability,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (!phone?.trim()) {
      return res.status(400).json({ message: 'Contact phone is required' });
    }

    if (role === 'ngo') {
      if (!address?.trim()) {
        return res.status(400).json({ message: 'Address is required for NGOs' });
      }
      if (vehicleAvailability == null || Number(vehicleAvailability) < 1) {
        return res.status(400).json({
          message: 'Vehicle capacity (servings you can transport) is required for NGOs',
        });
      }
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone: phone.trim(),
      address,
      lat: lat != null ? Number(lat) : undefined,
      lng: lng != null ? Number(lng) : undefined,
      vehicleAvailability: role === 'ngo' ? Number(vehicleAvailability) : 0,
    });

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};
