import React, { useState, useEffect } from 'react';
import {
  Film,
  Sparkles,
  Search,
  Bookmark,
  User,
  Compass,
  Menu,
  X,
  Clapperboard,
  Home,
} from 'lucide-react';
import { PageView } from '../types/movie';

interface NavbarProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  watchlistCount: number;
  userAvatar?: string;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  watchlistCount,
  userAvatar,
  userName = 'Alex',
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', view: { type: 'home' } as PageView, icon: <Home size={16} /> },
    { label: 'Movies', view: { type: 'movies' } as PageView, icon: <Clapperboard size={16} /> },
    { label: 'Genres', view: { type: 'genres' } as PageView, icon: <Compass size={16} /> },
    {
      label: 'AI Picks',
      view: { type: 'ai-picks' } as PageView,
      icon: <Sparkles size={16} className="text-amber-400" />,
      highlight: true,
    },
    {
      label: 'Search',
      view: { type: 'search' } as PageView,
      icon: <Search size={16} />,
    },
    {
      label: 'Watchlist',
      view: { type: 'watchlist' } as PageView,
      icon: <Bookmark size={16} />,
      badge: watchlistCount > 0 ? watchlistCount : undefined,
    },
  ];

  const isCurrent = (item: (typeof navItems)[0]) => {
    return currentView.type === item.view.type;
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050505]/95 backdrop-blur-xl border-b border-zinc-800/80 shadow-2xl shadow-black/80 py-3'
          : 'bg-gradient-to-b from-[#050505]/90 via-[#050505]/50 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          id="brand-logo-btn"
          onClick={() => onNavigate({ type: 'home' })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate({ type: 'home' });
            }
          }}
          className="flex items-center gap-2.5 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl p-1"
          role="button"
          tabIndex={0}
          aria-label="MOUVE Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 flex items-center justify-center text-black shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
            <Film size={20} className="stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-cinzel font-black text-xl md:text-2xl tracking-wider text-white group-hover:text-amber-400 transition-colors">
              MOUVE
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 p-1 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-md">
          {navItems.map((item) => {
            const active = isCurrent(item);
            return (
              <button
                key={item.label}
                id={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onNavigate(item.view)}
                className={`relative flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  active
                    ? item.highlight
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                      : 'bg-white/15 text-white shadow-sm'
                    : item.highlight
                    ? 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-black text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Search trigger & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Shortcut Trigger */}
          <button
            id="nav-quick-search-btn"
            onClick={() => onNavigate({ type: 'search' })}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 text-xs transition-colors cursor-pointer"
          >
            <Search size={14} />
            <span className="hidden md:inline">Quick Search...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px] text-zinc-400">
              ⌘K
            </kbd>
          </button>

          {/* Profile Button */}
          <button
            id="nav-profile-btn"
            onClick={() => onNavigate({ type: 'profile' })}
            className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all cursor-pointer ${
              currentView.type === 'profile'
                ? 'bg-white/15 border-white/30 text-white'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-7 h-7 rounded-lg object-cover border border-amber-500/40"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center">
                <User size={15} />
              </div>
            )}
            <span className="hidden md:inline text-xs font-semibold text-zinc-200 max-w-[80px] truncate">
              {userName}
            </span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            id="mobile-nav-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 lg:hidden border border-white/10"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="lg:hidden fixed inset-x-0 top-[58px] sm:top-[64px] p-4 bg-[#050505]/98 backdrop-blur-2xl border-b border-zinc-800 shadow-2xl space-y-1.5 animate-fadeIn max-h-[calc(100vh-70px)] overflow-y-auto"
        >
          {navItems.map((item) => {
            const active = isCurrent(item);
            return (
              <button
                key={item.label}
                onClick={() => {
                  onNavigate(item.view);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-black text-xs font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-zinc-800/80">
            <button
              onClick={() => {
                onNavigate({ type: 'profile' });
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-300 hover:bg-white/5"
            >
              <User size={16} />
              <span>My Profile & Cinema Taste</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
