import React from 'react';
import {
  Clock,
  Calendar,
  Flame,
  Star,
  Tv,
  Edit2,
  Trash2,
  PlayCircle,
  CheckCircle2,
  Eye,
  AlertCircle,
} from 'lucide-react';

export default function MovieCard({
  movie,
  onOpenEdit,
  onOpenStatusChange,
  onOpenDelete,
}) {
  const {
    _id,
    movieCode,
    title,
    genre,
    releaseYear,
    runtime,
    platform,
    priority,
    status,
    rating,
    watchedDate,
  } = movie;

  // Platform style mapping
  const getPlatformClass = (plat) => {
    switch (plat) {
      case 'Netflix':
        return 'platform-netflix';
      case 'Prime Video':
        return 'platform-prime';
      case 'Hotstar':
        return 'platform-hotstar';
      case 'Theatre':
        return 'platform-theatre';
      default:
        return 'platform-other';
    }
  };

  // Status style mapping
  const getStatusBadge = (st) => {
    switch (st) {
      case 'To Watch':
        return (
          <span className="mini-badge badge-to-watch" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={12} />
            <span>To Watch</span>
          </span>
        );
      case 'Watching':
        return (
          <span className="mini-badge badge-watching" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <PlayCircle size={12} />
            <span>Watching</span>
          </span>
        );
      case 'Watched':
        return (
          <span className="mini-badge badge-watched" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} />
            <span>Watched</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Formatted watched date
  const formattedWatchedDate = watchedDate
    ? new Date(watchedDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const isWatching = status === 'Watching';
  const isWatched = status === 'Watched';

  return (
    <div className="movie-card" id={`movie-card-${_id}`}>
      <div>
        {/* Top bar: Movie Code & Status Badge */}
        <div className="movie-card-header">
          <span className="movie-code">{movieCode}</span>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span className={`mini-badge ${getPlatformClass(platform)}`}>
              <Tv size={11} style={{ marginRight: '3px' }} />
              {platform}
            </span>
            {getStatusBadge(status)}
          </div>
        </div>

        {/* Title */}
        <h3 className="movie-title" title={title}>
          {title}
        </h3>

        {/* Metadata: Genre, Year, Runtime */}
        <div className="movie-meta-row">
          <span className="mini-badge" style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-primary)' }}>
            {genre}
          </span>
          <span className="movie-meta-item">
            <Calendar size={13} />
            {releaseYear}
          </span>
          <span className="movie-meta-item">
            <Clock size={13} />
            {runtime} mins
          </span>
        </div>

        {/* Priority & Rating Display */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
          {/* Priority */}
          <div className="priority-display" title={`Priority: ${priority} / 5`}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '4px' }}>Priority:</span>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <Flame
                key={lvl}
                size={16}
                className={lvl <= priority ? 'priority-flame' : ''}
                style={{
                  color: lvl <= priority ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
                  filter: lvl <= priority ? 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))' : 'none',
                }}
              />
            ))}
          </div>

          {/* Rating (if Watched) */}
          {isWatched && rating !== null && (
            <div className="rating-badge" title={`User Rating: ${rating}/10`}>
              <Star size={14} fill="#fbbf24" color="#fbbf24" />
              <span>{rating}/10</span>
            </div>
          )}
        </div>

        {/* Watched date note */}
        {isWatched && formattedWatchedDate && (
          <p className="watched-date-text">Finished on {formattedWatchedDate}</p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="movie-card-footer">
        {/* Status Transition Action */}
        <div>
          {isWatched ? (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--accent-emerald)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CheckCircle2 size={13} /> Completed
            </span>
          ) : (
            <button
              id={`btn-status-movie-${_id}`}
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenStatusChange(movie)}
              title="Change Status"
            >
              <span>Update Status</span>
            </button>
          )}
        </div>

        {/* Edit & Delete Controls */}
        <div className="card-actions">
          {/* Edit Button */}
          <button
            id={`btn-edit-movie-${_id}`}
            className="btn btn-secondary btn-icon"
            onClick={() => onOpenEdit(movie)}
            title="Edit Movie"
          >
            <Edit2 size={14} />
          </button>

          {/* Delete Button (Disabled if Watching per requirement) */}
          <button
            id={`btn-delete-movie-${_id}`}
            className="btn btn-danger btn-icon"
            onClick={() => onOpenDelete(movie)}
            disabled={isWatching}
            title={
              isWatching
                ? 'Movies currently in "Watching" status cannot be deleted.'
                : 'Delete Movie'
            }
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
