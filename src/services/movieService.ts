import { GENRES, MOCK_MOVIES } from '../data/mockMovies';
import { FilterOptions, Genre, Movie, SimilarMovieMatch, UserPreferences } from '../types/movie';

/**
 * Reusable helper to check if a movie belongs to a specific genre.
 * Matches against genre id, slug, or name (case-insensitive).
 */
export function movieMatchesGenre(movie: Movie, genreQuery: string): boolean {
  if (!genreQuery || genreQuery === 'all') return true;
  const q = genreQuery.toLowerCase().trim();

  // Special handler for Indian Cinema category
  if (q === 'indian-cinema' || q === 'indian cinema' || q === 'indian') {
    const hasGenre = movie.genres.some(
      (g) => g.id.toLowerCase() === 'indian-cinema' || g.slug.toLowerCase() === 'indian-cinema' || g.name.toLowerCase().includes('indian')
    );
    const hasIndianKeyword = movie.keywords?.some((k) => k.toLowerCase().includes('indian cinema') || k.toLowerCase() === 'indian cinema' || k.toLowerCase() === 'indian');
    const hasIndianLanguage = movie.languages?.some((l) =>
      ['Hindi', 'Telugu', 'Tamil', 'Malayalam', 'Kannada', 'Bengali', 'Marathi'].includes(l)
    );
    return Boolean(hasGenre || hasIndianKeyword || hasIndianLanguage);
  }

  return movie.genres.some((g) => {
    const idMatch = g.id.toLowerCase() === q;
    const slugMatch = g.slug.toLowerCase() === q;
    const nameMatch = g.name.toLowerCase() === q;
    const partialMatch = g.name.toLowerCase().includes(q) || q.includes(g.name.toLowerCase());
    return idMatch || slugMatch || nameMatch || partialMatch;
  });
}

