import { MOCK_MOVIES } from '../data/mockMovies';
import { StorageService } from './storageService';
import { AIRecommendation, Genre, Movie } from '../types/movie';

export interface ParsedUserIntent {
  requestedGenres: string[];
  negativeGenres: string[];
  requestedThemes: string[];
  negativeThemes: string[];
  requestedMoods: string[];
  negativeMoods: string[];
  requestedDirectors: string[];
  negativeDirectors: string[];
  requestedActors: string[];
  negativeActors: string[];
  requestedLanguages: string[];
  requestedEras: string[]; // e.g. '2000s', '1990s', '80s', '2010s', '2020s', 'classic', 'modern'
  negativeTitles: string[]; // e.g. ['the-dark-knight']
  referenceMovieId: string | null;
  referenceMovieTitle: string | null;
  unrecognizedReferenceTitle: string | null;
  isLibraryBased: boolean;
  libraryMode: 'all' | 'favorites' | 'watchlist' | 'history' | null;
  hasStrongFemaleLead: boolean;
  maxRuntime: number | null;
  minRuntime: number | null;
  minRating: number | null;
  isEmotional: boolean;
  isFunny: boolean;
  isDark: boolean;
  isMindBending: boolean;
  isHorror: boolean;
  isActionPacked: boolean;
  isVisual: boolean;
  isRecent: boolean;
  isClassic: boolean;
  isFollowUp: boolean;
  isBroadRequest: boolean;
  rawPrompt: string;
}

/**
 * Normalizes genre query to canonical genre id
 */
export function normalizeGenreId(input: string): string | null {
  const s = input.toLowerCase().trim();
  if (['romance', 'romantic', 'love', 'romcom', 'rom-com'].includes(s)) return 'romance';
  if (['thriller', 'thrillers', 'thrilling', 'suspense', 'suspenseful'].includes(s)) return 'thriller';
  if (['horror', 'scary', 'spooky', 'terrifying'].includes(s)) return 'horror';
  if (['sci-fi', 'scifi', 'science fiction', 'science-fiction'].includes(s)) return 'sci-fi';
  if (['comedy', 'comedies', 'funny', 'hilarious', 'humor'].includes(s)) return 'comedy';
  if (['drama', 'dramas', 'dramatic'].includes(s)) return 'drama';
  if (['mystery', 'mysteries', 'mysterious', 'whodunit', 'whodunnit'].includes(s)) return 'mystery';
  if (['action', 'explosive'].includes(s)) return 'action';
  if (['adventure', 'adventures', 'quest'].includes(s)) return 'adventure';
  if (['fantasy', 'mythology', 'magic'].includes(s)) return 'fantasy';
  if (['animation', 'animated', 'anime'].includes(s)) return 'animation';
  if (['crime', 'gangster', 'mafia', 'heist'].includes(s)) return 'crime';
  if (['indian-cinema', 'indian cinema', 'indian', 'bollywood', 'tollywood', 'kollywood', 'mollywood'].includes(s)) return 'indian-cinema';
  return null;
}

/**
 * Checks if movie matches a canonical genre ID
 */
export function movieHasGenre(movie: Movie, genreId: string): boolean {
  const target = genreId.toLowerCase();
  if (target === 'indian-cinema' || target === 'indian cinema' || target === 'indian') {
    return (
      movie.genres.some((g) => g.id === 'indian-cinema' || g.name.toLowerCase().includes('indian')) ||
      (movie.keywords && movie.keywords.some((k) => k.toLowerCase().includes('indian cinema') || k.toLowerCase() === 'indian')) ||
      (movie.languages && movie.languages.some((l) => ['Hindi', 'Telugu', 'Tamil', 'Malayalam', 'Kannada', 'Bengali', 'Marathi'].includes(l))) ||
      false
    );
  }
  return movie.genres.some((g) => {
    const id = g.id.toLowerCase();
    const slug = g.slug.toLowerCase();
    const name = g.name.toLowerCase();
    if (target === 'sci-fi' || target === 'science-fiction') {
      return (
        id === 'sci-fi' ||
        slug === 'sci-fi' ||
        id === 'science-fiction' ||
        slug === 'science-fiction' ||
        name.includes('science')
      );
    }
    return id === target || slug === target || name === target;
  });
}

// Complete catalog directors
const CATALOG_DIRECTORS: { name: string; aliases: string[] }[] = [
  { name: 'Christopher Nolan', aliases: ['christopher nolan', 'nolan', 'chris nolan'] },
  { name: 'Denis Villeneuve', aliases: ['denis villeneuve', 'villeneuve'] },
  { name: 'David Fincher', aliases: ['david fincher', 'fincher'] },
  { name: 'Quentin Tarantino', aliases: ['quentin tarantino', 'tarantino'] },
  { name: 'Martin Scorsese', aliases: ['martin scorsese', 'scorsese'] },
  { name: 'Hayao Miyazaki', aliases: ['hayao miyazaki', 'miyazaki', 'ghibli'] },
  { name: 'Damien Chazelle', aliases: ['damien chazelle', 'chazelle'] },
  { name: 'Ridley Scott', aliases: ['ridley scott'] },
  { name: 'Jordan Peele', aliases: ['jordan peele', 'peele'] },
  { name: 'Ari Aster', aliases: ['ari aster', 'aster'] },
  { name: 'Wes Anderson', aliases: ['wes anderson', 'anderson'] },
  { name: 'Bong Joon-ho', aliases: ['bong joon-ho', 'bong joon ho', 'bong joonho'] },
  { name: 'Celine Song', aliases: ['celine song'] },
  { name: 'Peter Jackson', aliases: ['peter jackson'] },
  { name: 'Stanley Kubrick', aliases: ['stanley kubrick', 'kubrick'] },
  { name: 'Francis Ford Coppola', aliases: ['francis ford coppola', 'coppola'] },
  { name: 'Alex Garland', aliases: ['alex garland', 'garland'] },
  { name: 'Spike Jonze', aliases: ['spike jonze', 'jonze'] },
  { name: 'Rian Johnson', aliases: ['rian johnson'] },
  { name: 'Guillermo del Toro', aliases: ['guillermo del toro', 'del toro'] },
  { name: 'Makoto Shinkai', aliases: ['makoto shinkai', 'shinkai'] },
  { name: 'Andrew Stanton', aliases: ['andrew stanton'] },
  { name: 'Chad Stahelski', aliases: ['chad stahelski', 'stahelski'] },
  { name: 'Coen Brothers', aliases: ['coen brothers', 'joel coen', 'ethan coen', 'the coens'] },
  { name: 'Paul King', aliases: ['paul king'] },
  // Indian Cinema Visionaries
  { name: 'S.S. Rajamouli', aliases: ['s.s. rajamouli', 'ss rajamouli', 'rajamouli'] },
  { name: 'Rajkumar Hirani', aliases: ['rajkumar hirani', 'hirani'] },
  { name: 'Anurag Kashyap', aliases: ['anurag kashyap', 'kashyap'] },
  { name: 'Lokesh Kanagaraj', aliases: ['lokesh kanagaraj', 'lokesh'] },
  { name: 'Prashanth Neel', aliases: ['prashanth neel', 'neel'] },
  { name: 'Vetrimaaran', aliases: ['vetrimaaran', 'vetri maaran'] },
  { name: 'Satyajit Ray', aliases: ['satyajit ray', 'ray'] },
  { name: 'Rishab Shetty', aliases: ['rishab shetty'] },
  { name: 'Sukumar', aliases: ['sukumar'] },
  { name: 'Zoya Akhtar', aliases: ['zoya akhtar'] },
  { name: 'Vidhu Vinod Chopra', aliases: ['vidhu vinod chopra'] },
  { name: 'Farhan Akhtar', aliases: ['farhan akhtar'] },
  { name: 'Sriram Raghavan', aliases: ['sriram raghavan'] },
  { name: 'Ashutosh Gowariker', aliases: ['ashutosh gowariker'] },
];

