import React, { useEffect, useRef } from 'react';
import { Play, X, ExternalLink } from 'lucide-react';
import { Movie } from '../types/movie';

interface TrailerModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ movie, isOpen, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Manage Escape key with capture phase so it cleanly takes precedence over view navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  // Lock background body scroll while open and restore normal page scrolling when closed
  useEffect(() => {
    if (isOpen && movie) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focus close button for keyboard accessibility
      const focusTimer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      return () => {
        document.body.style.overflow = originalOverflow;
        clearTimeout(focusTimer);
      };
    }
  }, [isOpen, movie]);

  if (!isOpen || !movie) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      id="trailer-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`${movie.title} Trailer`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        id="trailer-modal-dialog"
        className="relative w-full max-w-4xl bg-[#0F121A] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-[#121622]/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 mr-3">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Play size={14} className="fill-current ml-0.5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-semibold text-white text-base md:text-lg leading-tight truncate">
                {movie.title} <span className="text-zinc-400 text-sm font-normal">({movie.year})</span>
              </h3>
              <p className="text-xs text-zinc-400 truncate">{movie.trailerTitle || 'Official HD Trailer'}</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            id="close-trailer-modal-btn"
            type="button"
            onClick={handleCloseClick}
            className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0"
            aria-label="Close trailer"
          >
            <X size={20} className="pointer-events-none" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black shrink-0">
          {movie.trailerKey ? (
            <iframe
              key={`trailer-iframe-${movie.id}-${movie.trailerKey}`}
              src={`https://www.youtube-nocookie.com/embed/${movie.trailerKey}?autoplay=1&rel=0&modestbranding=1`}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-6 text-center">
              <p className="text-base font-medium text-zinc-300">Trailer preview currently unavailable.</p>
              <p className="text-xs text-zinc-500 mt-1">Official high-definition streaming preview from TMDB.</p>
            </div>
          )}
        </div>

        {/* Footer info & external link */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0C0E14] text-xs text-zinc-400 border-t border-zinc-800/60 shrink-0">
          <span className="truncate max-w-[200px] sm:max-w-md">{movie.tagline || movie.genres.map((g) => g.name).join(' • ')}</span>
          <a
            href={`https://www.youtube.com/watch?v=${movie.trailerKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-amber-400 transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md px-1 shrink-0"
          >
            <span>Watch on YouTube</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
};
