import React from 'react';
import { Star } from 'lucide-react';

interface RatingBadgeProps {
  rating: number;
  voteCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showStar?: boolean;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  voteCount,
  size = 'md',
  showStar = true,
}) => {
  const getRatingColor = (val: number) => {
    if (val >= 8.5) return 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_12px_rgba(245,197,24,0.15)]';
    if (val >= 7.5) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (val >= 6.0) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    return 'text-zinc-400 border-zinc-700 bg-zinc-800/40';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs md:text-sm px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm md:text-base px-3 py-1.5 gap-2 font-semibold',
  };

  const starSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <div
      id={`rating-badge-${rating.toFixed(1)}`}
      className={`inline-flex items-center rounded-full border backdrop-blur-md ${getRatingColor(
        rating
      )} ${sizeClasses[size]}`}
    >
      {showStar && <Star size={starSizes[size]} className="fill-current" />}
      <span>{rating.toFixed(1)}</span>
      {voteCount !== undefined && size === 'lg' && (
        <span className="text-zinc-400 text-xs font-normal border-l border-zinc-700/60 pl-1.5 ml-0.5">
          {voteCount > 1000 ? `${(voteCount / 1000).toFixed(0)}k votes` : `${voteCount} votes`}
        </span>
      )}
    </div>
  );
};
