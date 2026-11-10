const User = require('../models/User');
const Patient = require('../models/Patient');
const Dentist = require('../models/Dentist');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const sendToken = async (user, statusCode, res) => {
  const token = user.getSignedJwt();
  let avatar = user.avatar || '';
  if (!avatar) {
    try {
      if (user.role === 'patient') {
        const p = await Patient.findOne({ $or: [{ user: user._id }, { email: user.email }] });
        if (p && (p.photo || p.avatar)) avatar = p.photo || p.avatar;
      } else if (user.role === 'dentist') {
        const d = await Dentist.findOne({ $or: [{ user: user._id }, { email: user.email }] });
        if (d && (d.photo || d.avatar)) avatar = d.photo || d.avatar;
      }
    } catch (_) {}
  }
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar,
      photo: avatar,
      isSuperAdmin: !!(user.isSuperAdmin || user.role === 'superadmin'),
      linkedId: user.linkedId,
    },
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    // Block registering as admin or superadmin via public registration
    const assignedRole = role === 'dentist' ? 'dentist' : 'patient';

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      // Check if this existing account is an orphaned record whose profile was deleted from admin side
      if (assignedRole === 'dentist') {
        const dentistExists = await Dentist.findOne({ $or: [{ user: exists._id }, { email: normalizedEmail }], isActive: true });
        if (!dentistExists) {
          // Previous dentist was deleted from admin side - clean up and allow re-registration
          await Dentist.deleteMany({ $or: [{ user: exists._id }, { email: normalizedEmail }] });
          await User.findByIdAndDelete(exists._id);
        } else {
          return res.status(400).json({ success: false, message: 'An account with this email is already registered' });
        }
      } else if (assignedRole === 'patient') {
        const patientExists = await Patient.findOne({ $or: [{ user: exists._id }, { email: normalizedEmail }], isActive: true });
        if (!patientExists) {
          await Patient.deleteMany({ $or: [{ user: exists._id }, { email: normalizedEmail }] });
          await User.findByIdAndDelete(exists._id);
        } else {
          return res.status(400).json({ success: false, message: 'An account with this email is already registered' });
        }
      } else {
        return res.status(400).json({ success: false, message: 'An account with this email is already registered' });
      }
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: assignedRole,
      phone: phone ? phone.trim() : '',
    });

    if (assignedRole === 'patient') {
      const patient = await Patient.create({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        user: user._id,
      });
      user.linkedId = patient._id;
      user.linkedModel = 'Patient';
      await user.save();
    } else if (assignedRole === 'dentist') {
      const dentist = await Dentist.create({
        user: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        specialization: 'General Dentistry',
      });
      user.linkedId = dentist._id;
      user.linkedModel = 'Dentist';
      await user.save();
    }

    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    // Auto-heal / ensure linked profile exists for dentist or patient
    if (user.role === 'dentist') {
      let dentist = await Dentist.findOne({ $or: [{ user: user._id }, { email: user.email }] });
      if (!dentist) {
        dentist = await Dentist.create({
          user: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          specialization: 'General Dentistry',
          isActive: true,
        });
        user.linkedId = dentist._id;
        user.linkedModel = 'Dentist';
        await user.save();
      } else {
        let needsSave = false;
        if (!dentist.user || dentist.user.toString() !== user._id.toString()) {
          dentist.user = user._id;
          needsSave = true;
        }
        if (!dentist.isActive) {
          dentist.isActive = true;
          needsSave = true;
        }
        if (needsSave) await dentist.save();
        if (!user.linkedId || user.linkedId.toString() !== dentist._id.toString()) {
          user.linkedId = dentist._id;
          user.linkedModel = 'Dentist';
          await user.save();
        }
      }
    } else if (user.role === 'patient') {
      let patient = await Patient.findOne({ $or: [{ user: user._id }, { email: user.email }] });
      if (!patient) {
        patient = await Patient.create({
          user: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          isActive: true,
        });
        user.linkedId = patient._id;
        user.linkedModel = 'Patient';
        await user.save();
      } else {
        let needsSave = false;
        if (!patient.user || patient.user.toString() !== user._id.toString()) {
          patient.user = user._id;
          needsSave = true;
        }
        if (!patient.isActive) {
          patient.isActive = true;
          needsSave = true;
        }
        if (needsSave) await patient.save();
        if (!user.linkedId || user.linkedId.toString() !== patient._id.toString()) {
          user.linkedId = patient._id;
          user.linkedModel = 'Patient';
          await user.save();
        }
      }
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const updateData = { name, phone };
    if (avatar !== undefined) updateData.avatar = avatar;
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password — generate reset token
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with that email address' });

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // In a real production app you'd email this link.
    // For local dev we return the token directly so the UI can redirect.
    const resetUrl = `${req.headers.origin || 'http://localhost:5173'}/reset-password/${resetToken}`;

    res.json({
      success: true,
      message: 'Reset link generated successfully',
      resetUrl, // frontend uses this to redirect
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password using token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful! You can now log in.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Send 6-digit OTP to user email
exports.sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Please enter your email address' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ success: false, message: 'No account found with that email address' });

    const otp = user.getResetPasswordOtp();
    await user.save({ validateBeforeSave: false });

    // Send email via Resend or Nodemailer
    const emailResult = await sendEmail.sendOtp(user, otp);

    res.json({
      success: true,
      message: `A 6-digit OTP verification code has been sent to ${user.email}`,
      provider: emailResult.provider,
      // In development mode when no keys are provided yet, include hint
      hint: emailResult.provider === 'simulated' ? `Dev mode code: ${otp}` : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify 6-digit OTP
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    const hashedOtp = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password with verified OTP
exports.resetPasswordWithOtp = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const hashedOtp = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully! You can now log in.' });
  } catch (err) {
    next(err);
  }
};
