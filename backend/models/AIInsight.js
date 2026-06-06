const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  insightType: {
    type: String,
    required: true,
    enum: ['spending_analysis', 'budget_prediction', 'overspending_alert', 'savings_suggestion', 'monthly_report', 'pattern_detection']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical', 'positive'],
    default: 'info'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

aiInsightSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AIInsight', aiInsightSchema);
