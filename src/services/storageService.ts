import { Movie, UserActivity, UserPreferences, UserProfile, UserTasteProfile } from '../types/movie';
import { GENRES } from '../data/mockMovies';

const STORAGE_KEYS = {
  WATCHLIST: 'mouve_watchlist_v1',
  LEGACY_WATCHLIST: 'cinmora_watchlist_v1',
  FAVORITES: 'mouve_favorites_v1',
  LEGACY_FAVORITES: 'cinmora_favorites_v1',
  HISTORY: 'mouve_history_v1',
  LEGACY_HISTORY: 'cinmora_history_v1',
  RECENT_SEARCHES: 'mouve_recent_searches_v1',
  LEGACY_RECENT_SEARCHES: 'cinmora_recent_searches_v1',
  USER_PROFILE: 'mouve_profile_v1',
  LEGACY_USER_PROFILE: 'cinmora_profile_v1',
  ACTIVITIES: 'mouve_activities_v1',
  LEGACY_ACTIVITIES: 'cinmora_activities_v1',
  PREFERENCES: 'mouve_preferences_v1',
  LEGACY_PREFERENCES: 'cinmora_preferences_v1',
};

// In-memory fallback for environments where localStorage is unavailable, disabled, or throws security errors
const memoryStore: Record<string, string> = {};

function safeGet(key: string, legacyKey?: string): string | null {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      const val = window.localStorage.getItem(key);
      if (val !== null && val !== undefined) return val;
      if (legacyKey) {
        const legacyVal = window.localStorage.getItem(legacyKey);
        if (legacyVal !== null && legacyVal !== undefined) {
          try {
            window.localStorage.setItem(key, legacyVal);
          } catch {
            // ignore quota error
          }
          return legacyVal;
        }
      }
    }
  } catch {
    // localStorage security or access error, fall back to memory
  }
  return memoryStore[key] ?? (legacyKey ? memoryStore[legacyKey] : null) ?? null;
}

function safeSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {
    // Quota exceeded or storage disabled
  }
  memoryStore[key] = value;
}

function safeRemove(key: string, legacyKey?: string): void {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.removeItem(key);
      if (legacyKey) window.localStorage.removeItem(legacyKey);
    }
  } catch {
    // ignore
  }
  delete memoryStore[key];
  if (legacyKey) delete memoryStore[legacyKey];
}

// Safe JSON parser to protect against corrupted localStorage
function safeParse<T>(data: string | null, fallback: T): T {
  if (!data) return fallback;
  try {
    const parsed = JSON.parse(data);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}

// Default user cinema preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  favoriteGenres: ['Science Fiction', 'Drama', 'Animation', 'Thriller'],
  preferredLanguages: ['English'],
  preferredMoods: ['Mind-Bending', 'Intense', 'Atmospheric'],
};

// Default profile for local state
const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_mouve_demo',
  name: 'Alex Vance',
  handle: '@alexvance_cinema',
  email: 'alex.vance@mouve.io',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  joinedDate: 'Joined February 2025',
  favoriteGenres: ['Science Fiction', 'Drama', 'Animation', 'Thriller'],
  bio: 'Cinephile & visual storyteller. Passionate about mind-bending sci-fi, auteur direction, and unforgettable film scores.',
  preferences: DEFAULT_PREFERENCES,
};

