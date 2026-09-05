# MOUVE

**MOUVE** is a modern, AI-powered movie discovery and personalized recommendation platform. Designed with a cinematic aesthetic and crafted for film enthusiasts, MOUVE transforms how viewers explore cinema by combining natural-language discovery, heuristic taste profiling, deep catalog filtering, and rich movie metadata.

---

## Features

- **MOUVE AI Discovery**: Natural-language movie recommendation engine that understands themes, emotional tones, director styles, and complex criteria (e.g., *"dark sci-fi movies"*, *"thrillers but not horror"*, *"movies by Christopher Nolan"*).
- **Personalized Recommendations**: Taste-profile engine that learns from your Watchlist, Favorites, and Viewing History to surface tailored suggestions with similarity percentages and explanations.
- **Natural-Language Search**: Instant search matching movie titles, partial titles, directors, cast members, genres, languages, and keywords.
- **Indian Cinema Collection**: Dedicated showcase celebrating acclaimed Indian classics and contemporary blockbusters across Hindi, Malayalam, Tamil, and Telugu languages.
- **Comprehensive Genre Browsing**: Explore diverse film categories with dynamic movie counts and custom genre visual cards.
- **Watchlist & Favorites**: Save and organize films with persistent client storage and instant queue toggles.
- **Recently Viewed History**: Seamless tracking of browsed titles with a quick-access timeline and one-click clear option.
- **Advanced Filtering & Sorting**: Filter by genre, release era/year, minimum IMDb rating, mood, director, and language; sort by popularity, rating, release year, or title.
- **Contextual "Because You Watched" & Similar Titles**: Deep similarity engine that compares auteur styles, themes, moods, era proximity, and cast connections.
- **Movie Trailers**: Built-in responsive modal for watching movie trailers with full keyboard accessibility (Escape to close, backdrop dismiss).
- **Cinematic Responsive Design**: Crafted with modern typography, dark theme neutrals, and fluid layouts optimized for mobile, tablet, and desktop screens.

---

## Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Server**: [Express 4](https://expressjs.com/) with Vite development middleware and production static bundling via [esbuild](https://esbuild.github.io/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Runtime**: [Node.js](https://nodejs.org/) & [tsx](https://github.com/privatenumber/tsx)

---

## How It Works

MOUVE operates as a full-stack single-page application with a decoupled service architecture:

1. **Centralized Cinema Catalog (`src/data/`)**: A rich, validated dataset containing global cinematic masterpieces and Indian cinema gems. Every film includes detailed metadata: runtime, certification, genres, director, cast, synopsis, mood tags, keywords, language, and high-resolution posters/backdrops.
2. **Service Layer (`src/services/`)**:
   - `MovieService`: Handles catalog queries, multi-criteria filtering, sorting, pagination, dynamic genre counting, and content-based similarity scoring.
   - `AIService`: Analyzes natural-language prompts and user taste vectors to calculate match scores and generate contextual justification strings.
   - `StorageService`: Manages persistent client storage for Watchlist, Favorites, Viewing History, and Taste Profiles with safe fallback mechanisms for non-browser environments.
3. **Reactive UI & Routing (`src/views/` & `src/components/`)**: A custom single-view router coordinates views (Home, Movies, Genres, AI Picks, Search, Watchlist, Movie Details, Profile) without full page reloads, ensuring smooth transitions and preserved states.

---

## AI Recommendation System

MOUVE AI pairs natural-language understanding with catalog grounding:

- **Intent Extraction**: Identifies explicit keywords, genre tokens, emotional nuances, and director affinities from freeform user queries.
- **Constraint Handling**: Intelligently handles compound requests, decade filters, and negative constraints (e.g., recognizing that "thrillers but not horror" should amplify suspense while filtering out jump-scare horror).
- **Match Scoring & Justification**: Calculates a percentage match score (80%–99%) and generates clear explanations (`matchReason`) explaining why each title was selected.
- **Taste Alignment**: In the absence of a search prompt, MOUVE AI builds a mathematical taste vector from the user's favorited genres, saved directors, and watch history to deliver bespoke recommendations.
- **Zero Hallucination Guarantee**: All recommendations map strictly to verified catalog entries with working details and trailers.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/mouve.git
cd mouve

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Production Build

```bash
# Build production client bundle and server executable
npm run build

# Start the production server
npm run start
```

---

## Project Structure

```
├── src/
│   ├── components/       # Reusable UI elements (Navbar, MovieCard, MovieRow, TrailerModal, etc.)
│   ├── data/             # Centralized movie database & Indian cinema catalog
│   ├── services/         # Core business logic (MovieService, AIService, StorageService)
│   ├── types/            # TypeScript interfaces and data models
│   ├── views/            # Main views (HomeView, MoviesView, MovieDetailsView, AIPicksView, etc.)
│   ├── App.tsx           # Main application entry and view router
│   ├── main.tsx          # React DOM bootstrap
│   └── index.css         # Global styling and Tailwind CSS imports
├── server.ts             # Express server with Vite middleware integration
├── metadata.json         # Platform configuration & metadata
├── package.json          # Project dependencies and build scripts
└── README.md             # Project documentation
```

---

## Future Improvements

- **External Catalog Sync**: Expand beyond the curated catalog with optional TMDB API synchronization for infinite title browsing.
- **Social Watchlists**: Shareable watchlist links and collaborative watch queues for groups and movie clubs.
- **Offline PWA Support**: Enhanced offline service worker caching for offline viewing of saved film details.
- **Streaming Provider Availability**: Real-time integration to display which local streaming platforms host each film.

---

## Author

Crafted for film lovers and cinephiles. Designed with care for performance, accessibility, and modern web standards.
