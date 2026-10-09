const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/db');
const { User, Store, Rating } = require('./models');
const seedDatabase = require('./seeders/seed');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ownerRoutes = require('./routes/ownerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/owner', ownerRoutes);

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Store Rating System Backend API is running successfully!',
    frontendUrl: 'http://localhost:5173',
    healthCheck: '/api/health',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Store Rating System Backend is operational.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// Start Server and Database Sync
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    // Sync database and seed if table empty
    await sequelize.sync();
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('🚀 Empty database detected. Auto-seeding initial data...');
      await seedDatabase();
    } else {
      console.log(`ℹ️ Database already contains ${userCount} users.`);
    }

    app.listen(PORT, () => {
      console.log(`🌐 Server is running on port ${PORT} (http://localhost:${PORT})`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
  }
};

startServer();