export const StorageService = {
  getWatchlist(): Movie[] {
    return safeParse<Movie[]>(safeGet(STORAGE_KEYS.WATCHLIST, STORAGE_KEYS.LEGACY_WATCHLIST), []);
  },

  addToWatchlist(movie: Movie): boolean {
    const list = this.getWatchlist();
    if (list.some((m) => m.id === movie.id)) return false;
    const updated = [movie, ...list];
    safeSet(STORAGE_KEYS.WATCHLIST, JSON.stringify(updated));
    this.recordActivity({
      id: `act_${Date.now()}`,
      movieId: movie.id,
      movieTitle: movie.title,
      moviePoster: movie.posterUrl,
      action: 'watchlist_added',
      timestamp: new Date().toISOString(),
    });
    return true;
  },

  removeFromWatchlist(movieId: string): void {
    const list = this.getWatchlist().filter((m) => m.id !== movieId);
    safeSet(STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
  },

  isInWatchlist(movieId: string): boolean {
    return this.getWatchlist().some((m) => m.id === movieId);
  },

  getFavorites(): Movie[] {
    return safeParse<Movie[]>(safeGet(STORAGE_KEYS.FAVORITES, STORAGE_KEYS.LEGACY_FAVORITES), []);
  },

  toggleFavorite(movie: Movie): boolean {
    const favorites = this.getFavorites();
    const exists = favorites.some((m) => m.id === movie.id);
    let updated: Movie[];
    if (exists) {
      updated = favorites.filter((m) => m.id !== movie.id);
    } else {
      updated = [movie, ...favorites];
      this.recordActivity({
        id: `act_${Date.now()}`,
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.posterUrl,
        action: 'favorited',
        timestamp: new Date().toISOString(),
      });
    }
    safeSet(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    return !exists;
  },

  removeFromFavorites(movieId: string): void {
    const favorites = this.getFavorites().filter((m) => m.id !== movieId);
    safeSet(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  },

  isFavorite(movieId: string): boolean {
    return this.getFavorites().some((m) => m.id === movieId);
  },

  getViewingHistory(): Movie[] {
    return safeParse<Movie[]>(safeGet(STORAGE_KEYS.HISTORY, STORAGE_KEYS.LEGACY_HISTORY), []);
  },

  addToHistory(movie: Movie): void {
    // Avoid duplicate entries and place most recent at the top
    const history = this.getViewingHistory().filter((m) => m.id !== movie.id);
    const updated = [movie, ...history].slice(0, 30);
    safeSet(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    this.recordActivity({
      id: `act_${Date.now()}`,
      movieId: movie.id,
      movieTitle: movie.title,
      moviePoster: movie.posterUrl,
      action: 'watched',
      timestamp: new Date().toISOString(),
    });
  },

  removeFromHistory(movieId: string): void {
    const history = this.getViewingHistory().filter((m) => m.id !== movieId);
    safeSet(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  },

  clearHistory(): void {
    safeRemove(STORAGE_KEYS.HISTORY, STORAGE_KEYS.LEGACY_HISTORY);
  },

  getUserPreferences(): UserPreferences {
    return safeParse<UserPreferences>(safeGet(STORAGE_KEYS.PREFERENCES, STORAGE_KEYS.LEGACY_PREFERENCES), DEFAULT_PREFERENCES);
  },

  updateUserPreferences(partial: Partial<UserPreferences>): UserPreferences {
    const current = this.getUserPreferences();
    const updated: UserPreferences = {
      ...current,
      ...partial,
      favoriteGenres: partial.favoriteGenres || current.favoriteGenres,
      preferredLanguages: partial.preferredLanguages || current.preferredLanguages,
      preferredMoods: partial.preferredMoods || current.preferredMoods,
    };
    safeSet(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    return updated;
  },

  saveUserPreferences(partial: Partial<UserPreferences>): UserPreferences {
    return this.updateUserPreferences(partial);
  },

  getActivities(): UserActivity[] {
    return safeParse<UserActivity[]>(safeGet(STORAGE_KEYS.ACTIVITIES, STORAGE_KEYS.LEGACY_ACTIVITIES), []);
  },

  recordActivity(activity: UserActivity): void {
    const activities = [activity, ...this.getActivities()].slice(0, 40);
    safeSet(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  },

  getRecentSearches(): string[] {
    return safeParse<string[]>(safeGet(STORAGE_KEYS.RECENT_SEARCHES, STORAGE_KEYS.LEGACY_RECENT_SEARCHES), [
      'Interstellar',
      'Sci-Fi under 2 hours',
      'Denis Villeneuve',
      'Oppenheimer',
    ]);
  },

  addRecentSearch(term: string): void {
    if (!term.trim()) return;
    const current = this.getRecentSearches().filter((t) => t.toLowerCase() !== term.toLowerCase().trim());
    const updated = [term.trim(), ...current].slice(0, 8);
    safeSet(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
  },

  clearRecentSearches(): void {
    safeRemove(STORAGE_KEYS.RECENT_SEARCHES, STORAGE_KEYS.LEGACY_RECENT_SEARCHES);
  },

  getUserProfile(): UserProfile {
    const profile = safeParse<UserProfile>(safeGet(STORAGE_KEYS.USER_PROFILE, STORAGE_KEYS.LEGACY_USER_PROFILE), DEFAULT_PROFILE);
    if (!profile.preferences) {
      profile.preferences = this.getUserPreferences();
    }
    return profile;
  },

  updateUserProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    const updated = { ...current, ...profile };
    safeSet(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
    return updated;
  },

  /**
   * Derives a unified, weighted user taste profile from active library signals:
   * Favorites (weight: 3.0), Watchlist (weight: 2.0), History (weight: 1.5), and Preferences (weight: 2.5)
   */
  getUserTasteProfile(): UserTasteProfile {
    const favorites = this.getFavorites();
    const watchlist = this.getWatchlist();
    const history = this.getViewingHistory();
    const preferences = this.getUserPreferences();

    const genreScores: Record<string, { id: string; name: string; score: number }> = {};
    const directorScores: Record<string, number> = {};
    const moodScores: Record<string, number> = {};
    const keywordScores: Record<string, number> = {};

    const applyMovieSignals = (movie: Movie, weight: number) => {
      for (const g of movie.genres) {
        const id = g.id.toLowerCase();
        if (!genreScores[id]) {
          genreScores[id] = { id: g.id, name: g.name, score: 0 };
        }
        genreScores[id].score += weight * 2.0;
      }
      if (movie.director) {
        directorScores[movie.director] = (directorScores[movie.director] || 0) + weight * 2.5;
      }
      for (const mood of movie.moods || []) {
        const m = mood.toLowerCase();
        moodScores[m] = (moodScores[m] || 0) + weight * 1.5;
      }
      for (const kw of movie.keywords || []) {
        const k = kw.toLowerCase();
        keywordScores[k] = (keywordScores[k] || 0) + weight * 1.0;
      }
    };

    // 1. Favorites (strongest signal: 3.0)
    for (const f of favorites) {
      applyMovieSignals(f, 3.0);
    }

    // 2. Watchlist (intent signal: 2.0)
    for (const w of watchlist) {
      applyMovieSignals(w, 2.0);
    }

    // 3. Viewing History (recency signal: 1.5)
    for (const h of history) {
      applyMovieSignals(h, 1.5);
    }

    // 4. Stored explicit preferences
    if (preferences) {
      for (const favGenre of preferences.favoriteGenres || []) {
        const found = GENRES.find((g) => g.name.toLowerCase() === favGenre.toLowerCase() || g.id === favGenre.toLowerCase());
        const gid = found ? found.id : favGenre.toLowerCase();
        const gname = found ? found.name : favGenre;
        if (!genreScores[gid]) {
          genreScores[gid] = { id: gid, name: gname, score: 0 };
        }
        genreScores[gid].score += 4.0;
      }
      for (const prefMood of preferences.preferredMoods || []) {
        const m = prefMood.toLowerCase();
        moodScores[m] = (moodScores[m] || 0) + 3.0;
      }
    }

    const topGenres = Object.values(genreScores)
      .sort((a, b) => b.score - a.score)
      .map((g) => ({ genreId: g.id, name: g.name, score: Math.round(g.score * 10) / 10 }));

    const topDirectors = Object.entries(directorScores)
      .sort((a, b) => b[1] - a[1])
      .map(([director, score]) => ({ director, score: Math.round(score * 10) / 10 }));

    const topMoods = Object.entries(moodScores)
      .sort((a, b) => b[1] - a[1])
      .map(([mood, score]) => ({ mood, score: Math.round(score * 10) / 10 }));

    const topKeywords = Object.entries(keywordScores)
      .sort((a, b) => b[1] - a[1])
      .map(([keyword, score]) => ({ keyword, score: Math.round(score * 10) / 10 }));

    const totalInteractions = favorites.length + watchlist.length + history.length;
    const hasHistory = totalInteractions > 0;

    return {
      topGenres,
      topDirectors,
      topMoods,
      topKeywords,
      totalInteractions,
      hasHistory,
      favoriteTitles: favorites.map((m) => m.title),
      watchlistTitles: watchlist.map((m) => m.title),
      historyTitles: history.map((m) => m.title),
    };
  },
};
