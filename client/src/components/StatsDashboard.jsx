import React from 'react';
import { Film, Clock, Star, Award, Layers } from 'lucide-react';

export default function StatsDashboard({ stats }) {
  if (!stats) return null;

  const {
    statusCounts = { 'To Watch': 0, Watching: 0, Watched: 0, total: 0 },
    totalHoursWatched = 0,
    totalMinutesWatched = 0,
    averageRating = 0,
    topWatchedGenre = 'None yet',
    topWatchedGenreCount = 0,
  } = stats;

  return (
    <section className="stats-grid" aria-label="Watchlist Statistics">
      {/* 1. Status Overview */}
      <div className="stat-card glass-panel" style={{ '--stat-color': 'var(--accent-cyan)' }}>
        <div>
          <div className="stat-header">
            <span className="stat-label">Watchlist Breakdown</span>
            <div className="stat-icon">
              <Layers size={20} />
            </div>
          </div>
          <div className="stat-value">{statusCounts.total || 0}</div>
          <p className="stat-sub">Total movies registered</p>
        </div>
        <div className="stat-breakdown">
          <span className="mini-badge badge-to-watch" title="To Watch">
            {statusCounts['To Watch'] || 0} To Watch
          </span>
          <span className="mini-badge badge-watching" title="Watching">
            {statusCounts['Watching'] || 0} Watching
          </span>
          <span className="mini-badge badge-watched" title="Watched">
            {statusCounts['Watched'] || 0} Watched
          </span>
        </div>
      </div>

      {/* 2. Total Hours Watched */}
      <div className="stat-card glass-panel" style={{ '--stat-color': 'var(--accent-purple)' }}>
        <div>
          <div className="stat-header">
            <span className="stat-label">Time Spent Watching</span>
            <div className="stat-icon">
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value">{totalHoursWatched} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>hrs</span></div>
          <p className="stat-sub">
            {totalMinutesWatched ? `${totalMinutesWatched} minutes of finished films` : 'No movies watched yet'}
          </p>
        </div>
        <div className="stat-breakdown">
          <span className="mini-badge badge-watched">
            Across {statusCounts['Watched'] || 0} completed {statusCounts['Watched'] === 1 ? 'film' : 'films'}
          </span>
        </div>
      </div>

      {/* 3. Average Rating */}
      <div className="stat-card glass-panel" style={{ '--stat-color': 'var(--accent-primary)' }}>
        <div>
          <div className="stat-header">
            <span className="stat-label">Average Rating</span>
            <div className="stat-icon">
              <Star size={20} />
            </div>
          </div>
          <div className="stat-value">
            {averageRating > 0 ? averageRating : '—'}
            {averageRating > 0 && <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}> / 10</span>}
          </div>
          <p className="stat-sub">Based on completed movie scores</p>
        </div>
        <div className="stat-breakdown">
          <span className="mini-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            {averageRating >= 8 ? '⭐ Highly Rated' : averageRating > 0 ? '👍 Solid Collection' : 'No ratings yet'}
          </span>
        </div>
      </div>

      {/* 4. Genre with Most Watched Movies */}
      <div className="stat-card glass-panel" style={{ '--stat-color': 'var(--accent-emerald)' }}>
        <div>
          <div className="stat-header">
            <span className="stat-label">Top Watched Genre</span>
            <div className="stat-icon">
              <Award size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.65rem' }}>
            {topWatchedGenre}
          </div>
          <p className="stat-sub">
            {topWatchedGenreCount > 0
              ? `${topWatchedGenreCount} ${topWatchedGenreCount === 1 ? 'movie' : 'movies'} finished`
              : 'Complete movies to reveal top genre'}
          </p>
        </div>
        <div className="stat-breakdown">
          <span className="mini-badge badge-watched">
            Favorite Category
          </span>
        </div>
      </div>
    </section>
  );
}
