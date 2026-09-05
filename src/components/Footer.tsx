import React from 'react';
import { Film, Sparkles, Shield, Heart, Github } from 'lucide-react';
import { PageView } from '../types/movie';

interface FooterProps {
  onNavigate: (view: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-20 border-t border-zinc-800/80 bg-[#050505] text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <div
              onClick={() => onNavigate({ type: 'home' })}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 flex items-center justify-center text-black shadow-lg shadow-orange-500/30">
                <Film size={18} className="stroke-[2.5]" />
              </div>
              <span className="font-cinzel font-black text-xl tracking-wider text-white group-hover:text-amber-400 transition-colors">
                MOUVE
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              "Discover what you'll love next."
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Next-generation cinematic discovery engine powered by natural language AI recommendations, curated metadata, and legitimate trailer streams.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate({ type: 'home' })}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Home Spotlight
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'movies' })}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Movie Discovery Grid
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'genres' })}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Browse by Genre
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'ai-picks' })}
                  className="hover:text-amber-300 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Sparkles size={13} className="text-amber-400" />
                  <span>MOUVE AI Picks</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'watchlist' })}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  My Watchlist & Favorites
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Genres */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Popular Genres
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { name: 'Science Fiction', id: 'sci-fi' },
                { name: 'Action', id: 'action' },
                { name: 'Adventure', id: 'adventure' },
                { name: 'Drama', id: 'drama' },
                { name: 'Thriller', id: 'thriller' },
                { name: 'Romance', id: 'romance' },
                { name: 'Animation', id: 'animation' },
                { name: 'Comedy', id: 'comedy' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate({ type: 'movies', initialGenreId: item.id })}
                    className="hover:text-white transition-colors cursor-pointer text-left text-zinc-400 hover:text-zinc-200"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Compliance Notice */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-200">
              <Shield size={14} className="text-emerald-400" />
              <span>Platform Integrity</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              MOUVE is strictly a metadata discovery, film analysis, and recommendation platform.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              We do not host or distribute unauthorized full-length films. All trailer media playback is embedded directly from legitimate verified video partners.
            </p>
          </div>
        </div>

        {/* Sub-footer */}
        <div className="mt-12 pt-8 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} MOUVE Cinema Intelligence. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Powered by Google AI Studio & React 19</span>
            <span>•</span>
            <span>Designed for Cinephiles</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
