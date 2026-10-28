import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Sparkles, Check, Flame } from 'lucide-react';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'];
const PLATFORMS = ['Netflix', 'Prime Video', 'Hotstar', 'Theatre', 'Other'];
const CURRENT_YEAR = new Date().getFullYear();

export default function MovieFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialMovie = null, // if provided, we are in Edit mode
}) {
  const isEditMode = Boolean(initialMovie);

  const [formData, setFormData] = useState({
    title: '',
    genre: 'Action',
    releaseYear: CURRENT_YEAR,
    runtime: 120,
    platform: 'Netflix',
    priority: 3,
    rating: 8,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialMovie) {
      setFormData({
        title: initialMovie.title || '',
        genre: initialMovie.genre || 'Action',
        releaseYear: initialMovie.releaseYear || CURRENT_YEAR,
        runtime: initialMovie.runtime || 120,
        platform: initialMovie.platform || 'Netflix',
        priority: initialMovie.priority || 3,
        rating: initialMovie.rating || 8,
      });
    } else {
      setFormData({
        title: '',
        genre: 'Action',
        releaseYear: CURRENT_YEAR,
        runtime: 120,
        platform: 'Netflix',
        priority: 3,
        rating: 8,
      });
    }
    setErrors({});
    setServerError('');
  }, [initialMovie, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required.';
    }

    const year = Number(formData.releaseYear);
    if (!year || year < 1950 || year > CURRENT_YEAR) {
      newErrors.releaseYear = `Release Year must be between 1950 and ${CURRENT_YEAR}.`;
    }

    const run = Number(formData.runtime);
    if (!run || run < 30 || run > 300) {
      newErrors.runtime = 'Runtime must be between 30 and 300 minutes.';
    }

    if (!formData.genre || !GENRES.includes(formData.genre)) {
      newErrors.genre = 'Please select a valid genre.';
    }

    if (!formData.platform || !PLATFORMS.includes(formData.platform)) {
      newErrors.platform = 'Please select a valid platform.';
    }

    const prio = Number(formData.priority);
    if (!prio || prio < 1 || prio > 5) {
      newErrors.priority = 'Priority must be between 1 and 5.';
    }

    if (isEditMode && initialMovie?.status === 'Watched') {
      const rate = Number(formData.rating);
      if (!rate || rate < 1 || rate > 10) {
        newErrors.rating = 'Rating must be an integer between 1 and 10.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        // Exclude movieCode and releaseYear from payload to respect immutability
        const payload = {
          title: formData.title.trim(),
          genre: formData.genre,
          runtime: Number(formData.runtime),
          platform: formData.platform,
          priority: Number(formData.priority),
        };
        if (initialMovie?.status === 'Watched') {
          payload.rating = Number(formData.rating);
        }
        await onSubmit(initialMovie._id, payload);
      } else {
        await onSubmit({
          title: formData.title.trim(),
          genre: formData.genre,
          releaseYear: Number(formData.releaseYear),
          runtime: Number(formData.runtime),
          platform: formData.platform,
          priority: Number(formData.priority),
        });
      }
      onClose();
    } catch (err) {
      // Duplicate rule (409) or validation error from backend
      setServerError(err.message || 'An error occurred while saving movie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {isEditMode ? 'Edit Movie' : 'Add Movie to Watchlist'}
            </h2>
            {isEditMode && (
              <span className="movie-code" style={{ marginTop: '4px', display: 'inline-block' }}>
                Code: {initialMovie.movieCode}
              </span>
            )}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Server Error / 409 Duplicate Banner */}
            {serverError && (
              <div className="form-error-banner" role="alert" id="form-server-error-banner">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{serverError}</span>
              </div>
            )}

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="movie-form-title">
                Movie Title <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <input
                id="movie-form-title"
                type="text"
                className="form-input"
                placeholder="e.g. Inception"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              {errors.title && <p className="form-hint" style={{ color: 'var(--accent-rose)' }}>{errors.title}</p>}
            </div>

            {/* Genre & Platform Row */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="movie-form-genre">
                  Genre <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <select
                  id="movie-form-genre"
                  className="form-select"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {errors.genre && <p className="form-hint" style={{ color: 'var(--accent-rose)' }}>{errors.genre}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="movie-form-platform">
                  Platform <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <select
                  id="movie-form-platform"
                  className="form-select"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.platform && <p className="form-hint" style={{ color: 'var(--accent-rose)' }}>{errors.platform}</p>}
              </div>
            </div>

            {/* Release Year & Runtime Row */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="movie-form-year">
                  Release Year (1950 - {CURRENT_YEAR}) <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <input
                  id="movie-form-year"
                  type="number"
                  min="1950"
                  max={CURRENT_YEAR}
                  className="form-input"
                  value={formData.releaseYear}
                  onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                  disabled={isEditMode}
                  title={isEditMode ? 'Release Year cannot be edited after creation' : ''}
                  required
                />
                {isEditMode && (
                  <p className="form-hint">Release year cannot be modified after creation.</p>
                )}
                {errors.releaseYear && (
                  <p className="form-hint" style={{ color: 'var(--accent-rose)' }}>{errors.releaseYear}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="movie-form-runtime">
                  Runtime (30 - 300 mins) <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <input
                  id="movie-form-runtime"
                  type="number"
                  min="30"
                  max="300"
                  className="form-input"
                  value={formData.runtime}
                  onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
                  required
                />
                {errors.runtime && (
                  <p className="form-hint" style={{ color: 'var(--accent-rose)' }}>{errors.runtime}</p>
                )}
              </div>
            </div>

            {/* Priority Slider / Input (1 - 5) */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="movie-form-priority" style={{ marginBottom: 0 }}>
                  Priority (1 to 5, where 5 is highest)
                </label>
                <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem' }}>
                  Level {formData.priority} / 5
                </span>
              </div>
              <input
                id="movie-form-priority"
                type="range"
                min="1"
                max="5"
                step="1"
                className="form-input"
                style={{ padding: '0.4rem', cursor: 'pointer' }}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>1 (Casual)</span>
                <span>2 (Low)</span>
                <span>3 (Medium)</span>
                <span>4 (High)</span>
                <span>5 (Urgent / Must Watch)</span>
              </div>
              {errors.priority && (
                <p className="form-hint" style={{ color: 'var(--accent-rose)' }}>{errors.priority}</p>
              )}
            </div>

            {/* If in Edit mode and movie is Watched, Rating can be edited */}
            {isEditMode && initialMovie?.status === 'Watched' && (
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" htmlFor="movie-form-rating" style={{ marginBottom: 0 }}>
                    Rating (1 to 10)
                  </label>
                  <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: '1rem' }}>
                    ⭐ {formData.rating} / 10
                  </span>
                </div>
                <input
                  id="movie-form-rating"
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  className="form-input"
                  style={{ padding: '0.4rem', cursor: 'pointer' }}
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                />
                {errors.rating && (
                  <p className="form-hint" style={{ color: 'var(--accent-rose)' }}>{errors.rating}</p>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              id="btn-submit-movie-form"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Movie' : 'Add to Watchlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
