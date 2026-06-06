require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const user = await User.create({ name: 'Script Test', email: 'script_test_162345@example.com', password: 'secret123' });
    console.log('Created user:', user);
    process.exit(0);
  } catch (err) {
    console.error('Script error:', err);
    process.exit(1);
  }
})();
