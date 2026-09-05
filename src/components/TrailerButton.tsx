import React from 'react';
import { Play } from 'lucide-react';

interface TrailerButtonProps {
  onClick: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'glass';
  className?: string;
  label?: string;
}

export const TrailerButton: React.FC<TrailerButtonProps> = ({
  onClick,
  size = 'md',
  variant = 'primary',
  className = '',
  label = 'Watch Trailer',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2 font-medium',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  const iconSizes = {
    sm: 13,
    md: 16,
    lg: 18,
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:via-amber-400 hover:to-yellow-400 text-black font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02]',
    secondary: 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 border border-zinc-700/80 hover:border-amber-500/40',
    glass: 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 hover:border-amber-500/40 hover:scale-[1.02]',
  };

  return (
    <button
      id={`trailer-btn-${size}`}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      <Play size={iconSizes[size]} className="fill-current" />
      <span>{label}</span>
    </button>
  );
};
