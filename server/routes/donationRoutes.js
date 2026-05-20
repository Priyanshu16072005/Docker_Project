const express = require('express');
const {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
} = require('../controllers/donationController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/donate', authorize('donor', 'admin'), createDonation);
router.get('/donations', getDonations);
router.get('/donation/:id', getDonationById);
router.put('/donation/:id', updateDonation);
router.delete('/donation/:id', authorize('donor', 'admin'), deleteDonation);

module.exports = router;
