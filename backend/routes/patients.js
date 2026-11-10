const express = require('express');
const router = express.Router();
const { getPatients, getPatient, createPatient, updatePatient, deletePatient, getMyProfile } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, authorize('patient'), getMyProfile);
router.route('/').get(protect, authorize('admin','dentist'), getPatients).post(protect, authorize('admin'), createPatient);
router.route('/:id').get(protect, getPatient).put(protect, authorize('admin','patient'), updatePatient).delete(protect, authorize('admin'), deletePatient);

module.exports = router;
