const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @route   GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit = 50, page = 1, sort = '-date' } = req.query;
    
    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Calculate summary
    const summary = await Transaction.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const income = summary.find(s => s._id === 'income')?.total || 0;
    const expense = summary.find(s => s._id === 'expense')?.total || 0;

    res.json({
      success: true,
      data: transactions,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      summary: { income, expense, balance: income - expense }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Error fetching transactions' });
  }
});

// @route   POST /api/transactions
router.post('/', [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').notEmpty().withMessage('Category is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('description').trim().notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { type, category, amount, description, date, tags, isRecurring, recurringFrequency } = req.body;
    
    const transaction = await Transaction.create({
      userId: req.user._id,
      type, category, amount, description,
      date: date || new Date(),
      tags: tags || [],
      isRecurring: isRecurring || false,
      recurringFrequency: recurringFrequency || null
    });

    res.status(201).json({ success: true, message: 'Transaction added', data: transaction });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, message: 'Error creating transaction' });
  }
});

// @route   PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Transaction updated', data: updated });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ success: false, message: 'Error updating transaction' });
  }
});

// @route   DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ success: false, message: 'Error deleting transaction' });
  }
});

// @route   GET /api/transactions/analytics/summary
router.get('/analytics/summary', async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const monthlyData = await Transaction.aggregate([
      { $match: { userId: req.user._id, date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const categoryData = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'expense', date: { $gte: startDate } } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({ success: true, data: { monthlyData, categoryData } });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Error fetching analytics' });
  }
});

module.exports = router;
