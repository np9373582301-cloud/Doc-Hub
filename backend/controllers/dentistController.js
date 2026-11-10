const Dentist = require('../models/Dentist');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getDentists = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await Dentist.countDocuments(query);
    const dentists = await Dentist.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: dentists, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getDentist = async (req, res, next) => {
  try {
    const dentist = await Dentist.findById(req.params.id);
    if (!dentist) return res.status(404).json({ success: false, message: 'Dentist not found' });
    res.json({ success: true, data: dentist });
  } catch (err) { next(err); }
};

exports.createDentist = async (req, res, next) => {
  try {
    const { email, name, password = 'DocHub@123', ...rest } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }
    const normalizedEmail = email.toLowerCase().trim();

    // Check if an active dentist already exists
    const existingDentist = await Dentist.findOne({ email: normalizedEmail, isActive: true });
    if (existingDentist) {
      return res.status(400).json({ success: false, message: 'A dentist with this email is already registered' });
    }

    // Clean up any stale or inactive duplicate dentist profiles for this email
    await Dentist.deleteMany({ email: normalizedEmail });

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({ name: name.trim(), email: normalizedEmail, password, role: 'dentist', phone: rest.phone || '' });
    } else {
      user.name = name.trim();
      user.role = 'dentist';
      if (rest.phone) user.phone = rest.phone;
      user.password = password;
      await user.save();
    }

    const dentist = await Dentist.create({ ...rest, name: name.trim(), email: normalizedEmail, user: user._id, isActive: true });
    user.linkedId = dentist._id;
    user.linkedModel = 'Dentist';
    await user.save();

    res.status(201).json({ success: true, data: dentist });
  } catch (err) { next(err); }
};

exports.updateDentist = async (req, res, next) => {
  try {
    const dentist = await Dentist.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dentist) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Also sync User name, phone, and avatar if provided
    const targetUserId = dentist.user || (req.user && req.user._id);
    if (targetUserId) {
      const updates = {};
      if (req.body.name) updates.name = req.body.name;
      if (req.body.phone) updates.phone = req.body.phone;
      const img = req.body.photo || req.body.avatar;
      if (img !== undefined) updates.avatar = img;
      await User.findByIdAndUpdate(targetUserId, updates);
    }

    res.json({ success: true, data: dentist });
  } catch (err) { next(err); }
};

exports.deleteDentist = async (req, res, next) => {
  try {
    const dentist = await Dentist.findById(req.params.id);
    if (!dentist) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Delete linked user account so the email is freed up completely
    if (dentist.user) {
      await User.findByIdAndDelete(dentist.user);
    }
    if (dentist.email) {
      await User.deleteMany({ email: dentist.email.toLowerCase().trim() });
    }

    // Delete the dentist record
    await Dentist.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Doctor and associated login account deleted successfully' });
  } catch (err) { next(err); }
};

exports.getMyProfile = async (req, res, next) => {
  try {
    let dentist = await Dentist.findOne({ user: req.user.id });
    if (!dentist) {
      dentist = await Dentist.findOne({ email: req.user.email });
    }
    if (!dentist) {
      // Auto-create dentist profile if missing
      dentist = await Dentist.create({
        user: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '',
        specialization: 'General Physician',
        isActive: true,
      });
      await User.findByIdAndUpdate(req.user.id, { linkedId: dentist._id, linkedModel: 'Dentist' });
    } else if (!dentist.isActive) {
      dentist.isActive = true;
      dentist.user = req.user.id;
      await dentist.save();
    }

    const dentistObj = dentist.toObject();
    const user = await User.findById(req.user.id);
    if (user && user.avatar && !dentistObj.photo && !dentistObj.avatar) {
      dentistObj.avatar = user.avatar;
      dentistObj.photo = user.avatar;
    }

    res.json({ success: true, data: dentistObj });
  } catch (err) { next(err); }
};
