const mongoose = require('mongoose');

const TreatmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  dentist: { type: mongoose.Schema.Types.ObjectId, ref: 'Dentist', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  diagnosis: { type: String, required: true },
  treatmentType: { type: String, required: true },
  toothNumber: { type: String },
  treatmentDate: { type: Date, default: Date.now },
  description: { type: String },
  cost: { type: Number, required: true },
  status: { type: String, enum: ['Planned','In Progress','Completed'], default: 'Completed' },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Treatment', TreatmentSchema);
