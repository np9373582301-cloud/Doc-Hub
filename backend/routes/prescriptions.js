const express = require('express');
const router = express.Router();
const { getPrescriptions, getPrescription, createPrescription, updatePrescription, deletePrescription } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

router.route('/').get(protect, getPrescriptions).post(protect, authorize('admin','dentist'), createPrescription);
router.route('/:id').get(protect, getPrescription).put(protect, authorize('admin','dentist'), updatePrescription).delete(protect, authorize('admin'), deletePrescription);

module.exports = router;
