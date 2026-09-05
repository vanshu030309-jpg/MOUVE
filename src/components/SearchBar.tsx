import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, Film, ArrowRight } from 'lucide-react';
import { Movie } from '../types/movie';
import { StorageService } from '../services/storageService';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  onSubmit?: (query: string) => void;
  onSelectSuggestion?: (movie: Movie) => void;
  suggestions?: Movie[];
  placeholder?: string;
  autoFocus?: boolean;
  showSuggestions?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  onSelectSuggestion,
  suggestions = [],
  placeholder = 'Search by movie title, director, actor, genre...',
  autoFocus = false,
  showSuggestions = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentSearches(StorageService.getRecentSearches());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K or /
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement?.tagName !== 'INPUT')) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      StorageService.addRecentSearch(value);
      setRecentSearches(StorageService.getRecentSearches());
      setIsOpen(false);
      onSubmit?.(value);
    }
  };

  const handleRecentClick = (term: string) => {
    onChange(term);
    StorageService.addRecentSearch(term);
    setRecentSearches(StorageService.getRecentSearches());
    setIsOpen(false);
    onSubmit?.(term);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4.5 text-zinc-400 pointer-events-none">
          <Search size={18} />
        </div>

        <input
          ref={inputRef}
          id="global-search-input"
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-12 pr-24 py-3.5 md:py-4 rounded-2xl bg-[#0E121B] text-white placeholder-zinc-500 border border-zinc-700/70 focus:border-amber-500/80 focus:ring-4 focus:ring-amber-500/15 focus:outline-none transition-all text-sm md:text-base shadow-xl shadow-black/50"
        />

        <div className="absolute right-3.5 flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              title="Clear search text"
              aria-label="Clear search text"
            >
              <X size={16} />
            </button>
          )}

          <div className="hidden sm:inline-flex items-center px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800/80 text-[11px] text-zinc-400 font-mono select-none">
            ⌘K
          </div>
        </div>
      </form>

      {/* Autocomplete Dropdown & Recent Searches */}
      {showSuggestions && isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-[#0F131D] border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden z-40 animate-fadeIn backdrop-blur-xl">
          {/* Quick Movie Suggestions */}
          {value.trim() && suggestions.length > 0 && (
            <div className="p-2 border-b border-zinc-800/80">
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Film size={13} />
                <span>Matching Titles</span>
              </div>
              <div className="space-y-1">
                {suggestions.slice(0, 4).map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => {
                      onSelectSuggestion?.(movie);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-10 h-14 object-cover rounded-lg bg-zinc-800"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors truncate">
                        {movie.title}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {movie.year} • {movie.genres.map((g) => g.name).slice(0, 2).join(', ')} • ★{' '}
                        {movie.rating}
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-zinc-500 group-hover:text-white mr-1" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches / Suggested Prompts */}
          <div className="p-3">
            <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <span>{value.trim() ? 'Suggested Tags' : 'Recent & Popular Searches'}</span>
              {recentSearches.length > 0 && !value.trim() && (
                <button
                  onClick={() => {
                    StorageService.clearRecentSearches();
                    setRecentSearches([]);
                  }}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 normal-case"
                >
                  Clear history
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {recentSearches.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentClick(term)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white border border-white/5 hover:border-white/15 transition-all text-left cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
