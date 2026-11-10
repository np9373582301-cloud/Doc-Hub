const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  patientId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodGroup: { type: String },
  address: { type: String },
  allergies: [String],
  medicalHistory: { type: String },
  currentMedications: { type: String },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
  photo: { type: String, default: '' },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

PatientSchema.pre('save', async function (next) {
  if (!this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = `PAT-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Patient', PatientSchema);
