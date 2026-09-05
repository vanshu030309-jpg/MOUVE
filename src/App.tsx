import React, { useState, useEffect, useCallback } from 'react';
import { Movie, PageView, ToastMessage } from './types/movie';
import { StorageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { TrailerModal } from './components/TrailerModal';
import { ToastContainer } from './components/ToastContainer';
import { HomeView } from './views/HomeView';
import { MoviesView } from './views/MoviesView';
import { MovieDetailsView } from './views/MovieDetailsView';
import { GenresView } from './views/GenresView';
import { SearchView } from './views/SearchView';
import { WatchlistView } from './views/WatchlistView';
import { ProfileView } from './views/ProfileView';
import { AIPicksView } from './views/AIPicksView';

export default function App() {
  const [currentView, setCurrentView] = useState<PageView>({ type: 'home' });
  const [activeTrailerMovie, setActiveTrailerMovie] = useState<Movie | null>(null);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [userProfile, setUserProfile] = useState(StorageService.getUserProfile());

  // Load persistent initial state and global keyboard listeners
  useEffect(() => {
    refreshLists();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCurrentView({ type: 'search' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const refreshLists = () => {
    const wl = StorageService.getWatchlist().map((m) => m.id);
    const fav = StorageService.getFavorites().map((m) => m.id);
    setWatchlistIds(wl);
    setFavoriteIds(fav);
  };

  const addToast = (title: string, message?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleWatchlist = (movie: Movie) => {
    const inList = watchlistIds.includes(movie.id);
    if (inList) {
      StorageService.removeFromWatchlist(movie.id);
      addToast('Removed from Watchlist', `"${movie.title}" was removed from your watchlist.`, 'info');
    } else {
      StorageService.addToWatchlist(movie);
      addToast('Added to Watchlist', `"${movie.title}" is saved in your queue.`, 'success');
    }
    refreshLists();
  };

  const handleToggleFavorite = (movie: Movie) => {
    const isFav = favoriteIds.includes(movie.id);
    StorageService.toggleFavorite(movie);
    if (isFav) {
      addToast('Removed from Favorites', `"${movie.title}" removed from favorites.`, 'info');
    } else {
      addToast('Saved to Favorites', `"${movie.title}" added to your favorite films!`, 'success');
    }
    refreshLists();
  };

  const handleNavigate = useCallback((newView: PageView) => {
    setActiveTrailerMovie(null);
    setCurrentView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectMovie = useCallback((movie: Movie) => {
    setActiveTrailerMovie(null);
    setCurrentView((prev) => ({
      type: 'movie-detail',
      movieId: movie.id,
      previousView: prev.type !== 'movie-detail' ? prev : { type: 'home' },
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePlayTrailer = useCallback((movie: Movie) => {
    setActiveTrailerMovie(movie);
  }, []);

  const handleCloseTrailer = useCallback(() => {
    setActiveTrailerMovie(null);
  }, []);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#07080B] text-[#E2E8F0] flex flex-col selection:bg-red-600/30 selection:text-white">
      {/* Primary Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        watchlistCount={watchlistIds.length}
        userAvatar={userProfile.avatar}
        userName={userProfile.name}
      />

      {/* Main Routed Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {currentView.type === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onSelectMovie={handleSelectMovie}
            onPlayTrailer={handlePlayTrailer}
            watchlistIds={watchlistIds}
            favoriteIds={favoriteIds}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentView.type === 'movies' && (
          <MoviesView
            initialGenreId={currentView.initialGenreId}
            onSelectMovie={handleSelectMovie}
            onPlayTrailer={handlePlayTrailer}
            watchlistIds={watchlistIds}
            favoriteIds={favoriteIds}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleFavorite={handleToggleFavorite}
            onNavigate={handleNavigate}
          />
        )}

        {currentView.type === 'movie-detail' && (
          <MovieDetailsView
            movieId={currentView.movieId}
            previousView={currentView.previousView}
            onNavigate={handleNavigate}
            onSelectMovie={handleSelectMovie}
            onPlayTrailer={handlePlayTrailer}
            watchlistIds={watchlistIds}
            favoriteIds={favoriteIds}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentView.type === 'genres' && (
          <GenresView
            selectedGenreId={currentView.selectedGenreId}
            onSelectMovie={handleSelectMovie}
            onPlayTrailer={handlePlayTrailer}
            watchlistIds={watchlistIds}
            favoriteIds={favoriteIds}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleFavorite={handleToggleFavorite}
            onNavigate={handleNavigate}
          />
        )}

        {currentView.type === 'search' && (
          <SearchView
            initialQuery={currentView.initialQuery}
            onSelectMovie={handleSelectMovie}
            onPlayTrailer={handlePlayTrailer}
            watchlistIds={watchlistIds}
            favoriteIds={favoriteIds}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleFavorite={handleToggleFavorite}
            onNavigate={handleNavigate}
          />
        )}

        {currentView.type === 'watchlist' && (
          <WatchlistView
            initialTab={currentView.initialTab}
            onSelectMovie={handleSelectMovie}
            onPlayTrailer={handlePlayTrailer}
            watchlistIds={watchlistIds}
            favoriteIds={favoriteIds}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleFavorite={handleToggleFavorite}
            onNavigate={handleNavigate}
          />
        )}

        {currentView.type === 'profile' && (
          <ProfileView
            onSelectMovie={handleSelectMovie}
            onPlayTrailer={handlePlayTrailer}
            watchlistIds={watchlistIds}
            favoriteIds={favoriteIds}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleFavorite={handleToggleFavorite}
            onNavigate={handleNavigate}
          />
        )}

        {currentView.type === 'ai-picks' && (
          <AIPicksView
            initialPrompt={currentView.initialPrompt}
            onSelectMovie={handleSelectMovie}
            onPlayTrailer={handlePlayTrailer}
            watchlistIds={watchlistIds}
            favoriteIds={favoriteIds}
            onToggleWatchlist={handleToggleWatchlist}
            onToggleFavorite={handleToggleFavorite}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Trailer Modal Dialog */}
      <TrailerModal
        movie={activeTrailerMovie}
        isOpen={Boolean(activeTrailerMovie)}
        onClose={handleCloseTrailer}
      />

      {/* User Action Feedback Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
