const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'dentist', 'patient', 'superadmin'], default: 'patient' },
  isSuperAdmin: { type: Boolean, default: false },
  phone: { type: String },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  linkedId: { type: mongoose.Schema.Types.ObjectId, refPath: 'linkedModel' },
  linkedModel: { type: String, enum: ['Patient', 'Dentist'] },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  resetPasswordOtp: { type: String },
  resetPasswordOtpExpire: { type: Date },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwt = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

UserSchema.methods.getResetPasswordOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetPasswordOtp = crypto.createHash('sha256').update(otp).digest('hex');
  this.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

module.exports = mongoose.model('User', UserSchema);
