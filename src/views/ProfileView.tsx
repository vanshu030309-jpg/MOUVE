import React, { useState, useEffect } from 'react';
import {
  User,
  Heart,
  Bookmark,
  History,
  Sparkles,
  Film,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { Movie, PageView, UserActivity, UserProfile } from '../types/movie';
import { StorageService } from '../services/storageService';
import { MovieCard } from '../components/MovieCard';

interface ProfileViewProps {
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  watchlistIds: string[];
  favoriteIds: string[];
  onToggleWatchlist: (movie: Movie) => void;
  onToggleFavorite: (movie: Movie) => void;
  onNavigate: (view: PageView) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onSelectMovie,
  onPlayTrailer,
  watchlistIds,
  favoriteIds,
  onToggleWatchlist,
  onToggleFavorite,
  onNavigate,
}) => {
  const [profile, setProfile] = useState<UserProfile>(StorageService.getUserProfile());
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [history, setHistory] = useState<Movie[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(profile.bio);

  const [userPreferences, setUserPreferences] = useState(StorageService.getUserPreferences());

  useEffect(() => {
    setProfile(StorageService.getUserProfile());
    setWatchlist(StorageService.getWatchlist());
    setFavorites(StorageService.getFavorites());
    setHistory(StorageService.getViewingHistory());
    setActivities(StorageService.getActivities());
    setUserPreferences(StorageService.getUserPreferences());
  }, [watchlistIds, favoriteIds]);

  const handleSaveBio = () => {
    const updated = StorageService.updateUserProfile({ bio: bioInput });
    setProfile(updated);
    setIsEditingBio(false);
  };

  const handleToggleGenrePreference = (genreName: string) => {
    const current = userPreferences.favoriteGenres || [];
    let updated: string[];
    if (current.includes(genreName)) {
      updated = current.filter((g) => g !== genreName);
    } else {
      updated = [...current, genreName];
    }
    const newPrefs = StorageService.saveUserPreferences({ favoriteGenres: updated });
    setUserPreferences(newPrefs);
  };

  const handleClearHistory = () => {
    StorageService.clearHistory();
    setHistory([]);
    setActivities(StorageService.getActivities());
  };

  // Compute dynamic taste radar from real library data
  const computeTasteRadar = () => {
    const genreScores: Record<string, number> = {};
    favorites.forEach((m) => {
      m.genres.forEach((g) => {
        genreScores[g.name] = (genreScores[g.name] || 0) + 3;
      });
    });
    watchlist.forEach((m) => {
      m.genres.forEach((g) => {
        genreScores[g.name] = (genreScores[g.name] || 0) + 2;
      });
    });
    history.forEach((m) => {
      m.genres.forEach((g) => {
        genreScores[g.name] = (genreScores[g.name] || 0) + 1;
      });
    });

    const sorted = Object.entries(genreScores).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) {
      return [
        { name: 'Science Fiction', pct: 90, color: 'bg-amber-500', text: 'text-amber-400' },
        { name: 'Psychological Thrillers', pct: 85, color: 'bg-red-500', text: 'text-red-400' },
        { name: 'Auteur Drama', pct: 78, color: 'bg-emerald-500', text: 'text-emerald-400' },
      ];
    }

    const maxScore = sorted[0][1];
    const colors = [
      { color: 'bg-amber-500', text: 'text-amber-400' },
      { color: 'bg-red-500', text: 'text-red-400' },
      { color: 'bg-emerald-500', text: 'text-emerald-400' },
    ];

    return sorted.slice(0, 3).map(([name, score], idx) => {
      const pct = Math.min(98, Math.max(50, Math.round((score / maxScore) * 98)));
      return {
        name,
        pct,
        color: colors[idx % colors.length].color,
        text: colors[idx % colors.length].text,
      };
    });
  };

  const tasteRadar = computeTasteRadar();

  const calculateAvgRating = () => {
    const all = [...watchlist, ...favorites];
    if (all.length === 0) return '8.7';
    const sum = all.reduce((acc, m) => acc + m.rating, 0);
    return (sum / all.length).toFixed(1);
  };

  return (
    <div id="profile-view-page" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-24 pb-16 space-y-10">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#111522] via-[#161B2B] to-[#0E121B] border border-zinc-800/80 p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar with glowing ring */}
          <div className="relative shrink-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-amber-500/50 shadow-xl shadow-amber-500/10"
            />
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-amber-500 text-black shadow-md">
              <Sparkles size={14} />
            </div>
          </div>

          {/* Profile Bio & Details */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                  {profile.name}
                </h1>
                <p className="text-sm text-zinc-400 font-mono">{profile.handle}</p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold self-center sm:self-auto">
                <CheckCircle2 size={13} />
                <span>Cinephile Tier</span>
              </span>
            </div>

            {/* Bio */}
            {isEditingBio ? (
              <div className="space-y-2 pt-1">
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveBio}
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingBio(false)}
                    className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
                  {profile.bio}
                </p>
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="text-zinc-500 hover:text-zinc-300 p-1 rounded transition-colors"
                  title="Edit bio"
                >
                  <Edit3 size={13} />
                </button>
              </div>
            )}

            {/* Favorite Genre Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 justify-center sm:justify-start">
              <span className="text-xs text-zinc-500 mr-1">Favorite Genres:</span>
              {profile.favoriteGenres.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs text-amber-200/90 font-medium"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-800/80 text-center sm:text-left">
          <div className="p-3.5 rounded-2xl bg-[#090B10]/80 border border-zinc-800">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-zinc-400 text-xs font-medium">
              <Bookmark size={14} className="text-amber-400" />
              <span>Watchlist</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">{watchlist.length}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#090B10]/80 border border-zinc-800">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-zinc-400 text-xs font-medium">
              <Heart size={14} className="text-rose-400" />
              <span>Favorites</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">{favorites.length}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#090B10]/80 border border-zinc-800">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-zinc-400 text-xs font-medium">
              <History size={14} className="text-blue-400" />
              <span>Explored</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">{history.length}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#090B10]/80 border border-zinc-800">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-zinc-400 text-xs font-medium">
              <Star size={14} className="text-yellow-400" />
              <span>Avg Taste Rating</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">
              ★ {calculateAvgRating()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Profile Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recently Viewed & Watchlist Highlights */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recently Viewed Movies */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={18} className="text-zinc-400" />
                <h2 className="font-heading font-bold text-xl text-white">Recently Viewed</h2>
              </div>
              {history.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Clear History
                  </button>
                  <button
                    onClick={() => onNavigate({ type: 'watchlist', initialTab: 'history' })}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    View all ({history.length})
                  </button>
                </div>
              )}
            </div>

            {history.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {history.slice(0, 4).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelect={onSelectMovie}
                    onPlayTrailer={onPlayTrailer}
                    inWatchlist={watchlistIds.includes(movie.id)}
                    isFavorite={favoriteIds.includes(movie.id)}
                    onToggleWatchlist={onToggleWatchlist}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#0E1119] border border-zinc-800 text-center text-zinc-400 text-xs">
                <p>No recently viewed movies. Explore the catalog to log your cinema activity.</p>
              </div>
            )}
          </section>

          {/* Watchlist Quick Shelf */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark size={18} className="text-amber-400" />
                <h2 className="font-heading font-bold text-xl text-white">Watchlist Priority</h2>
              </div>
              <button
                onClick={() => onNavigate({ type: 'watchlist' })}
                className="text-xs text-amber-300 hover:text-amber-200"
              >
                Manage Full Watchlist ({watchlist.length})
              </button>
            </div>

            {watchlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {watchlist.slice(0, 4).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelect={onSelectMovie}
                    onPlayTrailer={onPlayTrailer}
                    inWatchlist={watchlistIds.includes(movie.id)}
                    isFavorite={favoriteIds.includes(movie.id)}
                    onToggleWatchlist={onToggleWatchlist}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[#0E1119] border border-zinc-800 text-center text-zinc-400 text-xs">
                <p>Your watchlist is empty. Save upcoming films to build your personal queue.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Col: Activity Log & Taste Radar */}
        <div className="space-y-6">
          {/* Cinema Taste Affinity */}
          <div className="p-6 rounded-2xl bg-[#0E1119] border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-zinc-200 font-bold text-base">
                <Sparkles size={16} className="text-amber-400" />
                <span>Cinema Taste Radar</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                Personalized
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {tasteRadar.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-zinc-300 font-medium mb-1.5">
                    <span>{item.name}</span>
                    <span className={item.text}>{item.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="p-6 rounded-2xl bg-[#0E1119] border border-zinc-800/80 space-y-4">
            <h3 className="font-heading font-bold text-base text-white border-b border-zinc-800 pb-3">
              Recent Film Activity
            </h3>

            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-center gap-3 text-xs">
                    <img
                      src={act.moviePoster}
                      alt={act.movieTitle}
                      className="w-8 h-11 object-cover rounded bg-zinc-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-200 truncate">{act.movieTitle}</p>
                      <p className="text-[11px] text-zinc-500">
                        {act.action === 'watchlist_added' && 'Added to Watchlist'}
                        {act.action === 'favorited' && 'Saved to Favorites'}
                        {act.action === 'watched' && 'Explored Film Details'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No activity recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
