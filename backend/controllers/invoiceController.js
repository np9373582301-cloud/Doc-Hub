const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpayInstance = () => {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys not configured on server.');
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

exports.getInvoices = async (req, res, next) => {
  try {
    const { patient, paymentStatus, page = 1, limit = 10 } = req.query;
    const query = {};
    if (patient) query.patient = patient;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (req.user.role === 'patient') {
      const pat = await Patient.findOne({ user: req.user.id });
      if (pat) query.patient = pat._id;
    }
    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('patient', 'name patientId phone')
      .populate('treatment', 'treatmentType diagnosis')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: invoices, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getInvoice = async (req, res, next) => {
  try {
    const inv = await Invoice.findById(req.params.id).populate('patient').populate('treatment');
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: inv });
  } catch (err) { next(err); }
};

exports.createInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.create(req.body);
    res.status(201).json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

exports.updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patient', 'name patientId').populate('treatment', 'treatmentType');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (err) { next(err); }
};

exports.markAsPaid = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: 'Paid', paidAmount: undefined, paidDate: new Date(), paymentMethod },
      { new: true }
    ).populate('patient', 'name patientId');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    invoice.paidAmount = invoice.total;
    await invoice.save();
    res.json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

// @desc    Get Razorpay Key ID for client
// @route   GET /api/invoices/razorpay-key
// @access  Private
exports.getRazorpayKey = async (req, res, next) => {
  try {
    const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
    if (!keyId) {
      return res.status(500).json({ success: false, message: 'Razorpay Key ID not configured' });
    }
    res.json({ success: true, keyId });
  } catch (err) { next(err); }
};

// @desc    Create Razorpay Order for an Invoice
// @route   POST /api/invoices/:id/create-razorpay-order
// @access  Private (Patient/Admin)
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('patient');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'This invoice is already marked as Paid.' });
    }

    const amountInPaise = Math.round(invoice.total * 100);
    if (amountInPaise <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid invoice amount for payment.' });
    }

    const razorpay = getRazorpayInstance();

    // Create Razorpay Order
    // Receipt can be max 40 chars
    const cleanReceipt = String(invoice.invoiceId || invoice._id).substring(0, 40);
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: cleanReceipt,
      notes: {
        invoiceId: invoice.invoiceId,
        patientName: invoice.patient?.name || '',
      },
    };

    const order = await razorpay.orders.create(options);
    invoice.razorpayOrderId = order.id;
    await invoice.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: (process.env.RAZORPAY_KEY_ID || '').trim(),
      invoice: {
        id: invoice._id,
        invoiceId: invoice.invoiceId,
        total: invoice.total,
        patientName: invoice.patient?.name,
        patientEmail: invoice.patient?.email,
        patientPhone: invoice.patient?.phone,
      },
    });
  } catch (err) {
    console.error('Razorpay Order Creation Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to initialize Razorpay payment order',
    });
  }
};

// @desc    Verify Razorpay Payment Signature and Mark Invoice Paid
// @route   POST /api/invoices/:id/verify-razorpay-payment
// @access  Private (Patient/Admin)
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment verification parameters.',
      });
    }

    const invoice = await Invoice.findById(req.params.id).populate('patient');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch.',
      });
    }

    // Mark invoice as Paid via Razorpay
    invoice.paymentStatus = 'Paid';
    invoice.paymentMethod = 'Razorpay';
    invoice.paidAmount = invoice.total;
    invoice.paidDate = new Date();
    invoice.razorpayOrderId = razorpay_order_id;
    invoice.razorpayPaymentId = razorpay_payment_id;
    invoice.razorpaySignature = razorpay_signature;
    await invoice.save();

    console.log(`💳 [Razorpay Payment Success] Invoice ${invoice.invoiceId} paid: ₹${invoice.total} (Payment ID: ${razorpay_payment_id})`);

    res.json({
      success: true,
      message: 'Payment verified successfully! Invoice is now Paid.',
      data: invoice,
    });
  } catch (err) {
    console.error('Razorpay Verification Error:', err);
    next(err);
  }
};
