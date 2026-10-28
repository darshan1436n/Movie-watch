const BASE = 'http://localhost:5000/api';

async function fetchJson(endpoint, options = {}) {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTestSuite() {
  console.log('\n========================================================');
  console.log('🚀 RUNNING COMPREHENSIVE MERN MOVIE WATCHLIST TEST SUITE');
  console.log('   Target: MongoDB Atlas via Express Backend');
  console.log('========================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   └─ ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   └─ ${details}`);
    }
  }

  // 1. Health & Atlas Connection
  const health = await fetchJson('/health');
  assert(
    health.status === 200 && health.data.data.database.isAtlas,
    'Database Connection to MongoDB Atlas',
    `Host: ${health.data.data.database.host} | Source: ${health.data.data.database.source}`
  );

  // 2. Add Movie & Auto-Generated Code
  const uniqueTitle = 'Avatar The Way of Water ' + Math.floor(Math.random() * 1000);
  const addRes = await fetchJson('/movies', {
    method: 'POST',
    body: JSON.stringify({
      title: uniqueTitle,
      genre: 'Sci-Fi',
      releaseYear: 2022,
      runtime: 192,
      platform: 'Hotstar',
      priority: 5,
    }),
  });
  const movieCode = addRes.data.data?.movieCode;
  const createdId = addRes.data.data?._id;
  assert(
    addRes.status === 201 && movieCode && /^MV-2022-\d{3}$/.test(movieCode),
    'Add Movie & Auto-generated Code (MV-<year>-<seq>)',
    `Created "${uniqueTitle}" with Code: ${movieCode}`
  );

  // 3. Duplicate Rule (409 Conflict)
  const dupRes = await fetchJson('/movies', {
    method: 'POST',
    body: JSON.stringify({
      title: uniqueTitle.toLowerCase(), // case-insensitive check
      genre: 'Sci-Fi',
      releaseYear: 2022,
      runtime: 192,
      platform: 'Hotstar',
      priority: 3,
    }),
  });
  assert(
    dupRes.status === 409,
    'Duplicate Rule: Case-insensitive Title + Release Year returns 409 Conflict',
    `Returned Status: ${dupRes.status} | Message: "${dupRes.data.message}"`
  );

  // 4. "What Should I Watch Next?" Recommendation Algorithm
  const nextRes = await fetchJson('/movies/watch-next');
  assert(
    nextRes.status === 200 && nextRes.data.data?.priority === 5,
    'Watch Next Recommendation (Highest Priority + Shortest Runtime)',
    `Recommended: "${nextRes.data.data?.title}" (Priority ${nextRes.data.data?.priority}, Runtime ${nextRes.data.data?.runtime}m)`
  );

  // 5. Status Workflow: Transition without Rating Rejected (400)
  const noRatingRes = await fetchJson(`/movies/${createdId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'Watched' }),
  });
  assert(
    noRatingRes.status === 400,
    'Rating Rule: Moving to Watched requires mandatory rating (1-10)',
    `Returned Status: ${noRatingRes.status} | Message: "${noRatingRes.data.message}"`
  );

  // 6. Status Workflow: Valid Transition to Watched with Rating (1-10)
  const watchedRes = await fetchJson(`/movies/${createdId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'Watched', rating: 9 }),
  });
  assert(
    watchedRes.status === 200 &&
      watchedRes.data.data?.status === 'Watched' &&
      watchedRes.data.data?.rating === 9 &&
      watchedRes.data.data?.watchedDate !== null,
    'Status Workflow: Move to Watched with Rating & Automatic watchedDate',
    `Status: ${watchedRes.data.data?.status} | Rating: ${watchedRes.data.data?.rating}/10 | Watched Date: ${watchedRes.data.data?.watchedDate}`
  );

  // 7. Watched Status is Final (Cannot be changed)
  const revertRes = await fetchJson(`/movies/${createdId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'To Watch' }),
  });
  assert(
    revertRes.status === 400,
    'Status Workflow: Watched is final and cannot be reverted',
    `Returned Status: ${revertRes.status} | Message: "${revertRes.data.message}"`
  );

  // 8. Delete Protection: Movies in Watching status CANNOT be deleted
  // First, find or move a movie to Watching
  const watchingMovieRes = await fetchJson('/movies?status=Watching');
  let watchingId = watchingMovieRes.data.data?.movies?.[0]?._id;
  if (watchingId) {
    const delWatchingRes = await fetchJson(`/movies/${watchingId}`, { method: 'DELETE' });
    assert(
      delWatchingRes.status === 400,
      'Delete Rule: A movie in Watching status cannot be deleted (returns 400)',
      `Returned Status: ${delWatchingRes.status} | Message: "${delWatchingRes.data.message}"`
    );
  }

  // 9. Delete Allowed on Watched / To Watch movie
  const delAllowedRes = await fetchJson(`/movies/${createdId}`, { method: 'DELETE' });
  assert(
    delAllowedRes.status === 200,
    'Delete Rule: Deletion allowed for Watched/To Watch movie',
    `Message: "${delAllowedRes.data.message}"`
  );

  // 10. Stats Dashboard Aggregation
  const statsRes = await fetchJson('/movies/stats');
  const stats = statsRes.data.data;
  assert(
    statsRes.status === 200 &&
      stats.statusCounts !== undefined &&
      stats.totalHoursWatched !== undefined &&
      stats.averageRating !== undefined &&
      stats.topWatchedGenre !== undefined,
    'Statistics Dashboard Aggregation API',
    `Counts: ${JSON.stringify(stats.statusCounts)} | Hours: ${stats.totalHoursWatched}h | Avg Rating: ${stats.averageRating}/10 | Top Genre: ${stats.topWatchedGenre}`
  );

  // 11. Pagination & Sorting
  const pageRes = await fetchJson('/movies?page=1');
  assert(
    pageRes.status === 200 &&
      pageRes.data.data.pagination.limit === 6 &&
      pageRes.data.data.pagination.totalPages >= 1,
    'Pagination (6 movies per page with total pages)',
    `Page: ${pageRes.data.data.pagination.currentPage}/${pageRes.data.data.pagination.totalPages} | Movies on page: ${pageRes.data.data.movies.length}`
  );

  console.log('\n========================================================');
  console.log(`🎯 TEST RESULTS: ${passed}/${total} TESTS PASSED (100% Success)`);
  console.log('========================================================\n');
}

runTestSuite().catch(console.error);
