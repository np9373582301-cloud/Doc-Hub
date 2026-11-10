const User = require('../models/User');

// @desc    Get all admins
// @route   GET /api/admins
// @access  Private/Admin
exports.getAdmins = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {
      $or: [
        { role: 'admin' },
        { role: 'superadmin' },
        { isSuperAdmin: true },
      ],
    };

    if (search) {
      query.$and = [
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    const total = await User.countDocuments(query);
    const admins = await User.find(query)
      .select('-password')
      .sort({ isSuperAdmin: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: admins,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new admin
// @route   POST /api/admins
// @access  Private/SuperAdmin
exports.createAdmin = async (req, res, next) => {
  try {
    const isCurrentSuper = req.user.isSuperAdmin || req.user.role === 'superadmin' || req.user.email === 'np9373582301@gmail.com';
    if (!isCurrentSuper) {
      return res.status(403).json({ success: false, message: 'Access denied: Only Super Admin can create new administrators' });
    }

    const { name, email, password, phone, isSuperAdmin } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const makeSuper = Boolean(isSuperAdmin);

    const admin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim() || '',
      role: makeSuper ? 'superadmin' : 'admin',
      isSuperAdmin: makeSuper,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        isSuperAdmin: admin.isSuperAdmin,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      },
      message: `${makeSuper ? 'Super Admin' : 'Admin'} account created successfully`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update admin
// @route   PUT /api/admins/:id
// @access  Private/SuperAdmin
exports.updateAdmin = async (req, res, next) => {
  try {
    const isCurrentSuper = req.user.isSuperAdmin || req.user.role === 'superadmin' || req.user.email === 'np9373582301@gmail.com';
    if (!isCurrentSuper) {
      return res.status(403).json({ success: false, message: 'Access denied: Only Super Admin can modify administrator accounts' });
    }

    const { name, phone, isActive, password, isSuperAdmin } = req.body;
    const admin = await User.findById(req.params.id);

    if (!admin || (!['admin', 'superadmin'].includes(admin.role) && !admin.isSuperAdmin)) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const targetIsSuper = admin.isSuperAdmin || admin.role === 'superadmin' || admin.email === 'np9373582301@gmail.com';

    if (name) admin.name = name.trim();
    if (phone !== undefined) admin.phone = phone.trim();
    if (isActive !== undefined) {
      // Prevent deactivating own account
      if (admin._id.toString() === req.user.id && !isActive) {
        return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
      }
      if (targetIsSuper && !isActive) {
        return res.status(400).json({ success: false, message: 'Super Admin accounts cannot be deactivated' });
      }
      admin.isActive = isActive;
    }
    if (password && password.length >= 6) {
      admin.password = password;
    }
    if (isSuperAdmin !== undefined) {
      admin.isSuperAdmin = Boolean(isSuperAdmin);
      admin.role = isSuperAdmin ? 'superadmin' : 'admin';
    }

    await admin.save();

    res.json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        isSuperAdmin: admin.isSuperAdmin,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      },
      message: 'Admin updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete admin
// @route   DELETE /api/admins/:id
// @access  Private/SuperAdmin
exports.deleteAdmin = async (req, res, next) => {
  try {
    const isCurrentSuper = req.user.isSuperAdmin || req.user.role === 'superadmin' || req.user.email === 'np9373582301@gmail.com';
    if (!isCurrentSuper) {
      return res.status(403).json({ success: false, message: 'Access denied: Only Super Admin can delete administrator accounts' });
    }

    const admin = await User.findById(req.params.id);

    if (!admin || (!['admin', 'superadmin'].includes(admin.role) && !admin.isSuperAdmin)) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Never allow deleting root super admin
    if (admin.email === 'np9373582301@gmail.com') {
      return res.status(403).json({ success: false, message: 'Root Super Admin cannot be deleted' });
    }

    // Prevent deleting own account
    if (admin._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (err) {
    next(err);
  }
};
