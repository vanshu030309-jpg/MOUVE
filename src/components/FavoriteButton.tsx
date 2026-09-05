import React from 'react';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'icon' | 'pill';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  size = 'md',
  className = '',
  variant = 'icon',
}) => {
  const sizeMap = {
    sm: { icon: 14, pad: 'p-1.5' },
    md: { icon: 16, pad: 'p-2.5' },
    lg: { icon: 18, pad: 'p-3' },
  };

  if (variant === 'pill') {
    return (
      <button
        id={`favorite-toggle-pill-${isFavorite ? 'active' : 'inactive'}`}
        onClick={onToggle}
        title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          isFavorite
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'
        } ${className}`}
      >
        <Heart size={16} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
        <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
      </button>
    );
  }

  return (
    <button
      id={`favorite-toggle-icon-${isFavorite ? 'active' : 'inactive'}`}
      onClick={onToggle}
      title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      className={`rounded-full transition-all duration-200 cursor-pointer backdrop-blur-md active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
        sizeMap[size].pad
      } ${
        isFavorite
          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
          : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80 border border-white/10'
      } ${className}`}
    >
      <Heart size={sizeMap[size].icon} className={isFavorite ? 'fill-current' : ''} />
    </button>
  );
};
