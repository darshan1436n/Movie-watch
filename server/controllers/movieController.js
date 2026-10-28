const { Movie, allowedGenres, allowedPlatforms, allowedStatuses } = require('../models/Movie');
const Counter = require('../models/Counter');

// Helper to escape regex special characters
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @desc    Create a new movie
 * @route   POST /api/movies
 */
const createMovie = async (req, res, next) => {
  try {
    const { title, genre, releaseYear, runtime, platform, priority } = req.body;

    // Field existence validation
    if (!title || !genre || releaseYear === undefined || runtime === undefined || !platform || priority === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: Title, Genre, Release Year, Runtime, Platform, Priority.',
      });
    }

    const trimmedTitle = String(title).trim();
    if (!trimmedTitle) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot be empty.',
      });
    }

    // Genre validation
    if (!allowedGenres.includes(genre)) {
      return res.status(400).json({
        success: false,
        message: `Invalid genre '${genre}'. Allowed genres: ${allowedGenres.join(', ')}.`,
      });
    }

    // Release Year validation (1950 to current year)
    const currentYear = new Date().getFullYear();
    const numYear = Number(releaseYear);
    if (!Number.isInteger(numYear) || numYear < 1950 || numYear > currentYear) {
      return res.status(400).json({
        success: false,
        message: `Release Year must be an integer between 1950 and ${currentYear}.`,
      });
    }

    // Runtime validation (30 to 300 minutes)
    const numRuntime = Number(runtime);
    if (!Number.isInteger(numRuntime) || numRuntime < 30 || numRuntime > 300) {
      return res.status(400).json({
        success: false,
        message: 'Runtime must be an integer between 30 and 300 minutes.',
      });
    }

    // Platform validation
    if (!allowedPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: `Invalid platform '${platform}'. Allowed platforms: ${allowedPlatforms.join(', ')}.`,
      });
    }

    // Priority validation (1 to 5)
    const numPriority = Number(priority);
    if (!Number.isInteger(numPriority) || numPriority < 1 || numPriority > 5) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be an integer between 1 and 5.',
      });
    }

    // Duplicate check: Same Title and Release Year (case-insensitive)
    const existingMovie = await Movie.findOne({
      releaseYear: numYear,
      titleLower: trimmedTitle.toLowerCase(),
    });

    if (existingMovie) {
      return res.status(409).json({
        success: false,
        message: `A movie with the title "${trimmedTitle}" and release year ${numYear} already exists.`,
      });
    }

    // Auto-generated Movie Code: MV-<release year>-<3-digit sequence> (client cannot set)
    const seq = await Counter.getNextSequence(numYear);
    const movieCode = `MV-${numYear}-${String(seq).padStart(3, '0')}`;

    // Status starts strictly at 'To Watch'
    const movie = await Movie.create({
      movieCode,
      title: trimmedTitle,
      titleLower: trimmedTitle.toLowerCase(),
      genre,
      releaseYear: numYear,
      runtime: numRuntime,
      platform,
      priority: numPriority,
      status: 'To Watch',
      rating: null,
      watchedDate: null,
    });

    return res.status(201).json({
      success: true,
      message: 'Movie added successfully to watchlist.',
      data: movie,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A movie with this title and release year already exists.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all movies with filtering, search, and pagination
 * @route   GET /api/movies
 */
const getMovies = async (req, res, next) => {
  try {
    const { status, genre, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = 6; // Fixed 6 movies per page as per specification
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};

    if (status && allowedStatuses.includes(status)) {
      filter.status = status;
    }

    if (genre && allowedGenres.includes(genre)) {
      filter.genre = genre;
    }

    if (search && search.trim()) {
      filter.title = { $regex: escapeRegex(search.trim()), $options: 'i' };
    }

    // Total count with filters
    const totalMovies = await Movie.countDocuments(filter);
    const totalPages = Math.ceil(totalMovies / limit) || 1;

    // Sorting requirement:
    // "Movies in To Watch status must be sorted by Priority (high to low) first"
    // Using aggregation to ensure To Watch status movies are sorted by Priority (high to low)
    const pipeline = [
      { $match: filter },
      {
        $addFields: {
          statusSortOrder: {
            $cond: [{ $eq: ['$status', 'To Watch'] }, 0, { $cond: [{ $eq: ['$status', 'Watching'] }, 1, 2] }],
          },
        },
      },
      {
        $sort: {
          statusSortOrder: 1,
          priority: -1,
          runtime: 1,
          createdAt: -1,
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          statusSortOrder: 0,
          titleLower: 0,
        },
      },
    ];

    const movies = await Movie.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      message: 'Movies retrieved successfully.',
      data: {
        movies,
        pagination: {
          totalMovies,
          totalPages,
          currentPage: page,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single movie by ID
 * @route   GET /api/movies/:id
 */
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Movie retrieved successfully.',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Watch Next recommendation
 * @route   GET /api/movies/watch-next
 */
const getWatchNext = async (req, res, next) => {
  try {
    // "The backend must return the To Watch movie with the highest priority.
    // If several movies have the same priority, return the one with the shortest runtime.
    // If there is no such movie, return a proper message with status 404."
    const movie = await Movie.findOne({ status: 'To Watch' })
      .sort({ priority: -1, runtime: 1, createdAt: 1 })
      .select('-titleLower');

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'No movie found in "To Watch" status. Add more movies to your watchlist to get recommendations!',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Recommended movie found.',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get stats dashboard
 * @route   GET /api/movies/stats
 */
const getStats = async (req, res, next) => {
  try {
    // 1. Total movies in each status
    const statusCountsAgg = await Movie.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {
      'To Watch': 0,
      'Watching': 0,
      'Watched': 0,
      total: 0,
    };

    statusCountsAgg.forEach((item) => {
      if (statusCounts[item._id] !== undefined) {
        statusCounts[item._id] = item.count;
      }
      statusCounts.total += item.count;
    });

    // 2. Total hours watched & Average rating of Watched movies
    const watchedMetricsAgg = await Movie.aggregate([
      { $match: { status: 'Watched' } },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$runtime' },
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    const watchedMetrics = watchedMetricsAgg[0] || { totalMinutes: 0, avgRating: 0, count: 0 };
    const totalHoursWatched = Number((watchedMetrics.totalMinutes / 60).toFixed(1));
    const averageRating = watchedMetrics.avgRating ? Number(watchedMetrics.avgRating.toFixed(1)) : 0;

    // 3. Genre with the most Watched movies
    const topGenreAgg = await Movie.aggregate([
      { $match: { status: 'Watched' } },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 1 },
    ]);

    const topWatchedGenre = topGenreAgg.length > 0 ? topGenreAgg[0]._id : 'None yet';
    const topWatchedGenreCount = topGenreAgg.length > 0 ? topGenreAgg[0].count : 0;

    return res.status(200).json({
      success: true,
      message: 'Statistics calculated successfully.',
      data: {
        statusCounts,
        totalHoursWatched,
        totalMinutesWatched: watchedMetrics.totalMinutes,
        averageRating,
        topWatchedGenre,
        topWatchedGenreCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Edit movie details (Title, Genre, Runtime, Platform, Priority, and Rating for Watched)
 * @route   PUT /api/movies/:id
 */
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    const { title, genre, runtime, platform, priority, rating } = req.body;

    // Movie Code and Release Year cannot be edited after creation
    if (req.body.releaseYear !== undefined && Number(req.body.releaseYear) !== movie.releaseYear) {
      return res.status(400).json({
        success: false,
        message: 'Release Year cannot be modified after movie creation.',
      });
    }

    if (req.body.movieCode !== undefined && req.body.movieCode !== movie.movieCode) {
      return res.status(400).json({
        success: false,
        message: 'Movie Code is auto-generated and cannot be modified.',
      });
    }

    // Validate Title if changed
    if (title !== undefined) {
      const trimmedTitle = String(title).trim();
      if (!trimmedTitle) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty.',
        });
      }

      // Check duplicate with another movie having same title & release year
      const duplicate = await Movie.findOne({
        _id: { $ne: movie._id },
        releaseYear: movie.releaseYear,
        titleLower: trimmedTitle.toLowerCase(),
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `A movie with the title "${trimmedTitle}" and release year ${movie.releaseYear} already exists.`,
        });
      }

      movie.title = trimmedTitle;
      movie.titleLower = trimmedTitle.toLowerCase();
    }

    // Validate Genre if provided
    if (genre !== undefined) {
      if (!allowedGenres.includes(genre)) {
        return res.status(400).json({
          success: false,
          message: `Invalid genre '${genre}'. Allowed genres: ${allowedGenres.join(', ')}.`,
        });
      }
      movie.genre = genre;
    }

    // Validate Runtime if provided
    if (runtime !== undefined) {
      const numRuntime = Number(runtime);
      if (!Number.isInteger(numRuntime) || numRuntime < 30 || numRuntime > 300) {
        return res.status(400).json({
          success: false,
          message: 'Runtime must be an integer between 30 and 300 minutes.',
        });
      }
      movie.runtime = numRuntime;
    }

    // Validate Platform if provided
    if (platform !== undefined) {
      if (!allowedPlatforms.includes(platform)) {
        return res.status(400).json({
          success: false,
          message: `Invalid platform '${platform}'. Allowed platforms: ${allowedPlatforms.join(', ')}.`,
        });
      }
      movie.platform = platform;
    }

    // Validate Priority if provided
    if (priority !== undefined) {
      const numPriority = Number(priority);
      if (!Number.isInteger(numPriority) || numPriority < 1 || numPriority > 5) {
        return res.status(400).json({
          success: false,
          message: 'Priority must be an integer between 1 and 5.',
        });
      }
      movie.priority = numPriority;
    }

    // Rating rule:
    // "A rating must be rejected for any movie that is not in Watched status. A rating can be edited later only for Watched movies."
    if (rating !== undefined) {
      if (movie.status !== 'Watched') {
        return res.status(400).json({
          success: false,
          message: 'Rating can only be assigned or edited for movies with "Watched" status.',
        });
      }
      const numRating = Number(rating);
      if (!Number.isInteger(numRating) || numRating < 1 || numRating > 10) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 10.',
        });
      }
      movie.rating = numRating;
    }

    await movie.save();

    return res.status(200).json({
      success: true,
      message: 'Movie details updated successfully.',
      data: movie,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A movie with this title and release year already exists.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Update movie status with transition workflow and rating rules
 * @route   PATCH /api/movies/:id/status
 */
const updateStatus = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    const { status: nextStatus, rating } = req.body;

    if (!nextStatus || !allowedStatuses.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}.`,
      });
    }

    // Status Workflow Rules:
    // "To Watch → Watching or Watched
    //  Watching → Watched or To Watch
    //  Watched is final and cannot be changed"
    if (movie.status === 'Watched') {
      return res.status(400).json({
        success: false,
        message: 'Status cannot be changed. "Watched" is a final status.',
      });
    }

    if (movie.status === 'To Watch') {
      const validTransitions = ['Watching', 'Watched'];
      if (!validTransitions.includes(nextStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from "To Watch" to "${nextStatus}". Allowed transitions are: Watching, Watched.`,
        });
      }
    } else if (movie.status === 'Watching') {
      const validTransitions = ['To Watch', 'Watched'];
      if (!validTransitions.includes(nextStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from "Watching" to "${nextStatus}". Allowed transitions are: Watched, To Watch.`,
        });
      }
    }

    // Rating Rule:
    // "When a movie is moved to Watched, a rating from 1 to 10 is mandatory, and the backend must also store the Watched Date automatically.
    //  A rating must be rejected for any movie that is not in Watched status."
    if (nextStatus === 'Watched') {
      if (rating === undefined || rating === null || rating === '') {
        return res.status(400).json({
          success: false,
          message: 'A rating between 1 and 10 is mandatory when marking a movie as "Watched".',
        });
      }

      const numRating = Number(rating);
      if (!Number.isInteger(numRating) || numRating < 1 || numRating > 10) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 10.',
        });
      }

      movie.rating = numRating;
      movie.watchedDate = new Date();
    } else {
      // Transitioning to 'Watching' or 'To Watch'
      if (rating !== undefined && rating !== null) {
        return res.status(400).json({
          success: false,
          message: `Rating must be rejected for any movie not in "Watched" status.`,
        });
      }
      movie.rating = null;
      movie.watchedDate = null;
    }

    movie.status = nextStatus;
    await movie.save();

    return res.status(200).json({
      success: true,
      message: `Movie status updated to "${nextStatus}" successfully.`,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete movie
 * @route   DELETE /api/movies/:id
 */
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    // Delete Rule:
    // "A movie in Watching status cannot be deleted, and the backend must return an error in that case."
    if (movie.status === 'Watching') {
      return res.status(400).json({
        success: false,
        message: 'A movie in "Watching" status cannot be deleted.',
      });
    }

    await Movie.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: `Movie "${movie.title}" deleted successfully.`,
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMovie,
  getMovies,
  getMovieById,
  getWatchNext,
  getStats,
  updateMovie,
  updateStatus,
  deleteMovie,
};
