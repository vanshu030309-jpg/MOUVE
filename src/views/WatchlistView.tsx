import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Heart,
  History,
  Trash2,
  Search,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { Movie, PageView } from '../types/movie';
import { StorageService } from '../services/storageService';
import { MovieCard } from '../components/MovieCard';
import { EmptyState } from '../components/EmptyState';

interface WatchlistViewProps {
  initialTab?: 'watchlist' | 'favorites' | 'history';
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  watchlistIds: string[];
  favoriteIds: string[];
  onToggleWatchlist: (movie: Movie) => void;
  onToggleFavorite: (movie: Movie) => void;
  onNavigate: (view: PageView) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  initialTab = 'watchlist',
  onSelectMovie,
  onPlayTrailer,
  watchlistIds,
  favoriteIds,
  onToggleWatchlist,
  onToggleFavorite,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'favorites' | 'history'>(initialTab);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [history, setHistory] = useState<Movie[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState<'added' | 'rating' | 'year' | 'title'>('added');

  useEffect(() => {
    setWatchlist(StorageService.getWatchlist());
    setFavorites(StorageService.getFavorites());
    setHistory(StorageService.getViewingHistory());
  }, [watchlistIds, favoriteIds]);

  const getActiveList = (): Movie[] => {
    switch (activeTab) {
      case 'favorites':
        return favorites;
      case 'history':
        return history;
      case 'watchlist':
      default:
        return watchlist;
    }
  };

  const currentList = getActiveList();

  // Filter & sort
  let filtered = currentList.filter((m) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.director.toLowerCase().includes(q) ||
      m.genres.some((g) => g.name.toLowerCase().includes(q))
    );
  });

  if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'year') {
    filtered.sort((a, b) => b.year - a.year);
  } else if (sortBy === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  return (
    <div id="watchlist-view-page" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-24 pb-16 space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            My Cinema Library
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Organize your planned watchlist, all-time favorites, and viewing history
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'watchlist'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bookmark size={15} />
            <span>Watchlist ({watchlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart size={15} />
            <span>Favorites ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white/20 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History size={15} />
            <span>Watched ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search within list */}
      {currentList.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0E121B] border border-zinc-800/80">
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={`Filter in ${activeTab}...`}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
            />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-zinc-400">
            {activeTab === 'history' && history.length > 0 && (
              <button
                onClick={() => {
                  StorageService.clearHistory();
                  setHistory([]);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-red-950/40 text-zinc-300 hover:text-red-400 border border-zinc-700/80 hover:border-red-500/30 transition-colors cursor-pointer"
                title="Clear your viewed history"
              >
                <Trash2 size={13} />
                <span>Clear History</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="added">Recently Added</option>
                <option value="rating">Highest Rating</option>
                <option value="year">Release Year</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content Grid or Empty States */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-5 lg:gap-6">
          {filtered.map((movie) => (
            <div key={movie.id} className="relative group">
              <MovieCard
                movie={movie}
                onSelect={onSelectMovie}
                onPlayTrailer={onPlayTrailer}
                inWatchlist={watchlistIds.includes(movie.id)}
                isFavorite={favoriteIds.includes(movie.id)}
                onToggleWatchlist={onToggleWatchlist}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          ))}
        </div>
      ) : currentList.length > 0 ? (
        <EmptyState
          type="search"
          title="No matching saved films"
          description={`No titles in your ${activeTab} match "${filterQuery}".`}
          actionLabel="Clear Filter"
          onAction={() => setFilterQuery('')}
        />
      ) : (
        <EmptyState
          type={activeTab === 'favorites' ? 'favorites' : activeTab === 'history' ? 'history' : 'watchlist'}
          title={
            activeTab === 'favorites'
              ? 'No favorites yet'
              : activeTab === 'history'
              ? 'No viewing history yet'
              : 'Your watchlist is empty'
          }
          description={
            activeTab === 'favorites'
              ? 'Mark films you love with the heart icon to easily revisit your top cinematic masterpieces.'
              : activeTab === 'history'
              ? 'Movies you explore and view details of will automatically be logged here for quick reference.'
              : 'Explore top rated movies, trending titles, or ask MOUVE AI to curate your next movie night.'
          }
          actionLabel="Discover Movies Now"
          onAction={() => onNavigate({ type: 'movies' })}
          secondaryActionLabel="Ask MOUVE AI"
          onSecondaryAction={() => onNavigate({ type: 'ai-picks' })}
        />
      )}
    </div>
  );
};