// Complete catalog actors
const CATALOG_ACTORS: { name: string; aliases: string[] }[] = [
  { name: 'Leonardo DiCaprio', aliases: ['leonardo dicaprio', 'dicaprio', 'leo dicaprio'] },
  { name: 'Christian Bale', aliases: ['christian bale', 'bale'] },
  { name: 'Timothée Chalamet', aliases: ['timothee chalamet', 'timothée chalamet', 'chalamet'] },
  { name: 'Cillian Murphy', aliases: ['cillian murphy', 'cillian'] },
  { name: 'Ryan Gosling', aliases: ['ryan gosling', 'gosling'] },
  { name: 'Matthew McConaughey', aliases: ['matthew mcconaughey', 'mcconaughey'] },
  { name: 'Brad Pitt', aliases: ['brad pitt', 'pitt'] },
  { name: 'Scarlett Johansson', aliases: ['scarlett johansson', 'johansson'] },
  { name: 'Emma Stone', aliases: ['emma stone'] },
  { name: 'Florence Pugh', aliases: ['florence pugh', 'pugh'] },
  { name: 'Daniel Craig', aliases: ['daniel craig'] },
  { name: 'Joaquin Phoenix', aliases: ['joaquin phoenix', 'phoenix'] },
  { name: 'Keanu Reeves', aliases: ['keanu reeves', 'keanu'] },
  { name: 'Song Kang-ho', aliases: ['song kang-ho', 'song kang ho'] },
  { name: 'Zendaya', aliases: ['zendaya'] },
  { name: 'Amy Adams', aliases: ['amy adams'] },
  { name: 'Michelle Yeoh', aliases: ['michelle yeoh'] },
  { name: 'Keira Knightley', aliases: ['keira knightley'] },
  { name: 'Greta Lee', aliases: ['greta lee'] },
  { name: 'Jodie Foster', aliases: ['jodie foster'] },
  { name: 'Sigourney Weaver', aliases: ['sigourney weaver'] },
  // Indian Cinema Icons
  { name: 'Aamir Khan', aliases: ['aamir khan', 'aamir'] },
  { name: 'Shah Rukh Khan', aliases: ['shah rukh khan', 'shahrukh khan', 'srk'] },
  { name: 'N.T. Rama Rao Jr.', aliases: ['jr ntr', 'ntr jr', 'n.t. rama rao jr', 'taraka ratna', 'ntr'] },
  { name: 'Ram Charan', aliases: ['ram charan'] },
  { name: 'Prabhas', aliases: ['prabhas'] },
  { name: 'Kamal Haasan', aliases: ['kamal haasan', 'kamal hassan'] },
  { name: 'Fahadh Faasil', aliases: ['fahadh faasil', 'fahad faasil', 'fafa', 'fahadh'] },
  { name: 'Vijay Sethupathi', aliases: ['vijay sethupathi', 'sethupathi'] },
  { name: 'Allu Arjun', aliases: ['allu arjun', 'bunny'] },
  { name: 'Yash', aliases: ['yash', 'rocky bhai'] },
  { name: 'Dhanush', aliases: ['dhanush'] },
  { name: 'Suriya', aliases: ['suriya', 'surya'] },
  { name: 'Mohanlal', aliases: ['mohanlal', 'lalettan'] },
  { name: 'Dulquer Salmaan', aliases: ['dulquer salmaan', 'dulquer', 'dq'] },
  { name: 'Nivin Pauly', aliases: ['nivin pauly'] },
  { name: 'Soubin Shahir', aliases: ['soubin shahir'] },
  { name: 'Rajkummar Rao', aliases: ['rajkummar rao', 'rajkumar rao'] },
  { name: 'Ayushmann Khurrana', aliases: ['ayushmann khurrana'] },
  { name: 'Manoj Bajpayee', aliases: ['manoj bajpayee'] },
  { name: 'Nawazuddin Siddiqui', aliases: ['nawazuddin siddiqui', 'nawazuddin'] },
  { name: 'Tabu', aliases: ['tabu'] },
  { name: 'Vidya Balan', aliases: ['vidya balan'] },
  { name: 'Alia Bhatt', aliases: ['alia bhatt'] },
  { name: 'Deepika Padukone', aliases: ['deepika padukone', 'deepika'] },
  { name: 'Priyanka Chopra', aliases: ['priyanka chopra'] },
  { name: 'Kangana Ranaut', aliases: ['kangana ranaut'] },
  { name: 'Sai Pallavi', aliases: ['sai pallavi'] },
  { name: 'Rajinikanth', aliases: ['rajinikanth', 'superstar rajini'] },
  { name: 'Rana Daggubati', aliases: ['rana daggubati', 'rana'] },
  { name: 'Hrithik Roshan', aliases: ['hrithik roshan', 'hrithik'] },
];

// Catalog movie aliases
const MOVIE_ALIASES: Record<string, string> = {
  'interstellar': 'interstellar',
  'dune': 'dune-2',
  'dune 2': 'dune-2',
  'dune part two': 'dune-2',
  'oppenheimer': 'oppenheimer',
  'spider-verse': 'across-the-spider-verse',
  'spider verse': 'across-the-spider-verse',
  'across the spider verse': 'across-the-spider-verse',
  'everything everywhere': 'everything-everywhere',
  'everything everywhere all at once': 'everything-everywhere',
  'blade runner': 'blade-runner-2049',
  'blade runner 2049': 'blade-runner-2049',
  'parasite': 'parasite',
  'dark knight': 'the-dark-knight',
  'the dark knight': 'the-dark-knight',
  'batman': 'the-dark-knight',
  'inception': 'inception',
  'arrival': 'arrival',
  'knives out': 'knives-out',
  'whiplash': 'whiplash',
  'past lives': 'past-lives',
  'grand budapest': 'grand-budapest-hotel',
  'grand budapest hotel': 'grand-budapest-hotel',
  'spirited away': 'spirited-away',
  'top gun': 'top-gun-maverick',
  'top gun maverick': 'top-gun-maverick',
  'hereditary': 'hereditary',
  'quiet place': 'a-quiet-place',
  'a quiet place': 'a-quiet-place',
  'get out': 'get-out',
  'la la land': 'la-la-land',
  'before sunrise': 'before-sunrise',
  'about time': 'about-time',
  'truman show': 'the-truman-show',
  'the truman show': 'the-truman-show',
  'superbad': 'superbad',
  'the hangover': 'the-hangover',
  'hangover': 'the-hangover',
  'lord of the rings': 'lotr-fellowship',
  'lotr': 'lotr-fellowship',
  'fellowship of the ring': 'lotr-fellowship',
  'mad max': 'mad-max-fury-road',
  'fury road': 'mad-max-fury-road',
  'se7en': 'se7en',
  'seven': 'se7en',
  'silence of the lambs': 'silence-of-the-lambs',
  'the silence of the lambs': 'silence-of-the-lambs',
  'alien': 'alien',
  'the shining': 'the-shining',
  'shining': 'the-shining',
  'the matrix': 'the-matrix',
  'matrix': 'the-matrix',
  'pulp fiction': 'pulp-fiction',
  'shutter island': 'shutter-island',
  'coco': 'coco',
  'princess mononoke': 'princess-mononoke',
  'pride and prejudice': 'pride-and-prejudice',
  'pride & prejudice': 'pride-and-prejudice',
  'raiders of the lost ark': 'raiders-lost-ark',
  'indiana jones': 'raiders-lost-ark',
  'godfather': 'the-godfather',
  'the godfather': 'the-godfather',
  'shawshank': 'the-shawshank-redemption',
  'shawshank redemption': 'the-shawshank-redemption',
  'fight club': 'fight-club',
  'gladiator': 'gladiator',
  'john wick': 'john-wick-4',
  'john wick 4': 'john-wick-4',
  'mission impossible': 'mission-impossible-fallout',
  'the prestige': 'the-prestige',
  'prestige': 'the-prestige',
  'ex machina': 'ex-machina',
  'eternal sunshine': 'eternal-sunshine',
  'eternal sunshine of the spotless mind': 'eternal-sunshine',
  'her': 'her',
  'portrait of a lady on fire': 'portrait-of-a-lady-on-fire',
  'big lebowski': 'the-big-lebowski',
  'the big lebowski': 'the-big-lebowski',
  'glass onion': 'glass-onion',
  'zodiac': 'zodiac',
  'no country for old men': 'no-country-for-old-men',
  'the thing': 'the-thing',
  'midsommar': 'midsommar',
  'wall e': 'wall-e',
  'walle': 'wall-e',
  'your name': 'your-name',
  'return of the king': 'lotr-return-of-the-king',
  'pan\'s labyrinth': 'pans-labyrinth',
  'pans labyrinth': 'pans-labyrinth',
  'paddington 2': 'paddington-2',
  'paddington': 'paddington-2',
  // Indian Cinema Aliases
  'rrr': 'rrr',
  '3 idiots': '3-idiots',
  'three idiots': '3-idiots',
  'dangal': 'dangal',
  'baahubali': 'baahubali-2',
  'baahubali 2': 'baahubali-2',
  'baahubali 1': 'baahubali-1',
  'bahubali': 'baahubali-2',
  'bahubali 2': 'baahubali-2',
  'andhadhun': 'andhadhun',
  'drishyam': 'drishyam-hindi',
  'vikram': 'vikram',
  'kaithi': 'kaithi',
  'tumbbad': 'tumbbad',
  '12th fail': '12th-fail',
  'twelfth fail': '12th-fail',
  'kantara': 'kantara',
  'kgf': 'kgf-1',
  'kgf 1': 'kgf-1',
  'kgf 2': 'kgf-2',
  'kgf chapter 1': 'kgf-1',
  'kgf chapter 2': 'kgf-2',
  'lagaan': 'lagaan',
  'kalki': 'kalki-2898-ad',
  'kalki 2898 ad': 'kalki-2898-ad',
  'super deluxe': 'super-deluxe',
  'kumbalangi nights': 'kumbalangi-nights',
  'taare zameen par': 'taare-zameen-par',
  'gangs of wasseypur': 'gangs-of-wasseypur',
  'swades': 'swades',
  'chak de india': 'chak-de-india',
  'znmd': 'znmd',
  'zindagi na milegi dobara': 'znmd',
  'barfi': 'barfi',
  'kahaani': 'kahaani',
  'queen': 'queen',
  'rang de basanti': 'rang-de-basanti',
  'pushpa': 'pushpa-the-rise',
  'pushpa 2': 'pushpa-2',
  'jersey': 'jersey',
  'sita ramam': 'sita-ramam',
  'eega': 'eega',
  'vada chennai': 'vada-chennai',
  '96': 'movie-96',
  'soorarai pottru': 'soorarai-pottru',
  'jai bhim': 'jai-bhim',
  'ratsasan': 'ratsasan',
  'enthiran': 'enthiran',
  'robot': 'enthiran',
  'premam': 'premam',
  'bangalore days': 'bangalore-days',
  'manjummel boys': 'manjummel-boys',
  'great indian kitchen': 'the-great-indian-kitchen',
  'pather panchali': 'pather-panchali',
  'sairat': 'sairat',
  'dil chahta hai': 'dil-chahta-hai',
  'stree': 'stree',
};

