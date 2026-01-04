const express = require('express');
const { getUsers, createUser, deleteUser, updateUserRole } = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Only admin in demo mode (authorize relaxed in demo middleware)
router.get('/', protect, authorize('admin'), getUsers);
router.post('/', protect, authorize('admin'), createUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);

module.exports = router;
