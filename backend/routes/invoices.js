const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  markAsPaid,
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/razorpay-key', protect, getRazorpayKey);
router.post('/:id/create-razorpay-order', protect, createRazorpayOrder);
router.post('/:id/verify-razorpay-payment', protect, verifyRazorpayPayment);

router.route('/').get(protect, getInvoices).post(protect, authorize('admin'), createInvoice);
router.route('/:id').get(protect, getInvoice).put(protect, authorize('admin'), updateInvoice).delete(protect, authorize('admin'), deleteInvoice);
router.put('/:id/pay', protect, authorize('admin'), markAsPaid);

module.exports = router;
