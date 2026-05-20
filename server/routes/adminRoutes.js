const express = require('express');
const { getUsers, deleteUser, getAnalytics } = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(auth, authorize('admin'));

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/analytics', getAnalytics);

module.exports = router;
