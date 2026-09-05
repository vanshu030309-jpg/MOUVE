import React, { useEffect, useState } from 'react';
import { Compass, Sparkles, Filter, Film } from 'lucide-react';
import { Genre, Movie, PageView } from '../types/movie';
import { MovieService } from '../services/movieService';
import { GenreCard } from '../components/GenreCard';
import { MovieCard } from '../components/MovieCard';
import { MovieGridSkeleton } from '../components/LoadingSkeleton';

interface GenresViewProps {
  selectedGenreId?: string;
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  watchlistIds: string[];
  favoriteIds: string[];
  onToggleWatchlist: (movie: Movie) => void;
  onToggleFavorite: (movie: Movie) => void;
  onNavigate: (view: PageView) => void;
}

export const GenresView: React.FC<GenresViewProps> = ({
  selectedGenreId,
  onSelectMovie,
  onPlayTrailer,
  watchlistIds,
  favoriteIds,
  onToggleWatchlist,
  onToggleFavorite,
  onNavigate,
}) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGenres() {
      const g = await MovieService.getGenres();
      setGenres(g);
      if (g.length > 0) {
        if (selectedGenreId) {
          const match = g.find(
            (genre) =>
              genre.id.toLowerCase() === selectedGenreId.toLowerCase() ||
              genre.slug.toLowerCase() === selectedGenreId.toLowerCase()
          );
          setSelectedGenre(match || g[0]);
        } else {
          setSelectedGenre(g[0]);
        }
      }
    }
    loadGenres();
  }, [selectedGenreId]);

  useEffect(() => {
    let isMounted = true;
    async function loadGenreMovies() {
      if (!selectedGenre) return;
      try {
        setLoading(true);
        const m = await MovieService.getMoviesByGenre(selectedGenre.id);
        if (isMounted) setMovies(m);
      } catch (err) {
        console.error('Failed to load genre movies:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadGenreMovies();
    return () => {
      isMounted = false;
    };
  }, [selectedGenre]);

  return (
    <div id="genres-view-page" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-24 pb-16 space-y-10">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-6">
        <div className="flex items-center gap-2 text-red-500 font-semibold text-xs uppercase tracking-wider mb-1">
          <Compass size={14} />
          <span>Cinematic Categories</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          Browse by Genre
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Explore curated cinematic collections categorized by world-class storytelling themes
        </p>
      </div>

      {/* Genre Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {genres.map((genre) => (
          <GenreCard
            key={genre.id}
            genre={genre}
            selected={selectedGenre?.id === genre.id}
            onSelect={(g) => setSelectedGenre(g)}
          />
        ))}
      </div>

      {/* Active Genre Movies Spotlight */}
      {selectedGenre && (
        <section className="pt-8 border-t border-zinc-800/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-heading font-bold text-2xl text-white tracking-tight">
                  {selectedGenre.name} Collection
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold">
                  {movies.length} {movies.length === 1 ? 'Movie' : 'Movies'}
                </span>
              </div>
              <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl">{selectedGenre.description}</p>
            </div>

            <button
              onClick={() => onNavigate({ type: 'movies', initialGenreId: selectedGenre.id })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-800 transition-colors w-fit cursor-pointer"
            >
              <Filter size={14} />
              <span>Open in Movie Discovery Grid</span>
            </button>
          </div>

          {loading ? (
            <MovieGridSkeleton count={8} />
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
            <div className="p-12 text-center text-zinc-400 bg-zinc-900/40 rounded-2xl border border-zinc-800">
              <Film size={32} className="mx-auto text-zinc-600 mb-2" />
              <p className="font-medium text-white">No films currently listed in this genre.</p>
              <p className="text-xs text-zinc-500 mt-1">Try selecting another genre above.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
