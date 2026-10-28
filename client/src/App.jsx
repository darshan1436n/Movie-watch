import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsDashboard from './components/StatsDashboard';
import FiltersBar from './components/FiltersBar';
import MovieCard from './components/MovieCard';
import Pagination from './components/Pagination';
import MovieFormModal from './components/MovieFormModal';
import StatusChangeModal from './components/StatusChangeModal';
import WatchNextModal from './components/WatchNextModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ToastContainer from './components/Toast';
import { movieApi } from './services/api';
import { Film, PlusCircle, Sparkles } from 'lucide-react';

export default function App() {
  // Main Data States
  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState({
    totalMovies: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 6,
  });
  const [stats, setStats] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState({
    status: '',
    genre: '',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Modals States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [statusChangingMovie, setStatusChangingMovie] = useState(null);
  const [deletingMovie, setDeletingMovie] = useState(null);
  const [watchNextState, setWatchNextState] = useState({
    isOpen: false,
    movie: null,
    error: null,
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Movies
  const loadMovies = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await movieApi.getMovies({
        page: currentPage,
        status: filters.status,
        genre: filters.genre,
        search: filters.search,
      });

      if (res.success && res.data) {
        setMovies(res.data.movies || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load movies:', err);
      addToast(err.message || 'Failed to load movies', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  // Fetch Stats
  const loadStats = useCallback(async () => {
    try {
      const res = await movieApi.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Fetch DB Health
  const loadHealth = useCallback(async () => {
    try {
      const res = await movieApi.getHealth();
      if (res.success && res.data?.database) {
        setDbStatus(res.data.database);
      }
    } catch (err) {
      console.error('Failed to check health:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadHealth();
    loadStats();
  }, [loadHealth, loadStats]);

  // Reload movies when page or filters change
  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  // Debounced search / filter update
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to page 1 on filter/search change
  };

  const handleResetFilters = () => {
    setFilters({ status: '', genre: '', search: '' });
    setCurrentPage(1);
  };

  // Handler: Add Movie
  const handleCreateMovie = async (movieData) => {
    const res = await movieApi.createMovie(movieData);
    addToast(`"${movieData.title}" added to watchlist with code ${res.data?.movieCode || ''}!`, 'success');
    // Refresh both list and stats
    loadMovies();
    loadStats();
  };

  // Handler: Edit Movie
  const handleUpdateMovie = async (id, movieData) => {
    const res = await movieApi.updateMovie(id, movieData);
    addToast(`Movie "${res.data?.title || ''}" updated successfully!`, 'success');
    loadMovies();
    loadStats();
  };

  // Handler: Update Status
  const handleStatusUpdate = async (id, statusData) => {
    const res = await movieApi.updateStatus(id, statusData);
    addToast(
      `Status changed to "${statusData.status}"${statusData.rating ? ` with rating ${statusData.rating}/10` : ''}!`,
      'success'
    );
    loadMovies();
    loadStats();
  };

  // Handler: Delete Movie
  const handleDeleteMovie = async (id) => {
    const res = await movieApi.deleteMovie(id);
    addToast(res.message || 'Movie deleted successfully.', 'info');
    loadMovies();
    loadStats();
  };

  // Handler: Watch Next recommendation
  const handleWatchNext = async () => {
    try {
      const res = await movieApi.getWatchNext();
      if (res.success && res.data) {
        setWatchNextState({
          isOpen: true,
          movie: res.data,
          error: null,
        });
      }
    } catch (err) {
      // 404 or other error
      setWatchNextState({
        isOpen: true,
        movie: null,
        error: err.message || 'No movie found in "To Watch" status.',
      });
    }
  };

  // Quick Action from Watch Next Modal: Start Watching
  const handleStartWatching = async (movieId) => {
    try {
      await handleStatusUpdate(movieId, { status: 'Watching' });
    } catch (err) {
      addToast(err.message || 'Failed to start watching', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Navigation */}
      <Navbar
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenWatchNext={handleWatchNext}
        dbStatus={dbStatus}
      />

      {/* Statistics Dashboard */}
      <StatsDashboard stats={stats} />

      {/* Filter & Search Toolbar */}
      <FiltersBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalResults={pagination.totalMovies}
      />

      {/* Movie Grid / List */}
      <main>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
            <div className="status-dot" style={{ margin: '0 auto 1rem', width: '12px', height: '12px' }}></div>
            <p style={{ fontWeight: 600 }}>Loading movies from database...</p>
          </div>
        ) : movies.length > 0 ? (
          <div className="movies-grid">
            {movies.map((movie) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                onOpenEdit={(m) => setEditingMovie(m)}
                onOpenStatusChange={(m) => setStatusChangingMovie(m)}
                onOpenDelete={(m) => setDeletingMovie(m)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Film className="empty-icon" />
            <h3 className="empty-title">No Movies Found</h3>
            <p className="empty-desc">
              {filters.status || filters.genre || filters.search
                ? 'No movies match your current search and filter criteria. Try resetting filters.'
                : 'Your watchlist is empty! Add movies to plan what to watch, track what you are watching, and rate finished films.'}
            </p>
            {filters.status || filters.genre || filters.search ? (
              <button className="btn btn-secondary" onClick={handleResetFilters}>
                Reset Filters
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                <PlusCircle size={18} />
                <span>Add Your First Movie</span>
              </button>
            )}
          </div>
        )}

        {/* Pagination (6 movies per page) */}
        {!isLoading && (
          <Pagination
            pagination={pagination}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </main>

      {/* Modals */}
      {/* 1. Add Movie Modal */}
      <MovieFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateMovie}
      />

      {/* 2. Edit Movie Modal */}
      <MovieFormModal
        isOpen={Boolean(editingMovie)}
        onClose={() => setEditingMovie(null)}
        onSubmit={handleUpdateMovie}
        initialMovie={editingMovie}
      />

      {/* 3. Status Workflow Change Modal */}
      <StatusChangeModal
        isOpen={Boolean(statusChangingMovie)}
        onClose={() => setStatusChangingMovie(null)}
        movie={statusChangingMovie}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* 4. Watch Next Modal */}
      <WatchNextModal
        isOpen={watchNextState.isOpen}
        onClose={() => setWatchNextState({ isOpen: false, movie: null, error: null })}
        movie={watchNextState.movie}
        error={watchNextState.error}
        onStartWatching={handleStartWatching}
      />

      {/* 5. Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingMovie)}
        onClose={() => setDeletingMovie(null)}
        movie={deletingMovie}
        onConfirmDelete={handleDeleteMovie}
      />
    </div>
  );
}
