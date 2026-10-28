import React from 'react';
import { Sparkles, Clock, Calendar, Tv, Flame, PlayCircle, X, Film } from 'lucide-react';

export default function WatchNextModal({
  isOpen,
  onClose,
  movie,
  error,
  onStartWatching,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header" style={{ borderBottomColor: 'rgba(99, 102, 241, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.25rem' }}>What Should You Watch Next?</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Algorithmic recommendation based on priority & runtime
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <Film size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: '#f8fafc' }}>
                No Movies to Recommend
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto' }}>
                {error}
              </p>
            </div>
          ) : movie ? (
            <div>
              {/* Highlight badge */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="movie-code">{movie.movieCode}</span>
                  <span
                    className="mini-badge"
                    style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#c7d2fe', fontWeight: 700 }}
                  >
                    🏆 Top Pick
                  </span>
                </div>

                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
                  {movie.title}
                </h3>

                <div className="movie-meta-row" style={{ marginBottom: '0.75rem' }}>
                  <span className="mini-badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#fff' }}>
                    {movie.genre}
                  </span>
                  <span className="movie-meta-item">
                    <Calendar size={13} />
                    {movie.releaseYear}
                  </span>
                  <span className="movie-meta-item">
                    <Clock size={13} />
                    {movie.runtime} mins
                  </span>
                  <span className="movie-meta-item">
                    <Tv size={13} />
                    {movie.platform}
                  </span>
                </div>

                {/* Priority */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Priority:</span>
                  <div className="priority-display">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <Flame
                        key={lvl}
                        size={16}
                        className={lvl <= movie.priority ? 'priority-flame' : ''}
                        style={{
                          color: lvl <= movie.priority ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
                        }}
                      />
                    ))}
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginLeft: '4px' }}>
                      ({movie.priority}/5)
                    </span>
                  </div>
                </div>
              </div>

              {/* Selection Logic Explainer */}
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                💡 <strong>Why this movie?</strong> Matches the backend selection algorithm: Highest Priority movie in your
                watchlist, with tie-breaking for shortest runtime ({movie.runtime} min).
              </div>
            </div>
          ) : null}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {movie && !error && (
            <button
              id="btn-start-watching-recommended"
              type="button"
              className="btn btn-watch-next"
              onClick={() => {
                onStartWatching(movie._id);
                onClose();
              }}
            >
              <PlayCircle size={18} />
              <span>Start Watching Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
