import React from 'react';
import { Sparkles, Play, Info, Check } from 'lucide-react';
import { AIRecommendation, Movie } from '../types/movie';
import { RatingBadge } from './RatingBadge';
import { WatchlistButton } from './WatchlistButton';

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  inWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
}

export const RecommendationCard = React.memo<RecommendationCardProps>(({
  recommendation,
  onSelectMovie,
  onPlayTrailer,
  inWatchlist,
  onToggleWatchlist,
}) => {
  const { movie, matchReason, matchScore, standoutAspects, similarVibe } = recommendation;

  return (
    <div
      id={`ai-recommendation-card-${movie.id}`}
      className="group relative flex flex-col sm:flex-row gap-4 sm:gap-5 p-4 sm:p-5 md:p-6 rounded-2xl bg-[#0B0D15] border border-zinc-800/80 hover:border-amber-500/40 transition-all duration-300 shadow-xl shadow-black/60 hover:shadow-orange-950/20 text-left"
    >
      {/* Poster Thumbnail */}
      <div
        onClick={() => onSelectMovie(movie)}
        className="relative w-full sm:w-36 md:w-44 lg:w-48 xl:w-52 shrink-0 aspect-[2/3] rounded-xl overflow-hidden cursor-pointer bg-zinc-950 group-hover:shadow-lg transition-shadow"
      >
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        
        {/* Poster Quick Play Trailer Overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayTrailer(movie);
          }}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
          aria-label="Play trailer"
        >
          <div className="p-3 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-black shadow-xl hover:scale-110 transition-transform">
            <Play size={18} className="fill-current ml-0.5" />
          </div>
        </button>
      </div>

      {/* Details & AI Insights */}
      <div className="flex flex-col justify-between flex-1 min-w-0 space-y-4">
        <div>
          {/* Header Row: Match Score & Ratings */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              <Sparkles size={13} className="text-amber-400" />
              <span>{matchScore}% AI Match</span>
            </div>
            <RatingBadge rating={movie.rating} voteCount={movie.voteCount} size="sm" />
          </div>

          {/* Title & Metadata */}
          <h3
            onClick={() => onSelectMovie(movie)}
            className="font-heading font-bold text-xl md:text-2xl text-white hover:text-amber-300 transition-colors cursor-pointer"
          >
            {movie.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-1">
            <span>{movie.year}</span>
            <span>•</span>
            <span>{movie.runtime} min</span>
            <span>•</span>
            <span>{movie.certification || 'PG-13'}</span>
            <span>•</span>
            <span className="text-zinc-300">{movie.genres.map((g) => g.name).join(', ')}</span>
          </div>

          {/* AI Match Commentary */}
          <div className="mt-3.5 p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs md:text-sm text-zinc-200 leading-relaxed">
            <p className="font-semibold text-amber-300/90 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>Why MOUVE AI Recommended This:</span>
            </p>
            <p className="text-zinc-300">{matchReason}</p>
          </div>

          {/* Standout Tags */}
          {standoutAspects && standoutAspects.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {standoutAspects.map((aspect, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 text-xs rounded-md bg-white/5 border border-white/10 text-zinc-300 font-medium"
                >
                  ✓ {aspect}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-800/80">
          <button
            onClick={() => onPlayTrailer(movie)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black text-xs md:text-sm font-semibold transition-all shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
          >
            <Play size={14} className="fill-current" />
            <span>Trailer</span>
          </button>

          <WatchlistButton
            inWatchlist={inWatchlist}
            onToggle={() => onToggleWatchlist(movie)}
            size="sm"
          />

          <button
            onClick={() => onSelectMovie(movie)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs md:text-sm font-medium border border-white/10 transition-colors ml-auto cursor-pointer"
          >
            <Info size={14} />
            <span>Full Details</span>
          </button>
        </div>
      </div>
    </div>
  );
});
