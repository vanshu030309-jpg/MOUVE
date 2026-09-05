import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Unable to load movie details at this moment. Please check your connection.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-12 rounded-2xl bg-red-950/20 border border-red-500/30">
      <div className="p-3 rounded-full bg-red-500/10 text-red-400 mb-3">
        <AlertCircle size={28} />
      </div>
      <h3 className="font-heading font-bold text-white text-lg mb-1">Content Unavailable</h3>
      <p className="text-xs md:text-sm text-zinc-400 mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs md:text-sm font-medium border border-zinc-700 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
