const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @route   GET /api/users/profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
});

// @route   PUT /api/users/profile
router.put('/profile', async (req, res) => {
  try {
    const { name, monthlyBudget, currency, categoryBudgets, preferences } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (monthlyBudget !== undefined) updateData.monthlyBudget = monthlyBudget;
    if (currency) updateData.currency = currency;
    if (categoryBudgets) updateData.categoryBudgets = categoryBudgets;
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// @route   PUT /api/users/password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating password' });
  }
});

module.exports = router;
