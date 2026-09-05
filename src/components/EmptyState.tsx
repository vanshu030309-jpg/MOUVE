import React from 'react';
import { Film, Search, Bookmark, Sparkles, AlertCircle, Filter } from 'lucide-react';

interface EmptyStateProps {
  type?: 'search' | 'watchlist' | 'favorites' | 'history' | 'general' | 'ai' | 'error' | 'filter';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'general',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
}) => {
  const getDefaultIcon = () => {
    switch (type) {
      case 'search':
        return <Search size={32} className="text-amber-400" />;
      case 'filter':
        return <Filter size={32} className="text-amber-400" />;
      case 'watchlist':
      case 'favorites':
        return <Bookmark size={32} className="text-amber-400" />;
      case 'ai':
        return <Sparkles size={32} className="text-amber-400" />;
      case 'error':
        return <AlertCircle size={32} className="text-rose-400" />;
      default:
        return <Film size={32} className="text-zinc-400" />;
    }
  };

  return (
    <div
      id={`empty-state-${type}`}
      className="flex flex-col items-center justify-center p-8 md:p-12 text-center max-w-lg mx-auto rounded-3xl bg-[#0D1018]/80 border border-zinc-800/80 my-8 shadow-xl shadow-black/40"
    >
      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 mb-4 text-zinc-300">
        {icon || getDefaultIcon()}
      </div>
      <h3 className="font-heading font-bold text-lg md:text-xl text-white mb-2">{title}</h3>
      <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-sm mb-6">{description}</p>
      
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs md:text-sm font-semibold transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <span>{actionLabel}</span>
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs md:text-sm font-medium transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>{secondaryActionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
