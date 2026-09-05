import { Genre } from '../types/movie';

export const GENRES: Genre[] = [
  {
    id: 'indian-cinema',
    name: 'Indian Cinema',
    slug: 'indian-cinema',
    description: "Explore acclaimed stories from across India's many film industries.",
    icon: 'Sparkles',
    backdropUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'adventure',
    name: 'Adventure',
    slug: 'adventure',
    description: 'Daring expeditions, uncharted frontiers, and epic quests across grand landscapes.',
    icon: 'Compass',
    backdropUrl: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'thriller',
    name: 'Thriller',
    slug: 'thriller',
    description: 'Nail-biting suspense, high-stakes psychological tension, and shocking twists.',
    icon: 'Eye',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'drama',
    name: 'Drama',
    slug: 'drama',
    description: 'Intimate human journeys, deep moral conflicts, and emotionally resonant storytelling.',
    icon: 'HeartHandshake',
    backdropUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'comedy',
    name: 'Comedy',
    slug: 'comedy',
    description: 'Sharp wit, hilarious situations, eccentric characters, and cinematic joy.',
    icon: 'Smile',
    backdropUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'romance',
    name: 'Romance',
    slug: 'romance',
    description: 'Tender connections, heartfelt passions, and unforgettable soulmate stories.',
    icon: 'Heart',
    backdropUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'horror',
    name: 'Horror',
    slug: 'horror',
    description: 'Spine-chilling terror, supernatural dread, and heart-pounding survival.',
    icon: 'Ghost',
    backdropUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sci-fi',
    name: 'Science Fiction',
    slug: 'sci-fi',
    description: 'Immersive voyages into futuristic worlds, time-twisting physics, and speculative futures.',
    icon: 'Atom',
    backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'mystery',
    name: 'Mystery',
    slug: 'mystery',
    description: 'Complex whodunits, hidden secrets, and intricate puzzles waiting to be solved.',
    icon: 'Search',
    backdropUrl: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    slug: 'fantasy',
    description: 'Mythical realms, ancient wonders, legendary creatures, and mystical sagas.',
    icon: 'Flame',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'animation',
    name: 'Animation',
    slug: 'animation',
    description: 'Stunning visual marvels and vibrant world-building crafted by visionary animators.',
    icon: 'Sparkles',
    backdropUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'action',
    name: 'Action',
    slug: 'action',
    description: 'High-octane choreography, relentless momentum, and heroic spectacles.',
    icon: 'Zap',
    backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'crime',
    name: 'Crime',
    slug: 'crime',
    description: 'Gritty underworld operations, moral gray zones, and intense detective investigations.',
    icon: 'ShieldAlert',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80',
  },
];

export const getGenre = (id: string): Genre => {
  const found = GENRES.find((item) => item.id === id);
  if (found) return found;
  return {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    slug: id,
    description: '',
    icon: 'Film',
    backdropUrl: '',
  };
};
