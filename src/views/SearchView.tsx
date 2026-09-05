import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Filter, X, Film, Clock, Star } from 'lucide-react';
import { Movie, PageView } from '../types/movie';
import { MovieService } from '../services/movieService';
import { StorageService } from '../services/storageService';
import { SearchBar } from '../components/SearchBar';
import { MovieCard } from '../components/MovieCard';
import { EmptyState } from '../components/EmptyState';
import { MovieGridSkeleton } from '../components/LoadingSkeleton';

interface SearchViewProps {
  initialQuery?: string;
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  watchlistIds: string[];
  favoriteIds: string[];
  onToggleWatchlist: (movie: Movie) => void;
  onToggleFavorite: (movie: Movie) => void;
  onNavigate: (view: PageView) => void;
}

const POPULAR_SEARCH_TAGS = [
  'Christopher Nolan',
  'Denis Villeneuve',
  'S.S. Rajamouli',
  'Sci-Fi',
  'Interstellar',
  'RRR',
  'The Godfather',
  'Hindi',
  'Fight Club',
  'Thriller',
  'Aamir Khan',
  'Animation',
];

export const SearchView: React.FC<SearchViewProps> = ({
  initialQuery = '',
  onSelectMovie,
  onPlayTrailer,
  watchlistIds,
  favoriteIds,
  onToggleWatchlist,
  onToggleFavorite,
  onNavigate,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Movie[]>([]);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);

  useEffect(() => {
    setRecentSearches(StorageService.getRecentSearches());
  }, []);

  // Instant search & suggestion retrieval
  useEffect(() => {
    let isMounted = true;
    async function executeSearch() {
      if (!query.trim()) {
        setResults([]);
        setSuggestions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);
      try {
        const data = await MovieService.searchMovies(query, {
          minRating: minRatingFilter,
        });
        if (isMounted) {
          setResults(data.movies);
          setSuggestions(data.movies.slice(0, 5));
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      executeSearch();
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, minRatingFilter]);

  const handleSearchSubmit = (searchTerm: string) => {
    setQuery(searchTerm);
    StorageService.addRecentSearch(searchTerm);
    setRecentSearches(StorageService.getRecentSearches());
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    handleSearchSubmit(tag);
  };

  return (
    <div id="search-view-page" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-24 pb-16 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          Search Films & Visionaries
        </h1>
        <p className="text-sm text-zinc-400">
          Find movies by title, director, cast members, plot points, or genres
        </p>
      </div>

      {/* Main Search Input */}
      <div className="max-w-3xl mx-auto space-y-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={handleSearchSubmit}
          onSelectSuggestion={(m) => onSelectMovie(m)}
          suggestions={suggestions}
          placeholder="Search by movie title, director, actor, genre..."
          autoFocus={!initialQuery}
          showSuggestions={false}
        />

        {/* Quick Filter & Tags Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-zinc-500 mr-1">Trending:</span>
            {POPULAR_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Min Rating Filter */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-zinc-500">Filter rating:</span>
            <select
              value={minRatingFilter}
              onChange={(e) => setMinRatingFilter(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1 text-zinc-300 text-xs focus:outline-none"
            >
              <option value={0}>All Scores</option>
              <option value={8.5}>★ 8.5+</option>
              <option value={8.0}>★ 8.0+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Content / Results */}
      <div className="pt-4">
        {loading ? (
          <MovieGridSkeleton count={8} />
        ) : query.trim() ? (
          results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-3">
                <p>
                  Found <span className="text-white font-semibold">{results.length}</span> results for{' '}
                  <span className="text-amber-300">"{query}"</span>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-5 lg:gap-6">
                {results.map((movie) => (
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
            </div>
          ) : (
            <EmptyState
              type="search"
              title="No movies found"
              description={`We couldn't find any films matching "${query}". Try searching for another director, genre, or title.`}
              actionLabel="Search with MOUVE AI"
              onAction={() => onNavigate({ type: 'ai-picks', initialPrompt: query })}
              secondaryActionLabel="Clear Search"
              onSecondaryAction={() => {
                setQuery('');
                setMinRatingFilter(0);
              }}
            />
          )
        ) : (
          /* Default Search Landing (Recent searches & AI Prompt Shortcuts) */
          <div className="max-w-3xl mx-auto space-y-8 pt-4">
            {recentSearches.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#0E121B] border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-300 text-sm font-semibold">
                    <Clock size={16} className="text-zinc-400" />
                    <span>Your Recent Searches</span>
                  </div>
                  <button
                    onClick={() => {
                      StorageService.clearRecentSearches();
                      setRecentSearches([]);
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handleTagClick(term)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-200 border border-white/10 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Assistant Callout */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#17142A] to-[#121626] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>Looking for something specific?</span>
                </div>
                <p className="text-white text-sm font-medium">
                  Try asking MOUVE AI with natural language (e.g. "gripping sci-fi with an emotional ending").
                </p>
              </div>
              <button
                onClick={() => onNavigate({ type: 'ai-picks' })}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md shadow-amber-500/20"
              >
                Launch MOUVE AI
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
