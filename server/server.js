require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB, getDbStatus } = require('./config/db');
const { seedSampleMovies } = require('./seedData');
const movieRoutes = require('./routes/movieRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database & seed if empty
connectDB().then(() => {
  seedSampleMovies();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// System / DB Health Check
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.status(200).json({
    success: true,
    message: 'Movie Watchlist API is operational',
    data: {
      status: 'online',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    },
  });
});

// Mount Routes
app.use('/api/movies', movieRoutes);

// Catch-all 404 for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`🎬 Movie Watchlist Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = { app, server };