export const MovieService = {
  /**
   * Get all distinct directors in the dataset
   */
  getAvailableDirectors(): string[] {
    const directors = new Set<string>();
    for (const m of MOCK_MOVIES) {
      if (m.director) directors.add(m.director.trim());
    }
    return Array.from(directors).sort((a, b) => a.localeCompare(b));
  },

  /**
   * Get all distinct moods across movies
   */
  getAvailableMoods(): string[] {
    const moods = new Set<string>();
    for (const m of MOCK_MOVIES) {
      if (m.moods) {
        for (const mood of m.moods) moods.add(mood.trim());
      }
    }
    return Array.from(moods).sort((a, b) => a.localeCompare(b));
  },

  /**
   * Get all distinct audio languages across movies
   */
  getAvailableLanguages(): string[] {
    const langs = new Set<string>();
    for (const m of MOCK_MOVIES) {
      if (m.languages) {
        for (const lang of m.languages) langs.add(lang.trim());
      }
    }
    return Array.from(langs).sort((a, b) => a.localeCompare(b));
  },

  /**
   * Get the hero featured movie
   */
  async getFeaturedMovie(): Promise<Movie> {
    await delay(100);
    return MOCK_MOVIES.find((m) => m.featured) || MOCK_MOVIES[0];
  },

  /**
   * Get trending movies based on trendingScore
   */
  async getTrendingMovies(limit = 10): Promise<Movie[]> {
    await delay(120);
    return [...MOCK_MOVIES]
      .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
      .slice(0, limit);
  },

  /**
   * Get popular movies based on vote counts and ratings
   */
  async getPopularMovies(limit = 10): Promise<Movie[]> {
    await delay(120);
    return [...MOCK_MOVIES]
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, limit);
  },

  /**
   * Get highest rated masterpieces
   */
  async getTopRatedMovies(limit = 10): Promise<Movie[]> {
    await delay(120);
    return [...MOCK_MOVIES]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  },

  /**
   * Get newly released titles sorted by release date
   */
  async getNewReleases(limit = 10): Promise<Movie[]> {
    await delay(120);
    return [...MOCK_MOVIES]
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
      .slice(0, limit);
  },

  /**
   * Curated recommendations for the home feed (high-rating fallback)
   */
  async getRecommendedMovies(limit = 8): Promise<Movie[]> {
    await delay(120);
    return [...MOCK_MOVIES]
      .filter((m) => m.rating >= 8.6)
      .sort((a, b) => (b.trendingScore || 0) + b.rating * 10 - ((a.trendingScore || 0) + a.rating * 10))
      .slice(0, limit);
  },

  /**
   * Generate personalized recommendations based on the user's explicit
   * interactions: Watchlist, Favorites, History, and Preferences.
   * If insufficient signals exist, returns a high-quality fallback with isPersonalized: false.
   */
  async getPersonalizedRecommendations(
    signals: {
      watchlist?: Movie[];
      favorites?: Movie[];
      history?: Movie[];
      preferences?: UserPreferences;
    },
    limit = 10
  ): Promise<{ movies: Movie[]; isPersonalized: boolean; reason: string }> {
    await delay(140);
    const watchlist = signals.watchlist || [];
    const favorites = signals.favorites || [];
    const history = signals.history || [];
    const preferences = signals.preferences;

    const hasSignificantHistory =
      watchlist.length > 0 ||
      favorites.length > 0 ||
      history.length > 0;

    // Fallback if user has virtually no history
    if (!hasSignificantHistory) {
      const topPicks = [...MOCK_MOVIES]
        .sort((a, b) => b.rating * 10 + (b.trendingScore || 0) - (a.rating * 10 + (a.trendingScore || 0)))
        .slice(0, limit);

      return {
        movies: topPicks,
        isPersonalized: false,
        reason: 'Popular & acclaimed masterpieces to start your cinema journey',
      };
    }

    // Build affinity maps
    const genreAffinities: Record<string, number> = {};
    const directorAffinities: Record<string, number> = {};
    const moodAffinities: Record<string, number> = {};
    const keywordAffinities: Record<string, number> = {};
    const interactedMovieIds = new Set<string>();

    // 1. Favorites (highest weight: 3.0)
    for (const m of favorites) {
      interactedMovieIds.add(m.id);
      for (const g of m.genres) {
        genreAffinities[g.id] = (genreAffinities[g.id] || 0) + 3.0;
      }
      if (m.director) {
        directorAffinities[m.director] = (directorAffinities[m.director] || 0) + 3.0;
      }
      for (const mood of m.moods || []) {
        moodAffinities[mood.toLowerCase()] = (moodAffinities[mood.toLowerCase()] || 0) + 2.0;
      }
      for (const kw of m.keywords || []) {
        keywordAffinities[kw.toLowerCase()] = (keywordAffinities[kw.toLowerCase()] || 0) + 1.5;
      }
    }

    // 2. Watchlist (weight: 2.0)
    for (const m of watchlist) {
      interactedMovieIds.add(m.id);
      for (const g of m.genres) {
        genreAffinities[g.id] = (genreAffinities[g.id] || 0) + 2.0;
      }
      if (m.director) {
        directorAffinities[m.director] = (directorAffinities[m.director] || 0) + 2.0;
      }
      for (const mood of m.moods || []) {
        moodAffinities[mood.toLowerCase()] = (moodAffinities[mood.toLowerCase()] || 0) + 1.5;
      }
      for (const kw of m.keywords || []) {
        keywordAffinities[kw.toLowerCase()] = (keywordAffinities[kw.toLowerCase()] || 0) + 1.0;
      }
    }

    // 3. Viewing History (weight: 1.5)
    for (const m of history) {
      interactedMovieIds.add(m.id);
      for (const g of m.genres) {
        genreAffinities[g.id] = (genreAffinities[g.id] || 0) + 1.5;
      }
      if (m.director) {
        directorAffinities[m.director] = (directorAffinities[m.director] || 0) + 1.5;
      }
      for (const mood of m.moods || []) {
        moodAffinities[mood.toLowerCase()] = (moodAffinities[mood.toLowerCase()] || 0) + 1.0;
      }
      for (const kw of m.keywords || []) {
        keywordAffinities[kw.toLowerCase()] = (keywordAffinities[kw.toLowerCase()] || 0) + 0.8;
      }
    }

    // 4. Explicit user preferences (weight: 2.5)
    if (preferences) {
      for (const favGenre of preferences.favoriteGenres) {
        const found = GENRES.find((g) => g.name.toLowerCase() === favGenre.toLowerCase());
        const gid = found ? found.id : favGenre.toLowerCase();
        genreAffinities[gid] = (genreAffinities[gid] || 0) + 2.5;
      }
      for (const prefMood of preferences.preferredMoods) {
        moodAffinities[prefMood.toLowerCase()] = (moodAffinities[prefMood.toLowerCase()] || 0) + 2.0;
      }
    }

    // Score all movies in catalog
    const scored = MOCK_MOVIES.map((movie) => {
      let score = 0;

      // Genre score
      for (const g of movie.genres) {
        if (genreAffinities[g.id]) {
          score += genreAffinities[g.id] * 8;
        }
      }

      // Director affinity (auteur matching)
      if (movie.director && directorAffinities[movie.director]) {
        score += directorAffinities[movie.director] * 12;
      }

      // Mood match
      for (const mood of movie.moods || []) {
        if (moodAffinities[mood.toLowerCase()]) {
          score += moodAffinities[mood.toLowerCase()] * 6;
        }
      }

      // Keyword match
      for (const kw of movie.keywords || []) {
        if (keywordAffinities[kw.toLowerCase()]) {
          score += keywordAffinities[kw.toLowerCase()] * 4;
        }
      }

      // Preferred language bonus
      if (preferences?.preferredLanguages && movie.languages) {
        for (const lang of movie.languages) {
          if (preferences.preferredLanguages.includes(lang)) {
            score += 10;
          }
        }
      }

      // Quality signal
      score += movie.rating * 5;

      // Unseen discovery bonus: boost movies the user hasn't yet added to watchlist/favorites/history
      if (!interactedMovieIds.has(movie.id)) {
        score += 20;
      } else {
        // slight dampening so recommendations focus on fresh discoveries
        score -= 15;
      }

      return { movie, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const topRecommendations = scored.slice(0, limit).map((s) => s.movie);

    // Identify top genres for contextual reason
    const topGenreEntries = Object.entries(genreAffinities).sort((a, b) => b[1] - a[1]);
    const topGenreNames = topGenreEntries
      .slice(0, 2)
      .map(([gid]) => {
        const found = GENRES.find((g) => g.id === gid);
        return found ? found.name : gid;
      });

    const reason =
      topGenreNames.length > 0
        ? `Curated based on your affinity for ${topGenreNames.join(' & ')} and your viewing history`
        : 'Curated based on your library interactions and preferences';

    return {
      movies: topRecommendations,
      isPersonalized: true,
      reason,
    };
  },

  /**
   * Get genre-specific picks (e.g. Adventure, Thriller, Drama, Comedy, Sci-Fi)
   */
  async getGenrePicks(genreKey: string, limit = 8): Promise<Movie[]> {
    await delay(120);
    const matching = MOCK_MOVIES.filter((m) => movieMatchesGenre(m, genreKey));
    return matching
      .sort((a, b) => (b.trendingScore || 0) + b.rating * 5 - ((a.trendingScore || 0) + a.rating * 5))
      .slice(0, limit);
  },

  /**
   * Retrieve a movie by its unique ID
   */
  async getMovieById(id: string): Promise<Movie | null> {
    await delay(80);
    const movie = MOCK_MOVIES.find((m) => m.id === id);
    return movie || null;
  },

  /**
   * Smart Movie Matching: Calculate similarity using weighted metadata:
   * - Shared genres (25 pts per shared genre)
   * - Director (35 pts for auteur match)
   * - Shared cast members (15 pts per shared actor)
   * - Themes & keywords (15 pts per shared keyword)
   * - Moods & tone (12 pts per shared mood)
   * - Shared audio language (8 pts)
   * - Release era proximity (up to 8 pts)
   * - Rating proximity (up to 8 pts)
   * Excludes the current movie.
   */
  async getSimilarMovies(movieId: string, limit = 6): Promise<Movie[]> {
    await delay(100);
    const current = MOCK_MOVIES.find((m) => m.id === movieId);
    if (!current) return MOCK_MOVIES.slice(0, limit);

    const currentGenreIds = new Set(current.genres.map((g) => g.id.toLowerCase()));
    const currentKeywords = new Set((current.keywords || []).map((k) => k.toLowerCase()));
    const currentMoods = new Set((current.moods || []).map((m) => m.toLowerCase()));
    const currentCastNames = new Set(current.cast.map((c) => c.name.toLowerCase()));
    const currentLanguages = new Set((current.languages || []).map((l) => l.toLowerCase()));

    // Rank candidates
    const candidates = MOCK_MOVIES.filter((m) => m.id !== movieId).map((movie) => {
      let score = 0;

      // 1. Shared genres (high weight)
      for (const g of movie.genres) {
        if (currentGenreIds.has(g.id.toLowerCase())) {
          score += 25;
        }
      }

      // 2. Same director (strong auteur signal)
      if (movie.director && current.director && movie.director.toLowerCase() === current.director.toLowerCase()) {
        score += 35;
      }

      // 3. Shared cast members (moderate signal)
      for (const castMember of movie.cast) {
        if (currentCastNames.has(castMember.name.toLowerCase())) {
          score += 15;
        }
      }

      // 4. Shared themes & keywords (high signal)
      if (movie.keywords) {
        for (const k of movie.keywords) {
          if (currentKeywords.has(k.toLowerCase())) {
            score += 15;
          }
        }
      }

      // 5. Shared moods & tone
      if (movie.moods) {
        for (const m of movie.moods) {
          if (currentMoods.has(m.toLowerCase())) {
            score += 12;
          }
        }
      }

      // 6. Shared languages
      if (movie.languages) {
        for (const l of movie.languages) {
          if (currentLanguages.has(l.toLowerCase())) {
            score += 8;
          }
        }
      }

      // 7. Era/Decade similarity
      const yearDiff = Math.abs(movie.year - current.year);
      if (yearDiff <= 3) {
        score += 8;
      } else if (yearDiff <= 8) {
        score += 4;
      }

      // 8. Rating proximity (similar caliber)
      const ratingDiff = Math.abs(movie.rating - current.rating);
      if (ratingDiff <= 0.3) {
        score += 8;
      } else if (ratingDiff <= 0.7) {
        score += 4;
      }

      return {
        movie,
        score,
      };
    });

    const matched = candidates
      .filter((c) => c.score > 25)
      .sort((a, b) => b.score - a.score)
      .map((c) => c.movie);

    if (matched.length >= limit) {
      return matched.slice(0, limit);
    }

    // Fallback fill to reach limit
    const result = [...matched];
    const existingIds = new Set([movieId, ...matched.map((m) => m.id)]);

    for (const movie of MOCK_MOVIES) {
      if (!existingIds.has(movie.id)) {
        result.push(movie);
        existingIds.add(movie.id);
        if (result.length >= limit) break;
      }
    }

    return result.slice(0, limit);
  },

  /**
   * "Because You Watched" - smart matches based on a specific explored film
   */
  async getMoviesBecauseYouWatched(referenceMovie: Movie, limit = 6): Promise<Movie[]> {
    return this.getSimilarMovies(referenceMovie.id, limit);
  },

  /**
   * Smart Multi-Attribute Similarity with grounded match reasons and match percentage badge
   */
  async getSimilarMovieMatches(movieId: string, limit = 6): Promise<SimilarMovieMatch[]> {
    await delay(100);
    const current = MOCK_MOVIES.find((m) => m.id === movieId);
    if (!current) return [];

    const currentGenreIds = new Set(current.genres.map((g) => g.id.toLowerCase()));
    const currentKeywords = new Set((current.keywords || []).map((k) => k.toLowerCase()));
    const currentMoods = new Set((current.moods || []).map((m) => m.toLowerCase()));
    const currentCastNames = new Set(current.cast.map((c) => c.name.toLowerCase()));

    const scored = MOCK_MOVIES.filter((m) => m.id !== movieId).map((movie) => {
      let rawScore = 0;
      const matchReasons: string[] = [];
      const standoutPills: string[] = [];

      // 1. Same director
      if (movie.director && current.director && movie.director.toLowerCase() === current.director.toLowerCase()) {
        rawScore += 50;
        standoutPills.push(`Directed by ${movie.director}`);
        matchReasons.push(`Auteur direction by ${movie.director}`);
      }

      // 2. Shared genres
      const sharedGenres = movie.genres.filter((g) => currentGenreIds.has(g.id.toLowerCase()));
      if (sharedGenres.length > 0) {
        rawScore += sharedGenres.length * 30;
        if (standoutPills.length === 0) {
          standoutPills.push(sharedGenres.map((g) => g.name).slice(0, 2).join(' & '));
        }
        matchReasons.push(`Shared ${sharedGenres.map((g) => g.name).join(' & ')} storytelling`);
      }

      // 3. Shared cast
      const sharedCast = movie.cast.filter((c) => currentCastNames.has(c.name.toLowerCase()));
      if (sharedCast.length > 0) {
        rawScore += sharedCast.length * 20;
        matchReasons.push(`Features ${sharedCast.map((c) => c.name).join(', ')}`);
      }

      // 4. Shared themes & keywords
      if (movie.keywords) {
        const sharedKw = movie.keywords.filter((k) => currentKeywords.has(k.toLowerCase()));
        if (sharedKw.length > 0) {
          rawScore += sharedKw.length * 15;
          matchReasons.push(`Thematic parallels in ${sharedKw.slice(0, 2).join(' & ')}`);
        }
      }

      // 5. Shared moods
      if (movie.moods) {
        const sharedM = movie.moods.filter((m) => currentMoods.has(m.toLowerCase()));
        if (sharedM.length > 0) {
          rawScore += sharedM.length * 12;
        }
      }

      // Proximity score
      const yearDiff = Math.abs(movie.year - current.year);
      if (yearDiff <= 3) rawScore += 8;
      const ratingDiff = Math.abs(movie.rating - current.rating);
      if (ratingDiff <= 0.4) rawScore += 8;

      return {
        movie,
        rawScore,
        matchReasons,
        standoutPills,
      };
    });

    scored.sort((a, b) => b.rawScore - a.rawScore || b.movie.rating - a.movie.rating);
    const topPicks = scored.slice(0, limit);

    return topPicks.map((item, idx) => {
      const percentage = Math.min(98, Math.max(84, 98 - idx * 3));
      let badge = `${percentage}% Match`;
      if (item.standoutPills.length > 0) {
        badge = `${percentage}% Match • ${item.standoutPills[0]}`;
      }

      return {
        movie: item.movie,
        similarityScore: percentage,
        matchReasons: item.matchReasons.length > 0 ? item.matchReasons : [`Acclaimed cinematic match`],
        similarityBadge: badge,
      };
    });
  },

  /**
   * Get all genres with accurate dynamic movie counts based on the active dataset
   */
  async getGenres(): Promise<Genre[]> {
    await delay(60);
    return GENRES.map((genre) => {
      const count = MOCK_MOVIES.filter((m) => movieMatchesGenre(m, genre.id)).length;
      return {
        ...genre,
        movieCount: count,
      };
    });
  },

  /**
   * Filter movies strictly by genre
   */
  async getMoviesByGenre(genreQuery: string): Promise<Movie[]> {
    await delay(120);
    if (!genreQuery || genreQuery === 'all') return MOCK_MOVIES;
    return MOCK_MOVIES.filter((m) => movieMatchesGenre(m, genreQuery));
  },

  /**
   * Search movies across title, genres, overview, director, cast, languages, keywords, and moods
   */
  async searchMovies(
    query: string,
    filters?: Partial<FilterOptions>
  ): Promise<{ movies: Movie[]; totalResults: number }> {
    await delay(120);
    let results = [...MOCK_MOVIES];

    const q = query.toLowerCase().trim();
    if (q) {
      const scored = results
        .map((m) => {
          let score = 0;
          const titleLower = m.title.toLowerCase();
          const dirLower = m.director.toLowerCase();

          // Title matching
          if (titleLower === q) score += 100;
          else if (titleLower.startsWith(q)) score += 60;
          else if (titleLower.includes(q)) score += 40;

          // Director matching
          if (dirLower.includes(q)) score += 50;

          // Cast matching
          const castMatch = m.cast.some((c) => c.name.toLowerCase().includes(q) || c.character.toLowerCase().includes(q));
          if (castMatch) score += 45;

          // Genre matching
          const genreMatch = m.genres.some(
            (g) => g.name.toLowerCase().includes(q) || g.slug.toLowerCase().includes(q)
          );
          if (genreMatch) score += 35;

          // Language matching
          const langMatch = (m.languages || []).some((l) => l.toLowerCase().includes(q));
          if (langMatch) score += 30;

          // Keywords matching
          const keywordMatch = (m.keywords || []).some((k) => k.toLowerCase().includes(q));
          if (keywordMatch) score += 30;

          // Moods matching
          const moodMatch = (m.moods || []).some((mood) => mood.toLowerCase().includes(q));
          if (moodMatch) score += 25;

          // Overview & tagline matching
          if (m.overview.toLowerCase().includes(q)) score += 15;
          if (m.tagline?.toLowerCase().includes(q)) score += 15;

          return { movie: m, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || b.movie.rating - a.movie.rating);

      results = scored.map((item) => item.movie);
    }

    if (filters?.genreId && filters.genreId !== 'all') {
      results = results.filter((m) => movieMatchesGenre(m, filters.genreId!));
    }

    if (filters?.year && filters.year !== 'all') {
      if (filters.year === '2020s') {
        results = results.filter((m) => m.year >= 2020);
      } else if (filters.year === '2010s') {
        results = results.filter((m) => m.year >= 2010 && m.year <= 2019);
      } else if (filters.year === '2000s') {
        results = results.filter((m) => m.year >= 2000 && m.year <= 2009);
      } else if (filters.year === '1990s') {
        results = results.filter((m) => m.year >= 1990 && m.year <= 1999);
      } else if (filters.year === 'classic') {
        results = results.filter((m) => m.year < 1990);
      } else {
        results = results.filter((m) => m.year.toString() === filters.year);
      }
    }

    if (filters?.minRating && filters.minRating > 0) {
      results = results.filter((m) => m.rating >= filters.minRating!);
    }

    if (filters?.language && filters.language !== 'all') {
      results = results.filter((m) => (m.languages || []).some((l) => l.toLowerCase() === filters.language!.toLowerCase()));
    }

    if (filters?.mood && filters.mood !== 'all') {
      results = results.filter((m) => (m.moods || []).some((mood) => mood.toLowerCase() === filters.mood!.toLowerCase()));
    }

    if (filters?.director && filters.director !== 'all') {
      results = results.filter((m) => m.director.toLowerCase() === filters.director!.toLowerCase());
    }

    return {
      movies: results,
      totalResults: results.length,
    };
  },

  /**
   * Discover movies with comprehensive filtering & pagination
   */
  async discoverMovies(
    filters: FilterOptions,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ movies: Movie[]; totalPages: number; totalResults: number }> {
    await delay(150);
    let results = [...MOCK_MOVIES];

    // Search query
    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      results = results.filter((m) => {
        const titleMatch = m.title.toLowerCase().includes(q);
        const dirMatch = m.director.toLowerCase().includes(q);
        const castMatch = m.cast.some((c) => c.name.toLowerCase().includes(q) || c.character.toLowerCase().includes(q));
        const genreMatch = m.genres.some(
          (g) => g.name.toLowerCase().includes(q) || g.slug.toLowerCase().includes(q)
        );
        const overviewMatch = m.overview.toLowerCase().includes(q);
        return titleMatch || dirMatch || castMatch || genreMatch || overviewMatch;
      });
    }

    // Genre
    if (filters.genreId && filters.genreId !== 'all') {
      results = results.filter((m) => movieMatchesGenre(m, filters.genreId));
    }

    // Year or Decade filter
    if (filters.year && filters.year !== 'all') {
      if (filters.year === '2020s') {
        results = results.filter((m) => m.year >= 2020);
      } else if (filters.year === '2010s') {
        results = results.filter((m) => m.year >= 2010 && m.year <= 2019);
      } else if (filters.year === '2000s') {
        results = results.filter((m) => m.year >= 2000 && m.year <= 2009);
      } else if (filters.year === '1990s') {
        results = results.filter((m) => m.year >= 1990 && m.year <= 1999);
      } else if (filters.year === 'classic') {
        results = results.filter((m) => m.year < 1990);
      } else {
        results = results.filter((m) => m.year.toString() === filters.year);
      }
    }

    // Min Rating
    if (filters.minRating && filters.minRating > 0) {
      results = results.filter((m) => m.rating >= filters.minRating);
    }

    // Audio Language filter
    if (filters.language && filters.language !== 'all') {
      results = results.filter((m) => (m.languages || []).some((l) => l.toLowerCase() === filters.language!.toLowerCase()));
    }

    // Atmosphere/Mood filter
    if (filters.mood && filters.mood !== 'all') {
      results = results.filter((m) => (m.moods || []).some((mood) => mood.toLowerCase() === filters.mood!.toLowerCase()));
    }

    // Director filter
    if (filters.director && filters.director !== 'all') {
      results = results.filter((m) => m.director.toLowerCase() === filters.director!.toLowerCase());
    }

    // Sorting
    switch (filters.sortBy) {
      case 'rating.desc':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'release_date.desc':
        results.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        break;
      case 'release_date.asc':
        results.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
        break;
      case 'title.asc':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title.desc':
        results.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'popularity.desc':
      default:
        results.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
        break;
    }

    const totalResults = results.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const paginated = results.slice(startIndex, startIndex + pageSize);

    return {
      movies: paginated,
      totalPages,
      totalResults,
    };
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
