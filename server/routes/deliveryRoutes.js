const express = require('express');
const {
  assignVolunteer,
  getDeliveries,
  updateDeliveryStatus,
  pickTask,
} = require('../controllers/deliveryController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/assign-volunteer', authorize('ngo', 'admin'), assignVolunteer);
router.post('/pick-task', authorize('volunteer'), pickTask);
router.get('/deliveries', getDeliveries);
router.put('/delivery-status/:id', updateDeliveryStatus);

module.exports = router;
