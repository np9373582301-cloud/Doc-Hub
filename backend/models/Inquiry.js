const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema(
  {
    referenceId: { type: String, unique: true },
    name: { type: String, required: [true, 'Please provide your name'], trim: true },
    email: { type: String, required: [true, 'Please provide your email'], trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    subject: { type: String, trim: true, default: 'General Consultation' },
    message: { type: String, required: [true, 'Please provide message details'], trim: true },
    status: { type: String, enum: ['Unread', 'Read', 'Replied', 'Resolved'], default: 'Unread' },
    replyMessage: { type: String, default: '' },
    repliedAt: { type: Date },
    repliedBy: { type: String, default: '' },
    resolutionNote: { type: String, default: '' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

InquirySchema.pre('save', async function (next) {
  if (!this.referenceId) {
    const count = await mongoose.model('Inquiry').countDocuments();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    this.referenceId = `INQ-${String(count + 1).padStart(4, '0')}-${randomSuffix}`;
  }
  next();
});

module.exports = mongoose.model('Inquiry', InquirySchema);
