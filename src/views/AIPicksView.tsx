import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  RefreshCw,
  Lightbulb,
  Compass,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { AIRecommendation, Movie, PageView } from '../types/movie';
import { AIService } from '../services/aiService';
import { RecommendationCard } from '../components/RecommendationCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { RecommendationCardSkeleton } from '../components/LoadingSkeleton';

interface AIPicksViewProps {
  initialPrompt?: string;
  onSelectMovie: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
  watchlistIds: string[];
  favoriteIds: string[];
  onToggleWatchlist: (movie: Movie) => void;
  onToggleFavorite: (movie: Movie) => void;
  onNavigate: (view: PageView) => void;
}

const PRESET_PROMPTS = [
  {
    title: 'Based on My Taste',
    prompt: 'Recommend something tailored to my personal favorites and cinema taste.',
  },
  {
    title: 'Emotional Sci-Fi',
    prompt: 'I want a mysterious science-fiction movie with an emotional story.',
  },
  {
    title: 'Nolan & Villeneuve',
    prompt: 'Show me mind-bending masterpieces directed by Christopher Nolan or Denis Villeneuve.',
  },
  {
    title: 'Thriller (No Horror)',
    prompt: 'I want an intense suspense thriller with high tension but not horror.',
  },
  {
    title: 'Like Interstellar',
    prompt: 'Recommend something similar to Interstellar with cosmic scale and heart.',
  },
  {
    title: 'Under 2 Hours',
    prompt: 'I want a thrilling, high-rated movie under two hours with no filler.',
  },
  {
    title: 'Intricate Whodunit',
    prompt: 'I want a smart, witty murder mystery or psychological crime puzzle.',
  },
  {
    title: 'Indian Epics like RRR',
    prompt: 'Show me monumental Indian cinema epics and grand spectacles like RRR and Baahubali.',
  },
  {
    title: 'Heartfelt Drama & Comedy',
    prompt: 'Recommend inspirational Indian cinema classics starring Aamir Khan or Shah Rukh Khan.',
  },
];

export const AIPicksView: React.FC<AIPicksViewProps> = ({
  initialPrompt = '',
  onSelectMovie,
  onPlayTrailer,
  watchlistIds,
  favoriteIds,
  onToggleWatchlist,
  onToggleFavorite,
  onNavigate,
}) => {
  const [prompt, setPrompt] = useState(
    initialPrompt || 'I want a mysterious science-fiction movie with an emotional story.'
  );
  const [activeQuery, setActiveQuery] = useState(
    initialPrompt || 'I want a mysterious science-fiction movie with an emotional story.'
  );
  const [sessionHistory, setSessionHistory] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async (queryText: string, customHistory?: string[]) => {
    if (!queryText.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setActiveQuery(queryText);
      const historyToUse = customHistory !== undefined ? customHistory : sessionHistory;
      const results = await AIService.getRecommendations(queryText, historyToUse);
      setRecommendations(results);
      setSessionHistory((prev) => (prev.includes(queryText) ? prev : [...prev, queryText]));
    } catch (err) {
      console.error('AI recommendation failed:', err);
      setError('MOUVE AI service encountered an issue. Please retry with your query.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(prompt, []);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      fetchRecommendations(prompt);
    }
  };

  const handleSelectPreset = (presetPrompt: string) => {
    setPrompt(presetPrompt);
    fetchRecommendations(presetPrompt, []);
  };

  return (
    <div id="ai-picks-view-page" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-24 pb-16 space-y-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#17142A] via-[#1E1738] to-[#121626] border border-amber-500/30 p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-400" />
            <span>MOUVE AI Recommendation Engine</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
            Cinematic AI Discovery
          </h1>

          <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
            Tell MOUVE AI your exact mood, desired runtime, emotional intensity, or reference films in natural language. We analyze story structure, pacing, and visual style to curate your ideal watch.
          </p>
        </div>
      </div>

      {/* Interactive AI Prompt Input & Preset Chips */}
      <div className="max-w-4xl mx-auto space-y-4">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="absolute left-4.5 text-amber-400 pointer-events-none">
            <Sparkles size={20} />
          </div>

          <input
            id="ai-prompt-input"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., I want an emotional sci-fi movie like Interstellar under 2 hours..."
            className="w-full pl-13 pr-28 py-4 md:py-4.5 rounded-2xl bg-[#0F131F] text-white placeholder-zinc-500 border border-amber-500/30 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/15 focus:outline-none transition-all text-sm md:text-base shadow-2xl shadow-black/80"
          />

          <button
            id="ai-prompt-submit-btn"
            type="submit"
            disabled={loading || !prompt.trim()}
            className="absolute right-2.5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-black font-semibold text-xs md:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>Curate</span>
                <Send size={14} />
              </>
            )}
          </button>
        </form>

        {/* Preset Prompt Suggestions */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
            <Lightbulb size={13} className="text-amber-400" />
            <span>Try these cinema prompts:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_PROMPTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset.prompt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all text-left cursor-pointer ${
                  activeQuery === preset.prompt
                    ? 'bg-amber-500/20 text-amber-200 border-amber-500/50 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/5 hover:border-white/15'
                }`}
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="pt-4 border-t border-zinc-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="font-heading font-bold text-xl md:text-2xl text-white">
              Curated Recommendations
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 mt-0.5">
              Analysis based on: <span className="text-amber-300 font-medium">"{activeQuery}"</span>
            </p>
          </div>

          {!loading && recommendations.length > 0 && (
            <button
              onClick={() => fetchRecommendations(activeQuery)}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw size={13} />
              <span>Regenerate Picks</span>
            </button>
          )}
        </div>

        {/* Loading State with Cinematic Scanning Glow & Skeletons */}
        {loading ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-8 md:p-12 rounded-3xl bg-[#0D101A] border border-amber-500/20 text-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
                  <Sparkles size={24} className="animate-spin duration-3000" />
                </div>
                <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-ping" />
              </div>

              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base md:text-lg text-white">
                  MOUVE AI is Analyzing Cinematic Metadata...
                </h3>
                <p className="text-xs md:text-sm text-zinc-400 max-w-sm">
                  Evaluating pacing, directorial vision, critical consensus, and emotional resonance for your prompt.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <RecommendationCardSkeleton />
              <RecommendationCardSkeleton />
            </div>
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchRecommendations(activeQuery)} />
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.movie.id}
                recommendation={rec}
                onSelectMovie={onSelectMovie}
                onPlayTrailer={onPlayTrailer}
                inWatchlist={watchlistIds.includes(rec.movie.id)}
                onToggleWatchlist={onToggleWatchlist}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            type="ai"
            title="Ready for your next request"
            description="Type any specific movie scenario, genre fusion, or mood in the prompt box above to generate tailored recommendations."
          />
        )}
      </div>
    </div>
  );
};
