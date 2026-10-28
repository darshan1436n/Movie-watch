# 🎬 CineTrack — Movie Watchlist Manager (MERN Stack)

A full-stack Movie Watchlist Manager built using the **MERN Stack** (MongoDB Atlas, Express.js, React.js, Node.js). It enables movie lovers to plan what to watch, track what they are currently watching, and rate finished movies, complete with real-time statistics, smart recommendations, and strict business workflows.

---

## 🌟 Key Features & Business Rules

### 1. ➕ Add Movie & Form Validations
- **Fields**: Title, Genre, Release Year, Runtime, Platform, and Priority.
- **Enums**:
  - **Genre**: `Action`, `Comedy`, `Drama`, `Horror`, `Sci-Fi`, `Romance`, `Thriller`
  - **Platform**: `Netflix`, `Prime Video`, `Hotstar`, `Theatre`, `Other`
- **Constraints**:
  - **Release Year**: Integer between `1950` and the current year (`2026`).
  - **Runtime**: Integer between `30` and `300` minutes.
  - **Priority**: Integer from `1` to `5` (where 5 is highest priority).
- **Validation**: Strict validation implemented on both client and backend.

### 2. 🏷️ Auto-Generated Movie Code
- Format: `MV-<release year>-<3-digit sequence>` (e.g., `MV-2019-004`).
- Sequence increases per release year atomically.
- The client cannot set or modify the Movie Code.

### 3. 🔄 Status Transition Workflow
- Every new movie begins with status `To Watch`.
- **Allowed Transitions**:
  - `To Watch` $\rightarrow$ `Watching` or `Watched`
  - `Watching` $\rightarrow$ `Watched` or `To Watch`
  - `Watched` is **final and immutable**.
- The backend rejects invalid transitions with HTTP `400 Bad Request`.
- The frontend dynamically renders only the valid next statuses in the transition dropdown.

### 4. ⭐ Rating Rule & Watched Date
- When a movie is moved to `Watched`, a rating between `1` and `10` is **mandatory**.
- The backend automatically stores `watchedDate` (`new Date()`).
- Ratings are rejected for any movie not in `Watched` status.
- Ratings can be edited later only for `Watched` movies.

### 5. 🚫 Duplicate Rule (HTTP 409 Conflict)
- The same Title and Release Year (case-insensitive) cannot be added twice.
- Returns status `409 Conflict` and displays a clear error banner on the form.

### 6. 🎴 View Movies, Filter, Search & Pagination
- Displays movies as cards with Movie Code, Title, Genre, colored Status badge, Priority flames, Platform tag, and Rating badge.
- **Backend-Driven Query Parameters**:
  - `status`: Filter by status (`To Watch`, `Watching`, `Watched`)
  - `genre`: Filter by genre
  - `search`: Case-insensitive title search
  - `page`: Pagination with 6 movies per page (response includes `totalPages` and `totalMovies`)
- **Priority Sorting**: Movies in `To Watch` status are sorted by Priority (high to low) first.

### 7. 🔮 "What should I watch next?"
- Dedicated recommendation algorithm returning the `To Watch` movie with the highest priority.
- If multiple movies have the same priority, returns the one with the shortest runtime.
- If no movies remain in `To Watch` status, returns status `404 Not Found` with a helpful message.

### 8. 📊 Statistics Dashboard
Calculated via backend MongoDB aggregation:
- Total movies in each status (`To Watch`, `Watching`, `Watched`)
- Total hours watched (sum of runtime of `Watched` movies in hours)
- Average rating of Watched movies (rounded to 1 decimal place)
- Genre with the most Watched movies
- Dashboard automatically refreshes after any add, edit, status change, or delete operation.

### 9. ✏️ Edit Movie Details
- Pre-filled modal to edit Title, Genre, Runtime, Platform, Priority (and Rating if Watched).
- `Movie Code` and `Release Year` are immutable and locked from editing.

### 10. 🗑️ Delete Rule
- A movie in `Watching` status **cannot** be deleted (backend returns `400 Bad Request`).
- Frontend disables the Delete button for `Watching` movies with a descriptive tooltip.
- For all other statuses, a confirmation modal confirms the action before deletion.

---

## 🛠️ Project Structure

```
moviewatch/
├── server/
│   ├── config/
│   │   └── db.js                 # Database connection (Atlas with in-memory dev fallback)
│   ├── controllers/
│   │   └── movieController.js    # All movie business logic & aggregation
│   ├── models/
│   │   ├── Movie.js              # Mongoose schema, validations, compound indexes
│   │   └── Counter.js            # Per-year sequence generator
│   ├── routes/
│   │   └── movieRoutes.js        # Express REST endpoints
│   ├── middleware/
│   │   └── errorHandler.js       # Centralized error handler
│   ├── seedData.js               # Initial sample movies
│   ├── .env                      # Environment config (add your MongoDB Atlas URI here)
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Server entrypoint
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── StatsDashboard.jsx
│   │   │   ├── FiltersBar.jsx
│   │   │   ├── MovieCard.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── MovieFormModal.jsx
│   │   │   ├── StatusChangeModal.jsx
│   │   │   ├── WatchNextModal.jsx
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   └── Toast.jsx
│   │   ├── services/
│   │   │   └── api.js            # Frontend API client
│   │   ├── App.jsx
│   │   ├── index.css             # Glassmorphism & Cinema Dark design system
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json                  # Root runner scripts
└── README.md
```

---

## 🚀 Getting Started

### 1. MongoDB Atlas Configuration
Open `server/.env` and replace `MONGODB_URI` with your MongoDB Atlas connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/moviewatch?retryWrites=true&w=majority
NODE_ENV=development
```

*(Note: If no Atlas URI is provided or is pending, the server automatically starts a local in-memory MongoDB fallback so the application is 100% functional out-of-the-box!)*

### 2. Running Locally
In the root directory, start both frontend and backend concurrently:

```bash
npm run dev
```

Or start them individually:
```bash
# Start backend server on http://localhost:5000
npm run server

# Start frontend client on http://localhost:5173
npm run client
```

Open your browser at **[http://localhost:5173](http://localhost:5173)** to use CineTrack!

---

## 📡 REST API Reference

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/health` | Health check & Atlas connection status | `200` |
| `GET` | `/api/movies` | Get movies (filters: `status`, `genre`, `search`, `page`) | `200` |
| `POST` | `/api/movies` | Add movie (auto-generates code `MV-<year>-<seq>`) | `201`, `400`, `409` |
| `GET` | `/api/movies/watch-next` | Recommend highest priority / shortest runtime movie | `200`, `404` |
| `GET` | `/api/movies/stats` | Aggregated dashboard metrics | `200` |
| `GET` | `/api/movies/:id` | Get movie by ID | `200`, `404` |
| `PUT` | `/api/movies/:id` | Edit details (Title, Genre, Runtime, Platform, Priority) | `200`, `400`, `404`, `409` |
| `PATCH` | `/api/movies/:id/status` | Update status (requires rating for Watched) | `200`, `400`, `404` |
| `DELETE` | `/api/movies/:id` | Delete movie (forbidden for Watching) | `200`, `400`, `404` |
