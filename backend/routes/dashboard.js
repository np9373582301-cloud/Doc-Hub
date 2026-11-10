const express = require('express');
const router = express.Router();
const { getAdminStats, getDentistStats, getPatientStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/admin', protect, authorize('admin'), getAdminStats);
router.get('/dentist', protect, authorize('dentist'), getDentistStats);
router.get('/patient', protect, authorize('patient'), getPatientStats);

module.exports = router;
