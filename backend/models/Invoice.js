const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  treatment: { type: mongoose.Schema.Types.ObjectId, ref: 'Treatment' },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  items: [{
    description: String,
    amount: Number,
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash','Card','UPI','Net Banking','Insurance','Razorpay'], default: 'Cash' },
  paymentStatus: { type: String, enum: ['Paid','Pending','Partially Paid'], default: 'Pending' },
  paidAmount: { type: Number, default: 0 },
  dueDate: { type: Date },
  paidDate: { type: Date },
  notes: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
}, { timestamps: true });

InvoiceSchema.pre('save', async function (next) {
  if (!this.invoiceId) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceId = `INV-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
