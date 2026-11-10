const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  dentist: { type: mongoose.Schema.Types.ObjectId, ref: 'Dentist', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  treatmentType: { type: String },
  status: { type: String, enum: ['Pending','Confirmed','Completed','Cancelled'], default: 'Pending' },
  notes: { type: String },
  cancellationReason: { type: String },
}, { timestamps: true });

AppointmentSchema.pre('save', async function (next) {
  if (!this.appointmentId) {
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentId = `APT-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
