const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  monthlyBudget: {
    type: Number,
    default: 5000
  },
  currency: {
    type: String,
    default: 'USD'
  },
  categoryBudgets: {
    food: { type: Number, default: 500 },
    transport: { type: Number, default: 200 },
    entertainment: { type: Number, default: 300 },
    shopping: { type: Number, default: 400 },
    health: { type: Number, default: 200 },
    utilities: { type: Number, default: 300 },
    education: { type: Number, default: 200 },
    other: { type: Number, default: 200 }
  },
  preferences: {
    theme: { type: String, default: 'dark', enum: ['dark', 'light'] },
    aiSensitivity: { type: String, default: 'medium', enum: ['low', 'medium', 'high'] },
    notifications: { type: Boolean, default: true },
    weeklyReport: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
