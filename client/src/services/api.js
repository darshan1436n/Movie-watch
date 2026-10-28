const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(result.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = result;
      throw error;
    }

    return result;
  } catch (error) {
    throw error;
  }
}

export const movieApi = {
  // System Health & Atlas Connection Status
  getHealth: () => request('/health'),

  // Movies list with pagination, search, and filters
  getMovies: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page);
    if (params.status) searchParams.append('status', params.status);
    if (params.genre) searchParams.append('genre', params.genre);
    if (params.search && params.search.trim()) searchParams.append('search', params.search.trim());

    const queryString = searchParams.toString();
    return request(`/movies${queryString ? `?${queryString}` : ''}`);
  },

  // Single movie
  getMovieById: (id) => request(`/movies/${id}`),

  // Watch Next recommendation
  getWatchNext: () => request('/movies/watch-next'),

  // Aggregate statistics
  getStats: () => request('/movies/stats'),

  // Create new movie
  createMovie: (data) =>
    request('/movies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Edit movie (Movie Code & Release Year cannot be changed)
  updateMovie: (id, data) =>
    request(`/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Update status (workflow transitions + mandatory rating on Watched)
  updateStatus: (id, statusData) =>
    request(`/movies/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    }),

  // Delete movie (Watching status rejected)
  deleteMovie: (id) =>
    request(`/movies/${id}`, {
      method: 'DELETE',
    }),
};
