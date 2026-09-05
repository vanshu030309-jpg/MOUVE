import React from 'react';
import {
  Atom,
  Zap,
  HeartHandshake,
  Eye,
  Sparkles,
  Smile,
  ShieldAlert,
  Flame,
  Film,
  Compass,
  Heart,
  Ghost,
  Search,
} from 'lucide-react';
import { Genre } from '../types/movie';

interface GenreCardProps {
  genre: Genre;
  onSelect: (genre: Genre) => void;
  selected?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Compass: <Compass size={24} className="text-emerald-400" />,
  Atom: <Atom size={24} className="text-cyan-400" />,
  Zap: <Zap size={24} className="text-amber-400" />,
  HeartHandshake: <HeartHandshake size={24} className="text-rose-400" />,
  Heart: <Heart size={24} className="text-pink-400" />,
  Ghost: <Ghost size={24} className="text-purple-400" />,
  Search: <Search size={24} className="text-blue-400" />,
  Eye: <Eye size={24} className="text-indigo-400" />,
  Sparkles: <Sparkles size={24} className="text-emerald-400" />,
  Smile: <Smile size={24} className="text-yellow-400" />,
  ShieldAlert: <ShieldAlert size={24} className="text-red-400" />,
  Flame: <Flame size={24} className="text-orange-400" />,
};

export const GenreCard: React.FC<GenreCardProps> = ({ genre, onSelect, selected = false }) => {
  const icon = ICON_MAP[genre.icon] || <Film size={24} className="text-zinc-400" />;

  return (
    <div
      id={`genre-card-${genre.id}`}
      onClick={() => onSelect(genre)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(genre);
        }
      }}
      className={`group relative flex flex-col justify-between p-5 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 min-h-[160px] md:min-h-[180px] border text-left focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
        selected
          ? 'bg-red-950/40 border-red-500 shadow-lg shadow-red-900/30'
          : 'bg-[#0E1119] border-zinc-800/80 hover:border-zinc-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50'
      }`}
    >
      {/* Backdrop image */}
      {genre.backdropUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={genre.backdropUrl}
            alt={genre.name}
            className="w-full h-full object-cover opacity-25 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1119] via-[#0E1119]/70 to-transparent" />
        </div>
      )}

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {genre.movieCount && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/50 text-zinc-400 border border-white/10">
            {genre.movieCount}+ Titles
          </span>
        )}
      </div>

      {/* Bottom Text */}
      <div className="relative z-10 mt-4">
        <h3 className="font-heading font-bold text-lg md:text-xl text-white group-hover:text-red-400 transition-colors">
          {genre.name}
        </h3>
        {genre.description && (
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
            {genre.description}
          </p>
        )}
      </div>
    </div>
  );
};
