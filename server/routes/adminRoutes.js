const express = require('express');
const { getUsers, deleteUser, getAnalytics } = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');
//used to define routes separatly
//Instead of writing everything in:
//index.js
//we separate routes into files.
const router = express.Router();
//his registers global middleware for this specific router. It tells Express: "Any request that comes into this router must pass through these functions first before reaching the final destination
router.use(auth, authorize('admin'));//this express used to passed two distict middleware at one time and execute one by one

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/analytics', getAnalytics);

module.exports = router;
//“We do have an admin page at /admin, but it’s not public. Only users with role: admin can open it. Admin accounts are not on the register form; we create them manually in MongoDB for security.”