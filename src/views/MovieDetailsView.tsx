import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Film,
  Globe,
  Heart,
  Play,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';
import { Movie, PageView, SimilarMovieMatch } from '../types/movie';
import { MovieService } from '../services/movieService';
import { StorageService } from '../services/storageService';
import { RatingBadge } from '../components/RatingBadge';
import { TrailerButton } from '../components/TrailerButton';
import { WatchlistButton } from '../components/WatchlistButton';
import { FavoriteButton } from '../components/FavoriteButton';
import { MovieCard } from '../components/MovieCard';
import { MovieDetailsSkeleton } from '../components/LoadingSkeleton';

interface MovieDetailsViewProps {
  movieId: string;
  previousView?: PageView;
  onNavigate: (view: PageView) => void;
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  watchlistIds: string[];
  favoriteIds: string[];
  onToggleWatchlist: (movie: Movie) => void;
  onToggleFavorite: (movie: Movie) => void;
}

export const MovieDetailsView: React.FC<MovieDetailsViewProps> = ({
  movieId,
  previousView,
  onNavigate,
  onSelectMovie,
  onPlayTrailer,
  watchlistIds,
  favoriteIds,
  onToggleWatchlist,
  onToggleFavorite,
}) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [similarMatches, setSimilarMatches] = useState<SimilarMovieMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadDetails() {
      try {
        setLoading(true);
        const data = await MovieService.getMovieById(movieId);
        if (data && isMounted) {
          setMovie(data);
          // Record to viewing history
          StorageService.addToHistory(data);
          const matches = await MovieService.getSimilarMovieMatches(movieId, 6);
          if (isMounted) {
            setSimilarMatches(matches);
            setSimilarMovies(matches.map((m) => m.movie));
          }
        }
      } catch (err) {
        console.error('Failed to load movie details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => {
      isMounted = false;
    };
  }, [movieId]);

  // Escape key back navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === 'Escape') {
        onNavigate(previousView || { type: 'movies' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previousView, onNavigate]);

  const handleShare = () => {
    if (navigator.clipboard && movie) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  if (loading || !movie) {
    return <MovieDetailsSkeleton />;
  }

  const inWatchlist = watchlistIds.includes(movie.id);
  const isFavorite = favoriteIds.includes(movie.id);

  return (
    <div id={`movie-details-view-${movie.id}`} className="min-h-screen pb-20 space-y-12">
      {/* Hero Backdrop Banner */}
      <div className="relative w-full min-h-[500px] md:min-h-[600px] flex items-end pb-8 overflow-hidden">
        {/* Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center transform scale-105 filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/75 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent w-full lg:w-2/3" />
        </div>

        {/* Floating Top Back Button */}
        <div className="absolute top-20 left-4 sm:left-6 md:left-8 z-20">
          <button
            id="back-to-previous-btn"
            onClick={() => onNavigate(previousView || { type: 'movies' })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/70 hover:bg-black/90 text-zinc-300 hover:text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            title="Go back to previous page (Esc)"
            aria-label="Go back to previous page"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>

        {/* Movie Header Info */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full pt-28">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            {/* Poster Thumbnail */}
            <div className="hidden sm:block shrink-0 w-44 md:w-56 lg:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/90 border-2 border-white/10 bg-zinc-900">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title & Actions */}
            <div className="flex-1 space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold uppercase text-zinc-200">
                  {movie.certification || 'PG-13'}
                </span>
                <RatingBadge rating={movie.rating} voteCount={movie.voteCount} size="lg" />
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-sm sm:text-base md:text-lg text-amber-200/80 font-medium italic mt-2">
                    "{movie.tagline}"
                  </p>
                )}
              </div>

              {/* Key metadata pills */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <Calendar size={15} className="text-zinc-400" />
                  <span>{movie.year} ({movie.releaseDate})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={15} className="text-zinc-400" />
                  <span>
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m ({movie.runtime} mins)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Film size={15} className="text-zinc-400" />
                  <span>Directed by {movie.director}</span>
                </div>
              </div>

              {/* Genre Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {movie.genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => onNavigate({ type: 'movies', initialGenreId: genre.id })}
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-zinc-200 border border-white/10 transition-colors cursor-pointer"
                  >
                    {genre.name}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <TrailerButton
                  onClick={() => onPlayTrailer(movie)}
                  size="lg"
                  variant="primary"
                  label="Watch Official Trailer"
                />

                <WatchlistButton
                  inWatchlist={inWatchlist}
                  onToggle={() => onToggleWatchlist(movie)}
                  size="lg"
                />

                <FavoriteButton
                  isFavorite={isFavorite}
                  onToggle={() => onToggleFavorite(movie)}
                  variant="pill"
                />

                <button
                  onClick={handleShare}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  title="Share movie link"
                  aria-label="Share movie link"
                >
                  <Share2 size={18} />
                </button>
                {copiedShare && (
                  <span className="text-xs text-emerald-400 font-semibold animate-fadeIn">
                    Link copied!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Story Overview & Cast */}
        <div className="lg:col-span-2 space-y-8">
          {/* Synopsis */}
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl md:text-2xl text-white">Storyline</h2>
            <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-normal">
              {movie.overview}
            </p>
          </section>

          {/* Cast Members */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-zinc-400" />
              <h2 className="font-heading font-bold text-xl md:text-2xl text-white">Top Billed Cast</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {movie.cast.map((member, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#0E1119] border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                >
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                    <img
                      src={member.profileUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white text-xs md:text-sm truncate">
                      {member.name}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">{member.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Ask AI About This Film CTA */}
          <section className="p-6 rounded-2xl bg-gradient-to-r from-[#171A26] via-[#1C172E] to-[#121522] border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                <Sparkles size={14} />
                <span>MOUVE AI Insights</span>
              </div>
              <p className="text-white font-medium text-sm">
                Want movies with the exact same vibe and themes as <span className="text-amber-300">{movie.title}</span>?
              </p>
            </div>
            <button
              onClick={() =>
                onNavigate({
                  type: 'ai-picks',
                  initialPrompt: `Recommend movies with similar themes, cinematography, and atmosphere to ${movie.title}`,
                })
              }
              className="shrink-0 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs md:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Ask MOUVE AI
            </button>
          </section>
        </div>

        {/* Right Col: Production Details Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0E1119] border border-zinc-800/80 space-y-4">
            <h3 className="font-heading font-bold text-lg text-white border-b border-zinc-800/80 pb-3">
              Film Metadata
            </h3>

            <div className="space-y-3.5 text-xs md:text-sm">
              <div>
                <span className="text-zinc-500 block text-xs uppercase font-medium">Director</span>
                <span className="text-zinc-200 font-semibold">{movie.director}</span>
              </div>

              {movie.budget && (
                <div>
                  <span className="text-zinc-500 block text-xs uppercase font-medium">Production Budget</span>
                  <span className="text-zinc-200 font-medium">{movie.budget}</span>
                </div>
              )}

              {movie.boxOffice && (
                <div>
                  <span className="text-zinc-500 block text-xs uppercase font-medium">Global Box Office</span>
                  <span className="text-zinc-200 font-medium">{movie.boxOffice}</span>
                </div>
              )}

              {movie.languages && (
                <div>
                  <span className="text-zinc-500 block text-xs uppercase font-medium">Original Audio Languages</span>
                  <span className="text-zinc-200">{movie.languages.join(', ')}</span>
                </div>
              )}

              {movie.moods && movie.moods.length > 0 && (
                <div>
                  <span className="text-zinc-500 block text-xs uppercase font-medium mb-1.5">Atmosphere & Mood</span>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.moods.map((mood) => (
                      <span
                        key={mood}
                        className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300/90 border border-amber-500/20 text-xs font-medium"
                      >
                        {mood}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movie.keywords && movie.keywords.length > 0 && (
                <div>
                  <span className="text-zinc-500 block text-xs uppercase font-medium mb-1.5">Key Themes & Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/10 text-xs font-normal"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-zinc-500 block text-xs uppercase font-medium">Audience Status</span>
                <span className="text-emerald-400 font-medium">Critically Acclaimed (98% Positive)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Movies Section */}
      {similarMovies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8 border-t border-zinc-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-xl md:text-2xl text-white">
                More Movies Like This
              </h2>
              <p className="text-xs md:text-sm text-zinc-400 mt-0.5">
                Films sharing narrative themes, tone, and director style
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {similarMovies.map((similar) => {
              const match = similarMatches.find((sm) => sm.movie.id === similar.id);
              return (
                <MovieCard
                  key={similar.id}
                  movie={similar}
                  onSelect={onSelectMovie}
                  onPlayTrailer={onPlayTrailer}
                  inWatchlist={watchlistIds.includes(similar.id)}
                  isFavorite={favoriteIds.includes(similar.id)}
                  onToggleWatchlist={onToggleWatchlist}
                  onToggleFavorite={onToggleFavorite}
                  badgeText={match?.similarityBadge}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
