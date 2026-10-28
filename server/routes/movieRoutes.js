const express = require('express');
const router = express.Router();
const {
  createMovie,
  getMovies,
  getMovieById,
  getWatchNext,
  getStats,
  updateMovie,
  updateStatus,
  deleteMovie,
} = require('../controllers/movieController');

// Specific endpoints before parameter routes
router.get('/watch-next', getWatchNext);
router.get('/stats', getStats);

// Main movie CRUD routes
router.route('/').get(getMovies).post(createMovie);

router.route('/:id').get(getMovieById).put(updateMovie).delete(deleteMovie);

router.patch('/:id/status', updateStatus);

module.exports = router;
