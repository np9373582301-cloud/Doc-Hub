const mongoose = require('mongoose');

const DentistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  specialization: { type: String, required: true },
  experience: { type: Number, default: 0 },
  qualification: { type: String },
  licenseNumber: { type: String },
  photo: { type: String },
  avatar: { type: String },
  bio: { type: String },
  availability: [{
    day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
    startTime: String,
    endTime: String,
    isAvailable: { type: Boolean, default: true },
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Dentist', DentistSchema);
