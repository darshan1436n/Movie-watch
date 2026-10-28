import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  movie,
  onConfirmDelete,
}) {
  if (!isOpen || !movie) return null;

  const [isDeleting, setIsDeleting] = useState(false);
  const isWatching = movie.status === 'Watching';

  const handleDelete = async () => {
    if (isWatching) return;
    setIsDeleting(true);
    try {
      await onConfirmDelete(movie._id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header" style={{ borderBottomColor: 'rgba(244, 63, 94, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(244, 63, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f43f5e',
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <h2 className="modal-title" style={{ fontSize: '1.2rem', color: '#f8fafc' }}>
              Confirm Delete
            </h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {isWatching ? (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                color: '#fda4af',
                fontSize: '0.9rem',
              }}
            >
              <strong>Cannot Delete:</strong> Movies currently in <em>"Watching"</em> status cannot be deleted. You must transition this movie to another status first.
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Are you sure you want to delete this movie from your watchlist?
              </p>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{movie.movieCode}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '2px 0' }}>
                  {movie.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {movie.releaseYear} • {movie.genre} • {movie.status}
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                This action cannot be undone.
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          {!isWatching && (
            <button
              id="btn-confirm-delete"
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 size={16} />
              <span>{isDeleting ? 'Deleting...' : 'Delete Movie'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
