const Patient = require('../models/Patient');
const Dentist = require('../models/Dentist');
const Appointment = require('../models/Appointment');
const Treatment = require('../models/Treatment');
const Invoice = require('../models/Invoice');

exports.getAdminStats = async (req, res, next) => {
  try {
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
    const [totalPatients, totalDentists, todayAppts, completedAppts, pendingInvoices, paidInvoices] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Dentist.countDocuments({ isActive: true }),
      Appointment.countDocuments({ date: { $gte: todayStart, $lte: todayEnd } }),
      Appointment.countDocuments({ status: 'Completed' }),
      Invoice.aggregate([{ $match: { paymentStatus: 'Pending' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Invoice.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    ]);
    const todayRevenue = await Invoice.aggregate([
      { $match: { paidDate: { $gte: todayStart, $lte: todayEnd }, paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const recentPatients = await Patient.find({ isActive: true }).sort({ createdAt: -1 }).limit(5);
    const upcomingAppts = await Appointment.find({
      date: { $gte: new Date() },
      status: { $in: ['Pending','Confirmed'] },
    }).populate('patient','name patientId').populate('dentist','name').sort({ date: 1 }).limit(5);
    // Monthly revenue chart (last 6 months)
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); sixMonthsAgo.setDate(1); sixMonthsAgo.setHours(0,0,0,0);
    const revenueChart = await Invoice.aggregate([
      { $match: { paymentStatus: 'Paid', paidDate: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$paidDate' }, month: { $month: '$paidDate' } }, revenue: { $sum: '$total' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    const appointmentChart = await Appointment.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' }, status: '$status' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    res.json({
      success: true,
      data: {
        totalPatients,
        totalDentists,
        todayAppointments: todayAppts,
        completedAppointments: completedAppts,
        todayRevenue: todayRevenue[0]?.total || 0,
        totalRevenue: paidInvoices[0]?.total || 0,
        pendingAmount: pendingInvoices[0]?.total || 0,
        recentPatients,
        upcomingAppointments: upcomingAppts,
        revenueChart,
        appointmentChart,
      },
    });
  } catch (err) { next(err); }
};

exports.getDentistStats = async (req, res, next) => {
  try {
    const Dentist = require('../models/Dentist');
    const User = require('../models/User');
    let dentist = await Dentist.findOne({ user: req.user.id });
    if (!dentist && req.user.email) {
      dentist = await Dentist.findOne({ email: req.user.email });
    }
    if (!dentist) {
      dentist = await Dentist.create({
        user: req.user.id,
        name: req.user.name || 'Doctor',
        email: req.user.email,
        phone: req.user.phone || '',
        specialization: 'General Dentistry',
        isActive: true,
      });
      await User.findByIdAndUpdate(req.user.id, { linkedId: dentist._id, linkedModel: 'Dentist' });
    } else {
      let needsSave = false;
      if (!dentist.isActive) { dentist.isActive = true; needsSave = true; }
      if (!dentist.user || dentist.user.toString() !== req.user.id) { dentist.user = req.user.id; needsSave = true; }
      if (needsSave) await dentist.save();
    }

    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
    const [todayAppts, totalPatients, completedTreatments, pendingTreatments] = await Promise.all([
      Appointment.countDocuments({ dentist: dentist._id, date: { $gte: todayStart, $lte: todayEnd }, status: { $in: ['Pending','Confirmed'] } }),
      Appointment.distinct('patient', { dentist: dentist._id }),
      Treatment.countDocuments({ dentist: dentist._id, status: 'Completed' }),
      Treatment.countDocuments({ dentist: dentist._id, status: { $in: ['Planned','In Progress'] } }),
    ]);
    const todayAppointments = await Appointment.find({
      dentist: dentist._id, date: { $gte: todayStart, $lte: todayEnd },
    }).populate('patient','name patientId phone').sort({ timeSlot: 1 });
    const upcomingAppts = await Appointment.find({
      dentist: dentist._id, date: { $gt: todayEnd }, status: { $in: ['Pending','Confirmed'] },
    }).populate('patient','name patientId').sort({ date: 1 }).limit(5);
    res.json({
      success: true,
      data: { todayAppointments: todayAppts, totalPatients: totalPatients.length, completedTreatments, pendingTreatments, todayAppointmentList: todayAppointments, upcomingAppointments: upcomingAppts },
    });
  } catch (err) { next(err); }
};

exports.getPatientStats = async (req, res, next) => {
  try {
    const Patient = require('../models/Patient');
    const User = require('../models/User');
    let patient = await Patient.findOne({ user: req.user.id });
    if (!patient && req.user.email) {
      patient = await Patient.findOne({ email: req.user.email });
    }
    if (!patient) {
      patient = await Patient.create({
        user: req.user.id,
        name: req.user.name || 'Patient',
        email: req.user.email,
        phone: req.user.phone || '',
        isActive: true,
      });
      await User.findByIdAndUpdate(req.user.id, { linkedId: patient._id, linkedModel: 'Patient' });
    } else {
      let needsSave = false;
      if (!patient.isActive) { patient.isActive = true; needsSave = true; }
      if (!patient.user || patient.user.toString() !== req.user.id) { patient.user = req.user.id; needsSave = true; }
      if (needsSave) await patient.save();
    }

    const [upcomingAppts, pastTreatments, unpaidInvoices, prescriptions] = await Promise.all([
      Appointment.find({ patient: patient._id, date: { $gte: new Date() }, status: { $in: ['Pending','Confirmed'] } }).populate('dentist','name specialization').sort({ date: 1 }).limit(5),
      Treatment.find({ patient: patient._id }).sort({ treatmentDate: -1 }).limit(5),
      Invoice.find({ patient: patient._id, paymentStatus: { $ne: 'Paid' } }),
      require('../models/Prescription').find({ patient: patient._id }).sort({ date: -1 }).limit(3).populate('dentist','name'),
    ]);
    res.json({
      success: true,
      data: { patient, upcomingAppointments: upcomingAppts, recentTreatments: pastTreatments, pendingInvoices: unpaidInvoices, recentPrescriptions: prescriptions },
    });
  } catch (err) { next(err); }
};
