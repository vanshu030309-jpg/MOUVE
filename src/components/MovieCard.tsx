import React from 'react';
import { Play, Film } from 'lucide-react';
import { Movie } from '../types/movie';
import { RatingBadge } from './RatingBadge';
import { WatchlistButton } from './WatchlistButton';
import { FavoriteButton } from './FavoriteButton';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onPlayTrailer?: (movie: Movie) => void;
  inWatchlist?: boolean;
  isFavorite?: boolean;
  onToggleWatchlist?: (movie: Movie) => void;
  onToggleFavorite?: (movie: Movie) => void;
  className?: string;
  priority?: boolean;
  badgeText?: string;
}

export const MovieCard = React.memo<MovieCardProps>(({
  movie,
  onSelect,
  onPlayTrailer,
  inWatchlist = false,
  isFavorite = false,
  onToggleWatchlist,
  onToggleFavorite,
  className = '',
  badgeText,
}) => {
  return (
    <div
      id={`movie-card-${movie.id}`}
      onClick={() => onSelect(movie)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(movie);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${movie.title}`}
      className={`group relative flex flex-col rounded-2xl bg-[#0B0D15] border border-zinc-800/80 hover:border-amber-500/40 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-orange-950/20 hover:-translate-y-1.5 hover:scale-[1.02] cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] ${className}`}
    >
      {/* Poster Image & Aspect Ratio */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D15] via-transparent to-black/40 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <RatingBadge rating={movie.rating} size="sm" />
          </div>
          <div
            className={`pointer-events-auto flex items-center gap-1.5 transition-opacity duration-200 ${
              inWatchlist || isFavorite
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
            }`}
          >
            {onToggleFavorite && (
              <FavoriteButton
                isFavorite={isFavorite}
                onToggle={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(movie);
                }}
                size="sm"
              />
            )}
            {onToggleWatchlist && (
              <WatchlistButton
                inWatchlist={inWatchlist}
                onToggle={(e) => {
                  e.stopPropagation();
                  onToggleWatchlist(movie);
                }}
                variant="icon"
                size="sm"
              />
            )}
          </div>
        </div>

        {/* Center Hover Trailer Play Button */}
        {onPlayTrailer && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200 z-10 pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayTrailer(movie);
              }}
              className="pointer-events-auto p-3.5 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-black shadow-xl shadow-orange-500/40 hover:scale-110 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title={`Play trailer for ${movie.title}`}
              aria-label={`Play trailer for ${movie.title}`}
            >
              <Play size={20} className="fill-current ml-0.5" />
            </button>
          </div>
        )}

        {/* Bottom Tagline / Similarity Badge on Poster */}
        {badgeText ? (
          <div className="absolute bottom-2 left-2 right-2 z-10">
            <span className="inline-block max-w-full px-2 py-0.5 text-[10px] font-semibold tracking-wide rounded bg-amber-500 text-black shadow-md shadow-black/80 truncate">
              {badgeText}
            </span>
          </div>
        ) : movie.certification ? (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-black/70 backdrop-blur-sm text-zinc-300 border border-white/10 select-none">
              {movie.certification}
            </span>
          </div>
        ) : null}
      </div>

      {/* Info Section */}
      <div className="flex flex-col flex-1 p-3.5 justify-between">
        <div>
          <h3
            title={movie.title}
            className="font-heading font-semibold text-white text-sm md:text-base line-clamp-1 group-hover:text-amber-400 transition-colors"
          >
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
            <span>{movie.year}</span>
            <span>•</span>
            <span>{movie.runtime}m</span>
            {movie.genres[0] && (
              <>
                <span>•</span>
                <span className="text-zinc-300 line-clamp-1">{movie.genres[0].name}</span>
              </>
            )}
          </div>
        </div>

        {movie.director && (
          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400">
            <Film size={12} className="text-amber-400/80 shrink-0" />
            <span className="line-clamp-1">{movie.director}</span>
          </div>
        )}
      </div>
    </div>
  );
});
