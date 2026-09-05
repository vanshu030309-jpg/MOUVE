import React from 'react';
import { Info, Sparkles, Volume2, Calendar, Clock } from 'lucide-react';
import { Movie } from '../types/movie';
import { RatingBadge } from './RatingBadge';
import { TrailerButton } from './TrailerButton';
import { WatchlistButton } from './WatchlistButton';

interface HeroSectionProps {
  movie: Movie;
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  inWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  movie,
  onSelectMovie,
  onPlayTrailer,
  inWatchlist,
  onToggleWatchlist,
}) => {
  return (
    <div
      id="cinematic-hero-section"
      className="relative w-full min-h-[560px] md:min-h-[640px] lg:min-h-[720px] flex items-end pb-12 md:pb-16 overflow-hidden"
    >
      {/* Background Backdrop Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center transform scale-105 animate-pulse duration-[8000ms]"
        />
        {/* Cinematic multi-stop gradient masks */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent w-full md:w-3/4" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#050505]/40 to-[#050505]/90" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="max-w-2xl lg:max-w-3xl space-y-4">
          {/* Spotlight Pill */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-black shadow-lg shadow-orange-500/25">
              <Sparkles size={12} className="text-black" />
              <span>MOUVE Spotlight</span>
            </span>
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/10 backdrop-blur-md text-zinc-300 border border-white/10">
              {movie.certification || 'PG-13'}
            </span>
          </div>

          {/* Title & Tagline */}
          <div className="space-y-1">
            <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-sm sm:text-base md:text-lg text-amber-200/80 font-medium italic">
                "{movie.tagline}"
              </p>
            )}
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-300">
            <RatingBadge rating={movie.rating} voteCount={movie.voteCount} size="lg" />

            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-zinc-400" />
              <span>{movie.year}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-zinc-400" />
              <span>
                {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {movie.genres.map((g) => (
                <span
                  key={g.id}
                  className="px-2.5 py-0.5 text-xs rounded-md bg-white/5 border border-white/10 text-zinc-300"
                >
                  {g.name}
                </span>
              ))}
            </div>
          </div>

          {/* Overview Excerpt */}
          <p className="text-sm sm:text-base text-zinc-300/90 line-clamp-3 leading-relaxed max-w-2xl">
            {movie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <TrailerButton
              onClick={() => onPlayTrailer(movie)}
              size="lg"
              variant="primary"
              label="Watch Trailer"
            />

            <button
              id="hero-view-details-btn"
              onClick={() => onSelectMovie(movie)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Info size={18} />
              <span>Details & Cast</span>
            </button>

            <WatchlistButton
              inWatchlist={inWatchlist}
              onToggle={() => onToggleWatchlist(movie)}
              size="lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
