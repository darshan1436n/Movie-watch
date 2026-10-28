import React from 'react';
import { Film, Sparkles, PlusCircle, Database, CheckCircle2 } from 'lucide-react';

export default function Navbar({ onOpenAddModal, onOpenWatchNext, dbStatus }) {
  const isAtlas = dbStatus?.isAtlas;
  const isConnected = dbStatus?.connected;

  return (
    <header className="header-nav">
      <div className="brand-wrapper">
        <div className="brand-icon">
          <Film size={26} />
        </div>
        <div>
          <h1 className="brand-title">CineTrack</h1>
          <p className="brand-subtitle">Movie Watchlist Manager</p>
        </div>
      </div>

      <div className="nav-actions">
        {/* DB Status Badge */}
        <div
          className="db-status-pill"
          title={`Connected to ${dbStatus?.source || 'MongoDB'}`}
        >
          <span className="status-dot"></span>
          <span>{isAtlas ? 'MongoDB Atlas' : dbStatus?.source || 'MongoDB Connected'}</span>
        </div>

        {/* Watch Next Action */}
        <button
          id="btn-watch-next-nav"
          className="btn btn-watch-next"
          onClick={onOpenWatchNext}
        >
          <Sparkles size={18} />
          <span>What should I watch next?</span>
        </button>

        {/* Add Movie Button */}
        <button
          id="btn-add-movie-nav"
          className="btn btn-primary"
          onClick={onOpenAddModal}
        >
          <PlusCircle size={18} />
          <span>Add Movie</span>
        </button>
      </div>
    </header>
  );
}
