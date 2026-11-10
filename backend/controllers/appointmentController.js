const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Dentist = require('../models/Dentist');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

exports.getAppointments = async (req, res, next) => {
  try {
    const { search, status, dentist, patient, date, page = 1, limit = 10, today } = req.query;
    const query = {};
    if (status) query.status = status;
    if (dentist) query.dentist = dentist;
    if (patient) query.patient = patient;
    if (today === 'true') {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      query.date = { $gte: start, $lte: end };
    } else if (date) {
      const d = new Date(date);
      const start = new Date(d); start.setHours(0,0,0,0);
      const end = new Date(d); end.setHours(23,59,59,999);
      query.date = { $gte: start, $lte: end };
    }
    if (req.user.role === 'dentist') {
      const doc = await Dentist.findOne({ user: req.user.id });
      if (doc) query.dentist = doc._id;
    }
    if (req.user.role === 'patient') {
      const pat = await Patient.findOne({ user: req.user.id });
      if (pat) query.patient = pat._id;
    }
    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'name patientId phone')
      .populate('dentist', 'name specialization')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: appointments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('patient').populate('dentist');
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appt });
  } catch (err) { next(err); }
};

exports.createAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.create(req.body);
    await appt.populate('patient', 'name patientId email user');
    await appt.populate('dentist', 'name specialization email');

    // Send confirmation email
    try {
      const patientUser = await User.findById(appt.patient.user).select('email name');
      if (patientUser) {
        await sendEmail.appointmentBooked(patientUser, appt.dentist, appt);
      }
    } catch (mailErr) {
      console.warn('Appointment email failed:', mailErr.message);
    }

    res.status(201).json({ success: true, data: appt });
  } catch (err) { next(err); }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const previous = await Appointment.findById(req.params.id).select('status');
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('patient', 'name patientId email user').populate('dentist', 'name specialization');
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // Send email if status changed
    if (previous && req.body.status && previous.status !== req.body.status) {
      try {
        const patientUser = await User.findById(appt.patient.user).select('email name');
        if (patientUser) {
          await sendEmail.appointmentStatusChanged(patientUser, appt, appt.status);
        }
      } catch (mailErr) {
        console.warn('Status email failed:', mailErr.message);
      }
    }

    res.json({ success: true, data: appt });
  } catch (err) { next(err); }
};

exports.deleteAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findByIdAndDelete(req.params.id);
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (err) { next(err); }
};

exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { dentistId, date } = req.query;
    const allSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];
    const d = new Date(date);
    const start = new Date(d); start.setHours(0,0,0,0);
    const end = new Date(d); end.setHours(23,59,59,999);
    const booked = await Appointment.find({
      dentist: dentistId,
      date: { $gte: start, $lte: end },
      status: { $in: ['Pending','Confirmed'] },
    }).select('timeSlot');
    const bookedSlots = booked.map(a => a.timeSlot);
    const available = allSlots.filter(s => !bookedSlots.includes(s));
    res.json({ success: true, data: available });
  } catch (err) { next(err); }
};
