const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  replyInquiry,
  deleteInquiry,
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

// Public route to submit an inquiry from landing page
router.post('/', createInquiry);

// Protected routes for admin to manage inquiries
router.get('/', protect, authorize('admin'), getInquiries);
router.patch('/:id', protect, authorize('admin'), updateInquiryStatus);
router.post('/:id/reply', protect, authorize('admin'), replyInquiry);
router.delete('/:id', protect, authorize('admin'), deleteInquiry);

module.exports = router;

