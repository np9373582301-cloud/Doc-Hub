const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  prescriptionId: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  dentist: { type: mongoose.Schema.Types.ObjectId, ref: 'Dentist', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  diagnosis: { type: String },
  medicines: [{
    name: { type: String, required: true },
    dosage: { type: String },
    frequency: { type: String },
    duration: { type: String },
    instructions: { type: String },
  }],
  notes: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

PrescriptionSchema.pre('save', async function (next) {
  if (!this.prescriptionId) {
    const count = await mongoose.model('Prescription').countDocuments();
    this.prescriptionId = `RX-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
