export interface Genre {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  backdropUrl: string;
  movieCount?: number;
}

export interface CastMember {
  name: string;
  character: string;
  profileUrl: string;
}

export interface Movie {
  id: string;
  title: string;
  tagline: string;
  overview: string;
  releaseDate: string;
  year: number;
  runtime: number; // in minutes
  rating: number; // 0 to 10
  voteCount: number;
  certification: string; // "PG-13", "R", etc.
  posterUrl: string;
  backdropUrl: string;
  genres: Genre[];
  director: string;
  cast: CastMember[];
  trailerKey: string; // YouTube video ID
  trailerTitle?: string;
  budget?: string;
  boxOffice?: string;
  languages?: string[];
  featured?: boolean;
  trendingScore?: number;
  keywords?: string[];
  moods?: string[];
}

export interface AIRecommendation {
  movie: Movie;
  matchReason: string;
  matchScore: number; // 0 - 100
  standoutAspects: string[];
  similarVibe: string;
  fallbackNotice?: string;
  matchedCriteria?: string[];
}

export interface SimilarMovieMatch {
  movie: Movie;
  similarityScore: number; // 0 - 100
  matchReasons: string[];
  similarityBadge: string;
}

export interface UserTasteProfile {
  topGenres: { genreId: string; name: string; score: number }[];
  topDirectors: { director: string; score: number }[];
  topMoods: { mood: string; score: number }[];
  topKeywords: { keyword: string; score: number }[];
  totalInteractions: number;
  hasHistory: boolean;
  favoriteTitles: string[];
  watchlistTitles: string[];
  historyTitles: string[];
}

export interface UserActivity {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  action: 'watched' | 'watchlist_added' | 'favorited' | 'rated';
  timestamp: string;
  userRating?: number;
}

export interface UserPreferences {
  favoriteGenres: string[];
  preferredLanguages: string[];
  preferredMoods: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatar: string;
  joinedDate: string;
  favoriteGenres: string[];
  bio: string;
  preferences?: UserPreferences;
}

export interface FilterOptions {
  searchQuery: string;
  genreId: string;
  year: string;
  minRating: number;
  language?: string;
  mood?: string;
  director?: string;
  sortBy:
    | 'popularity.desc'
    | 'rating.desc'
    | 'release_date.desc'
    | 'release_date.asc'
    | 'title.asc'
    | 'title.desc';
}

export type PageView =
  | { type: 'home' }
  | { type: 'movies'; initialGenreId?: string; initialMood?: string; initialDirector?: string }
  | { type: 'genres'; selectedGenreId?: string }
  | { type: 'ai-picks'; initialPrompt?: string }
  | { type: 'search'; initialQuery?: string }
  | { type: 'watchlist'; initialTab?: 'watchlist' | 'favorites' | 'history' }
  | { type: 'profile' }
  | { type: 'movie-detail'; movieId: string; previousView?: PageView };

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