// Common external non-catalog titles to gracefully handle
const KNOWN_EXTERNAL_TITLES: { title: string; genreKeywords: string[]; note: string }[] = [
  {
    title: 'Titanic',
    genreKeywords: ['romance', 'drama', 'historical'],
    note: "While 'Titanic' is not in the MOUVE catalog, here are our closest acclaimed romantic epics and poignant dramas featuring powerful love and high emotional stakes.",
  },
  {
    title: 'Avatar',
    genreKeywords: ['sci-fi', 'adventure', 'action'],
    note: "While 'Avatar' is not in the MOUVE catalog, here are our closest visionary sci-fi and epic worldbuilding masterpieces like Dune: Part Two and Interstellar.",
  },
  {
    title: 'Star Wars',
    genreKeywords: ['sci-fi', 'adventure'],
    note: "While 'Star Wars' is not currently in our catalog, here are our grandest space and fantasy odysseys.",
  },
  {
    title: 'Harry Potter',
    genreKeywords: ['fantasy', 'adventure'],
    note: "While 'Harry Potter' is not in our catalog, here are our top magical fantasy and mythical adventure films like The Lord of the Rings and Spirited Away.",
  },
];

/**
 * Natural language intent parser for movie recommendation requests
 */
export function parseUserIntent(prompt: string, contextHistory: string[] = []): ParsedUserIntent {
  const p = prompt.toLowerCase().trim();
  const fullText = p;

  const isFollowUp =
    contextHistory.length > 0 &&
    (p.startsWith('make') ||
      p.startsWith('and ') ||
      p.startsWith('also ') ||
      p.startsWith('now ') ||
      p.startsWith('something ') ||
      p.startsWith('what about') ||
      p.startsWith('how about') ||
      p.startsWith('under ') ||
      p.includes('more ') ||
      p.includes('less ') ||
      p.includes('shorter') ||
      p.includes('instead'));

  const requestedGenres = new Set<string>();
  const negativeGenres = new Set<string>();
  const requestedThemes = new Set<string>();
  const negativeThemes = new Set<string>();
  const requestedMoods = new Set<string>();
  const negativeMoods = new Set<string>();
  const requestedDirectors = new Set<string>();
  const negativeDirectors = new Set<string>();
  const requestedActors = new Set<string>();
  const negativeActors = new Set<string>();
  const requestedLanguages = new Set<string>();
  const requestedEras = new Set<string>();
  const negativeTitles = new Set<string>();

  // 1. NEGATION PARSING (e.g. "not", "without", "excluding", "except", "no", "don't want", "never", "other than", "but not")
  const negationPattern = /(?:not|without|excluding|except|no|don't want|dont want|never|other than|but not|minus)\s+([a-z0-9\- &]+)/gi;
  let match: RegExpExecArray | null;

  while ((match = negationPattern.exec(fullText)) !== null) {
    const negatedChunk = match[1].toLowerCase();

    // Check negated genres
    if (/\b(romantic|romance|rom-com|romcom|love story|love)\b/.test(negatedChunk)) negativeGenres.add('romance');
    if (/\b(horror|scary|terrifying|jump scare)\b/.test(negatedChunk)) negativeGenres.add('horror');
    if (/\b(comedy|comedies|funny)\b/.test(negatedChunk)) negativeGenres.add('comedy');
    if (/\b(sci-fi|scifi|science fiction)\b/.test(negatedChunk)) negativeGenres.add('sci-fi');
    if (/\b(action|explosions?)\b/.test(negatedChunk)) negativeGenres.add('action');
    if (/\b(drama|tearjerker)\b/.test(negatedChunk)) negativeGenres.add('drama');
    if (/\b(thriller)\b/.test(negatedChunk)) negativeGenres.add('thriller');

    // Check negated themes (e.g. "space movies", "superhero", "batman")
    if (/\b(space|space movies|outer space|astronaut|spacecraft)\b/.test(negatedChunk)) {
      negativeThemes.add('space');
    }
    if (/\b(superhero|superheroes|comic book)\b/.test(negatedChunk)) {
      negativeThemes.add('superhero');
    }
    if (/\b(batman|the dark knight|dark knight)\b/.test(negatedChunk)) {
      negativeTitles.add('the-dark-knight');
    }

    // Check negated directors
    for (const d of CATALOG_DIRECTORS) {
      if (d.aliases.some((alias) => negatedChunk.includes(alias))) {
        negativeDirectors.add(d.name);
      }
    }
  }

  // Explicit check for "not Batman" or "without Batman"
  if (/\b(?:not|without|except|excluding|no)\s+(?:batman|the dark knight|dark knight)\b/i.test(fullText)) {
    negativeTitles.add('the-dark-knight');
  }

  // Explicit check for "not space" or "without space" or "not space movies"
  if (/\b(?:not|without|except|excluding|no)\s+(?:space|space movies|outer space)\b/i.test(fullText)) {
    negativeThemes.add('space');
  }

  // 2. GENRE RECOGNITION (excluding negated ones)
  // Romance
  if (!negativeGenres.has('romance')) {
    if (
      /\b(romance|romantic|love stories|love story|about love|falling in love|relationship|relationships|dating|rom-com|romcom|soulmates?)\b/i.test(
        fullText
      ) ||
      (/\b(love)\b/i.test(fullText) && !/\b(i love|would love|loved to|falling in love)\b/i.test(fullText))
    ) {
      requestedGenres.add('romance');
    }
  }

  // Comedy
  if (!negativeGenres.has('comedy')) {
    if (
      /\b(comedy|comedies|funny|hilarious|laugh|laugh out loud|humor|humorous|lighthearted|rom-com|romcom|parody|satire|fun movie|witty)\b/i.test(
        fullText
      )
    ) {
      requestedGenres.add('comedy');
    }
  }

  // Thriller
  if (!negativeGenres.has('thriller')) {
    if (
      /\b(thriller|thrillers|thrilling|suspense|suspenseful|edge-of-your-seat|nail-biting|high stakes|tension|psychological thriller)\b/i.test(
        fullText
      )
    ) {
      requestedGenres.add('thriller');
    }
  }

  // Horror
  if (!negativeGenres.has('horror')) {
    if (
      /\b(horror|scary|scariest|terrifying|spooky|creepy|frightening|haunted|slasher|nightmare|demons?|monsters?)\b/i.test(
        fullText
      )
    ) {
      requestedGenres.add('horror');
    }
  }

  // Science Fiction
  if (!negativeGenres.has('sci-fi')) {
    if (
      /\b(sci-fi|scifi|science fiction|space movie|space films?|outer space|space travel|aliens?|futuristic|future|cyberpunk|time travel|multiverse|cosmos|cosmic|galaxy)\b/i.test(
        fullText
      )
    ) {
      requestedGenres.add('sci-fi');
    }
  }

  // Drama
  if (!negativeGenres.has('drama')) {
    if (
      /\b(drama|dramas|dramatic|tearjerker|character-driven|deep story|poignant|life journey|biographical|character study)\b/i.test(
        fullText
      )
    ) {
      requestedGenres.add('drama');
    }
  }

  // Mystery
  if (
    /\b(mystery|mysteries|mysterious|whodunit|whodunnit|detective|puzzle|investigation|unsolved|murder mystery|puzzle box)\b/i.test(
      fullText
    )
  ) {
    requestedGenres.add('mystery');
  }

  // Action
  if (!negativeGenres.has('action')) {
    if (
      /\b(action|explosive|high octane|combat|chase|adrenaline|fight|superhero|blockbuster|martial arts|gunfight)\b/i.test(
        fullText
      )
    ) {
      requestedGenres.add('action');
    }
  }

  // Adventure
  if (
    /\b(adventure|adventures|quest|expedition|odyssey|treasure hunt|daring journey)\b/i.test(fullText)
  ) {
    requestedGenres.add('adventure');
  }

  // Fantasy
  if (
    /\b(fantasy|mythology|mythological|magic|magical|wizards|dragons|middle-earth|spirits|folklore)\b/i.test(
      fullText
    )
  ) {
    requestedGenres.add('fantasy');
  }

  // Animation
  if (/\b(animation|animated|anime|cartoon|ghibli|studio ghibli|pixar)\b/i.test(fullText)) {
    requestedGenres.add('animation');
  }

  // Crime
  if (/\b(crime|gangster|mafia|mob|heist|serial killer|robbery|underworld|cops|police)\b/i.test(fullText)) {
    requestedGenres.add('crime');
  }

  // 3. SUBGENRES, TROPES & THEMES
  if (/\b(mind-bending|mind bending|mind blowing|twist|twists|complex plot|reality questioning)\b/i.test(fullText)) {
    requestedThemes.add('mind-bending');
  }
  if (/\b(time travel|timeloop|time loop|time dilation)\b/i.test(fullText)) {
    requestedThemes.add('time travel');
  }
  if (!negativeThemes.has('space') && /\b(space|cosmos|cosmic|outer space|astronaut|spacecraft)\b/i.test(fullText)) {
    requestedThemes.add('space');
  }
  if (/\b(multiverse|parallel universe|alternate dimension)\b/i.test(fullText)) {
    requestedThemes.add('multiverse');
  }
  if (/\b(heist|robbery|bank robbery|caper)\b/i.test(fullText)) {
    requestedThemes.add('heist');
  }
  if (/\b(cyberpunk|dystopia|dystopian|ai|artificial intelligence|android|robot)\b/i.test(fullText)) {
    requestedThemes.add('cyberpunk');
  }
  if (/\b(psychological|mind games|paranoia|obsession)\b/i.test(fullText)) {
    requestedThemes.add('psychological');
  }
  if (/\b(whodunit|whodunnit|detective|murder mystery|investigation)\b/i.test(fullText)) {
    requestedThemes.add('whodunit');
  }
  if (/\b(coming of age|coming-of-age|adolescence|youth|high school)\b/i.test(fullText)) {
    requestedThemes.add('coming-of-age');
  }
  if (/\b(friendship|brotherhood|family|kindness)\b/i.test(fullText)) {
    requestedThemes.add('friendship');
  }

  // Strong female character / female lead constraint
  const hasStrongFemaleLead =
    /\b(strong female character|strong female lead|female protagonist|female lead|women leads?|female hero|heroine)\b/i.test(
      fullText
    );

  // 4. MOOD & TONE
  const isEmotional =
    /\b(emotional|emotion|heartfelt|touching|moving|cry|crying|tear|tearjerker|deep feelings?|sad|bittersweet|soulful|heartbreaking|poignant)\b/i.test(
      fullText
    );
  if (isEmotional) requestedMoods.add('emotional');

  const isDark = /\b(dark|gritty|disturbing|grim|bleak|unsettling|sinister|intense)\b/i.test(fullText);
  if (isDark) requestedMoods.add('dark');

  const isAtmospheric = /\b(atmospheric|moody|immersive|haunting|ambient)\b/i.test(fullText);
  if (isAtmospheric) requestedMoods.add('atmospheric');

  const isMysterious = /\b(mysterious|enigmatic|puzzle|intriguing|secrets?)\b/i.test(fullText);
  if (isMysterious) requestedMoods.add('mysterious');

  const isEpic = /\b(epic|grand|colossal|majestic|monumental|monumental scale)\b/i.test(fullText);
  if (isEpic) requestedMoods.add('epic');

  const isFeelGood = /\b(feel good|feel-good|heartwarming|wholesome|uplifting|cheerful|delightful)\b/i.test(fullText);
  if (isFeelGood) requestedMoods.add('feel-good');

  const isMindBending = requestedThemes.has('mind-bending');
  const isVisual = /\b(visual|visually|cinematography|artistic|breathtaking visuals|groundbreaking art|spectacle)\b/i.test(
    fullText
  );

  // 5. DIRECTORS
  for (const d of CATALOG_DIRECTORS) {
    if (negativeDirectors.has(d.name)) continue;
    const matched = d.aliases.some((alias) => {
      return (
        fullText.includes(alias) ||
        fullText.includes(`directed by ${alias}`) ||
        fullText.includes(`by ${alias}`) ||
        fullText.includes(`${alias} movie`) ||
        fullText.includes(`${alias} film`)
      );
    });
    if (matched) {
      requestedDirectors.add(d.name);
    }
  }

  // 6. ACTORS / CAST
  for (const a of CATALOG_ACTORS) {
    if (negativeActors.has(a.name)) continue;
    const matched = a.aliases.some((alias) => fullText.includes(alias) || fullText.includes(`starring ${alias}`));
    if (matched) {
      requestedActors.add(a.name);
    }
  }

  // 7. LANGUAGES & REGIONAL CINEMA
  if (/\b(french|français)\b/i.test(fullText)) requestedLanguages.add('French');
  if (/\b(japanese|anime|nihongo)\b/i.test(fullText)) requestedLanguages.add('Japanese');
  if (/\b(korean|hangul)\b/i.test(fullText)) requestedLanguages.add('Korean');
  if (/\b(spanish|español)\b/i.test(fullText)) requestedLanguages.add('Spanish');
  if (/\b(german|deutsch)\b/i.test(fullText)) requestedLanguages.add('German');
  if (/\b(italian|italiano)\b/i.test(fullText)) requestedLanguages.add('Italian');
  if (/\b(hindi|bollywood)\b/i.test(fullText)) requestedLanguages.add('Hindi');
  if (/\b(telugu|tollywood)\b/i.test(fullText)) requestedLanguages.add('Telugu');
  if (/\b(tamil|kollywood)\b/i.test(fullText)) requestedLanguages.add('Tamil');
  if (/\b(malayalam|mollywood|kerala cinema)\b/i.test(fullText)) requestedLanguages.add('Malayalam');
  if (/\b(kannada|sandalwood)\b/i.test(fullText)) requestedLanguages.add('Kannada');
  if (/\b(bengali|bangla)\b/i.test(fullText)) requestedLanguages.add('Bengali');
  if (/\b(marathi)\b/i.test(fullText)) requestedLanguages.add('Marathi');
  if (/\b(indian|indian cinema|south indian|south indian cinema|indian movies|indian film)\b/i.test(fullText)) {
    requestedThemes.add('indian cinema');
    requestedGenres.add('indian-cinema');
  }

  // 8. ERAS & DECADES
  if (/\b(2000s|2000's|the 2000s|early 2000s|zeros)\b/i.test(fullText)) requestedEras.add('2000s');
  if (/\b(90s|1990s|the 90s|nineties)\b/i.test(fullText)) requestedEras.add('1990s');
  if (/\b(80s|1980s|the 80s|eighties)\b/i.test(fullText)) requestedEras.add('1980s');
  if (/\b(2010s|2010's|twenty tens)\b/i.test(fullText)) requestedEras.add('2010s');
  if (/\b(2020s|2020's|newest|recent|modern|2023|2024)\b/i.test(fullText)) requestedEras.add('2020s');
  if (/\b(classic|vintage|old school|golden age)\b/i.test(fullText)) requestedEras.add('classic');

  // 9. REFERENCE MOVIE DETECTION (e.g. "Movies like Inception", "Something similar to Dune but more emotional")
  let referenceMovieId: string | null = null;
  let referenceMovieTitle: string | null = null;
  let unrecognizedReferenceTitle: string | null = null;

  // Check catalog aliases
  for (const [alias, id] of Object.entries(MOVIE_ALIASES)) {
    const isExplicitRef =
      p.includes(`similar to ${alias}`) ||
      p.includes(`like ${alias}`) ||
      p.includes(`movies like ${alias}`) ||
      p.includes(`films like ${alias}`) ||
      p.includes(`vibe of ${alias}`) ||
      p.includes(`same vibe as ${alias}`) ||
      p.includes(`in the vein of ${alias}`) ||
      p.includes(`after watching ${alias}`) ||
      p.includes(`after ${alias}`) ||
      p.includes(`loved ${alias}`);

    if (isExplicitRef) {
      referenceMovieId = id;
      const found = MOCK_MOVIES.find((m) => m.id === id);
      if (found) referenceMovieTitle = found.title;
      break;
    }
  }

  // If no explicit similarity phrase prefix, check standalone movie alias in prompt
  if (!referenceMovieId) {
    for (const [alias, id] of Object.entries(MOVIE_ALIASES)) {
      if (p.includes(alias)) {
        // Only treat as reference if prompt isn't solely looking for something else
        const found = MOCK_MOVIES.find((m) => m.id === id);
        if (found) {
          referenceMovieId = id;
          referenceMovieTitle = found.title;
          break;
        }
      }
    }
  }

  // Check known external non-catalog titles
  if (!referenceMovieId) {
    for (const ext of KNOWN_EXTERNAL_TITLES) {
      if (p.includes(ext.title.toLowerCase())) {
        unrecognizedReferenceTitle = ext.title;
        for (const g of ext.genreKeywords) requestedGenres.add(g);
        break;
      }
    }
  }

  // 10. USER LIBRARY SIGNALS
  let isLibraryBased = false;
  let libraryMode: 'all' | 'favorites' | 'watchlist' | 'history' | null = null;

  if (/\b(watchlist|what i saved|my watch list)\b/i.test(fullText)) {
    isLibraryBased = true;
    libraryMode = 'watchlist';
  } else if (/\b(favorites|favorite movies|my favorites)\b/i.test(fullText)) {
    isLibraryBased = true;
    libraryMode = 'favorites';
  } else if (/\b(my history|what i watched|recently watched)\b/i.test(fullText)) {
    isLibraryBased = true;
    libraryMode = 'history';
  } else if (/\b(my library|my taste|based on my taste|tailored to me|recommend for me)\b/i.test(fullText)) {
    isLibraryBased = true;
    libraryMode = 'all';
  }

  // 11. RUNTIME CONSTRAINTS
  let maxRuntime: number | null = null;
  let minRuntime: number | null = null;

  if (
    /\b(under two hours|under 2 hours|under 2h|under 2 hrs|less than 2 hours|less than two hours|within 2 hours|under 120 min|under 120 mins|120 minutes or less)\b/i.test(
      fullText
    )
  ) {
    maxRuntime = 120;
  } else if (
    /\b(under 90 min|under 90 minutes|under an hour and a half|under 1\.5 hours|short movie|quick watch)\b/i.test(
      fullText
    )
  ) {
    maxRuntime = 100;
  } else if (/\b(under 100 min|under 100 minutes)\b/i.test(fullText)) {
    maxRuntime = 100;
  } else if (/\b(under 110 min|under 110 minutes)\b/i.test(fullText)) {
    maxRuntime = 110;
  } else if (/\b(under 2\.5 hours|under 150 min|under 150 minutes)\b/i.test(fullText)) {
    maxRuntime = 150;
  }

  // 12. RATING CONSTRAINTS
  let minRating: number | null = null;
  if (
    /\b(highest rated|top rated|masterpiece|masterpieces|critically acclaimed|high rated|best movies|best rated|8\.5\+|9\+|8\+)\b/i.test(
      fullText
    )
  ) {
    minRating = 8.4;
  }

  // Broad request detection (e.g. "I want something good", "Recommend a movie", "give me a film")
  const isBroadRequest =
    requestedGenres.size === 0 &&
    requestedDirectors.size === 0 &&
    requestedActors.size === 0 &&
    !referenceMovieId &&
    !isLibraryBased &&
    requestedThemes.size === 0 &&
    requestedMoods.size === 0 &&
    !hasStrongFemaleLead;

  // 13. MULTI-TURN INHERITANCE
  if (isFollowUp && contextHistory.length > 0) {
    const prevText = contextHistory.join(' ').toLowerCase();
    const prevParsed = parseUserIntent(prevText, []);

    prevParsed.requestedGenres.forEach((g) => {
      if (!negativeGenres.has(g)) requestedGenres.add(g);
    });

    if (!maxRuntime && prevParsed.maxRuntime) maxRuntime = prevParsed.maxRuntime;
    if (!referenceMovieId && prevParsed.referenceMovieId) {
      referenceMovieId = prevParsed.referenceMovieId;
      referenceMovieTitle = prevParsed.referenceMovieTitle;
    }
    if (requestedDirectors.size === 0 && prevParsed.requestedDirectors.length > 0) {
      prevParsed.requestedDirectors.forEach((d) => {
        if (!negativeDirectors.has(d)) requestedDirectors.add(d);
      });
    }
  }

  return {
    requestedGenres: Array.from(requestedGenres),
    negativeGenres: Array.from(negativeGenres),
    requestedThemes: Array.from(requestedThemes),
    negativeThemes: Array.from(negativeThemes),
    requestedMoods: Array.from(requestedMoods),
    negativeMoods: Array.from(negativeMoods),
    requestedDirectors: Array.from(requestedDirectors),
    negativeDirectors: Array.from(negativeDirectors),
    requestedActors: Array.from(requestedActors),
    negativeActors: Array.from(negativeActors),
    requestedLanguages: Array.from(requestedLanguages),
    requestedEras: Array.from(requestedEras),
    negativeTitles: Array.from(negativeTitles),
    referenceMovieId,
    referenceMovieTitle,
    unrecognizedReferenceTitle,
    isLibraryBased,
    libraryMode,
    hasStrongFemaleLead,
    maxRuntime,
    minRuntime,
    minRating,
    isEmotional,
    isFunny: !negativeGenres.has('comedy') && requestedGenres.has('comedy'),
    isDark,
    isMindBending,
    isHorror: !negativeGenres.has('horror') && requestedGenres.has('horror'),
    isActionPacked: !negativeGenres.has('action') && requestedGenres.has('action'),
    isVisual,
    isRecent: requestedEras.has('2020s'),
    isClassic: requestedEras.has('classic'),
    isFollowUp,
    isBroadRequest,
    rawPrompt: prompt,
  };
}

export const AIService = {
  /**
   * Main recommendation engine function
   * Evaluates natural language user requests against the centralized MOCK_MOVIES dataset.
   */
  async getRecommendations(prompt: string, sessionHistory: string[] = []): Promise<AIRecommendation[]> {
    // Cinematic inference delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const intent = parseUserIntent(prompt, sessionHistory);
    const {
      requestedGenres,
      negativeGenres,
      requestedThemes,
      negativeThemes,
      requestedMoods,
      requestedDirectors,
      negativeDirectors,
      requestedActors,
      negativeActors,
      requestedLanguages,
      requestedEras,
      negativeTitles,
      referenceMovieId,
      unrecognizedReferenceTitle,
      isLibraryBased,
      libraryMode,
      hasStrongFemaleLead,
      maxRuntime,
      minRating,
      isEmotional,
      isFunny,
      isDark,
      isMindBending,
      isHorror,
      isBroadRequest,
    } = intent;

    // Load reference movie if requested
    let refMovie: Movie | null = null;
    if (referenceMovieId) {
      refMovie = MOCK_MOVIES.find((m) => m.id === referenceMovieId) || null;
    }

    // Load user library signals if needed
    const tasteProfile = StorageService.getUserTasteProfile();
    const watchlist = StorageService.getWatchlist();
    const favorites = StorageService.getFavorites();
    const history = StorageService.getViewingHistory();

    const seenOrSavedIds = new Set<string>([
      ...favorites.map((m) => m.id),
      ...watchlist.map((m) => m.id),
      ...history.map((m) => m.id),
    ]);

    // 1. Candidate Pool
    let candidates = [...MOCK_MOVIES];

    // Exclude reference movie itself if similarity was requested
    if (refMovie) {
      candidates = candidates.filter((m) => m.id !== refMovie!.id);
    }

    // 2. Score Candidates
    interface ScoredMovie {
      movie: Movie;
      score: number;
      reasons: string[];
      standouts: string[];
      matchedGenres: string[];
      isDisqualified: boolean;
      disqualificationReason?: string;
    }

    const scoredList: ScoredMovie[] = [];

    for (const movie of candidates) {
      let score = 0;
      let isDisqualified = false;
      const reasons: string[] = [];
      const standouts: string[] = [];
      const matchedGenres: string[] = [];

      // ============================================
      // 0. NEGATION & DISQUALIFICATION CHECKS
      // ============================================

      // A. Disqualify negative titles (e.g. "Christopher Nolan but not Batman")
      if (negativeTitles.includes(movie.id)) {
        isDisqualified = true;
        scoredList.push({
          movie,
          score: -9999,
          reasons: [],
          standouts: [],
          matchedGenres: [],
          isDisqualified: true,
          disqualificationReason: 'Explicitly excluded title',
        });
        continue;
      }

      // B. Disqualify negative genres (e.g. "not romantic", "no horror", "without romance", "without comedy")
      for (const negGenre of negativeGenres) {
        if (movieHasGenre(movie, negGenre)) {
          isDisqualified = true;
          break;
        }
      }
      if (isDisqualified) {
        scoredList.push({
          movie,
          score: -9999,
          reasons: [],
          standouts: [],
          matchedGenres: [],
          isDisqualified: true,
          disqualificationReason: 'Matched negative genre constraint',
        });
        continue;
      }

      // C. Disqualify negative themes (e.g. "sci-fi but not space movies")
      if (negativeThemes.includes('space')) {
        const textToSearch = [
          movie.overview,
          movie.tagline,
          ...(movie.keywords || []),
          ...(movie.moods || []),
        ].join(' ').toLowerCase();

        const isSpaceMovie =
          /\b(space|spacecraft|astronaut|spaceship|galaxy|wormhole|cosmos|outer space|cosmic|orbit|planet exploration|deep space)\b/.test(
            textToSearch
          ) ||
          movie.id === 'interstellar' ||
          movie.id === 'dune-2' ||
          movie.id === 'alien' ||
          movie.id === 'wall-e';

        if (isSpaceMovie) {
          scoredList.push({
            movie,
            score: -9999,
            reasons: [],
            standouts: [],
            matchedGenres: [],
            isDisqualified: true,
            disqualificationReason: 'Contains excluded space theme',
          });
          continue;
        }
      }

      // D. Disqualify negative directors
      if (negativeDirectors.some((nd) => movie.director.toLowerCase().includes(nd.toLowerCase()))) {
        scoredList.push({
          movie,
          score: -9999,
          reasons: [],
          standouts: [],
          matchedGenres: [],
          isDisqualified: true,
          disqualificationReason: 'Excluded director',
        });
        continue;
      }

      // ============================================
      // 1. POSITIVE MATCHING & BOOSTS
      // ============================================

      // A. Director Intent (e.g. "Christopher Nolan movie", "directed by Denis Villeneuve")
      if (requestedDirectors.length > 0) {
        const matchesDir = requestedDirectors.some((rd) =>
          movie.director.toLowerCase().includes(rd.toLowerCase())
        );
        if (matchesDir) {
          score += 400;
          reasons.push(`Directed by ${movie.director}, matching your request for their visionary auteur style.`);
          standouts.push(`Directed by ${movie.director}`);
        } else {
          score -= 500; // Deprioritize when specific director is asked
        }
      }

      // B. Actor Intent (e.g. "starring Leonardo DiCaprio")
      if (requestedActors.length > 0) {
        const matchedActor = movie.cast.find((c) =>
          requestedActors.some((ra) => c.name.toLowerCase().includes(ra.toLowerCase()))
        );
        if (matchedActor) {
          score += 250;
          reasons.push(`Stars ${matchedActor.name} as ${matchedActor.character}.`);
          standouts.push(`Stars ${matchedActor.name}`);
        }
      }

      // C. Explicit Genre Matching
      if (requestedGenres.length > 0) {
        let genreMatches = 0;
        for (const reqGenre of requestedGenres) {
          if (movieHasGenre(movie, reqGenre)) {
            genreMatches++;
            matchedGenres.push(reqGenre);
          }
        }

        if (genreMatches === 0) {
          score -= 800; // Strong penalty if none of requested genres match
        } else if (genreMatches === requestedGenres.length) {
          score += 200 + genreMatches * 40;
          const genreNames = movie.genres.map((g) => g.name).join(' & ');
          reasons.push(`Combines ${genreNames} to match your exact request.`);
          standouts.push(`${genreNames} synergy`);
        } else {
          score += 100 + genreMatches * 30;
          const matchedNames = movie.genres
            .filter((g) => requestedGenres.some((rg) => rg === g.id || rg === g.slug))
            .map((g) => g.name)
            .join(' and ');
          reasons.push(`Anchored in ${matchedNames} storytelling.`);
          standouts.push(`Strong ${matchedNames} themes`);
        }
      }

      // D. Subgenre / Trope / Theme Matching
      if (requestedThemes.length > 0) {
        const textToSearch = [
          movie.overview,
          movie.tagline,
          ...(movie.keywords || []),
          ...(movie.moods || []),
        ].join(' ').toLowerCase();

        for (const theme of requestedThemes) {
          let matched = false;
          if (theme === 'mind-bending') {
            matched =
              movie.id === 'inception' ||
              movie.id === 'the-prestige' ||
              movie.id === 'shutter-island' ||
              movie.id === 'the-matrix' ||
              movie.id === 'arrival' ||
              movie.id === 'everything-everywhere' ||
              movie.id === 'eternal-sunshine' ||
              movie.id === 'fight-club' ||
              (movie.keywords && movie.keywords.some((k) => k.includes('twist') || k.includes('puzzle') || k.includes('reality')));
            if (matched) {
              score += 180;
              reasons.push('Features an intricate, mind-bending narrative that challenges perceptions and keeps you guessing.');
              standouts.push('Mind-bending conceptual layers');
            }
          } else if (theme === 'time travel') {
            matched =
              movie.id === 'interstellar' ||
              movie.id === 'arrival' ||
              movie.id === 'about-time' ||
              (movie.keywords && movie.keywords.some((k) => k.includes('time')));
            if (matched) {
              score += 150;
              reasons.push('Explores captivating time manipulation and temporal storytelling.');
              standouts.push('Temporal narrative structure');
            }
          } else if (theme === 'space' && !negativeThemes.includes('space')) {
            matched =
              movie.id === 'interstellar' ||
              movie.id === 'dune-2' ||
              movie.id === 'alien' ||
              movie.id === 'wall-e';
            if (matched) {
              score += 150;
              reasons.push('Breathtaking cosmic journey across the vast expanse of space.');
              standouts.push('Colossal cosmic scope');
            }
          } else if (theme === 'whodunit') {
            matched =
              movie.id === 'knives-out' ||
              movie.id === 'glass-onion' ||
              movie.id === 'se7en' ||
              movie.id === 'zodiac' ||
              movie.id === 'the-hangover';
            if (matched) {
              score += 160;
              reasons.push('A cunning murder mystery puzzle filled with twists, red herrings, and sharp deductions.');
              standouts.push('Witty whodunit puzzle');
            }
          } else if (theme === 'heist') {
            matched =
              movie.id === 'inception' ||
              movie.id === 'the-dark-knight' ||
              movie.id === 'mission-impossible-fallout' ||
              movie.id === 'paddington-2';
            if (matched) {
              score += 140;
              reasons.push('Elaborate, precision-timed heist operation with adrenaline-pumping stakes.');
              standouts.push('Meticulous heist plotting');
            }
          } else if (theme === 'cyberpunk') {
            matched =
              movie.id === 'blade-runner-2049' ||
              movie.id === 'the-matrix' ||
              movie.id === 'ex-machina' ||
              movie.id === 'her';
            if (matched) {
              score += 160;
              reasons.push('Visionary exploration of artificial intelligence, technology, and what it means to be human.');
              standouts.push('Immersive sci-fi worldbuilding');
            }
          } else if (textToSearch.includes(theme)) {
            score += 100;
            reasons.push(`Explores themes of ${theme} with depth and impact.`);
            standouts.push(`Themes of ${theme}`);
          }
        }
      }

      // E. Strong Female Lead / Character
      if (hasStrongFemaleLead) {
        const femaleLeadMovies = [
          'arrival',
          'past-lives',
          'everything-everywhere',
          'portrait-of-a-lady-on-fire',
          'pride-and-prejudice',
          'silence-of-the-lambs',
          'pans-labyrinth',
          'princess-mononoke',
          'alien',
          'spirited-away',
          'a-quiet-place',
          'hereditary',
        ];
        if (femaleLeadMovies.includes(movie.id)) {
          score += 220;
          reasons.push(`Anchored by a compelling, multifaceted female protagonist at the very heart of the story.`);
          standouts.push('Iconic female lead performance');
        } else {
          score -= 50;
        }
      }

      // F. Moods & Atmosphere
      if (isEmotional) {
        const isEmotionalMovie =
          movie.id === 'past-lives' ||
          movie.id === 'interstellar' ||
          movie.id === 'arrival' ||
          movie.id === 'before-sunrise' ||
          movie.id === 'the-shawshank-redemption' ||
          movie.id === 'la-la-land' ||
          movie.id === 'pride-and-prejudice' ||
          movie.id === 'coco' ||
          movie.id === 'portrait-of-a-lady-on-fire' ||
          movie.id === 'whiplash' ||
          movie.id === 'her' ||
          movie.id === 'your-name' ||
          movieHasGenre(movie, 'drama');

        if (isEmotionalMovie) {
          score += 130;
          reasons.push('Deeply resonant character journey with powerful emotional stakes.');
          standouts.push('Profound emotional resonance');
        }
      }

      if (isDark) {
        const isDarkMovie =
          movieHasGenre(movie, 'thriller') ||
          movieHasGenre(movie, 'crime') ||
          movieHasGenre(movie, 'horror') ||
          (movie.moods && movie.moods.some((m) => m.includes('dark') || m.includes('bleak') || m.includes('gritty')));
        if (isDarkMovie) {
          score += 80;
          reasons.push('Gritty atmosphere with complex moral grey areas and high tension.');
          standouts.push('Dark atmospheric tone');
        }
      }

      if (requestedMoods.includes('atmospheric')) {
        const isAtmo =
          movie.id === 'blade-runner-2049' ||
          movie.id === 'dune-2' ||
          movie.id === 'se7en' ||
          movie.id === 'zodiac' ||
          movie.id === 'arrival' ||
          movie.id === 'pans-labyrinth' ||
          movie.id === 'portrait-of-a-lady-on-fire' ||
          (movie.moods && movie.moods.some((m) => m.includes('atmospheric') || m.includes('immersive')));
        if (isAtmo) {
          score += 90;
          reasons.push('Immersive audiovisual atmosphere that envelops you in its cinematic world.');
          standouts.push('Masterclass in atmosphere');
        }
      }

      if (requestedMoods.includes('mysterious')) {
        if (
          movieHasGenre(movie, 'mystery') ||
          movie.id === 'shutter-island' ||
          movie.id === 'arrival' ||
          movie.id === 'the-prestige' ||
          movie.id === 'zodiac'
        ) {
          score += 90;
          reasons.push('Packed with eerie mystery and psychological intrigue that keeps you theorizing.');
          standouts.push('Enigmatic suspense');
        }
      }

      // G. Reference Movie Similarity
      if (refMovie) {
        const refGenreIds = new Set(refMovie.genres.map((g) => g.id.toLowerCase()));
        let sharedWithRef = 0;
        for (const g of movie.genres) {
          if (refGenreIds.has(g.id.toLowerCase())) sharedWithRef++;
        }

        if (sharedWithRef > 0) {
          score += sharedWithRef * 30;
          reasons.push(
            `Shares core genres and narrative DNA with ${refMovie.title}.`
          );
          standouts.push(`Similar tone to ${refMovie.title}`);
        }

        if (movie.director.toLowerCase() === refMovie.director.toLowerCase()) {
          score += 60;
          reasons.push(`Directed by ${movie.director}, matching the directorial vision of ${refMovie.title}.`);
          standouts.push(`Auteur direction by ${movie.director}`);
        }

        // Shared keywords/themes with reference
        if (refMovie.keywords && movie.keywords) {
          const refKw = new Set(refMovie.keywords.map((k) => k.toLowerCase()));
          const sharedKw = movie.keywords.filter((k) => refKw.has(k.toLowerCase()));
          if (sharedKw.length > 0) {
            score += sharedKw.length * 20;
          }
        }

        // Specific classic reference pairings
        if (refMovie.id === 'dune-2') {
          if (isEmotional && (movie.id === 'interstellar' || movie.id === 'arrival')) {
            score += 120; // "Something similar to Dune but more emotional"
            reasons.push(`Delivers colossal speculative wonder like Dune: Part Two, paired with an intensely emotional, heartfelt core.`);
            standouts.push('Epic scale + deep emotion');
          } else if (movie.id === 'blade-runner-2049') {
            score += 80;
            reasons.push(`Also helmed by Denis Villeneuve, featuring magnificent cinematic scale and existential depth.`);
            standouts.push('Denis Villeneuve vision');
          }
        } else if (refMovie.id === 'inception') {
          if (movie.id === 'the-prestige' || movie.id === 'shutter-island' || movie.id === 'the-matrix' || movie.id === 'interstellar') {
            score += 90;
            reasons.push(`High-concept psychological thriller with intricate puzzles and breathtaking cinematic scale like Inception.`);
            standouts.push('High-concept puzzle storytelling');
          }
        } else if (refMovie.id === 'rrr' || refMovie.id === 'baahubali-2' || refMovie.id === 'baahubali-1') {
          if (
            ['rrr', 'baahubali-2', 'baahubali-1', 'kalki-2898-ad', 'kantara', 'kgf-1', 'kgf-2', 'pushpa-the-rise', 'vikram'].includes(movie.id)
          ) {
            score += 150;
            reasons.push(`Delivers colossal mythological scale, heroic elevation, and exhilarating cinematic grandeur akin to ${refMovie.title}.`);
            standouts.push('Monumental spectacle');
          }
        } else if (refMovie.id === '3-idiots' || refMovie.id === 'dangal') {
          if (
            ['3-idiots', 'dangal', 'taare-zameen-par', '12th-fail', 'lagaan', 'swades', 'chak-de-india', 'znmd'].includes(movie.id)
          ) {
            score += 140;
            reasons.push(`Heartfelt, emotionally inspirational storytelling blending warmth, social resonance, and triumphs like ${refMovie.title}.`);
            standouts.push('Inspirational resonance');
          }
        } else if (refMovie.id === 'vikram' || refMovie.id === 'kaithi') {
          if (
            ['vikram', 'kaithi', 'vada-chennai', 'ratsasan', 'gangs-of-wasseypur', 'andhadhun', 'drishyam-hindi'].includes(movie.id)
          ) {
            score += 140;
            reasons.push(`High-octane neo-noir thriller driven by gritty suspense, intricate underworlds, and pulse-pounding pacing like ${refMovie.title}.`);
            standouts.push('Gritty neo-noir tension');
          }
        }
      }

      // H. Eras & Decades Matching
      if (requestedEras.length > 0) {
        let matchesEra = false;
        for (const era of requestedEras) {
          if (era === '2000s' && movie.year >= 2000 && movie.year <= 2009) matchesEra = true;
          if (era === '1990s' && movie.year >= 1990 && movie.year <= 1999) matchesEra = true;
          if (era === '1980s' && movie.year >= 1980 && movie.year <= 1989) matchesEra = true;
          if (era === '2010s' && movie.year >= 2010 && movie.year <= 2019) matchesEra = true;
          if (era === '2020s' && movie.year >= 2020) matchesEra = true;
          if (era === 'classic' && movie.year < 1990) matchesEra = true;
        }
        if (matchesEra) {
          score += 140;
          reasons.push(`Released in ${movie.year}, matching your desired era.`);
          standouts.push(`${movie.year} release`);
        } else {
          score -= 150;
        }
      }

      // I. Runtime Constraints
      if (maxRuntime !== null) {
        if (movie.runtime <= maxRuntime) {
          score += 80;
          reasons.push(`Concise ${movie.runtime}-minute runtime fits neatly under your ${maxRuntime}-minute limit.`);
          standouts.push(`Paced under ${maxRuntime}m (${movie.runtime}m)`);
        } else {
          score -= 300; // Strict penalty for exceeding requested runtime
        }
      }

      // J. Library-based personalized scoring
      if (isLibraryBased) {
        let libraryBonus = 0;

        // Affinity from inferred taste profile
        for (const tg of tasteProfile.topGenres.slice(0, 3)) {
          if (movieHasGenre(movie, tg.genreId)) {
            libraryBonus += tg.score * 8;
          }
        }
        for (const td of tasteProfile.topDirectors.slice(0, 2)) {
          if (movie.director.toLowerCase() === td.director.toLowerCase()) {
            libraryBonus += td.score * 12;
            reasons.push(`Directed by ${movie.director}, one of your most frequently explored filmmakers.`);
            standouts.push(`Matches your favorite auteur (${movie.director})`);
          }
        }

        // Fresh discovery boost: Prioritize movies not yet in watchlist/favorites/history
        if (!seenOrSavedIds.has(movie.id)) {
          libraryBonus += 60;
        } else {
          libraryBonus -= 20; // Slight dampening so AI suggests new discoveries
        }

        if (libraryBonus > 0) {
          score += libraryBonus;
          if (reasons.length === 0) {
            reasons.push('Tailored to your favorite genres, preferred moods, and viewing habits in MOUVE.');
            standouts.push('Personalized taste match');
          }
        }
      }

      // K. Language Matching
      if (requestedLanguages.length > 0) {
        const matchesLang = (movie.languages || []).some((l) =>
          requestedLanguages.some((rl) => l.toLowerCase() === rl.toLowerCase())
        );
        if (matchesLang) {
          score += 350;
          const matchedLangNames = (movie.languages || []).filter((l) =>
            requestedLanguages.some((rl) => l.toLowerCase() === rl.toLowerCase())
          ).join(', ');
          reasons.push(`Presented in original ${matchedLangNames} audio.`);
          standouts.push(`${matchedLangNames} cinema`);
        } else {
          score -= 450; // Strong deprioritization when specific language is requested
        }
      }

      // L. Indian Cinema Category & Theme Boost
      if (requestedThemes.includes('indian cinema') || requestedGenres.includes('indian-cinema')) {
        const isIndian =
          movie.genres.some((g) => g.id === 'indian-cinema' || g.name.toLowerCase().includes('indian')) ||
          (movie.keywords && movie.keywords.some((k) => k.toLowerCase().includes('indian cinema') || k.toLowerCase() === 'indian')) ||
          (movie.languages && movie.languages.some((l) => ['Hindi', 'Telugu', 'Tamil', 'Malayalam', 'Kannada', 'Bengali', 'Marathi'].includes(l)));

        if (isIndian) {
          score += 300;
          reasons.push('Acclaimed landmark from Indian cinema.');
          standouts.push('Indian Cinema selection');
        } else {
          score -= 400;
        }
      }

      // M. Quality & Critical Rating Base
      score += Math.round((movie.rating - 7.0) * 12);
      if (minRating && movie.rating >= minRating) {
        score += 30;
        standouts.push(`Critically acclaimed (${movie.rating}/10)`);
      }

      // Default reasons if still empty
      if (reasons.length === 0) {
        reasons.push(`Acclaimed ${movie.genres.map((g) => g.name).join(' / ')} with a stellar ${movie.rating}/10 rating.`);
      }
      if (standouts.length === 0) {
        standouts.push(`${movie.genres.map((g) => g.name).slice(0, 2).join(' & ')}`, `Runtime: ${movie.runtime}m`);
      }

      scoredList.push({
        movie,
        score,
        reasons,
        standouts,
        matchedGenres,
        isDisqualified: false,
      });
    }

    // 3. Filter Valid Recommendations (exclude any disqualified)
    let validMatches = scoredList.filter((item) => !item.isDisqualified && item.score > 0);

    // Fallback: If no matches because of overly strict criteria, gracefully find closest matches without breaking negative constraints
    if (validMatches.length === 0) {
      validMatches = scoredList
        .filter((item) => !item.isDisqualified)
        .sort((a, b) => b.score - a.score || b.movie.rating - a.movie.rating);
    }

    // Sort descending by score
    validMatches.sort((a, b) => b.score - a.score || b.movie.rating - a.movie.rating);

    // 4. Recommendation Diversity
    // Balance relevance with variety (avoid returning 4 films by the exact same director unless specifically asked for that director)
    const selectedPicks: ScoredMovie[] = [];
    const usedDirectors = new Set<string>();

    for (const item of validMatches) {
      if (selectedPicks.length >= 4) break;

      const dir = item.movie.director;
      const canAddDirector = requestedDirectors.length > 0 || !usedDirectors.has(dir) || selectedPicks.length >= 3;

      if (canAddDirector) {
        selectedPicks.push(item);
        usedDirectors.add(dir);
      }
    }

    // If still under 4, fill with remaining highest scoring
    if (selectedPicks.length < 4) {
      for (const item of validMatches) {
        if (!selectedPicks.some((p) => p.movie.id === item.movie.id)) {
          selectedPicks.push(item);
          if (selectedPicks.length >= 4) break;
        }
      }
    }

    // 5. Build AI Explanations & Format Output
    return selectedPicks.map((item, index) => {
      const basePercentage = 98 - index * 3;
      const matchScore = Math.min(99, Math.max(84, basePercentage));

      let fallbackNotice: string | undefined;
      if (unrecognizedReferenceTitle) {
        const ext = KNOWN_EXTERNAL_TITLES.find((e) => e.title.toLowerCase() === unrecognizedReferenceTitle.toLowerCase());
        fallbackNotice = ext ? ext.note : `MOUVE catalog match for fans of ${unrecognizedReferenceTitle}.`;
      }

      const matchReason = buildMatchExplanation(item.movie, intent, item.reasons);

      return {
        movie: item.movie,
        matchReason,
        matchScore,
        standoutAspects: Array.from(new Set(item.standouts)).slice(0, 3),
        similarVibe: getVibeDescription(item.movie),
        fallbackNotice,
        matchedCriteria: item.matchedGenres,
      };
    });
  },
};

/**
 * Builds an accurate, grounded explanation based purely on actual movie metadata and user intent
 */
function buildMatchExplanation(movie: Movie, intent: ParsedUserIntent, customReasons: string[]): string {
  const genresStr = movie.genres.map((g) => g.name).join(' & ');

  // Director query
  if (intent.requestedDirectors.length > 0 && intent.requestedDirectors.some((d) => movie.director.toLowerCase().includes(d.toLowerCase()))) {
    return `Recommended because it is directed by ${movie.director}, showcasing their distinctive visual style, thematic complexity, and masterclass storytelling.`;
  }

  // Funny but not romantic
  if (intent.isFunny && intent.negativeGenres.includes('romance')) {
    return `Recommended because it delivers pure comedy, sharp wit, and hilarious dialog without romantic subplots.`;
  }

  // Thriller without horror
  if (intent.requestedGenres.includes('thriller') && intent.negativeGenres.includes('horror')) {
    return `Recommended because it delivers edge-of-your-seat psychological suspense, tension, and investigation without supernatural or jump-scare horror.`;
  }

  // Sci-fi without space
  if (intent.requestedGenres.includes('sci-fi') && intent.negativeThemes.includes('space')) {
    return `Recommended because it delivers grounded, thought-provoking science fiction centered on technology, reality, and consciousness rather than space travel.`;
  }

  // Strong female character
  if (intent.hasStrongFemaleLead) {
    return `Recommended for its unforgettable female protagonist whose intelligence, resilience, and emotional depth anchor the entire film.`;
  }

  // Nolan without Batman
  if (intent.requestedDirectors.includes('Christopher Nolan') && intent.negativeTitles.includes('the-dark-knight')) {
    return `Recommended because it is directed by Christopher Nolan, providing his signature non-linear ambition and intellectual scope outside of Gotham.`;
  }

  // Reference movie (e.g. Dune but more emotional)
  if (intent.referenceMovieId && intent.referenceMovieTitle) {
    if (intent.isEmotional) {
      return `Recommended because it matches the monumental visual majesty of ${intent.referenceMovieTitle} while elevating the human emotional core to extraordinary heights.`;
    }
    return `Recommended because it shares narrative structure, visionary atmosphere, and cinematic depth with ${intent.referenceMovieTitle}.`;
  }

  // Mind-bending
  if (intent.isMindBending) {
    return `Recommended for its intricate, puzzle-box narrative that challenges reality, rewards multiple viewings, and keeps you theorizing.`;
  }

  // Atmospheric and mysterious
  if (intent.requestedMoods.includes('atmospheric') && intent.requestedMoods.includes('mysterious')) {
    return `Recommended for its moody, hypnotic cinematography and enigmatic story that plunges you into deep atmospheric suspense.`;
  }

  // Decades (e.g. 2000s)
  if (intent.requestedEras.includes('2000s')) {
    return `Recommended as a quintessential masterpiece of 2000s cinema (${movie.year}), boasting a remarkable ${movie.rating}/10 critical reception.`;
  }

  // Library-based
  if (intent.isLibraryBased) {
    if (intent.libraryMode === 'watchlist') {
      return `Recommended based on the genres, directorial vision, and narrative themes prominent in your saved Watchlist.`;
    }
    if (intent.libraryMode === 'favorites') {
      return `Curated to match the high-caliber storytelling and moods of the movies you've favorited.`;
    }
    return `Curated based on your personalized MOUVE viewing history, favorite directors, and genre affinities.`;
  }

  // Emotional
  if (intent.isEmotional) {
    return `Recommended for its deeply affecting character performances and poignant emotional resonance that stays with you long after the credits.`;
  }

  // Custom reason fallback
  if (customReasons.length > 0) {
    return `Recommended because it is an acclaimed ${genresStr} film. ${customReasons[0]}`;
  }

  return `Recommended because it features exceptional ${genresStr} storytelling with a standout ${movie.rating}/10 critical rating.`;
}

/**
 * Snapshot vibe description
 */
function getVibeDescription(movie: Movie): string {
  const vibes: Record<string, string> = {
    'dune-2': 'Epic desert warfare, mythic destiny, and monumental visual majesty.',
    oppenheimer: 'Pulse-pounding historical thriller examining moral dilemmas and world-changing science.',
    interstellar: 'Cosmic odyssey of time dilation, interstellar travel, and parental love.',
    'across-the-spider-verse': 'Revolutionary multiverse animation bursting with energy and heart.',
    'everything-everywhere': 'Absurdist multiversal comedy about existential family love and acceptance.',
    'blade-runner-2049': 'Neon noir detective journey asking what it means to be truly human.',
    parasite: 'Razor-sharp dark comedy thriller dissecting class divide and deception.',
    'the-dark-knight': 'Gripping psychological crime duel between chaos and unyielding justice.',
    inception: 'Heist inside the human subconscious with mind-bending architected dreams.',
    arrival: 'Lyrical first-contact science fiction exploring time, memory, and compassion.',
    'knives-out': 'Witty and intricate murder mystery overflowing with eccentric suspects.',
    whiplash: 'High-voltage duel between artistic perfectionism and ruthless ambition.',
    'past-lives': 'Achingly romantic exploration of childhood bonds, destiny, and choices.',
    'grand-budapest-hotel': 'Whimsical, symmetrical visual confection celebrating loyalty and nostalgia.',
    'spirited-away': 'Enchanting mythological adventure rich in folklore, wonder, and growth.',
    'top-gun-maverick': 'High-octane aerial cinematography paired with heartfelt brotherhood.',
    hereditary: 'Chilling, grief-fueled supernatural horror that lingers long after viewing.',
    'a-quiet-place': 'Heart-pounding sensory horror focusing on family survival in silence.',
    'get-out': 'Brilliant social thriller blending sharp satire with claustrophobic terror.',
    'la-la-land': 'Bittersweet musical romantic comedy set in the radiant glow of Los Angeles.',
    'before-sunrise': 'Intimate, dialog-driven romance capturing the magic of one fleeting night in Vienna.',
    'about-time': 'Touching romantic comedy about time travel, love, and cherishing everyday life.',
    'the-truman-show': 'Insightful existential comedy satirizing media surveillance and reality.',
    superbad: 'Hilarious, fast-talking coming-of-age comedy about high school friendship.',
    'the-hangover': 'Chaotic, laugh-a-minute Vegas mystery with unforgettable comedic chemistry.',
    'lotr-fellowship': 'The gold standard of high fantasy adventure, brotherhood, and epic heroism.',
    'mad-max-fury-road': 'Non-stop kinetic action masterpiece driven by practical stunts and fiery spectacle.',
    se7en: 'Bleak, atmospheric detective thriller navigating the darker corners of human morality.',
    'silence-of-the-lambs': 'Psychological crime masterpiece anchored by brilliant mind games.',
    alien: 'Claustrophobic space horror setting the definitive standard for sci-fi survival.',
    'the-shining': 'Haunting descent into madness inside an isolated, snowbound hotel.',
    'the-matrix': 'Groundbreaking cyberpunk action philosophy questioning the fabric of reality.',
    'pulp-fiction': 'Electrifying neo-noir crime anthology with iconic dialog and nonlinear style.',
    'shutter-island': 'Mind-twisting psychological mystery on a remote psychiatric asylum island.',
    coco: 'Visually vibrant musical journey celebrating ancestral heritage and memory.',
    'princess-mononoke': 'Epic ecological saga of war between nature spirits and early industrialization.',
    'pride-and-prejudice': 'Sumptuous, razor-witted adaptation of Austen’s timeless romantic classic.',
    'raiders-lost-ark': 'The quintessential archaeological adventure filled with iconic thrills and wit.',
    'the-godfather': 'Monumental saga of power, family loyalty, and the tragic descent into criminal empire.',
    'the-shawshank-redemption': 'Enduring testament to patience, hope, and the indomitable human spirit.',
    'fight-club': 'Anarchic, satirical psychological whirlwind dissecting modern identity and consumerism.',
    gladiator: 'Thunderous Roman epic blending Colosseum spectacle with deep emotional resonance.',
    'john-wick-4': 'Apex kinetic action ballet with breathtaking martial arts and high-stakes style.',
    'mission-impossible-fallout': 'Masterclass stunt-driven espionage thriller operating at non-stop velocity.',
    'the-prestige': 'Intricate, puzzle-box rivalry of obsession and sacrifice with a staggering climax.',
    'ex-machina': 'Chilling, elegant psychological chess match exploring AI consciousness and manipulation.',
    'eternal-sunshine': 'Heartbreakingly inventive journey through the architecture of memory and soulmate love.',
    her: 'Luminous, tender vision of modern loneliness and deep human-AI emotional connection.',
    'portrait-of-a-lady-on-fire': 'Aesthetically radiant, deeply poignant romance immortalized through the artist\'s gaze.',
    'the-big-lebowski': 'Effortlessly funny, infinitely quotable comedy noir featuring cinema\'s most relaxed hero.',
    'glass-onion': 'Vibrant, razor-sharp murder mystery poking fun at billionaire tech excess.',
    zodiac: 'Obsessive, masterfully detailed procedural chronicling the hunt for America\'s most elusive killer.',
    'no-country-for-old-men': 'Uncompromising neo-western thriller pitting pure evil against weary conscience.',
    'the-thing': 'Unmatched practical horror and paranoia where trust dissolves in the Antarctic ice.',
    midsommar: 'Sun-drenched, hypnotic folk nightmare turning communal grief into cathartic horror.',
    'wall-e': 'Poetic, visually sublime love story and environmental fable celebrating simple humanity.',
    'your-name': 'Visually dazzling cosmic romance of swapped souls and transcendent memories.',
    'lotr-return-of-the-king': 'Grand cinematic triumph delivering emotional catharsis and colossal heroism.',
    'pans-labyrinth': 'Spellbinding dark fairy tale balancing historical cruelty with magical wonder.',
    'paddington-2': 'Pure cinematic joy, flawless physical comedy, and a warm celebration of kindness.',
  };

  return vibes[movie.id] || `${movie.genres.map((g) => g.name).join(' • ')} with memorable directing and themes.`;
}
