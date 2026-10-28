import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Star, ArrowRight, CheckCircle2, PlayCircle, Eye } from 'lucide-react';

export default function StatusChangeModal({
  isOpen,
  onClose,
  movie,
  onStatusUpdate,
}) {
  if (!isOpen || !movie) return null;

  const currentStatus = movie.status;

  // Compute strictly allowed next transitions per requirements:
  // To Watch -> Watching or Watched
  // Watching -> Watched or To Watch
  // Watched -> final
  const getAvailableNextStatuses = () => {
    if (currentStatus === 'To Watch') {
      return ['Watching', 'Watched'];
    }
    if (currentStatus === 'Watching') {
      return ['Watched', 'To Watch'];
    }
    return [];
  };

  const availableStatuses = getAvailableNextStatuses();
  const [selectedStatus, setSelectedStatus] = useState(availableStatuses[0] || '');
  const [rating, setRating] = useState(8);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const next = getAvailableNextStatuses();
    setSelectedStatus(next[0] || '');
    setRating(8);
    setErrorMessage('');
  }, [movie]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedStatus) {
      setErrorMessage('Please select a valid next status.');
      return;
    }

    if (selectedStatus === 'Watched') {
      const numRating = Number(rating);
      if (!numRating || numRating < 1 || numRating > 10) {
        setErrorMessage('Rating between 1 and 10 is mandatory for Watched movies.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        status: selectedStatus,
      };
      if (selectedStatus === 'Watched') {
        payload.rating = Number(rating);
      }
      await onStatusUpdate(movie._id, payload);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Update Watch Status</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {movie.title} ({movie.releaseYear})
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMessage && (
              <div className="form-error-banner" role="alert" id="status-error-banner">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Current Status Preview */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Status:</span>
              <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{currentStatus}</strong>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                {selectedStatus || 'N/A'}
              </span>
            </div>

            {currentStatus === 'Watched' ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--accent-emerald)' }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontWeight: 600 }}>Watched is a final status and cannot be changed.</p>
              </div>
            ) : (
              <>
                {/* Status Dropdown showing ONLY valid next transitions */}
                <div className="form-group">
                  <label className="form-label" htmlFor="select-next-status">
                    Select Next Status <span style={{ color: 'var(--accent-rose)' }}>*</span>
                  </label>
                  <select
                    id="select-next-status"
                    className="form-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {availableStatuses.map((st) => (
                      <option key={st} value={st}>
                        Move to: {st}
                      </option>
                    ))}
                  </select>
                  <p className="form-hint">
                    {currentStatus === 'To Watch' && 'Allowed next transitions: Watching or Watched.'}
                    {currentStatus === 'Watching' && 'Allowed next transitions: Watched or To Watch.'}
                  </p>
                </div>

                {/* Mandatory Rating section when moving to 'Watched' */}
                {selectedStatus === 'Watched' && (
                  <div className="rating-slider-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Star size={18} fill="#fbbf24" color="#fbbf24" />
                      <label className="form-label" htmlFor="status-rating-slider" style={{ marginBottom: 0 }}>
                        Rate this film (1 - 10) <span style={{ color: 'var(--accent-rose)' }}>*Mandatory</span>
                      </label>
                    </div>

                    <div className="rating-score-display">
                      {rating} <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>/ 10</span>
                    </div>

                    <input
                      id="status-rating-slider"
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      className="form-input"
                      style={{ padding: '0.4rem', cursor: 'pointer' }}
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      required
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      <span>1 (Terrible)</span>
                      <span>5 (Average)</span>
                      <span>10 (Masterpiece)</span>
                    </div>

                    <p className="form-hint" style={{ marginTop: '0.75rem', color: '#94a3b8' }}>
                      ℹ️ Marking as Watched will automatically record today's date as the Watched Date.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            {currentStatus !== 'Watched' && (
              <button
                id="btn-confirm-status-update"
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !selectedStatus}
              >
                {isSubmitting ? 'Updating...' : 'Confirm Transition'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
