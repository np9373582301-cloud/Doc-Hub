const express = require('express');
const router = express.Router();
const { getAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment, getAvailableSlots } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/slots', protect, getAvailableSlots);
router.route('/').get(protect, getAppointments).post(protect, createAppointment);
router.route('/:id').get(protect, getAppointment).put(protect, updateAppointment).delete(protect, authorize('admin'), deleteAppointment);

module.exports = router;
