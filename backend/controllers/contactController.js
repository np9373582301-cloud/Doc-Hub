const Inquiry = require('../models/Inquiry');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new contact message / clinic inquiry
// @route   POST /api/contact
// @access  Public
exports.createInquiry = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message.',
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const inquiry = await Inquiry.create({
      name: name.trim(),
      email: email.trim(),
      phone: (phone || '').trim(),
      subject: (subject || 'General Consultation').trim(),
      message: message.trim(),
    });

    console.log(`[Contact Form Received] Ref: ${inquiry.referenceId} from ${inquiry.name} (${inquiry.email})`);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received by our clinic front desk.',
      data: {
        id: inquiry._id,
        referenceId: inquiry.referenceId,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        subject: inquiry.subject,
        createdAt: inquiry.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all inquiries
// @route   GET /api/contact
// @access  Private/Admin
exports.getInquiries = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    const total = await Inquiry.countDocuments(query);
    const unreadCount = await Inquiry.countDocuments({ status: 'Unread' });

    const inquiries = await Inquiry.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: inquiries,
      unreadCount,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reply to inquiry via direct email
// @route   POST /api/contact/:id/reply
// @access  Private/Admin
exports.replyInquiry = async (req, res, next) => {
  try {
    const { replyMessage } = req.body;
    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reply message.',
      });
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    const adminName = req.user?.name || 'DocHub Clinic Admin';

    // Send email to patient's email address
    let emailResult = { success: true };
    try {
      emailResult = await sendEmail.inquiryReplied(inquiry, replyMessage.trim(), adminName);
    } catch (mailErr) {
      console.error('Failed to send reply email to patient:', mailErr);
    }

    inquiry.replyMessage = replyMessage.trim();
    inquiry.repliedAt = new Date();
    inquiry.repliedBy = adminName;
    inquiry.status = 'Replied';
    await inquiry.save();

    res.json({
      success: true,
      message: `Reply email successfully delivered to ${inquiry.email}`,
      data: inquiry,
      emailResult,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update inquiry status (and optionally notify patient if resolved)
// @route   PATCH /api/contact/:id
// @access  Private/Admin
exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const { status, resolutionNote } = req.body;
    if (!['Unread', 'Read', 'Replied', 'Resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    const oldStatus = inquiry.status;
    inquiry.status = status;

    if (status === 'Resolved') {
      inquiry.resolvedAt = new Date();
      if (resolutionNote) {
        inquiry.resolutionNote = resolutionNote.trim();
      }

      // If status changed to Resolved, notify patient via email
      if (oldStatus !== 'Resolved') {
        try {
          const adminName = req.user?.name || 'DocHub Clinic Desk';
          await sendEmail.inquiryResolved(inquiry, inquiry.resolutionNote, adminName);
          console.log(`✉️ Resolution email dispatched to ${inquiry.email} for [${inquiry.referenceId}]`);
        } catch (mailErr) {
          console.error('Failed to dispatch resolution email:', mailErr);
        }
      }
    }

    await inquiry.save();

    res.json({
      success: true,
      message: status === 'Resolved' 
        ? `Inquiry marked as Resolved and confirmation email sent to ${inquiry.email}`
        : `Status updated to ${status}`,
      data: inquiry,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (err) {
    next(err);
  }
};
