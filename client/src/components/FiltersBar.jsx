import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'];
const STATUSES = ['To Watch', 'Watching', 'Watched'];

export default function FiltersBar({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) {
  const hasActiveFilters = filters.status || filters.genre || filters.search;

  return (
    <div className="toolbar-section glass-panel">
      {/* Search Input */}
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          id="search-movie-title"
          type="text"
          className="search-input"
          placeholder="Search movies by title..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="filters-group">
        {/* Status Filter */}
        <select
          id="filter-status-select"
          className="filter-select"
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          aria-label="Filter by Status"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {/* Genre Filter */}
        <select
          id="filter-genre-select"
          className="filter-select"
          value={filters.genre}
          onChange={(e) => onFilterChange('genre', e.target.value)}
          aria-label="Filter by Genre"
        >
          <option value="">All Genres</option>
          {GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            id="btn-reset-filters"
            className="btn btn-secondary btn-sm"
            onClick={onResetFilters}
            title="Reset All Filters"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
          Showing {totalResults} {totalResults === 1 ? 'movie' : 'movies'}
        </span>
      </div>
    </div>
  );
}
