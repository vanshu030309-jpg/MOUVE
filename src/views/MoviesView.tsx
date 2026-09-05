import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Filter,
  Check,
} from 'lucide-react';
import { FilterOptions, Genre, Movie, PageView } from '../types/movie';
import { MovieService } from '../services/movieService';
import { MovieCard } from '../components/MovieCard';
import { SearchBar } from '../components/SearchBar';
import { MovieGridSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { MOCK_MOVIES } from '../data/mockMovies';

interface MoviesViewProps {
  initialGenreId?: string;
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  watchlistIds: string[];
  favoriteIds: string[];
  onToggleWatchlist: (movie: Movie) => void;
  onToggleFavorite: (movie: Movie) => void;
  onNavigate: (view: PageView) => void;
}

const YEARS = ['all', ...Array.from(new Set(MOCK_MOVIES.map((m) => m.year.toString()))).sort((a, b) => Number(b) - Number(a))];

export const MoviesView: React.FC<MoviesViewProps> = ({
  initialGenreId = 'all',
  onSelectMovie,
  onPlayTrailer,
  watchlistIds,
  favoriteIds,
  onToggleWatchlist,
  onToggleFavorite,
  onNavigate,
}) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [availableMoods, setAvailableMoods] = useState<string[]>([]);
  const [availableDirectors, setAvailableDirectors] = useState<string[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    genreId: initialGenreId,
    year: 'all',
    minRating: 0,
    sortBy: 'popularity.desc',
    mood: 'all',
    director: 'all',
    language: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Load filter metadata
  useEffect(() => {
    async function loadMetadata() {
      const [g, moods, directors, languages] = await Promise.all([
        MovieService.getGenres(),
        MovieService.getAvailableMoods(),
        MovieService.getAvailableDirectors(),
        MovieService.getAvailableLanguages(),
      ]);
      setGenres(g);
      setAvailableMoods(moods);
      setAvailableDirectors(directors);
      setAvailableLanguages(languages);
    }
    loadMetadata();
  }, []);

  // Sync if initialGenreId changes from outside
  useEffect(() => {
    if (initialGenreId) {
      setFilters((prev) => ({ ...prev, genreId: initialGenreId }));
      setCurrentPage(1);
    }
  }, [initialGenreId]);

  // Discover movies when filters/page change
  useEffect(() => {
    let isMounted = true;
    async function fetchMovies() {
      try {
        setLoading(true);
        const res = await MovieService.discoverMovies(filters, currentPage, 10);
        if (isMounted) {
          setMovies(res.movies);
          setTotalPages(res.totalPages);
          setTotalResults(res.totalResults);
        }
      } catch (err) {
        console.error('Failed to discover movies:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchMovies();
    return () => {
      isMounted = false;
    };
  }, [filters, currentPage]);

  const handleFilterChange = (key: keyof FilterOptions, val: any) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      genreId: 'all',
      year: 'all',
      minRating: 0,
      sortBy: 'popularity.desc',
      mood: 'all',
      director: 'all',
      language: 'all',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.genreId !== 'all' ||
    filters.year !== 'all' ||
    filters.minRating > 0 ||
    filters.sortBy !== 'popularity.desc' ||
    (filters.mood && filters.mood !== 'all') ||
    (filters.director && filters.director !== 'all') ||
    (filters.language && filters.language !== 'all');

  return (
    <div id="movies-discovery-view" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-24 pb-16 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Movie Discovery
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse, filter, and discover cinematic works with tailored criteria, moods, and auteur directors
          </p>
        </div>

        {/* Quick Filter Toggle on Mobile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className="md:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm font-medium text-zinc-200"
          >
            <SlidersHorizontal size={16} />
            <span>Filters {hasActiveFilters && '(Active)'}</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Instant Search */}
      <div className="max-w-3xl">
        <SearchBar
          value={filters.searchQuery}
          onChange={(q) => handleFilterChange('searchQuery', q)}
          placeholder="Filter movies by title, actors, director, or keywords..."
          showSuggestions={false}
        />
      </div>

      {/* Filter Control Bar */}
      <div className="space-y-4">
        {/* Genre Tags Slider */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => handleFilterChange('genreId', 'all')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium shrink-0 transition-all cursor-pointer ${
              filters.genreId === 'all'
                ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/30'
                : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            All Genres
          </button>
          {genres.map((g) => {
            const active = filters.genreId === g.id || filters.genreId === g.slug;
            return (
              <button
                key={g.id}
                onClick={() => handleFilterChange('genreId', g.id)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium shrink-0 transition-all cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/30'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters Bar (Year, Mood, Director, Language, Rating, Sort) */}
        <div className="p-4 rounded-2xl bg-[#0E121B] border border-zinc-800/80 text-xs md:text-sm space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Year / Era Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-medium">Era / Year:</span>
              <select
                id="filter-year-select"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 text-xs cursor-pointer"
              >
                <option value="all">All Eras</option>
                <option value="2020s">2020s Modern</option>
                <option value="2010s">2010s Decade</option>
                <option value="classic">Classics (Pre-2010)</option>
                {YEARS.filter((y) => y !== 'all').map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Mood Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-medium">Mood:</span>
              <select
                id="filter-mood-select"
                value={filters.mood || 'all'}
                onChange={(e) => handleFilterChange('mood', e.target.value)}
                className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 text-xs cursor-pointer"
              >
                <option value="all">All Moods</option>
                {availableMoods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Director Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-medium">Director:</span>
              <select
                id="filter-director-select"
                value={filters.director || 'all'}
                onChange={(e) => handleFilterChange('director', e.target.value)}
                className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 text-xs cursor-pointer max-w-[150px] truncate"
              >
                <option value="all">All Directors</option>
                {availableDirectors.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-medium">Language:</span>
              <select
                id="filter-language-select"
                value={filters.language || 'all'}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 text-xs cursor-pointer"
              >
                <option value="all">All Languages</option>
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Rating */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-medium">Min Rating:</span>
              <select
                id="filter-rating-select"
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
                className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 text-xs cursor-pointer"
              >
                <option value={0}>Any Score</option>
                <option value={8.5}>★ 8.5+ (Masterpiece)</option>
                <option value={8.0}>★ 8.0+ (Great)</option>
                <option value={7.0}>★ 7.0+ (Good)</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-amber-400 text-xs font-semibold transition-colors cursor-pointer"
              >
                <X size={13} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Sorting */}
          <div className="flex items-center justify-between border-t border-zinc-800/60 pt-2.5">
            <div className="text-xs text-zinc-500">
              Showing <span className="text-zinc-300 font-medium">{totalResults}</span> matching films
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-medium">Sort by:</span>
              <select
                id="filter-sort-select"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 text-xs cursor-pointer font-medium"
              >
                <option value="popularity.desc">Most Popular</option>
                <option value="rating.desc">Highest Rated</option>
                <option value="release_date.desc">Release Date (Newest)</option>
                <option value="release_date.asc">Release Date (Oldest / Classics)</option>
                <option value="title.asc">Title (A – Z)</option>
                <option value="title.desc">Title (Z – A)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Results Status */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <p>
          Showing <span className="text-white font-semibold">{movies.length}</span> of{' '}
          <span className="text-white font-semibold">{totalResults}</span> titles
        </p>
        {totalPages > 1 && (
          <p>
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      {/* Movie Grid or Loading / Empty State */}
      {loading ? (
        <MovieGridSkeleton count={10} />
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-5 lg:gap-6">
          {movies.map((movie) => (
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
        <EmptyState
          type="search"
          title="No movies found"
          description="We couldn't find any films matching your exact combination of filters. Try adjusting your search query, year, or rating thresholds."
          actionLabel="Reset All Filters"
          onAction={handleResetFilters}
        />
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-8 border-t border-zinc-800/80">
          <button
            id="prev-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none text-zinc-300 text-sm font-medium border border-zinc-800 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-semibold transition-colors ${
                    currentPage === pageNum
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            id="next-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none text-zinc-300 text-sm font-medium border border-zinc-800 transition-colors"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
