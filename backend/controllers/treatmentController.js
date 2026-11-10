const Treatment = require('../models/Treatment');
const Patient = require('../models/Patient');
const Dentist = require('../models/Dentist');

exports.getTreatments = async (req, res, next) => {
  try {
    const { patient, dentist, page = 1, limit = 10 } = req.query;
    const query = {};
    if (patient) query.patient = patient;
    if (dentist) query.dentist = dentist;
    if (req.user.role === 'dentist') {
      const doc = await Dentist.findOne({ user: req.user.id });
      if (doc) query.dentist = doc._id;
    }
    if (req.user.role === 'patient') {
      const pat = await Patient.findOne({ user: req.user.id });
      if (pat) query.patient = pat._id;
    }
    const total = await Treatment.countDocuments(query);
    const treatments = await Treatment.find(query)
      .populate('patient', 'name patientId')
      .populate('dentist', 'name specialization')
      .sort({ treatmentDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: treatments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getTreatment = async (req, res, next) => {
  try {
    const t = await Treatment.findById(req.params.id).populate('patient').populate('dentist');
    if (!t) return res.status(404).json({ success: false, message: 'Treatment not found' });
    res.json({ success: true, data: t });
  } catch (err) { next(err); }
};

exports.createTreatment = async (req, res, next) => {
  try {
    const treatment = await Treatment.create(req.body);
    res.status(201).json({ success: true, data: treatment });
  } catch (err) { next(err); }
};

exports.updateTreatment = async (req, res, next) => {
  try {
    const treatment = await Treatment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!treatment) return res.status(404).json({ success: false, message: 'Treatment not found' });
    res.json({ success: true, data: treatment });
  } catch (err) { next(err); }
};

exports.deleteTreatment = async (req, res, next) => {
  try {
    const treatment = await Treatment.findByIdAndDelete(req.params.id);
    if (!treatment) return res.status(404).json({ success: false, message: 'Treatment not found' });
    res.json({ success: true, message: 'Treatment deleted' });
  } catch (err) { next(err); }
};
