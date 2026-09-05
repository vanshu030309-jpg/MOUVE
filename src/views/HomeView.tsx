import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Compass, ShieldAlert, HeartHandshake, Smile, Atom } from 'lucide-react';
import { Genre, Movie, PageView, SimilarMovieMatch } from '../types/movie';
import { MovieService } from '../services/movieService';
import { StorageService } from '../services/storageService';
import { MOCK_MOVIES } from '../data/mockMovies';
import { HeroSection } from '../components/HeroSection';
import { MovieRow } from '../components/MovieRow';
import { GenreCard } from '../components/GenreCard';
import { HeroSkeleton } from '../components/LoadingSkeleton';

interface HomeViewProps {
  onNavigate: (view: PageView) => void;
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  watchlistIds: string[];
  favoriteIds: string[];
  onToggleWatchlist: (movie: Movie) => void;
  onToggleFavorite: (movie: Movie) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectMovie,
  onPlayTrailer,
  watchlistIds,
  favoriteIds,
  onToggleWatchlist,
  onToggleFavorite,
}) => {
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [adventurePicks, setAdventurePicks] = useState<Movie[]>([]);
  const [thrillerPicks, setThrillerPicks] = useState<Movie[]>([]);
  const [dramaPicks, setDramaPicks] = useState<Movie[]>([]);
  const [comedyPicks, setComedyPicks] = useState<Movie[]>([]);
  const [sciFiPicks, setSciFiPicks] = useState<Movie[]>([]);
  const [indianCinemaPicks, setIndianCinemaPicks] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [personalizedData, setPersonalizedData] = useState<{
    recommendations: Movie[];
    isPersonalized: boolean;
    reason: string;
  }>({
    recommendations: [],
    isPersonalized: false,
    reason: 'Discover hand-curated cinematic gems tailored to your preferences',
  });
  const [recentlyViewed, setRecentlyViewed] = useState<Movie[]>([]);
  const [becauseYouWatchedData, setBecauseYouWatchedData] = useState<{
    referenceMovie: Movie;
    matches: SimilarMovieMatch[];
  } | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  // Load persistent user signals for personalized discovery
  const loadPersonalizedSignals = async () => {
    try {
      const history = StorageService.getViewingHistory();
      setRecentlyViewed(history);

      const favs = StorageService.getFavorites();
      const wls = StorageService.getWatchlist();
      const prefs = StorageService.getUserPreferences();

      const pResult = await MovieService.getPersonalizedRecommendations({
        favorites: favs,
        watchlist: wls,
        history,
        preferences: prefs,
      });
      setPersonalizedData({
        recommendations: pResult.movies,
        isPersonalized: pResult.isPersonalized,
        reason: pResult.reason,
      });

      // Derive "Because You Watched" reference movie
      const refMovie = history[0] || favs[0] || MOCK_MOVIES.find((m) => m.id === 'inception') || MOCK_MOVIES[0];
      if (refMovie) {
        const matches = await MovieService.getSimilarMovieMatches(refMovie.id, 8);
        setBecauseYouWatchedData({
          referenceMovie: refMovie,
          matches,
        });
      }
    } catch (e) {
      console.error('Failed to load personalized recommendations:', e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadHomeData() {
      try {
        setLoading(true);
        const [
          featured,
          trending,
          popular,
          topRated,
          releases,
          adv,
          thrill,
          drama,
          comedy,
          scifi,
          indian,
          recommended,
          allGenres,
        ] = await Promise.all([
          MovieService.getFeaturedMovie(),
          MovieService.getTrendingMovies(8),
          MovieService.getPopularMovies(8),
          MovieService.getTopRatedMovies(8),
          MovieService.getNewReleases(8),
          MovieService.getGenrePicks('adventure', 8),
          MovieService.getGenrePicks('thriller', 8),
          MovieService.getGenrePicks('drama', 8),
          MovieService.getGenrePicks('comedy', 8),
          MovieService.getGenrePicks('science-fiction', 8),
          MovieService.getGenrePicks('indian-cinema', 8),
          MovieService.getRecommendedMovies(8),
          MovieService.getGenres(),
        ]);

        if (isMounted) {
          setFeaturedMovie(featured);
          setTrendingMovies(trending);
          setPopularMovies(popular);
          setTopRatedMovies(topRated);
          setNewReleases(releases);
          setAdventurePicks(adv);
          setThrillerPicks(thrill);
          setDramaPicks(drama);
          setComedyPicks(comedy);
          setSciFiPicks(scifi);
          setIndianCinemaPicks(indian);
          setRecommendedMovies(recommended);
          setGenres(allGenres);
        }

        await loadPersonalizedSignals();
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update personalized signals when watchlist or favorites change
  useEffect(() => {
    loadPersonalizedSignals();
  }, [watchlistIds.length, favoriteIds.length]);

  if (loading || !featuredMovie) {
    return (
      <div className="space-y-8">
        <HeroSkeleton />
      </div>
    );
  }

  return (
    <div id="home-view-container" className="space-y-6 md:space-y-10 pb-16">
      {/* Hero Section */}
      <HeroSection
        movie={featuredMovie}
        onSelectMovie={onSelectMovie}
        onPlayTrailer={onPlayTrailer}
        inWatchlist={watchlistIds.includes(featuredMovie.id)}
        onToggleWatchlist={onToggleWatchlist}
      />

      {/* Recommended For You (Personalized Affinity Engine) */}
      {personalizedData.recommendations.length > 0 && (
        <MovieRow
          id="recommended-for-you"
          title={personalizedData.isPersonalized ? "Recommended For You" : "Recommended Films"}
          subtitle={personalizedData.reason}
          badge={personalizedData.isPersonalized ? "For You" : "Featured"}
          movies={personalizedData.recommendations}
          onSelectMovie={onSelectMovie}
          onPlayTrailer={onPlayTrailer}
          onViewAll={() => onNavigate({ type: 'movies' })}
          watchlistIds={watchlistIds}
          favoriteIds={favoriteIds}
          onToggleWatchlist={onToggleWatchlist}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      {/* Recently Viewed Row */}
      {recentlyViewed.length > 0 && (
        <MovieRow
          id="recently-viewed"
          title="Recently Viewed"
          subtitle="Continue exploring or revisit your recently viewed titles"
          badge="History"
          movies={recentlyViewed.slice(0, 10)}
          onSelectMovie={onSelectMovie}
          onPlayTrailer={onPlayTrailer}
          onViewAll={() => onNavigate({ type: 'profile' })}
          watchlistIds={watchlistIds}
          favoriteIds={favoriteIds}
          onToggleWatchlist={onToggleWatchlist}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      {/* Because You Watched (Smart Similarity Intelligence) */}
      {becauseYouWatchedData && becauseYouWatchedData.matches.length > 0 && (
        <MovieRow
          id="because-you-watched"
          title={`Because You Watched ${becauseYouWatchedData.referenceMovie.title}`}
          subtitle={`Similar ${becauseYouWatchedData.referenceMovie.director ? becauseYouWatchedData.referenceMovie.director + ' direction, ' : ''}${becauseYouWatchedData.referenceMovie.genres.map((g) => g.name).slice(0, 2).join(' & ')} themes and tone`}
          badge="Because You Watched"
          movies={becauseYouWatchedData.matches.map((m) => m.movie)}
          onSelectMovie={onSelectMovie}
          onPlayTrailer={onPlayTrailer}
          onViewAll={() => onNavigate({ type: 'movie-detail', movieId: becauseYouWatchedData.referenceMovie.id })}
          watchlistIds={watchlistIds}
          favoriteIds={favoriteIds}
          onToggleWatchlist={onToggleWatchlist}
          onToggleFavorite={onToggleFavorite}
          getMovieBadge={(m) => {
            const found = becauseYouWatchedData.matches.find((item) => item.movie.id === m.id);
            return found?.similarityBadge;
          }}
        />
      )}

      {/* Trending Now */}
      <MovieRow
        id="trending"
        title="Trending Now"
        subtitle="Most talked about and searched movies this week"
        badge="Hot"
        movies={trendingMovies}
        onSelectMovie={onSelectMovie}
        onPlayTrailer={onPlayTrailer}
        onViewAll={() => onNavigate({ type: 'movies' })}
        watchlistIds={watchlistIds}
        favoriteIds={favoriteIds}
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavorite={onToggleFavorite}
      />

      {/* MOUVE AI Recommendation Teaser Banner */}
      <section className="px-4 sm:px-6 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#17142A] via-[#1F1938] to-[#121626] border border-amber-500/30 p-6 sm:p-8 md:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-400" />
              <span>Cinema Intelligence</span>
            </div>

            <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">
              Can't decide what to watch tonight?
            </h2>

            <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
              Describe your exact mood, desired runtime, favorite director, or emotional tone. MOUVE AI understands cinema language and curates the perfect film match.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="home-ask-ai-cta-btn"
                onClick={() => onNavigate({ type: 'ai-picks' })}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Sparkles size={16} />
                <span>Launch MOUVE AI</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() =>
                  onNavigate({
                    type: 'ai-picks',
                    initialPrompt: 'I want a mysterious science-fiction movie with an emotional story.',
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 text-xs sm:text-sm font-medium border border-white/10 transition-colors cursor-pointer"
              >
                <span>"Mysterious sci-fi with emotion"</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated Masterpieces */}
      <MovieRow
        id="top-rated"
        title="Top Rated Masterpieces"
        subtitle="Critically acclaimed films with highest audience scores"
        badge="8.5+ Rating"
        movies={topRatedMovies}
        onSelectMovie={onSelectMovie}
        onPlayTrailer={onPlayTrailer}
        onViewAll={() => onNavigate({ type: 'movies' })}
        watchlistIds={watchlistIds}
        favoriteIds={favoriteIds}
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavorite={onToggleFavorite}
      />

      {/* Browse by Genre Section */}
      <section id="home-genres-section" className="px-4 sm:px-6 md:px-8 py-2">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-heading font-bold text-xl md:text-2xl text-white tracking-tight">
              Browse by Genre
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 mt-0.5">
              Explore cinematic stories categorized by world-class storytelling archetypes
            </p>
          </div>
          <button
            onClick={() => onNavigate({ type: 'genres' })}
            className="inline-flex items-center gap-1 text-xs md:text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer font-medium"
          >
            <span>All genres</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {genres.slice(0, 4).map((genre) => (
            <GenreCard
              key={genre.id}
              genre={genre}
              onSelect={() => onNavigate({ type: 'genres', selectedGenreId: genre.id })}
            />
          ))}
        </div>
      </section>

      {/* Adventure Picks */}
      <MovieRow
        id="adventure-picks"
        title="Adventure Picks"
        subtitle="Grand journeys, epic odysseys, and breathtaking quests"
        badge="Genre"
        movies={adventurePicks}
        onSelectMovie={onSelectMovie}
        onPlayTrailer={onPlayTrailer}
        onViewAll={() => onNavigate({ type: 'genres', selectedGenreId: 'adventure' })}
        watchlistIds={watchlistIds}
        favoriteIds={favoriteIds}
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavorite={onToggleFavorite}
      />

      {/* Thriller Picks */}
      <MovieRow
        id="thriller-picks"
        title="Thriller Picks"
        subtitle="Edge-of-your-seat suspense, tension, and psychological twists"
        badge="Genre"
        movies={thrillerPicks}
        onSelectMovie={onSelectMovie}
        onPlayTrailer={onPlayTrailer}
        onViewAll={() => onNavigate({ type: 'genres', selectedGenreId: 'thriller' })}
        watchlistIds={watchlistIds}
        favoriteIds={favoriteIds}
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavorite={onToggleFavorite}
      />

      {/* Sci-Fi Picks */}
      <MovieRow
        id="scifi-picks"
        title="Science Fiction Picks"
        subtitle="Mind-bending realities, outer space, and futuristic wonders"
        badge="Genre"
        movies={sciFiPicks}
        onSelectMovie={onSelectMovie}
        onPlayTrailer={onPlayTrailer}
        onViewAll={() => onNavigate({ type: 'genres', selectedGenreId: 'science-fiction' })}
        watchlistIds={watchlistIds}
        favoriteIds={favoriteIds}
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavorite={onToggleFavorite}
      />

      {/* Drama Picks */}
      <MovieRow
        id="drama-picks"
        title="Drama Picks"
        subtitle="Powerful character journeys and profound human experiences"
        badge="Genre"
        movies={dramaPicks}
        onSelectMovie={onSelectMovie}
        onPlayTrailer={onPlayTrailer}
        onViewAll={() => onNavigate({ type: 'genres', selectedGenreId: 'drama' })}
        watchlistIds={watchlistIds}
        favoriteIds={favoriteIds}
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavorite={onToggleFavorite}
      />

      {/* Comedy Picks */}
      <MovieRow
        id="comedy-picks"
        title="Comedy Picks"
        subtitle="Witty banter, laugh-out-loud moments, and feel-good fun"
        badge="Genre"
        movies={comedyPicks}
        onSelectMovie={onSelectMovie}
        onPlayTrailer={onPlayTrailer}
        onViewAll={() => onNavigate({ type: 'genres', selectedGenreId: 'comedy' })}
        watchlistIds={watchlistIds}
        favoriteIds={favoriteIds}
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavorite={onToggleFavorite}
      />

      {/* Indian Cinema Masterpieces Spotlight */}
      <MovieRow
        id="indian-cinema-picks"
        title="Indian Cinema Masterpieces"
        subtitle="Mythological epics, gripping thrillers, and heartfelt regional masterpieces"
        badge="Spotlight"
        movies={indianCinemaPicks}
        onSelectMovie={onSelectMovie}
        onPlayTrailer={onPlayTrailer}
        onViewAll={() => onNavigate({ type: 'genres', selectedGenreId: 'indian-cinema' })}
        watchlistIds={watchlistIds}
        favoriteIds={favoriteIds}
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavorite={onToggleFavorite}
      />

      {/* Popular Movies */}
      <MovieRow
        id="popular"
        title="Popular Right Now"
        subtitle="Global audience favorites and box office champions"
        movies={popularMovies}
        onSelectMovie={onSelectMovie}
        onPlayTrailer={onPlayTrailer}
        onViewAll={() => onNavigate({ type: 'movies' })}
        watchlistIds={watchlistIds}
        favoriteIds={favoriteIds}
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavorite={onToggleFavorite}
      />

      {/* New Releases & Modern Cinema */}
      <MovieRow
        id="new-releases"
        title="New & Recent Releases"
        subtitle="The latest arrivals and recent theatrical breakthroughs"
        movies={newReleases}
        onSelectMovie={onSelectMovie}
        onPlayTrailer={onPlayTrailer}
        onViewAll={() => onNavigate({ type: 'movies' })}
        watchlistIds={watchlistIds}
        favoriteIds={favoriteIds}
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavorite={onToggleFavorite}
      />

      {/* Curated Recommendations */}
      <MovieRow
        id="recommended"
        title="Curated Recommendations"
        subtitle="Handpicked films offering exceptional directorial vision"
        movies={recommendedMovies}
        onSelectMovie={onSelectMovie}
        onPlayTrailer={onPlayTrailer}
        onViewAll={() => onNavigate({ type: 'movies' })}
        watchlistIds={watchlistIds}
        favoriteIds={favoriteIds}
        onToggleWatchlist={onToggleWatchlist}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
};
