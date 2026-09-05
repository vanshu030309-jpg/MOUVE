import React from 'react';
import { Bookmark, Check } from 'lucide-react';

interface WatchlistButtonProps {
  inWatchlist: boolean;
  onToggle: (e: React.MouseEvent) => void;
  variant?: 'icon' | 'pill' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WatchlistButton: React.FC<WatchlistButtonProps> = ({
  inWatchlist,
  onToggle,
  variant = 'button',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 14, pad: 'p-1.5', text: 'text-xs px-3 py-1.5' },
    md: { icon: 16, pad: 'p-2.5', text: 'text-sm px-4 py-2.5' },
    lg: { icon: 18, pad: 'p-3', text: 'text-base px-5 py-3' },
  };

  if (variant === 'icon') {
    return (
      <button
        id={`watchlist-toggle-icon-${inWatchlist ? 'active' : 'inactive'}`}
        onClick={onToggle}
        title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        className={`rounded-full transition-all duration-200 cursor-pointer backdrop-blur-md active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          sizeMap[size].pad
        } ${
          inWatchlist
            ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
            : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80 border border-white/10'
        } ${className}`}
      >
        {inWatchlist ? (
          <Check size={sizeMap[size].icon} className="stroke-[3]" />
        ) : (
          <Bookmark size={sizeMap[size].icon} />
        )}
      </button>
    );
  }

  return (
    <button
      id={`watchlist-toggle-btn-${inWatchlist ? 'active' : 'inactive'}`}
      onClick={onToggle}
      className={`inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 font-medium cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
        sizeMap[size].text
      } ${
        inWatchlist
          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 shadow-sm shadow-amber-500/20'
          : 'bg-white/10 text-zinc-200 hover:text-white hover:bg-white/15 border border-white/15'
      } ${className}`}
    >
      {inWatchlist ? (
        <>
          <Check size={sizeMap[size].icon} className="stroke-[2.5]" />
          <span>In Watchlist</span>
        </>
      ) : (
        <>
          <Bookmark size={sizeMap[size].icon} />
          <span>Add to Watchlist</span>
        </>
      )}
    </button>
  );
};
