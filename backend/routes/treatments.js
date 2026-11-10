const express = require('express');
const router = express.Router();
const { getTreatments, getTreatment, createTreatment, updateTreatment, deleteTreatment } = require('../controllers/treatmentController');
const { protect, authorize } = require('../middleware/auth');

router.route('/').get(protect, getTreatments).post(protect, authorize('admin','dentist'), createTreatment);
router.route('/:id').get(protect, getTreatment).put(protect, authorize('admin','dentist'), updateTreatment).delete(protect, authorize('admin'), deleteTreatment);

module.exports = router;
