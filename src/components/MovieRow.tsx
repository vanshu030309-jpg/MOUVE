import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Movie } from '../types/movie';
import { MovieCard } from './MovieCard';

interface MovieRowProps {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer?: (movie: Movie) => void;
  onViewAll?: () => void;
  watchlistIds?: string[];
  favoriteIds?: string[];
  onToggleWatchlist?: (movie: Movie) => void;
  onToggleFavorite?: (movie: Movie) => void;
  getMovieBadge?: (movie: Movie, index: number) => string | undefined;
}

export const MovieRow = React.memo<MovieRowProps>(({
  id,
  title,
  subtitle,
  badge,
  movies,
  onSelectMovie,
  onPlayTrailer,
  onViewAll,
  watchlistIds = [],
  favoriteIds = [],
  onToggleWatchlist,
  onToggleFavorite,
  getMovieBadge,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (movies.length === 0) return null;

  return (
    <section id={`movie-row-${id}`} className="relative py-4 md:py-6 group/row w-full max-w-full overflow-hidden">
      {/* Row Header */}
      <div className="flex items-end justify-between px-4 sm:px-6 md:px-8 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-heading font-bold text-lg md:text-2xl text-white tracking-tight">
              {title}
            </h2>
            {badge && (
              <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-red-600/20 text-red-400 border border-red-500/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs md:text-sm text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="inline-flex items-center gap-1 text-xs md:text-sm text-zinc-400 hover:text-white transition-colors mr-2 cursor-pointer font-medium"
            >
              <span>Explore all</span>
              <ArrowRight size={14} />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer active:scale-90"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer active:scale-90"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={rowRef}
        className="flex items-stretch gap-3 sm:gap-4 px-4 sm:px-6 md:px-8 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2"
      >
        {movies.map((movie, index) => (
          <div
            key={movie.id}
            className="w-[160px] sm:w-[185px] md:w-[210px] lg:w-[230px] shrink-0 snap-start"
          >
            <MovieCard
              movie={movie}
              onSelect={onSelectMovie}
              onPlayTrailer={onPlayTrailer}
              inWatchlist={watchlistIds.includes(movie.id)}
              isFavorite={favoriteIds.includes(movie.id)}
              onToggleWatchlist={onToggleWatchlist}
              onToggleFavorite={onToggleFavorite}
              badgeText={getMovieBadge ? getMovieBadge(movie, index) : undefined}
            />
          </div>
        ))}
      </div>
    </section>
  );
});
