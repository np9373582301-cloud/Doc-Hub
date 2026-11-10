const express = require('express');
const router = express.Router();
const { getDentists, getDentist, createDentist, updateDentist, deleteDentist, getMyProfile } = require('../controllers/dentistController');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, authorize('dentist'), getMyProfile);
router.route('/').get(protect, getDentists).post(protect, authorize('admin'), createDentist);
router.route('/:id').get(protect, getDentist).put(protect, authorize('admin','dentist'), updateDentist).delete(protect, authorize('admin'), deleteDentist);

module.exports = router;
