const Patient = require('../models/Patient');
const User = require('../models/User');

exports.getPatients = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10, gender, bloodGroup } = req.query;
    const query = { isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (gender) query.gender = gender;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: patients, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('user', 'email');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, data: patient });
  } catch (err) { next(err); }
};

exports.createPatient = async (req, res, next) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (err) { next(err); }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    // Also sync photo/avatar/name with linked User account
    const targetUserId = patient.user || (req.user && req.user._id);
    if (targetUserId) {
      const userUpdate = {};
      const img = req.body.photo || req.body.avatar;
      if (img) userUpdate.avatar = img;
      if (req.body.name) userUpdate.name = req.body.name;
      if (req.body.phone) userUpdate.phone = req.body.phone;
      if (Object.keys(userUpdate).length > 0) {
        await User.findByIdAndUpdate(targetUserId, userUpdate);
      }
    }

    res.json({ success: true, data: patient });
  } catch (err) { next(err); }
};

exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    // Delete linked user account if exists
    if (patient.user) {
      await User.findByIdAndDelete(patient.user);
    }
    if (patient.email) {
      await User.deleteMany({ email: patient.email.toLowerCase().trim() });
    }

    // Delete the patient record
    await Patient.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Patient and associated login account deleted successfully' });
  } catch (err) { next(err); }
};

exports.getMyProfile = async (req, res, next) => {
  try {
    let patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      patient = await Patient.findOne({ email: req.user.email });
    }
    if (!patient) {
      // Auto-create patient profile if missing
      patient = await Patient.create({
        user: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '',
        isActive: true,
      });
      await User.findByIdAndUpdate(req.user.id, { linkedId: patient._id, linkedModel: 'Patient' });
    } else if (!patient.isActive) {
      patient.isActive = true;
      patient.user = req.user.id;
      await patient.save();
    }
    res.json({ success: true, data: patient });
  } catch (err) { next(err); }
};
