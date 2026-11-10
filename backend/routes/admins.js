const express = require('express');
const router = express.Router();
const {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin management routes require login and admin role
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getAdmins)
  .post(createAdmin);

router.route('/:id')
  .put(updateAdmin)
  .delete(deleteAdmin);

module.exports = router;

