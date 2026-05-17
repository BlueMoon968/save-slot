import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Plus, Grid3x3, List, Trash2, Edit2, X, BarChart3, Heart, TrendingUp, Package, Star, Gamepad2, Download, Upload, RefreshCw, Cloud, CloudOff, LogOut, User, Layers } from 'lucide-react';
import { supabase } from './supabase';
import achievementsImage from './assets/achievements.png';
import AnimeCard from './components/AnimeCard';
import MangaCard from './components/MangaCard';
import localforage from 'localforage';

const THEGAMESDB_BASE_URL = import.meta.env.VITE_SUPABASE_TGDB
const ANILIST_BASE_URL = import.meta.env.VITE_SUPABASE_ANILIST
const IGDB_URL = import.meta.env.VITE_SUPABASE_IGDB

// Unique ID generator
let uniqueIdCounter = 0;
const generateUniqueId = () => {
  uniqueIdCounter++;
  return `${Date.now()}-${uniqueIdCounter}-${Math.random().toString(36).substr(2, 9)}`;
};

// Configure
localforage.config({
  name: 'saveslot',
  storeName: 'data',
  description: 'Save Slot local cache'
});

const CONSOLES = [
  // Sony
  { id: 10,   name: 'PS1',  fullName: 'PlayStation',           aliases: ['PlayStation', 'PS1', 'PSX'] },
  { id: 11,   name: 'PS2',  fullName: 'PlayStation 2',         aliases: ['PlayStation 2', 'PS2'] },
  { id: 12,   name: 'PS3',  fullName: 'PlayStation 3',         aliases: ['PlayStation 3', 'PS3'] },
  { id: 4919, name: 'PS4',  fullName: 'PlayStation 4',         aliases: ['PlayStation 4', 'PS4'] },
  { id: 4980, name: 'PS5',  fullName: 'PlayStation 5',         aliases: ['PlayStation 5', 'PS5'] },
  { id: 13,   name: 'PSP',  fullName: 'PlayStation Portable',  aliases: ['PSP'] },
  { id: 39,   name: 'PS VITA', fullName: 'PlayStation Vita',   aliases: ['PS Vita', 'Vita'] },

  // Nintendo (home + handheld)
  { id: 4,    name: 'GB',   fullName: 'Game Boy',              aliases: ['Game Boy', 'GB'] },
  { id: 41,   name: 'GBC',  fullName: 'Game Boy Color',        aliases: ['Game Boy Color', 'GBC'] },
  { id: 5,    name: 'GBA',  fullName: 'Game Boy Advance',      aliases: ['Game Boy Advance', 'GBA'] },
  { id: 8,    name: 'NDS',  fullName: 'Nintendo DS',           aliases: ['Nintendo DS', 'NDS', 'DS'] },
  { id: 4912, name: '3DS',  fullName: 'Nintendo 3DS',          aliases: ['Nintendo 3DS', '3DS'] },
  { id: 7,    name: 'NES',  fullName: 'Nintendo Entertainment System', aliases: ['NES'] },
  { id: 6,    name: 'SNES', fullName: 'Super Nintendo',        aliases: ['Super Nintendo', 'SNES'] },
  { id: 3,    name: 'N64',  fullName: 'Nintendo 64',           aliases: ['Nintendo 64', 'N64'] },
  { id: 2,    name: 'GAMECUBE', fullName: 'Nintendo GameCube', aliases: ['GameCube', 'NGC'] },
  { id: 9,    name: 'WII',  fullName: 'Nintendo Wii',          aliases: ['Wii'] },
  { id: 38,   name: 'WII U', fullName: 'Nintendo Wii U',       aliases: ['Wii U'] },
  { id: 4971, name: 'SWITCH', fullName: 'Nintendo Switch',     aliases: ['Nintendo Switch', 'Switch'] },
  { id: 5021, name: 'SWITCH 2', fullName: 'Nintendo Switch 2', aliases: ['Nintendo Switch 2', 'Switch 2'] },

  // Microsoft
  { id: 14,   name: 'XBOX',          fullName: 'Xbox',                   aliases: ['Xbox'] },
  { id: 15,   name: 'XBOX 360',      fullName: 'Xbox 360',               aliases: ['Xbox 360'] },
  { id: 4920, name: 'XBOX ONE',      fullName: 'Xbox One',               aliases: ['Xbox One'] },
  { id: 4981, name: 'XBOX SERIES X', fullName: 'Xbox Series X',          aliases: ['Xbox Series X', 'Series X'] },

  // PC & mobile
  { id: 1,    name: 'PC',   fullName: 'PC (Microsoft Windows)', aliases: ['PC', 'Windows', 'Microsoft Windows'] },
  { id: 37,   name: 'MAC',  fullName: 'Mac',                     aliases: ['Mac', 'macOS', 'Apple Mac'] },
  { id: 4916, name: 'ANDROID', fullName: 'Android',             aliases: ['Android'] },
  { id: 4915, name: 'iOS',  fullName: 'iOS',                     aliases: ['iOS', 'iPhone', 'iPad'] },

  // Sega (corrected + added)
  { id: 23,   name: 'DREAMCAST', fullName: 'Sega Dreamcast',    aliases: ['Dreamcast', 'Sega Dreamcast'] },
  { id: 18,   name: 'GENESIS',   fullName: 'Sega Genesis',      aliases: ['Genesis', 'Mega Drive', 'Sega Genesis'] },
  { id: 21,   name: 'SEGA CD',   fullName: 'Sega CD',           aliases: ['Sega CD', 'Mega-CD'] },
  { id: 17,   name: 'SATURN',    fullName: 'Sega Saturn',       aliases: ['Saturn', 'Sega Saturn'] },
  { id: 35,   name: 'MASTER SYSTEM', fullName: 'Sega Master System', aliases: ['Master System', 'SMS'] },
  { id: 36,   name: 'MEGA DRIVE', fullName: 'Sega Mega Drive',  aliases: ['Mega Drive', 'Genesis (EU)'] },
  { id: 20,   name: 'GAME GEAR', fullName: 'Sega Game Gear',    aliases: ['Game Gear'] },

  // NEC & SNK (useful additions)
  { id: 34,   name: 'TG-16', fullName: 'TurboGrafx-16',         aliases: ['TurboGrafx 16', 'PC Engine (NA)'] },
  { id: 24,   name: 'NEO GEO', fullName: 'Neo Geo',             aliases: ['Neo Geo', 'AES', 'MVS'] }
];

const ACHIEVEMENTS = [
  { 
    id: 'first-game', 
    name: 'First Game', 
    desc: 'Add your first game', 
    image: achievementsImage,
    imagePosition: '-50px 0', // Top-left trophy (gamepad)
    check: (games, wishlist, badges) => games.length >= 1
  },
  { 
    id: 'collector', 
    name: 'Collector', 
    desc: 'Reach 50 games', 
    image: achievementsImage,
    imagePosition: '-340px 0', // Top-middle trophy (box)
    check: (games, wishlist, badges) => games.length >= 50
  },
  { 
    id: 'hoarder', 
    name: 'Hoarder', 
    desc: 'Reach 100 games', 
    image: achievementsImage,
    imagePosition: '-630px 0', // Top-right trophy (diamond)
    check: (games, wishlist, badges) => games.length >= 100
  },
  { 
    id: 'rainbow', 
    name: 'Rainbow Collector', 
    desc: 'Own games on 5+ consoles', 
    image: achievementsImage,
    imagePosition: '-50px -200px', // Middle-left trophy (rainbow)
    check: (games, wishlist, badges) => {
      const consoles = new Set(games.map(g => g.console));
      return consoles.size >= 5;
    }
  },
  { 
    id: 'rare-hunter', 
    name: 'Rare Hunter', 
    desc: 'Own 10 retro games', 
    image: achievementsImage,
    imagePosition: '-340px -200px', // Middle-center trophy (gem)
    check: (games, wishlist, badges) => {
      const retroConsoles = ['PS1', 'PS2', 'N64', 'SNES', 'NES', 'GENESIS', 'DREAMCAST', 'SATURN', 'GAMECUBE'];
      const retroGames = games.filter(g => retroConsoles.includes(g.console));
      return retroGames.length >= 10;
    }
  },
  { 
    id: 'veteran', 
    name: 'Veteran', 
    desc: 'Active for 30+ days', 
    image: achievementsImage,
    imagePosition: '-630px -200px', // Middle-right trophy (calendar)
    check: (games, wishlist, badges) => {
      const oldestGame = games.reduce((oldest, game) => {
        const gameDate = new Date(game.added_date);
        return gameDate < oldest ? gameDate : oldest;
      }, new Date());
      const daysDiff = (new Date() - oldestGame) / (1000 * 60 * 60 * 24);
      return daysDiff >= 30;
    }
  },
  { 
    id: 'wishlist-warrior', 
    name: 'Wishlist Warrior', 
    desc: 'Add 20+ games to wishlist', 
    image: achievementsImage,
    imagePosition: '-50px -400px', // Bottom-left trophy (star)
    check: (games, wishlist, badges) => wishlist.length >= 20
  },
  { 
    id: 'speed-collector', 
    name: 'Speed Collector', 
    desc: 'Add 10 games in one day', 
    image: achievementsImage,
    imagePosition: '-350px -400px', // Bottom-middle trophy (fire)
    check: (games, wishlist, badges) => {
      const today = new Date().toDateString();
      const todayGames = games.filter(g => new Date(g.added_date).toDateString() === today);
      return todayGames.length >= 10;
    }
  },
  { 
    id: 'master-collector', 
    name: 'Master Collector', 
    desc: 'Reach 500 games', 
    image: achievementsImage,
    imagePosition: '-630px -400px', // Bottom-right trophy (grid/treasure)
    check: (games, wishlist, badges) => games.length >= 500
  }
];


const VERSIONS = ['PAL', 'NTSC', 'NTSC-J', 'JP'];
const GAME_DATA_SOURCES = {
  TGDB: 'tgdb',
  IGDB: 'igdb'
};

const CONSOLE_ICONS = {
  'PS1': '🎮', 'PS2': '🎮', 'PS3': '🎮', 'PS4': '🎮', 'PS5': '🎮',
  'PSP': '🎮', 'PSP GO': '🎮', 'PS VITA': '🎮',
  'GB': '🎲', 'GBC': '🎲', 'GBA': '🎲', 'NDS': '🎲', '3DS': '🎲',
  'NES': '🕹️', 'SNES': '🕹️', 'N64': '🕹️',
  'GAMECUBE': '🎯', 'WII': '🎯', 'WII U': '🎯', 'SWITCH': '🎯',
  'XBOX': '🎮', 'XBOX 360': '🎮', 'XBOX ONE': '🎮', 'XBOX SERIES X/S': '🎮'
};

const stripDiacritics = (value = '') =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const normalizeGameTitle = (value = '') =>
  stripDiacritics(value)
    .toLowerCase()
    .replace(/[™®©]/g, '')
    .replace(/\b(game of the year|goty|definitive|deluxe|ultimate|collector'?s|limited|standard)\s+edition\b/g, '')
    .replace(/\b(hd|remastered|remaster|remake)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const escapeIGDBString = (value = '') => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim();

const getConsoleByName = (consoleName) => CONSOLES.find(c => c.name === consoleName);

const mapIGDBPlatformToConsole = (platform) => {
  if (!platform) return null;
  const platformNames = [platform.name, platform.abbreviation].filter(Boolean).map(v => v.toLowerCase());
  return CONSOLES.find(c =>
    c.aliases.some(alias => platformNames.includes(alias.toLowerCase())) ||
    platformNames.includes(c.name.toLowerCase()) ||
    platformNames.includes(c.fullName.toLowerCase())
  ) || null;
};

const igdbCoverUrl = (cover, size = 't_cover_big') =>
  cover?.url ? `https:${cover.url.replace('t_thumb', size)}` : '';

const tgdbCoverUrl = (gameId, include) => {
  const baseImageUrl = include?.boxart?.base_url?.large || 'https://cdn.thegamesdb.net/images/original/';
  const boxartArray = include?.boxart?.data?.[gameId] || [];
  const frontBoxart = boxartArray.find(img => img.side === 'front');
  return frontBoxart ? `${baseImageUrl}${frontBoxart.filename}` : '';
};

const sortByBestGameMatch = (results, title, consoleName = '') => {
  const wantedTitle = normalizeGameTitle(title);
  return [...results].sort((a, b) => {
    const aTitle = normalizeGameTitle(a.game_title || a.title || a.name);
    const bTitle = normalizeGameTitle(b.game_title || b.title || b.name);
    const aConsole = !consoleName || a._consoleShortName === consoleName || a.console === consoleName;
    const bConsole = !consoleName || b._consoleShortName === consoleName || b.console === consoleName;
    const score = (itemTitle, consoleMatch, hasCover) =>
      (itemTitle === wantedTitle ? 50 : itemTitle.includes(wantedTitle) || wantedTitle.includes(itemTitle) ? 20 : 0) +
      (consoleMatch ? 10 : 0) +
      (hasCover ? 5 : 0);
    return score(bTitle, bConsole, !!b.cover_url) - score(aTitle, aConsole, !!a.cover_url);
  });
};

const sanitizeGameForStorage = (game) => {
  const cleanGame = { ...game };
  delete cleanGame.barcode;
  return cleanGame;
};

  const LazyImage = React.memo(({ src, alt, className }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef();

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { rootMargin: '50px' }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, []);

    return (
      <div ref={imgRef} className={className}>
        {isInView ? (
          <>
            {!isLoaded && (
              <div className="w-full h-full bg-slate-900 animate-pulse" />
            )}
            <img
              src={src}
              alt={alt}
              className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity`}
              onLoad={() => setIsLoaded(true)}
              loading="lazy"
              decoding="async"
            />
          </>
        ) : (
          <div className="w-full h-full bg-slate-900 animate-pulse" />
        )}
      </div>
    );
  });

  LazyImage.displayName = 'LazyImage';


// Memoized Game Card Component
const GameCard = React.memo(({ game, onEdit, onDelete, onMove, isWishlist }) => {
  return (
    <div className={`bg-slate-800 rounded-sm border-4 ${isWishlist ? 'border-purple-700 hover:border-purple-600' : 'border-slate-700 hover:border-slate-600'} overflow-hidden transition-all shadow-lg group`}>
      <div className="aspect-[3/4] bg-slate-900 relative overflow-hidden">
        {game.cover_url ? (
          <LazyImage src={game.cover_url} alt={game.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isWishlist ? (
              <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-purple-700" />
            ) : (
              <Gamepad2 className="w-12 h-12 sm:w-16 sm:h-16 text-slate-700" />
            )}
          </div>
        )}
        {isWishlist && (
          <div className="absolute top-2 right-2 bg-purple-600 rounded-full p-1 sm:p-1.5">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-white" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all flex items-center justify-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onEdit(game)}
            className="p-1.5 sm:p-2 bg-blue-600 rounded-sm hover:bg-blue-700 transition-colors"
          >
            <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => onMove(game)}
            className={`p-1.5 sm:p-2 rounded-sm hover:opacity-90 transition-colors ${isWishlist ? 'bg-green-600' : 'bg-purple-600'}`}
          >
            {isWishlist ? <Star className="w-3 h-3 sm:w-4 sm:h-4" /> : <Heart className="w-3 h-3 sm:w-4 sm:h-4" />}
          </button>
          <button
            onClick={() => onDelete(game.id)}
            className="p-1.5 sm:p-2 bg-red-600 rounded-sm hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
      <div className="p-2 sm:p-3">
        <h3 className="font-bold text-xs sm:text-sm mb-1 truncate font-mono">{game.title}</h3>
        <div className="flex items-center gap-1 sm:gap-2 text-xs text-slate-400 font-mono">
          <span>{CONSOLE_ICONS[game.console]}</span>
          <span className="truncate">{game.console}</span>
          {game.version && (
            <span className={`ml-auto px-1.5 sm:px-2 py-0.5 rounded text-xs ${isWishlist ? 'bg-purple-700' : 'bg-slate-700'}`}>{game.version}</span>
          )}
        </div>
      </div>
    </div>
  );
});

GameCard.displayName = 'GameCard';

function App() {
  const [activeTab, setActiveTab] = useState('collection');
  const [games, setGames] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConsole, setFilterConsole] = useState('');
  const [filterVersion, setFilterVersion] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSeriesModal, setShowSeriesModal] = useState(false);
  const [seriesQuery, setSeriesQuery] = useState('');
  const [seriesResults, setSeriesResults] = useState([]);
  const [isSearchingSeries, setIsSearchingSeries] = useState(false);
  const [seriesAddedIds, setSeriesAddedIds] = useState(new Set());
  const [seriesError, setSeriesError] = useState('');
  const [igdbCollections, setIgdbCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [useIGDBSearch, setUseIGDBSearch] = useState(false);
  const [apiSearchSource, setApiSearchSource] = useState(GAME_DATA_SOURCES.TGDB);
  const [coverUpdateSource, setCoverUpdateSource] = useState(GAME_DATA_SOURCES.IGDB);
  const [isSearchingAPI, setIsSearchingAPI] = useState(false);
  const [apiSearchResults, setApiSearchResults] = useState([]);
  const csvInputRef = useRef(null);
  const [editingGame, setEditingGame] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addToWishlist, setAddToWishlist] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [collectionValue, setCollectionValue] = useState(0);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [badgeNotifications, setBadgeNotifications] = useState([]);
  const [notifiedBadges, setNotifiedBadges] = useState([]);
  const [anime, setAnime] = useState([]);
  const [manga, setManga] = useState([]);
  const [showAddAnimeModal, setShowAddAnimeModal] = useState(false);
  const [showAddMangaModal, setShowAddMangaModal] = useState(false);
  const [animeSearchResults, setAnimeSearchResults] = useState([]);
  const [mangaSearchResults, setMangaSearchResults] = useState([]);
  const [isSearchingAnime, setIsSearchingAnime] = useState(false);
  const [isSearchingManga, setIsSearchingManga] = useState(false);
  const [animeSearchQuery, setAnimeSearchQuery] = useState('');
  const [mangaSearchQuery, setMangaSearchQuery] = useState('');
  const [showAnimeDetails, setShowAnimeDetails] = useState(null);
  const [showMangaDetails, setShowMangaDetails] = useState(null);
  const [anilistUsername, setAnilistUsername] = useState(null);
  const [anilistToken, setAnilistToken] = useState(null);
  const [anilistUserId, setAnilistUserId] = useState(null);
  const [isAnilistConnected, setIsAnilistConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [isBatchOperation, setIsBatchOperation] = useState(false);           
  const [loginForm, setLoginForm] = useState({ username: '', password: '' }); 
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [newGame, setNewGame] = useState({
    title: '',
    console: '',
    version: 'PAL',
    cover_url: '',
    release_date: '',
    api_id: null
  });

  // Initialize user session
useEffect(() => {
  const initAuth = async () => {
    try {
      console.log('🔍 [INIT] Checking for saved auth...');
      
      const savedAuth = await localforage.getItem('saveslot-auth');
      
      if (savedAuth && savedAuth.userId && savedAuth.username) {
        const { userId: uid, username: uname } = savedAuth;
        
        console.log('✅ [INIT] Found auth:', uname);
        
        // IMPORTANTE: Setta state IMMEDIATAMENTE
        setUserId(uid);
        setUsername(uname);
        setShowLoginModal(false);
        console.log('📝 [INIT] State set');
        
        // Verifica user (in background)
        console.log('🔍 [INIT] Verifying user...');
        const { data: user, error } = await supabase
          .from('users')
          .select('id, username')
          .eq('id', uid)
          .single();
        
        if (error || !user) {
          console.warn('⚠️ [INIT] User not found, logging out');
          await localforage.removeItem('saveslot-auth');
          setUserId(null);
          setUsername(null);
          setShowLoginModal(true);
          return;
        }
        
        console.log('✅ [INIT] User verified');
        
        // Carica dati (non blocca)
        console.log('📥 [INIT] Loading data...');
        loadFromSupabase(uid).catch(err => {
          console.error('⚠️ [INIT] Load error:', err);
        });
        
      } else {
        console.log('ℹ️ [INIT] No saved auth');
        setShowLoginModal(true);
      }
    } catch (error) {
      console.error('❌ [INIT] Fatal error:', error);
      setShowLoginModal(true);
    }
  };
  
  initAuth();
}, []);


  // Calculate collection value - Simple estimation based on console/year
  const calculateCollectionValue = async () => {
    setIsLoadingPrices(true);
    let totalValue = 0;
    
    try {
      // Price estimation logic based on console and rarity
      const consolePrices = {
        'PS5': 60,      // Newer games average higher
        'PS4': 25,
        'PS3': 15,
        'PS2': 20,
        'PS1': 30,
        'SWITCH': 45,
        'SWITCH 2': 60,
        'XBOX SERIES X/S': 55,
        'XBOX ONE': 20,
        'XBOX 360': 12,
        'XBOX': 15,
        'WII U': 35,
        'WII': 18,
        'GAMECUBE': 40,
        'N64': 35,
        'SNES': 45,
        'NES': 40,
        '3DS': 30,
        'NDS': 25,
        'GBA': 30,
        'GBC': 35,
        'GB': 25,
        'PS VITA': 40,
        'PSP': 25,
        'DREAMCAST': 50,
        'SATURN': 60,
        'GENESIS': 30,
        'PC': 15,
        'MAC': 15
      };
      
      // Calculate based on console averages
      games.forEach(game => {
        const basePrice = consolePrices[game.console] || 20;
        
        // Add some randomness for realism (+/- 50%)
        const variance = (Math.random() * basePrice) - (basePrice * 0.25);
        const estimatedPrice = basePrice + variance;
        
        totalValue += Math.max(5, estimatedPrice); // Minimum $5 per game
      });
      
      // Round to nearest dollar
      totalValue = Math.round(totalValue);
      
      setCollectionValue(totalValue);
      
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('Error calculating collection value:', error);
      alert('Errore nel calcolare il valore della collezione.');
    } finally {
      setIsLoadingPrices(false);
    }
  };

const updateAllCovers = async () => {
  const gamesWithoutCovers = games.filter(g => !g.cover_url);
  const gamesWithCovers = games.filter(g => g.cover_url);
  const sourceLabel = coverUpdateSource === GAME_DATA_SOURCES.IGDB ? 'IGDB' : 'TheGamesDB';

  if (gamesWithoutCovers.length === 0) {
    alert('Tutti i giochi hanno gia una copertina!');
    return;
  }

  if (!window.confirm(
    `AGGIORNAMENTO COPERTINE\n\n` +
    `Giochi SENZA copertina: ${gamesWithoutCovers.length}\n` +
    `Giochi CON copertina: ${gamesWithCovers.length}\n` +
    `Totale: ${games.length}\n\n` +
    `Database: ${sourceLabel}\n` +
    `Tempo stimato: ~${Math.ceil(gamesWithoutCovers.length * 2 / 60)} minuti\n\n` +
    `Auto-save disabilitato durante l'operazione.\n` +
    `Il salvataggio avverra solo alla fine.\n\n` +
    `Continuare?`
  )) {
    return;
  }

  setIsBatchOperation(true);
  setIsLoadingPrices(true);

  let updated = 0;
  let skippedHasCover = 0;
  let skippedNotFound = 0;
  let errors = 0;

  try {
    const updatedGames = [...games];

    for (let i = 0; i < updatedGames.length; i++) {
      const game = updatedGames[i];

      if (game.cover_url) {
        skippedHasCover++;
        continue;
      }

      try {
        const results = coverUpdateSource === GAME_DATA_SOURCES.IGDB
          ? await searchIGDBForCoverResults(game.title, game.console)
          : await searchTGDBForCoverResults(game.title, game.console);
        const bestResult = results.find(result => result.cover_url);

        if (bestResult?.cover_url) {
          updatedGames[i] = {
            ...updatedGames[i],
            cover_url: bestResult.cover_url,
            release_date: game.release_date || bestResult.release_date || '',
            api_id: game.api_id || bestResult.id || null
          };
          updated++;
        } else {
          skippedNotFound++;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error updating cover for ${game.title}:`, error);
        errors++;
      }
    }

    setGames(updatedGames);
    await new Promise(resolve => setTimeout(resolve, 500));
    await saveToSupabase(updatedGames, wishlist);

    alert(
      `AGGIORNAMENTO COMPLETATO!\n\n` +
      `Database: ${sourceLabel}\n` +
      `Copertine aggiunte: ${updated}\n` +
      `Gia presenti: ${skippedHasCover}\n` +
      `Non trovate: ${skippedNotFound}\n` +
      `Errori API: ${errors}\n\n` +
      `Giochi con cover: ${updatedGames.filter(g => g.cover_url).length}/${updatedGames.length}`
    );
  } catch (error) {
    console.error('[UPDATE COVERS] Fatal error:', error);
    alert('Errore critico. Ricarica la pagina e verifica i dati.');
  } finally {
    setIsBatchOperation(false);
    setIsLoadingPrices(false);
  }
};

  // Import diretto da AniList senza OAuth (API pubblica)
  const importFromAniList = async (anilistUsername) => {
    if (!anilistUsername || !anilistUsername.trim()) {
      alert('Inserisci il tuo username AniList');
      return;
    }

    setIsSearchingAnime(true);
    
    const query = `
      query ($userName: String) {
        MediaListCollection(userName: $userName, type: ANIME) {
          lists {
            name
            entries {
              id
              status
              score
              progress
              media {
                id
                title {
                  romaji
                  english
                }
                episodes
                coverImage {
                  large
                }
                bannerImage
                genres
                seasonYear
                season
                format
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          query,
          variables: { userName: anilistUsername }
        })
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      if (data.data?.MediaListCollection) {
        const importedAnime = [];

        data.data.MediaListCollection.lists.forEach(list => {
          list.entries.forEach(entry => {
            const animeData = {
              id: generateUniqueId(),
              user_id: userId,
              title: entry.media.title.romaji || entry.media.title.english,
              title_english: entry.media.title.english,
              title_romaji: entry.media.title.romaji,
              episodes: entry.media.episodes,
              status: entry.status.toLowerCase(),
              score: entry.score || 0,
              cover_url: entry.media.coverImage.large,
              banner_url: entry.media.bannerImage,
              genres: entry.media.genres,
              year: entry.media.seasonYear,
              season: entry.media.season,
              format: entry.media.format,
              anilist_id: entry.media.id,
              added_date: new Date().toISOString()
            };

            importedAnime.push(animeData);
          });
        });

        setAnime(importedAnime);

        // Save to Supabase - CRITICAL: Check userId first
        if (userId && userId.length > 5 && importedAnime.length > 0) {
          try {
            // Delete existing anime for this user
            await supabase
              .from('anime')
              .delete()
              .eq('user_id', userId);
            
            // Insert new anime
            const { error } = await supabase
              .from('anime')
              .insert(importedAnime);
            
            if (error) {
              console.error('Error saving anime:', error);
              alert('⚠️ Anime importati ma non salvati nel database. Riprova.');
            } else {
              console.log(`✅ ${importedAnime.length} anime saved to database`);
            }
          } catch (error) {
            console.error('Error saving anime to database:', error);
          }
        }

        // Save to Supabase ONLY if we have valid userId
        if (userId && importedAnime.length > 0) {
          await supabase.from('anime').upsert(importedAnime);
          alert(`✅ Importati ${importedAnime.length} anime da AniList!`);
        }

        setAnilistUsername(anilistUsername);
        localStorage.setItem('anilist-username', anilistUsername);
        // Save to database
        try {
          await supabase
            .from('users')
            .update({ anilist_username: anilistUsername })
            .eq('id', userId);
          
          console.log('✅ AniList username saved to database');
        } catch (error) {
          console.error('Error saving AniList username:', error);
        }
      }
    } catch (error) {
      console.error('Error importing from AniList:', error);
      alert(`❌ Errore: ${error.message}\n\nVerifica che lo username "${anilistUsername}" esista su AniList.`);
    } finally {
      setIsSearchingAnime(false);
    }
  };

// OAuth Login to AniList
const loginToAniList = () => {
  const clientId = import.meta.env.VITE_ANILIST_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_ANILIST_REDIRECT_URI;
  
  if (!clientId) {
    alert('❌ AniList Client ID not configured. Check your .env file.');
    return;
  }
  
  const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
  
  console.log('🔐 Redirecting to AniList OAuth...');
  window.location.href = authUrl;
};

// Handle OAuth callback
const handleAniListCallback = async (code) => {
  console.log('🔐 Handling AniList callback with code:', code);
  
  try {
    // Use Supabase Edge Function as proxy
    const response = await fetch(
      ANILIST_BASE_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ code })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data.access_token) {
      console.log('✅ Access token received');
      
      // Save token
      setAnilistToken(data.access_token);
      await localforage.setItem('anilist-token', data.access_token);
      
      // Get user info
      await getAniListUserInfo(data.access_token);
      
      // Import anime list
      await importAniListWithToken(data.access_token);
      
      setIsAnilistConnected(true);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      alert('✅ Connesso ad AniList! I tuoi anime sono stati importati.');
    }
  } catch (error) {
    console.error('❌ OAuth error:', error);
    alert(`❌ Errore durante la connessione ad AniList:\n${error.message}`);
  }
};

// Get AniList user info with token
const getAniListUserInfo = async (token) => {
  const query = `
    query {
      Viewer {
        id
        name
        avatar {
          large
        }
      }
    }
  `;

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();

    if (data.data?.Viewer) {
      const user = data.data.Viewer;
      setAnilistUsername(user.name);
      setAnilistUserId(user.id);
      
      await localforage.setItem('anilist-username', user.name);
      await localforage.setItem('anilist-user-id', user.id);
      
      // Save to database
      await supabase
        .from('users')
        .update({ 
          anilist_username: user.name,
          anilist_user_id: user.id 
        })
        .eq('id', userId);
      
      console.log('✅ AniList user info saved:', user.name);
    }
  } catch (error) {
    console.error('❌ Error fetching AniList user:', error);
  }
};

// Import anime with OAuth token
const importAniListWithToken = async (token) => {
  if (!anilistUserId) {
    console.error('❌ No AniList user ID');
    alert('Errore: AniList user ID mancante. Riconnetti ad AniList.');
    return;
  }

  console.log('📥 [Import] Importing for AniList user:', anilistUserId);
  
  const query = `
    query ($userId: Int) {
      MediaListCollection(userId: $userId, type: ANIME) {
        lists {
          name
          entries {
            id
            status
            score
            progress
            media {
              id
              title {
                romaji
                english
              }
              episodes
              coverImage {
                large
              }
              bannerImage
              genres
              seasonYear
              season
              format
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        query,
        variables: { userId: parseInt(anilistUserId) }
      })
    });

    const data = await response.json();

    if (data.errors) {
      console.error('❌ [Import] GraphQL errors:', data.errors);
      throw new Error(data.errors[0].message);
    }

    if (data.data?.MediaListCollection) {
      const importedAnime = [];

      data.data.MediaListCollection.lists.forEach(list => {
        list.entries.forEach(entry => {
          const animeData = {
            id: generateUniqueId(),
            user_id: userId,
            title: entry.media.title.romaji || entry.media.title.english,
            title_english: entry.media.title.english,
            title_romaji: entry.media.title.romaji,
            episodes: entry.media.episodes,
            status: entry.status.toLowerCase(),
            score: entry.score || 0,
            progress: entry.progress || 0,
            cover_url: entry.media.coverImage.large,
            banner_url: entry.media.bannerImage,
            genres: entry.media.genres,
            year: entry.media.seasonYear,
            season: entry.media.season,
            format: entry.media.format,
            anilist_id: entry.media.id,
            anilist_entry_id: entry.id,  // CRITICO!
            added_date: new Date().toISOString()
          };

          importedAnime.push(animeData);
        });
      });

      setAnime(importedAnime);

      // Save to Supabase
      if (userId && importedAnime.length > 0) {
        await supabase.from('anime').delete().eq('user_id', userId);
        await supabase.from('anime').insert(importedAnime);
        console.log(`✅ [Import] Imported ${importedAnime.length} anime`);
        alert(`✅ Importati ${importedAnime.length} anime da AniList!`);
      }
    }
  } catch (error) {
    console.error('❌ [Import] Error:', error);
    alert(`Errore durante l'import: ${error.message}`);
  }
};

// Update anime on AniList (bidirectional sync)
// Update or Create anime on AniList (bidirectional sync)
const updateAnimeOnAniList = async (animeItem) => {
  if (!anilistToken) {
    console.warn('⚠️ [AniList Sync] Cannot update: missing token');
    return false;
  }

  // Convert status format
  const statusMap = {
    'watching': 'CURRENT',
    'completed': 'COMPLETED',
    'plan_to_watch': 'PLANNING',
    'dropped': 'DROPPED',
    'on_hold': 'PAUSED'
  };

  const anilistStatus = statusMap[animeItem.status];
  
  if (!anilistStatus) {
    console.error('❌ [AniList Sync] Invalid status:', animeItem.status);
    return false;
  }

  try {
    // Case 1: Has entry_id → UPDATE existing entry
    if (animeItem.anilist_entry_id) {
      console.log('🔄 [AniList Sync] Updating existing entry:', animeItem.anilist_entry_id);
      
      const mutation = `
        mutation ($id: Int, $status: MediaListStatus, $score: Int, $progress: Int) {
          SaveMediaListEntry(id: $id, status: $status, scoreRaw: $score, progress: $progress) {
            id
            status
            score
            progress
          }
        }
      `;

      const variables = {
        id: animeItem.anilist_entry_id,
        status: anilistStatus,
        score: animeItem.score ? animeItem.score * 10 : 0, // AniList usa scala 0-100
        progress: animeItem.progress || 0
      };

      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anilistToken}`
        },
        body: JSON.stringify({ query: mutation, variables })
      });

      const data = await response.json();

      if (data.errors) {
        console.error('❌ [AniList Sync] Update error:', data.errors);
        return false;
      }

      console.log('✅ [AniList Sync] Updated:', animeItem.title);
      return true;
    } 
    // Case 2: No entry_id but has anilist_id → CREATE new entry
    else if (animeItem.anilist_id) {
      console.log('➕ [AniList Sync] Creating new entry for:', animeItem.title);
      
      const mutation = `
        mutation ($mediaId: Int, $status: MediaListStatus, $score: Int, $progress: Int) {
          SaveMediaListEntry(mediaId: $mediaId, status: $status, scoreRaw: $score, progress: $progress) {
            id
            status
            score
            progress
            mediaId
          }
        }
      `;

      const variables = {
        mediaId: animeItem.anilist_id,
        status: anilistStatus,
        score: animeItem.score ? animeItem.score * 10 : 0,
        progress: animeItem.progress || 0
      };

      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anilistToken}`
        },
        body: JSON.stringify({ query: mutation, variables })
      });

      const data = await response.json();

      if (data.errors) {
        console.error('❌ [AniList Sync] Create error:', data.errors);
        return false;
      }

      console.log('✅ [AniList Sync] Created entry:', data.data.SaveMediaListEntry.id);
      
      // IMPORTANTE: Salva il nuovo entry_id nel database
      const newEntryId = data.data.SaveMediaListEntry.id;
      
      // Update in state
      setAnime(prevAnime => 
        prevAnime.map(a => 
          a.id === animeItem.id 
            ? { ...a, anilist_entry_id: newEntryId }
            : a
        )
      );
      
      // Update in database
      await supabase
        .from('anime')
        .update({ anilist_entry_id: newEntryId })
        .eq('id', animeItem.id);
      
      console.log('💾 [AniList Sync] Saved entry_id:', newEntryId);
      
      return true;
    }
    // Case 3: No anilist_id at all → Cannot sync
    else {
      console.warn('⚠️ [AniList Sync] Cannot sync: no anilist_id for', animeItem.title);
      return false;
    }

  } catch (error) {
    console.error('❌ [AniList Sync] Error:', error);
    return false;
  }
};

// Delete anime from AniList
const deleteAnimeFromAniList = async (animeItem) => {
  if (!anilistToken) {
    console.warn('⚠️ [AniList Delete] Cannot delete: missing token');
    return false;
  }

  if (!animeItem.anilist_entry_id) {
    console.warn('⚠️ [AniList Delete] No entry_id, nothing to delete on AniList');
    return true; // Non è un errore, semplicemente non esiste su AniList
  }

  try {
    console.log('🗑️ [AniList Delete] Deleting entry:', animeItem.anilist_entry_id);
    
    const mutation = `
      mutation ($id: Int) {
        DeleteMediaListEntry(id: $id) {
          deleted
        }
      }
    `;

    const variables = {
      id: animeItem.anilist_entry_id
    };

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anilistToken}`
      },
      body: JSON.stringify({ query: mutation, variables })
    });

    const data = await response.json();

    if (data.errors) {
      console.error('❌ [AniList Delete] Error:', data.errors);
      return false;
    }

    if (data.data?.DeleteMediaListEntry?.deleted) {
      console.log('✅ [AniList Delete] Deleted from AniList:', animeItem.title);
      return true;
    }

    return false;

  } catch (error) {
    console.error('❌ [AniList Delete] Fatal error:', error);
    return false;
  }
};

// Disconnect from AniList
const disconnectAniList = async () => {
  if (window.confirm('Disconnettere AniList? I tuoi anime rimarranno salvati localmente.')) {
    setAnilistToken(null);
    setAnilistUsername(null);
    setAnilistUserId(null);
    setIsAnilistConnected(false);
    
    await localforage.removeItem('anilist-token');
    await localforage.removeItem('anilist-username');
    await localforage.removeItem('anilist-user-id');
    
    await supabase
      .from('users')
      .update({ 
        anilist_username: null,
        anilist_user_id: null 
      })
      .eq('id', userId);
    
    alert('✅ Disconnesso da AniList');
  }
};

  // Search anime on AniList
  const searchAnime = async (query) => {
    const graphqlQuery = `
      query ($search: String) {
        Page(page: 1, perPage: 10) {
          media(search: $search, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            episodes
            coverImage {
              large
            }
            bannerImage
            genres
            seasonYear
            season
            format
          }
        }
      }
    `;
    
    try {
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          query: graphqlQuery,
          variables: { search: query }
        })
      });
      
      const data = await response.json();
      return data.data?.Page?.media || [];
    } catch (error) {
      console.error('Error searching anime:', error);
      return [];
    }
  };

  // Search manga on AniList
  const searchManga = async (query) => {
    const graphqlQuery = `
      query ($search: String) {
        Page(page: 1, perPage: 10) {
          media(search: $search, type: MANGA) {
            id
            title {
              romaji
              english
              native
            }
            volumes
            chapters
            coverImage {
              large
            }
            bannerImage
            genres
            startDate {
              year
            }
            staff {
              edges {
                node {
                  name {
                    full
                  }
                }
                role
              }
            }
            format
          }
        }
      }
    `;
    
    try {
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          query: graphqlQuery,
          variables: { search: query }
        })
      });
      
      const data = await response.json();
      return data.data?.Page?.media || [];
    } catch (error) {
      console.error('Error searching manga:', error);
      return [];
    }
  };

const handleSearchAnime = async () => {
  if (!animeSearchQuery || animeSearchQuery.length < 2) return;
  
  setIsSearchingAnime(true);
  const results = await searchAnime(animeSearchQuery);
  setAnimeSearchResults(results);
  setIsSearchingAnime(false);
};

const handleSearchManga = async () => {
  if (!mangaSearchQuery || mangaSearchQuery.length < 2) return;
  
  setIsSearchingManga(true);
  const results = await searchManga(mangaSearchQuery);
  setMangaSearchResults(results);
  setIsSearchingManga(false);
};

const addAnimeFromSearch = async (animeData) => {
  const newAnime = {
    id: generateUniqueId(),
    user_id: userId,
    title: animeData.title.romaji || animeData.title.english,
    title_english: animeData.title.english,
    title_romaji: animeData.title.romaji,
    episodes: animeData.episodes,
    status: 'plan_to_watch',
    score: 0,
    cover_url: animeData.coverImage.large,
    banner_url: animeData.bannerImage,
    genres: animeData.genres,
    year: animeData.seasonYear,
    season: animeData.season,
    format: animeData.format,
    anilist_id: animeData.id,
    anilist_entry_id: null,     // ← Null perché non ancora creato su AniList
    added_date: new Date().toISOString()
  };
  
  setAnime([newAnime, ...anime]);
  
  // Save to Supabase
  try {
    await supabase.from('anime').insert([newAnime]);
    console.log('💾 [Add Anime] Saved to database');
    
    // Sync to AniList if connected
    if (isAnilistConnected && anilistToken) {
      console.log('🔄 [Add Anime] Syncing to AniList...');
      const success = await updateAnimeOnAniList(newAnime);
      if (success) {
        console.log('✅ [Add Anime] Created on AniList');
      }
    }
  } catch (error) {
    console.error('❌ [Add Anime] Error:', error);
  }
  
  setShowAddAnimeModal(false);
  setAnimeSearchQuery('');
  setAnimeSearchResults([]);
};

// ========== MANGA FUNCTIONS ==========

// Add manga from search
const addMangaFromSearch = async (mangaData) => {
  const author = mangaData.staff?.edges?.find(edge => edge.role === 'Story')?.node?.name?.full || '';
  
  const newManga = {
    id: generateUniqueId(),
    user_id: userId,
    title: mangaData.title.romaji || mangaData.title.english,
    title_english: mangaData.title.english,
    title_romaji: mangaData.title.romaji,
    volumes: mangaData.volumes,
    chapters: mangaData.chapters,
    status: 'plan_to_read',
    score: 0,
    progress: 0,
    cover_url: mangaData.coverImage.large,
    banner_url: mangaData.bannerImage,
    genres: mangaData.genres,
    year: mangaData.startDate?.year,
    author: author,
    type: mangaData.format,
    anilist_id: mangaData.id,
    anilist_entry_id: null,
    added_date: new Date().toISOString()
  };
  
  setManga([newManga, ...manga]);
  
  // Save to Supabase
  try {
    await supabase.from('manga').insert([newManga]);
    console.log('💾 [Add Manga] Saved to database');
    
    // Sync to AniList if connected
    if (isAnilistConnected && anilistToken) {
      console.log('🔄 [Add Manga] Syncing to AniList...');
      const success = await updateMangaOnAniList(newManga);
      if (success) {
        console.log('✅ [Add Manga] Created on AniList');
      }
    }
  } catch (error) {
    console.error('❌ [Add Manga] Error:', error);
  }
  
  setShowAddMangaModal(false);
  setMangaSearchQuery('');
  setMangaSearchResults([]);
};

// Update manga on AniList (CREATE or UPDATE)
const updateMangaOnAniList = async (mangaItem) => {
  if (!anilistToken) {
    console.warn('⚠️ [AniList Manga Sync] Cannot update: missing token');
    return false;
  }

  const statusMap = {
    'reading': 'CURRENT',
    'completed': 'COMPLETED',
    'plan_to_read': 'PLANNING',
    'dropped': 'DROPPED',
    'on_hold': 'PAUSED'
  };

  const anilistStatus = statusMap[mangaItem.status];
  
  if (!anilistStatus) {
    console.error('❌ [AniList Manga Sync] Invalid status:', mangaItem.status);
    return false;
  }

  try {
    // Case 1: UPDATE existing entry
    if (mangaItem.anilist_entry_id) {
      console.log('🔄 [AniList Manga Sync] Updating:', mangaItem.anilist_entry_id);
      
      const mutation = `
        mutation ($id: Int, $status: MediaListStatus, $score: Int, $progress: Int) {
          SaveMediaListEntry(id: $id, status: $status, scoreRaw: $score, progress: $progress) {
            id
            status
            score
            progress
          }
        }
      `;

      const variables = {
        id: mangaItem.anilist_entry_id,
        status: anilistStatus,
        score: mangaItem.score ? mangaItem.score * 10 : 0,
        progress: mangaItem.progress || 0
      };

      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anilistToken}`
        },
        body: JSON.stringify({ query: mutation, variables })
      });

      const data = await response.json();

      if (data.errors) {
        console.error('❌ [AniList Manga Sync] Update error:', data.errors);
        return false;
      }

      console.log('✅ [AniList Manga Sync] Updated:', mangaItem.title);
      return true;
    } 
    // Case 2: CREATE new entry
    else if (mangaItem.anilist_id) {
      console.log('➕ [AniList Manga Sync] Creating:', mangaItem.title);
      
      const mutation = `
        mutation ($mediaId: Int, $status: MediaListStatus, $score: Int, $progress: Int) {
          SaveMediaListEntry(mediaId: $mediaId, status: $status, scoreRaw: $score, progress: $progress) {
            id
            status
            score
            progress
          }
        }
      `;

      const variables = {
        mediaId: mangaItem.anilist_id,
        status: anilistStatus,
        score: mangaItem.score ? mangaItem.score * 10 : 0,
        progress: mangaItem.progress || 0
      };

      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anilistToken}`
        },
        body: JSON.stringify({ query: mutation, variables })
      });

      const data = await response.json();

      if (data.errors) {
        console.error('❌ [AniList Manga Sync] Create error:', data.errors);
        return false;
      }

      const newEntryId = data.data.SaveMediaListEntry.id;
      console.log('✅ [AniList Manga Sync] Created:', newEntryId);
      
      // Save entry_id
      setManga(prevManga => 
        prevManga.map(m => 
          m.id === mangaItem.id 
            ? { ...m, anilist_entry_id: newEntryId }
            : m
        )
      );
      
      await supabase
        .from('manga')
        .update({ anilist_entry_id: newEntryId })
        .eq('id', mangaItem.id);
      
      return true;
    } else {
      console.warn('⚠️ [AniList Manga Sync] No anilist_id');
      return false;
    }

  } catch (error) {
    console.error('❌ [AniList Manga Sync] Error:', error);
    return false;
  }
};

// Delete manga from AniList
const deleteMangaFromAniList = async (mangaItem) => {
  if (!anilistToken || !mangaItem.anilist_entry_id) return true;

  try {
    console.log('🗑️ [AniList Manga Delete] Deleting:', mangaItem.anilist_entry_id);
    
    const mutation = `
      mutation ($id: Int) {
        DeleteMediaListEntry(id: $id) {
          deleted
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anilistToken}`
      },
      body: JSON.stringify({ 
        query: mutation, 
        variables: { id: mangaItem.anilist_entry_id }
      })
    });

    const data = await response.json();

    if (data.errors) {
      console.error('❌ [AniList Manga Delete] Error:', data.errors);
      return false;
    }

    console.log('✅ [AniList Manga Delete] Deleted');
    return data.data?.DeleteMediaListEntry?.deleted || false;
    
  } catch (error) {
    console.error('❌ [AniList Manga Delete] Fatal error:', error);
    return false;
  }
};
  const saveAchievementsOnServer = async (updatedNotified,uid) => {

    try {
      await supabase
        .from('users')
        .update({ notified_badges: updatedNotified })
        .eq('id', uid);
    }
    catch (error){
      console.error('Error saving achievements on supabase:', error)
    }

  };

const checkAchievements = useCallback(() => {
  const newBadges = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    // Check if already unlocked
    if (unlockedBadges.includes(achievement.id)) return;
    
    // Check if condition is met
    if (achievement.check(games, wishlist, unlockedBadges)) {
      newBadges.push(achievement);
    }
  });
  
  if (newBadges.length > 0) {
    setUnlockedBadges([...unlockedBadges, ...newBadges.map(b => b.id)]);
    
    // Filter out badges that have already been notified
    const badgesToNotify = newBadges.filter(badge => !notifiedBadges.includes(badge.id));
    
    if (badgesToNotify.length > 0) {
      // Mark these badges as notified
      const updatedNotified = [...notifiedBadges, ...badgesToNotify.map(b => b.id)];
      setNotifiedBadges(updatedNotified);
      
      // Save to localStorage
      if (userId) {
        localStorage.setItem(`saveslot-notified-badges-${userId}`, JSON.stringify(updatedNotified));
        saveAchievementsOnServer(updatedNotified, userId)
      }
      
      // Show notifications for new badges
      badgesToNotify.forEach((badge, index) => {
        const notificationId = `${badge.id}-${Date.now()}`;
        
        setTimeout(() => {
          setBadgeNotifications(prev => [...prev, { ...badge, notificationId }]);
          
          // Remove after 5 seconds
          setTimeout(() => {
            setBadgeNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
          }, 5000);
        }, index * 300);
      });
    }
  }
}, [games, wishlist, unlockedBadges, notifiedBadges, userId]);

  // Load data from Supabase
  const loadFromSupabase = async (uid) => {
    try {
      setIsSyncing(true);
      setSyncStatus('syncing');

      // Load collection
      const { data: collectionData, error: collectionError } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', uid)
        .eq('is_wishlist', false)
        .order('added_date', { ascending: false });

      if (collectionError) throw collectionError;

      // Load wishlist
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', uid)
        .eq('is_wishlist', true)
        .order('added_date', { ascending: false });

      if (wishlistError) throw wishlistError;

      const { data: userData } = await supabase
      .from('users')
      .select('notified_badges')
      .eq('id', uid)
      .single();

      if (userData?.notified_badges) {
        setNotifiedBadges(userData.notified_badges);
      }

      setGames((collectionData || []).map(sanitizeGameForStorage));
      setWishlist((wishlistData || []).map(sanitizeGameForStorage));
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error loading from Supabase:', error);
      setSyncStatus('error');
      
      // Fallback to localStorage
      const savedGames = localStorage.getItem('saveslot-collection');
      const savedWishlist = localStorage.getItem('saveslot-wishlist');
      
      if (savedGames) {
        try {
          setGames(JSON.parse(savedGames).map(sanitizeGameForStorage));
        } catch (e) {
          console.error('Error parsing saved games:', e);
        }
      }
      
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist).map(sanitizeGameForStorage));
        } catch (e) {
          console.error('Error parsing saved wishlist:', e);
        }
      }

      const savedNotifications = localStorage.getItem(`saveslot-notified-badges-${uid}`);
      if (savedNotifications) {
        try {
          setNotifiedBadges(JSON.parse(savedNotifications));
        } catch (e) {
          console.error('Error parsing notified badges:', e);
        }
      }

    } 
    
    try {
      const { data: animeData, error: animeError } = await supabase
        .from('anime')
        .select('*')
        .eq('user_id', uid)
        .order('added_date', { ascending: false });

      if (animeError) {
        console.error('Error loading anime:', animeError);
      } else if (animeData) {
        console.log(`✅ Loaded ${animeData.length} anime from database`);
        setAnime(animeData);
      }
    } catch (error) {
      console.error('Error loading anime:', error);
    }

    // Load manga
    try {
      const { data: mangaData, error: mangaError } = await supabase
        .from('manga')
        .select('*')
        .eq('user_id', uid)
        .order('added_date', { ascending: false });

      if (mangaError) {
        console.error('Error loading manga:', mangaError);
      } else if (mangaData) {
        console.log(`✅ Loaded ${mangaData.length} manga from database`);
        setManga(mangaData);
      }
    } catch (error) {
      console.error('Error loading manga:', error);
    }   
    
    try {
      // Load AniList username from database
      const { data: userData } = await supabase
        .from('users')
        .select('anilist_username')
        .eq('id', uid)
        .single();

      if (userData?.anilist_username) {
        setAnilistUsername(userData.anilist_username);
        await localforage.setItem('anilist-username', userData.anilist_username);
        console.log('✅ Loaded AniList username:', userData.anilist_username);
      }
    }
    
    finally {
      setIsSyncing(false);
    }
  };


const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    alert('Inserisci username e password');
    return;
  }

  try {
    console.log('🔐 [LOGIN] Attempting login as:', loginForm.username);
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', loginForm.username)
      .eq('password', loginForm.password)
      .single();

    if (error || !user) {
      console.error('❌ [LOGIN] Error:', error);
      alert('Username o password errati');
      return;
    }

    console.log('✅ [LOGIN] User found:', user.username);
    
    // STEP 1: Salva in localforage PRIMA DI TUTTO
    const authData = {
      userId: user.id,
      username: user.username
    };
    
    await localforage.setItem('saveslot-auth', authData);
    console.log('💾 [LOGIN] Auth saved:', authData);
    
    // STEP 2: Aggiorna lo state
    setUserId(user.id);
    setUsername(user.username);
    setShowLoginModal(false);
    console.log('📝 [LOGIN] State updated');
    
    // STEP 3: Carica dati (non blocca il login se fallisce)
    console.log('📥 [LOGIN] Loading data...');
    loadFromSupabase(user.id).catch(err => {
      console.error('⚠️ [LOGIN] Load error (non-critical):', err);
    });
    
    // STEP 4: Pulisci form
    setLoginForm({ username: '', password: '' });
    
  } catch (error) {
    console.error('❌ [LOGIN] Fatal error:', error);
    alert('Errore durante il login. Riprova.');
  } finally {
      setIsLoggingIn(false);
    }
  };


  const handleLogout = async () => {
    console.log('🚪 Logging out...');
    
    setUserId(null);
    setUsername(null);
    setGames([]);
    setWishlist([]);
    setAnime([]);
    setManga([]);
    setShowLoginModal(true);
    
    // Clear all auth data
    await localforage.removeItem('saveslot-auth');
    await localforage.removeItem('anilist-token');
    await localforage.removeItem('anilist-username');
    await localforage.removeItem('anilist-user-id');
    
    console.log('✅ Logged out');
  };

const saveToSupabase = useCallback(async (gamesData, wishlistData) => {
  // ============================================
  // CRITICAL SAFETY CHECKS - PREVENT DATA LOSS
  // ============================================
  
  // Check 1: userId must exist
  if (!userId) {
    console.error('❌ BLOCKED: No userId');
    return;
  }

  // Check 2: userId must be valid string
  if (typeof userId !== 'string' || userId === 'undefined' || userId === 'null') {
    console.error('❌ BLOCKED: Invalid userId type:', userId);
    setSyncStatus('error');
    return;
  }

  // Check 3: userId must be long enough
  if (userId.length < 5) {
    console.error('❌ BLOCKED: userId too short:', userId);
    setSyncStatus('error');
    return;
  }

  // Check 4: Must have data to save
  if (!gamesData || !wishlistData) {
    console.error('❌ BLOCKED: No data provided');
    return;
  }

  try {
    setSyncStatus('syncing');
    
    console.log(`🔄 Starting save for user: ${userId}`);
    console.log(`📊 Games: ${gamesData.length}, Wishlist: ${wishlistData.length}`);

    // Prepare games for upsert
    const allGames = [
      ...gamesData.map(g => ({
        ...sanitizeGameForStorage(g),
        user_id: userId,
        is_wishlist: false,
        added_date: g.added_date || new Date().toISOString()
      })),
      ...wishlistData.map(g => ({
        ...sanitizeGameForStorage(g),
        user_id: userId,
        is_wishlist: true,
        added_date: g.added_date || new Date().toISOString()
      }))
    ];

    // SAFETY: Verify userId one more time before delete
    if (!userId || userId.length < 5) {
      throw new Error('CRITICAL: userId became invalid before delete!');
    }

    // Delete all existing games for THIS USER ONLY
    const { error: deleteError, count } = await supabase
      .from('games')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('❌ Delete error:', deleteError);
      throw deleteError;
    }

    console.log(`✅ Deleted ${count || 0} existing games for user ${userId}`);

    // Insert new games
    if (allGames.length > 0) {
      const { error: insertError } = await supabase
        .from('games')
        .insert(allGames);

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        throw insertError;
      }

      console.log(`✅ Inserted ${allGames.length} games for user ${userId}`);
    }

    setSyncStatus('synced');

    // ALWAYS backup to localStorage
    await localforage.setItem('saveslot-collection', gamesData);
    await localforage.setItem('saveslot-wishlist', wishlistData);
    await localforage.setItem('saveslot-last-backup', new Date().toISOString());
    
    console.log('✅ Save completed successfully');

  } catch (error) {
    console.error('❌ Error saving to Supabase:', error);
    setSyncStatus('error');

    // FALLBACK: Save to localStorage
    try {
        await localforage.setItem('saveslot-collection', gamesData);
        await localforage.setItem('saveslot-wishlist', wishlistData);
        await localforage.setItem('saveslot-error-backup', {
          games: gamesData,
          wishlist: wishlistData,
          timestamp: new Date().toISOString(),
          error: error.message
        });
        console.log('💾 Emergency backup saved to localforage');
    } catch (backupError) {
      console.error('❌ Even backup failed:', backupError);
    }
  }
}, [userId]);

  // Global error handler - prevent saves during errors
  useEffect(() => {
    const handleError = (event) => {
      console.error('Global error caught:', event.error);
      // Block all saves during error
      setSyncStatus('error');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Save only if actually changed (deep comparison)
    const lastSaveRef = useRef({ games: '[]', wishlist: '[]' });

    useEffect(() => {
      if (!userId) return;
      
      // CRITICAL: Don't auto-save during batch operations
      if (isBatchOperation) {
        console.log('⏸️ [Auto-Save] Paused during batch operation');
        return;
      }
      
      // Quick check if data changed (using JSON comparison)
      const gamesStr = JSON.stringify(games);
      const wishlistStr = JSON.stringify(wishlist);
      
      if (gamesStr === lastSaveRef.current.games && 
          wishlistStr === lastSaveRef.current.wishlist) {
        return; // No changes, skip save
      }
    
    const timeoutId = setTimeout(() => {
      console.log('💾 Saving changes to Supabase...');
      saveToSupabase(games, wishlist);
      lastSaveRef.current = { games, wishlist };
    }, 2000); // Aumentato a 2 secondi

    return () => clearTimeout(timeoutId);
  }, [games, wishlist, userId, saveToSupabase]);

  // Check achievements when games or wishlist change
  useEffect(() => {
    if (games.length > 0 || wishlist.length > 0) {
      checkAchievements();
    }
  }, [games.length, wishlist.length, checkAchievements]);

  // Handle AniList OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    // Only process if there's actually an OAuth code
    if (code && code.length > 10 && !anilistToken) {
      console.log('🔐 AniList OAuth code detected, exchanging for token...');
      handleAniListCallback(code);
    } else if (window.location.search && !code) {
      // Clean URL if there's a ? but no code
      console.log('🧹 Cleaning URL...');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

// Load AniList credentials on mount
useEffect(() => {
  const loadAniListCredentials = async () => {
    const token = await localforage.getItem('anilist-token');
    const username = await localforage.getItem('anilist-username');
    const userIdAl = await localforage.getItem('anilist-user-id');
    
    if (token && username) {
      setAnilistToken(token);
      setAnilistUsername(username);
      setAnilistUserId(userIdAl);
      setIsAnilistConnected(true);
      console.log('✅ AniList credentials loaded from cache');
    }
  };
  
  loadAniListCredentials();
}, []);

  const searchGames = async (query, platformId) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    if (!THEGAMESDB_BASE_URL) {
      alert('TheGamesDB non configurato. Controlla VITE_SUPABASE_TGDB.');
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        name: query,
        include: 'boxart'
      });
      
      if (platformId) params.set('platform', String(platformId));
      
      const apiUrl = `${THEGAMESDB_BASE_URL}/Games/ByGameName?${params.toString()}`;
      
      const res = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
      const ctype = res.headers.get('content-type') || '';
      const txt = await res.text();
      if (!res.ok) throw new Error(`TGDB HTTP ${res.status}: ${txt.slice(0,150)}`);
      if (!ctype.includes('application/json')) throw new Error('TGDB: risposta non-JSON');
      
      const data = JSON.parse(txt);

      if (data.data && data.data.games) {
        const gamesWithImages = data.data.games.map(game => {
          let matchedConsole = CONSOLES.find(c => c.id === game.platform);

          // Debug: log platform ID to find correct mapping
          if (!matchedConsole) {
            console.log('🔍 Unknown platform ID:', game.platform, 'for game:', game.game_title);
          }
                    
          return {
            ...game,
            cover_url: tgdbCoverUrl(game.id, data.include),
            _source: GAME_DATA_SOURCES.TGDB,
            platformName: matchedConsole ? matchedConsole.fullName : 'Unknown Platform',
            uniqueKey: generateUniqueId()
          };
        });
        
        setSearchResults(gamesWithImages);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching games:', error);
      alert('Errore durante la ricerca. Riprova tra qualche secondo.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const igdbQuery = async (endpoint, query) => {
    if (!IGDB_URL) throw new Error('VITE_SUPABASE_IGDB non configurata — aggiungi il secret su GitHub e fai redeploy');
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    let res;
    try {
      res = await fetch(IGDB_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
        },
        body: JSON.stringify({ endpoint, query }),
      });
    } catch (networkErr) {
      console.error('[IGDB] network error:', networkErr);
      throw networkErr;
    }
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`IGDB proxy ${res.status}${errBody ? ': ' + errBody.slice(0, 300) : ''}`);
    }
    const data = await res.json();
    if (!Array.isArray(data) && data?.status && data.status >= 400) {
      throw new Error(`IGDB: ${data.message || data.title || JSON.stringify(data)}`);
    }
    return data;
  };

  const igdbSearchGames = async (query) => {
    if (!query || query.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const safeQuery = escapeIGDBString(query);
      const games = await igdbQuery('games', `
        search "${safeQuery}";
        fields name, first_release_date, platforms.abbreviation, platforms.name, cover.url, category;
        limit 100;
      `);
      if (!Array.isArray(games)) throw new Error(games?.error || 'IGDB error');

      const results = [];
      games.forEach(g => {
        const coverUrl = igdbCoverUrl(g.cover);
        const releaseYear = g.first_release_date
          ? new Date(g.first_release_date * 1000).getFullYear().toString()
          : '';
        const platforms = g.platforms?.length ? g.platforms : [null];

        platforms.forEach(p => {
          const consoleObj = p
            ? mapIGDBPlatformToConsole(p)
            : null;
          results.push({
            id: g.id,
            game_title: g.name,
            platform: consoleObj?.id ?? null,
            _consoleShortName: consoleObj?.name || '',
            _source: GAME_DATA_SOURCES.IGDB,
            platformName: consoleObj?.fullName || p?.name || 'Unknown Platform',
            cover_url: coverUrl,
            release_date: releaseYear,
            uniqueKey: generateUniqueId()
          });
        });
      });

      setSearchResults(results);
    } catch (e) {
      console.error('[IGDB game search]', e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const searchSeriesGames = async (query, collectionId = null) => {
    if (!query || query.trim().length < 2) return;
    setIsSearchingSeries(true);
    setSeriesResults([]);
    setSeriesError('');
    if (!collectionId) {
      setIgdbCollections([]);
      setSelectedCollection(null);
    }

    try {
      // collectionId can encode both type and id: "col:123" or "fra:456"
      let targetId = collectionId;
      let targetType = null; // 'collection' | 'franchise'
      if (collectionId) {
        const [type, id] = collectionId.split(':');
        targetType = type;
        targetId = id;
      }

      if (!targetId) {
        // Step 1: search collections AND franchises in parallel
        const q = query.trim();
        const safeQ = escapeIGDBString(q);
        const [collections, franchises] = await Promise.all([
          igdbQuery('collections', `search "${safeQ}"; fields id, name, slug; limit 20;`).catch(() => []),
          igdbQuery('franchises', `search "${safeQ}"; fields id, name, slug; limit 20;`).catch(() => []),
        ]);

        // Bidirectional name match: query contains name OR name contains query
        const qLow = q.toLowerCase();
        const nameMatches = (name) => {
          const n = name.toLowerCase();
          return n.includes(qLow) || qLow.includes(n);
        };

        const matchedCols = (Array.isArray(collections) ? collections : [])
          .filter(c => nameMatches(c.name))
          .map(c => ({ ...c, _type: 'collection' }));
        const matchedFras = (Array.isArray(franchises) ? franchises : [])
          .filter(f => nameMatches(f.name))
          .map(f => ({ ...f, _type: 'franchise' }));

        const allMatches = [...matchedCols, ...matchedFras];

        if (allMatches.length === 0) {
          await searchIGDBByName(q);
          return;
        }
        if (allMatches.length === 1) {
          targetType = allMatches[0]._type;
          targetId = String(allMatches[0].id);
          setSelectedCollection(allMatches[0]);
        } else {
          setIgdbCollections(allMatches);
          setIsSearchingSeries(false);
          return;
        }
      }

      // Step 2: fetch all games (no category filter — filter client-side after)
      const allGames = [];
      let offset = 0;
      const whereClauses = targetType === 'franchise'
        ? [`franchise = ${targetId}`, `franchises = (${targetId})`]
        : [`collection = ${targetId}`];

      for (const whereClause of whereClauses) {
        offset = 0;
        while (true) {
          const batch = await igdbQuery('games', `
            fields name, first_release_date, platforms.abbreviation, platforms.name, cover.url, category;
            where ${whereClause};
            sort first_release_date asc;
            limit 500;
            offset ${offset};
          `);
          if (!Array.isArray(batch) || batch.length === 0) break;
          allGames.push(...batch);
          if (batch.length < 500) break;
          offset += 500;
        }
      }

      const uniqueGames = [...new Map(allGames.map(g => [g.id, g])).values()];
      const EXCLUDED_CATEGORIES = new Set([1, 2, 3, 5, 6, 7, 13, 14]);
      const filtered = uniqueGames.filter(g => !EXCLUDED_CATEGORIES.has(g.category));
      setSeriesResults(processIGDBGames(filtered.length > 0 ? filtered : uniqueGames));
    } catch (e) {
      console.error('[SeriesTracker] IGDB error:', e);
      setSeriesError(`Errore IGDB: ${e.message}`);
    } finally {
      setIsSearchingSeries(false);
    }
  };

  const searchIGDBByName = async (query) => {
    try {
      const games = await igdbQuery('games', `
        search "${escapeIGDBString(query)}";
        fields name, first_release_date, platforms.abbreviation, platforms.name, cover.url, category;
        limit 500;
      `);
      if (!Array.isArray(games)) throw new Error('IGDB error');
      const EXCLUDED_CATEGORIES = new Set([1, 2, 3, 5, 6, 7, 13, 14]);
      setSeriesResults(processIGDBGames((games || []).filter(g => !EXCLUDED_CATEGORIES.has(g.category))));
    } catch (e) {
      console.error('[SeriesTracker] IGDB name search error:', e);
      setSeriesError(`Errore IGDB: ${e.message}`);
    } finally {
      setIsSearchingSeries(false);
    }
  };

  const processIGDBGames = (games) => {
    // Group by normalised title, merge platforms, keep best cover
    const map = new Map();
    (games || []).forEach(g => {
      const key = normalizeGameTitle(g.name);
      const coverUrl = igdbCoverUrl(g.cover, 't_cover_small');
      const year = g.first_release_date
        ? new Date(g.first_release_date * 1000).getFullYear()
        : null;
      const platformCandidates = (g.platforms || [])
        .map(mapIGDBPlatformToConsole)
        .filter(Boolean);
      const platNames = (g.platforms || [])
        .map(p => p.abbreviation || p.name)
        .filter(Boolean);

      if (!map.has(key)) {
        map.set(key, { igdbId: g.id, title: g.name, cover_url: coverUrl, platforms: platNames, platformCandidates, year });
      } else {
        const entry = map.get(key);
        platNames.forEach(p => { if (!entry.platforms.includes(p)) entry.platforms.push(p); });
        platformCandidates.forEach(p => {
          if (!entry.platformCandidates.some(existing => existing.name === p.name)) entry.platformCandidates.push(p);
        });
        if (!entry.cover_url && coverUrl) entry.cover_url = coverUrl;
        if (!entry.year && year) entry.year = year;
      }
    });
    return [...map.values()];
  };

  const searchTGDBForCoverResults = async (title, consoleShortName) => {
    if (!THEGAMESDB_BASE_URL) throw new Error('TheGamesDB non configurato');
    const consoleObj = getConsoleByName(consoleShortName);
    const params = new URLSearchParams({
      name: title,
      include: 'boxart'
    });
    if (consoleObj?.id) params.set('platform', String(consoleObj.id));

    const apiUrl = `${THEGAMESDB_BASE_URL}/Games/ByGameName?${params}`;
    const res = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
    const ctype = res.headers.get('content-type') || '';
    const txt = await res.text();
    if (!res.ok) throw new Error(`TGDB HTTP ${res.status}: ${txt.slice(0,150)}`);
    if (!ctype.includes('application/json')) throw new Error('TGDB: risposta non-JSON');

    const data = JSON.parse(txt);
    const results = (data.data?.games || []).map(game => {
      const matchedConsole = CONSOLES.find(c => c.id === game.platform);
      return {
        ...game,
        cover_url: tgdbCoverUrl(game.id, data.include),
        _consoleShortName: matchedConsole?.name || '',
        _source: GAME_DATA_SOURCES.TGDB,
        platformName: matchedConsole ? matchedConsole.fullName : 'Unknown Platform',
        uniqueKey: generateUniqueId()
      };
    });

    return sortByBestGameMatch(results, title, consoleShortName);
  };

  const searchIGDBForCoverResults = async (title, consoleShortName) => {
    const safeTitle = escapeIGDBString(title);
    const games = await igdbQuery('games', `
      search "${safeTitle}";
      fields name, first_release_date, platforms.abbreviation, platforms.name, cover.url, category;
      limit 50;
    `);
    if (!Array.isArray(games)) throw new Error('IGDB error');

    const wantedConsole = getConsoleByName(consoleShortName);
    const results = [];
    const EXCLUDED_CATEGORIES = new Set([1, 2, 3, 5, 6, 7, 13, 14]);
    games.filter(g => !EXCLUDED_CATEGORIES.has(g.category)).forEach(g => {
      const coverUrl = igdbCoverUrl(g.cover);
      const releaseYear = g.first_release_date
        ? new Date(g.first_release_date * 1000).getFullYear().toString()
        : '';
      const platforms = g.platforms?.length ? g.platforms : [null];

      platforms.forEach(platform => {
        const consoleObj = mapIGDBPlatformToConsole(platform);
        if (wantedConsole && consoleObj && consoleObj.name !== wantedConsole.name) return;
        results.push({
          id: g.id,
          game_title: g.name,
          platform: consoleObj?.id ?? null,
          _consoleShortName: consoleObj?.name || '',
          _source: GAME_DATA_SOURCES.IGDB,
          platformName: consoleObj?.fullName || platform?.name || 'Unknown Platform',
          cover_url: coverUrl,
          release_date: releaseYear,
          uniqueKey: generateUniqueId()
        });
      });
    });

    return sortByBestGameMatch(results, title, consoleShortName);
  };

  const searchAPIForCover = async (title, consoleShortName, source = apiSearchSource) => {
    setIsSearchingAPI(true);
    setApiSearchResults([]);
    
    try {
      if (source === GAME_DATA_SOURCES.IGDB) {
        const results = await searchIGDBForCoverResults(title, consoleShortName);
        setApiSearchResults(results);
        if (results.length === 0) {
          alert('Nessun risultato trovato su IGDB. Prova a modificare il titolo o rimuovere il filtro console.');
        }
        return;
      }

      if (!THEGAMESDB_BASE_URL) throw new Error('TheGamesDB non configurato');
      const consoleObj = CONSOLES.find(c => c.name === consoleShortName);
      const params = new URLSearchParams({
        name: title,
        include: 'boxart'
      });

      if (consoleObj?.id) params.set('platform', String(consoleObj?.id));

      const apiUrl = `${THEGAMESDB_BASE_URL}/Games/ByGameName?${params}`;
      const res = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
      const ctype = res.headers.get('content-type') || '';
      const txt = await res.text();
      if (!res.ok) throw new Error(`TGDB HTTP ${res.status}: ${txt.slice(0,150)}`);
      if (!ctype.includes('application/json')) throw new Error('TGDB: risposta non-JSON');
      
      const data = JSON.parse(txt);

      if (data.data && data.data.games && data.data.games.length > 0) {
        const gamesWithImages = data.data.games.map(game => {
          let matchedConsole = CONSOLES.find(c => c.id === game.platform);

          // Debug: log platform ID to find correct mapping
          if (!matchedConsole) {
            console.log('🔍 Unknown platform ID:', game.platform, 'for game:', game.game_title);
          }

          return {
            ...game,
            cover_url: tgdbCoverUrl(game.id, data.include),
            _consoleShortName: matchedConsole?.name || '',
            _source: GAME_DATA_SOURCES.TGDB,
            platformName: matchedConsole ? matchedConsole.fullName : 'Unknown Platform',
            uniqueKey: generateUniqueId()
          };
        });
        
        setApiSearchResults(sortByBestGameMatch(gamesWithImages, title, consoleShortName));
        
        if (gamesWithImages.length === 0) {
          alert('Nessun risultato trovato su TheGamesDB. Prova a modificare il titolo o rimuovi il filtro console.');
        }
      } else {
        setApiSearchResults([]);
        alert('Nessun risultato trovato su TheGamesDB. Prova a:\n- Modificare il titolo\n- Rimuovere il filtro console\n- Cercare solo parte del nome');
      }
    } catch (error) {
      console.error('Error searching API:', error);
      alert(`Errore durante la ricerca: ${error.message}\n\nL'API potrebbe essere temporaneamente non disponibile o hai raggiunto il limite di richieste. Attendi qualche secondo e riprova.`);
    } finally {
      setIsSearchingAPI(false);
    }
  };

  const selectCoverFromAPI = (game) => {
    if (editingGame) {
      setEditingGame({
        ...editingGame,
        cover_url: game.cover_url,
        release_date: game.release_date || editingGame.release_date,
        api_id: game.id
      });
    }
    setApiSearchResults([]);
  };

  const selectGameFromSearch = (game) => {
    // _consoleShortName is pre-resolved for IGDB results; fall back to TGDB platform ID lookup
    const consoleName = game._consoleShortName ||
      (CONSOLES.find(c => c.id === game.platform)?.name ?? '');

    setNewGame({
      title: game.game_title,
      console: consoleName,
      version: 'PAL',
      cover_url: game.cover_url || '',
      release_date: game.release_date || '',
      api_id: game.id
    });
    setSearchResults([]);
  };

const addGame = () => {
  if (!newGame.title || !newGame.console) {
    alert('Inserisci almeno titolo e console!');
    return;
  }

  // Check for duplicates (case-insensitive)
  const targetList = addToWishlist ? wishlist : games;
  const duplicate = targetList.find(
    g => g.title.toLowerCase().trim() === newGame.title.toLowerCase().trim() && 
         g.console === newGame.console
  );

  if (duplicate) {
    const confirmAdd = window.confirm(
      `⚠️ DUPLICATO RILEVATO!\n\n` +
      `"${newGame.title}" (${newGame.console}) è già nella tua ${addToWishlist ? 'wishlist' : 'collezione'}.\n\n` +
      `Vuoi aggiungerlo comunque?\n` +
      `(Potrebbe essere un'edizione diversa)`
    );
    
    if (!confirmAdd) {
      return; // User cancelled, don't add
    }
  }

  const gameToAdd = {
    id: generateUniqueId(),
    ...newGame,
    added_date: new Date().toISOString()
  };

  if (addToWishlist) {
    setWishlist([...wishlist, gameToAdd]);
  } else {
    setGames([...games, gameToAdd]);
  }

  setShowAddModal(false);
  setNewGame({
    title: '',
    console: '',
    version: 'PAL',
    cover_url: '',
    release_date: '',
    api_id: null
  });
  setSearchResults([]);
  setAddToWishlist(false);
};

  const deleteGame = useCallback((id, is_wishlist = false) => {
    if (window.confirm('Sei sicuro di voler eliminare questo gioco?')) {
      if (is_wishlist) {
        setWishlist(prev => prev.filter(g => g.id !== id));
      } else {
        setGames(prev => prev.filter(g => g.id !== id));
      }
    }
  }, []);

  const startEdit = (game, is_wishlist = false) => {
    setEditingGame({ ...game, is_wishlist });
    setShowEditModal(true);
    setApiSearchResults([]);
  };

  const saveEdit = () => {
    if (!editingGame.title || !editingGame.console) {
      alert('Inserisci almeno titolo e console!');
      return;
    }

    const cleanEditingGame = sanitizeGameForStorage(editingGame);

    if (editingGame.is_wishlist) {
      setWishlist(wishlist.map(g => g.id === editingGame.id ? cleanEditingGame : g));
    } else {
      setGames(games.map(g => g.id === editingGame.id ? cleanEditingGame : g));
    }

    setShowEditModal(false);
    setEditingGame(null);
    setApiSearchResults([]);
  };

  const moveToCollection = useCallback((game) => {
    setWishlist(prev => prev.filter(g => g.id !== game.id));
    setGames(prev => [...prev, { ...game, added_date: new Date().toISOString() }]);
  }, []);

  const moveToWishlist = useCallback((game) => {
    setGames(prev => prev.filter(g => g.id !== game.id));
    setWishlist(prev => [...prev, game]);
  }, []);

  const exportCSV = () => {
    const csvContent = [
      ['Gioco', 'Console', 'Versione'].join(','),
      ...games.map(game => [
        `"${game.title.replace(/"/g, '""')}"`,
        game.console,
        game.version
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `save-slot-collection-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const importCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const importedGames = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const regex = /("(?:[^"]|"")*"|[^,]+)(?:,|$)/g;
        const fields = [];
        let match;
        while ((match = regex.exec(line)) !== null) {
          let field = match[1];
          if (field.startsWith('"') && field.endsWith('"')) {
            field = field.slice(1, -1).replace(/""/g, '"');
          }
          fields.push(field);
        }

        if (fields.length >= 3) {
          importedGames.push({
            id: generateUniqueId(),
            title: fields[0],
            console: fields[1],
            version: fields[2],
            cover_url: '',
            release_date: '',
            api_id: null
          });
        }
      }

      if (importedGames.length > 0) {
        setGames([...games, ...importedGames]);
        alert(`${importedGames.length} giochi importati con successo!\n\nPuoi aggiungere le copertine modificando ogni gioco e usando "Search API".`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesConsole = !filterConsole || game.console === filterConsole;
      const matchesVersion = !filterVersion || game.version === filterVersion;
      return matchesSearch && matchesConsole && matchesVersion;
    });
  }, [games, searchTerm, filterConsole, filterVersion]);

  const filteredWishlist = useMemo(() => {
    return wishlist.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesConsole = !filterConsole || game.console === filterConsole;
      const matchesVersion = !filterVersion || game.version === filterVersion;
      return matchesSearch && matchesConsole && matchesVersion;
    });
  }, [wishlist, searchTerm, filterConsole, filterVersion]);

  const filteredAnime = useMemo(() => {
    if (!searchTerm) return anime;
    
    const lower = searchTerm.toLowerCase();
    return anime.filter(item => 
      item.title?.toLowerCase().includes(lower) ||
      item.title_english?.toLowerCase().includes(lower)
    );
  }, [anime, searchTerm]);

  // Memoize manga filtrati
  const filteredManga = useMemo(() => {
    if (!searchTerm) return manga;
    
    const lower = searchTerm.toLowerCase();
    return manga.filter(item => 
      item.title?.toLowerCase().includes(lower) ||
      item.title_english?.toLowerCase().includes(lower)
    );
  }, [manga, searchTerm]);

    const animeStats = useMemo(() => {
      if (anime.length === 0) {
        return { completed: 0, watching: 0, planToWatch: 0, dropped: 0, onHold: 0, avgScore: 0 };
      }
      
      const completed = anime.filter(a => a.status === 'completed').length;
      const watching = anime.filter(a => a.status === 'watching').length;
      const planToWatch = anime.filter(a => a.status === 'plan_to_watch').length;
      const dropped = anime.filter(a => a.status === 'dropped').length;
      const onHold = anime.filter(a => a.status === 'on_hold').length;
      
      const scoredAnime = anime.filter(a => a.score > 0);
      const avgScore = scoredAnime.length > 0 
        ? (scoredAnime.reduce((acc, a) => acc + a.score, 0) / scoredAnime.length).toFixed(1)
        : 0;
      
      return { completed, watching, planToWatch, dropped, onHold, avgScore };
    }, [anime]);

    // Memoize manga statistics
    const mangaStats = useMemo(() => {
      if (manga.length === 0) {
        return { completed: 0, reading: 0, planToRead: 0, dropped: 0, onHold: 0, avgScore: 0 };
      }
      
      const completed = manga.filter(m => m.status === 'completed').length;
      const reading = manga.filter(m => m.status === 'reading').length;
      const planToRead = manga.filter(m => m.status === 'plan_to_read').length;
      const dropped = manga.filter(m => m.status === 'dropped').length;
      const onHold = manga.filter(m => m.status === 'on_hold').length;
      
      const scoredManga = manga.filter(m => m.score > 0);
      const avgScore = scoredManga.length > 0 
        ? (scoredManga.reduce((acc, m) => acc + m.score, 0) / scoredManga.length).toFixed(1)
        : 0;
      
      return { completed, reading, planToRead, dropped, onHold, avgScore };
    }, [manga]);

  const totalGames = games.length;
  const totalWishlist = wishlist.length;
  
  const consoleStats = useMemo(() => {
    return CONSOLES.map(console => ({
      name: console.fullName,
      shortName: console.name,
      count: games.filter(g => g.console === console.name).length
    })).filter(stat => stat.count > 0);
  }, [games]);

  const versionStats = useMemo(() => {
    return VERSIONS.map(version => ({
      name: version,
      count: games.filter(g => g.version === version).length
    })).filter(stat => stat.count > 0);
  }, [games]);


  // Show login modal if not authenticated
  if (showLoginModal && !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-sm max-w-md w-full border-4 border-slate-600 shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-4 bg-slate-900 rounded-t-sm"></div>
          <div className="p-6 pt-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-slate-700 rounded-sm border-4 border-slate-600 shadow-xl relative overflow-hidden mb-4">
                <div className="absolute top-0 left-0 right-0 h-3 bg-slate-950"></div>
                <div className="absolute bottom-1 left-1 right-1 h-8 bg-white rounded-sm flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-slate-700" />
                </div>
                <div className="absolute top-1 right-1 w-2 h-3 bg-slate-950"></div>
              </div>
              <h1 className="text-3xl font-black text-white font-mono mb-2">
                💾 SAVE SLOT
              </h1>
              <p className="text-slate-400 text-sm font-mono">v2.0 • User Authentication</p>
            </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log('🔐 [FORM] Submit triggered');
                  handleLogin();
                }}
                className="space-y-4"
              >
              <div>
                <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">Username</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="Enter username"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-amber-600 text-white rounded-sm hover:bg-amber-700 transition-all font-bold border-4 border-amber-500 font-mono text-lg flex items-center justify-center gap-2"
              >
                <User className="w-5 h-5" />
                LOGIN
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-slate-500 text-xs font-mono text-center">
                Non hai l'account? Contatta Bluemoon.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
    
    {/* Badge Notifications - Multiple stacked */}
    <div className="fixed top-24 right-4 z-50 space-y-3">
      {badgeNotifications.map((badge, index) => (
        <div 
          key={badge.notificationId}
          className="bg-gradient-to-br from-amber-500 to-amber-700 text-white p-4 rounded-sm border-4 border-amber-400 shadow-2xl animate-bounce"
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center border-4 border-amber-300 overflow-hidden flex-shrink-0"
              style={{
                backgroundImage: `url(${achievementsImage})`,
                backgroundPosition: badge.imagePosition,
                backgroundSize: '860px 596px',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <div>
              <p className="font-black font-mono text-lg">🏆 UNLOCKED!</p>
              <p className="font-bold font-mono text-amber-100">{badge.name}</p>
              <p className="text-sm text-amber-200 font-mono">{badge.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
      {/* Header */}
      <div className="border-b-4 border-slate-700 bg-slate-900 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-slate-950 to-transparent opacity-70"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-800 rounded-sm border-4 border-slate-600 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-3 sm:h-4 bg-slate-950"></div>
                  <div className="absolute bottom-0.5 sm:bottom-1 left-0.5 sm:left-1 right-0.5 sm:right-1 h-6 sm:h-8 bg-white rounded-sm flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
                  </div>
                  <div className="absolute top-1 right-1 w-1.5 sm:w-2 h-2 sm:h-3 bg-slate-950"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-mono flex items-center gap-2">
                  💾 SAVE SLOT
                </h1>
                  <p className="text-slate-400 text-xs sm:text-sm font-mono hidden sm:flex items-center gap-2">
                    v2.0 © 2025 • {username}'s File #{totalGames}
                    {syncStatus === 'syncing' && <Cloud className="w-3 h-3 animate-pulse text-blue-400" />}
                    {syncStatus === 'synced' && <Cloud className="w-3 h-3 text-green-400" />}
                    {syncStatus === 'error' && <CloudOff className="w-3 h-3 text-red-400" />}
                  </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
              <button
                onClick={handleLogout}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-slate-700 text-white rounded-sm hover:bg-slate-600 transition-all font-bold border-4 border-slate-600 hover:border-slate-500 flex items-center gap-2 font-mono text-xs sm:text-sm"
                title={`Logged in as ${username}`}
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setAddToWishlist(activeTab === 'wishlist');
                }}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-amber-600 text-white rounded-sm hover:bg-amber-700 transition-all font-bold border-4 border-amber-500 hover:border-amber-400 shadow-lg flex items-center gap-2 font-mono text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">ADD</span>
              </button>
              <button
                onClick={exportCSV}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-slate-700 text-white rounded-sm hover:bg-slate-600 transition-all font-bold border-4 border-slate-600 hover:border-slate-500 flex items-center gap-2 font-mono text-xs sm:text-sm"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">CSV</span>
              </button>
              <button
                onClick={() => csvInputRef.current?.click()}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-slate-700 text-white rounded-sm hover:bg-slate-600 transition-all font-bold border-4 border-slate-600 hover:border-slate-500 flex items-center gap-2 font-mono text-xs sm:text-sm"
              >
                <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">IMPORT</span>
              </button>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                onChange={importCSV}
                className="hidden"
              />
              <select
                value={coverUpdateSource}
                onChange={(e) => setCoverUpdateSource(e.target.value)}
                className="px-2 py-2 bg-slate-700 text-white rounded-sm border-4 border-slate-600 font-mono text-xs"
                title="Database per update covers"
              >
                <option value={GAME_DATA_SOURCES.IGDB}>IGDB</option>
                <option value={GAME_DATA_SOURCES.TGDB}>TGDB</option>
              </select>
              <button
                onClick={updateAllCovers}
                disabled={isLoadingPrices || games.length === 0}
                className="px-3 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 transition-all font-bold border-4 border-green-500 font-mono text-xs disabled:opacity-50"
                title="Update all game covers"
              >
                🖼️ UPDATE COVERS
              </button>
              <button
                onClick={() => {
                  setShowSeriesModal(true);
                  setSeriesQuery('');
                  setSeriesResults([]);
                  setSeriesAddedIds(new Set());
                  setSeriesError('');
                  setIgdbCollections([]);
                  setSelectedCollection(null);
                }}
                className="px-3 py-2 bg-teal-600 text-white rounded-sm hover:bg-teal-700 transition-all font-bold border-4 border-teal-500 font-mono text-xs flex items-center gap-1"
                title="Series Tracker - verifica i titoli mancanti"
              >
                <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">SERIES</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-4 sm:mb-6">
                <button
                  onClick={() => setActiveTab('collection')}
                  className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-sm font-bold font-mono transition-all border-4 text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'collection'
                      ? 'bg-slate-700 text-white border-amber-600'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
              <Package className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">GAMES</span> ({totalGames})
            </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-sm font-bold font-mono transition-all border-4 text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'wishlist'
                    ? 'bg-slate-700 text-white border-purple-600'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">WISHLIST</span> ({totalWishlist})
            </button>
            <button
              onClick={() => setActiveTab('anime')}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-sm font-bold font-mono transition-all border-4 text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'anime'
                  ? 'bg-slate-700 text-white border-pink-600'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Star className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">ANIME</span> ({anime.length})
            </button>
            <button
              onClick={() => setActiveTab('manga')}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-sm font-bold font-mono transition-all border-4 text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'manga'
                  ? 'bg-slate-700 text-white border-blue-600'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">MANGA</span> ({manga.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-sm font-bold font-mono transition-all border-4 text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-slate-700 text-white border-slate-600'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              STATS
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - keeping rest of JSX the same, continuing... */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {activeTab !== 'stats' && (
          <>
            <div className="mb-4 sm:mb-6 bg-slate-800 p-3 sm:p-4 rounded-sm border-4 border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="text"
                      placeholder={
                        activeTab === 'collection' ? 'SEARCH GAMES...' :
                        activeTab === 'wishlist' ? 'SEARCH WISHLIST...' :
                        activeTab === 'anime' ? 'SEARCH ANIME...' :
                        activeTab === 'manga' ? 'SEARCH MANGA...' :
                        'SEARCH...'
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-slate-500 font-mono text-sm"
                    />
                  </div>
                </div>
                <select
                  value={filterConsole}
                  onChange={(e) => setFilterConsole(e.target.value)}
                  className="px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-slate-500 font-mono text-xs sm:text-sm"
                >
                  <option value="">ALL CONSOLES</option>
                  {CONSOLES.map(c => (
                    <option key={c.name} value={c.name}>{c.fullName}</option>
                  ))}
                </select>
                <select
                  value={filterVersion}
                  onChange={(e) => setFilterVersion(e.target.value)}
                  className="px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-slate-500 font-mono text-xs sm:text-sm"
                >
                  <option value="">ALL VERSIONS</option>
                  {VERSIONS.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center mt-3 sm:mt-4 gap-2">
                <div className="text-slate-400 font-mono text-xs sm:text-sm">
                  {activeTab === 'collection' 
                    ? `${filteredGames.length} of ${totalGames} games`
                    : `${filteredWishlist.length} of ${totalWishlist} items`
                  }
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-sm border-2 ${
                      viewMode === 'grid'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-sm border-2 ${
                      viewMode === 'list'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <List className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>

            {activeTab === 'collection' && (
              <>
                {filteredGames.length === 0 ? (
                  <div className="text-center py-12 sm:py-16 bg-slate-800 rounded-sm border-4 border-slate-700">
                    <Gamepad2 className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 font-mono text-sm sm:text-base mb-4">NO GAMES IN COLLECTION</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-4 sm:px-6 py-2 bg-amber-600 text-white rounded-sm hover:bg-amber-700 transition-all font-bold border-4 border-amber-500 font-mono text-sm"
                    >
                      ADD YOUR FIRST GAME
                    </button>
                  </div>
                ) : (
  <div className={viewMode === 'grid' 
    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
    : "space-y-3"
  }>
    {filteredGames.map(game => (
      viewMode === 'grid' ? (
        <GameCard
          key={game.id}
          game={game}
          onEdit={startEdit}
          onDelete={deleteGame}
          onMove={moveToWishlist}
          isWishlist={false}
        />
      ) : (
        <div key={game.id} className="bg-slate-800 rounded-sm border-4 border-slate-700 hover:border-slate-600 p-4 transition-all shadow-lg flex items-center gap-4">
          <div className="w-16 h-24 bg-slate-900 rounded overflow-hidden flex-shrink-0">
            {game.cover_url ? (
              <LazyImage src={game.cover_url} alt={game.title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gamepad2 className="w-8 h-8 text-slate-700" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1 truncate font-mono">{game.title}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400 font-mono mb-2">
              <span>{CONSOLE_ICONS[game.console]}</span>
              <span>{game.console}</span>
              {game.version && (
                <span className="px-2 py-0.5 rounded text-xs bg-slate-700">{game.version}</span>
              )}
            </div>
            {game.release_date && (
              <p className="text-xs text-slate-500 font-mono">Released: {game.release_date}</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => startEdit(game, false)}
              className="p-2 bg-blue-600 rounded-sm hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => moveToWishlist(game)}
              className="p-2 bg-purple-600 rounded-sm hover:bg-purple-700 transition-colors"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteGame(game.id, false)}
              className="p-2 bg-red-600 rounded-sm hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )
    ))}
  </div>
                )}
              </>
            )}

            {activeTab === 'wishlist' && (
              <>
                {filteredWishlist.length === 0 ? (
                  <div className="text-center py-12 sm:py-16 bg-slate-800 rounded-sm border-4 border-slate-700">
                    <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 font-mono text-sm sm:text-base mb-4">NO GAMES IN WISHLIST</p>
                    <button
                      onClick={() => {
                        setShowAddModal(true);
                        setAddToWishlist(true);
                      }}
                      className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-sm hover:bg-purple-700 transition-all font-bold border-4 border-purple-500 font-mono text-sm"
                    >
                      ADD TO WISHLIST
                    </button>
                  </div>
                ) : (
<div className={viewMode === 'grid' 
    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
    : "space-y-3"
  }>
    {filteredWishlist.map(game => (
      viewMode === 'grid' ? (
        <GameCard
          key={game.id}
          game={game}
          onEdit={(g) => startEdit(g, true)}
          onDelete={(id) => deleteGame(id, true)}
          onMove={moveToCollection}
          isWishlist={true}
        />
      ) : (
        <div key={game.id} className="bg-slate-800 rounded-sm border-4 border-purple-700 hover:border-purple-600 p-4 transition-all shadow-lg flex items-center gap-4">
          <div className="w-16 h-24 bg-slate-900 rounded overflow-hidden flex-shrink-0 relative">
            {game.cover_url ? (
              <LazyImage src={game.cover_url} alt={game.title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-purple-700" />
              </div>
            )}
            <div className="absolute top-1 right-1 bg-purple-600 rounded-full p-1">
              <Heart className="w-3 h-3 fill-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1 truncate font-mono">{game.title}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400 font-mono mb-2">
              <span>{CONSOLE_ICONS[game.console]}</span>
              <span>{game.console}</span>
              {game.version && (
                <span className="px-2 py-0.5 rounded text-xs bg-purple-700">{game.version}</span>
              )}
            </div>
            {game.release_date && (
              <p className="text-xs text-slate-500 font-mono">Released: {game.release_date}</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => startEdit(game, true)}
              className="p-2 bg-blue-600 rounded-sm hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => moveToCollection(game)}
              className="p-2 bg-green-600 rounded-sm hover:bg-green-700 transition-colors"
            >
              <Star className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteGame(game.id, true)}
              className="p-2 bg-red-600 rounded-sm hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )
    ))}
  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Anime Tab */}
        {activeTab === 'anime' && (
          <>
            <div className="mb-4 sm:mb-6 bg-slate-800 p-3 sm:p-4 rounded-sm border-4 border-pink-700">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-slate-400 font-mono text-sm flex items-center gap-3">
                  <span>{anime.length} anime</span>
                  {anilistUsername && (
                    <span className="text-pink-400">🔗 Connected: {anilistUsername}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!isAnilistConnected ? (
                    <button
                      onClick={loginToAniList}
                      className="px-4 py-2 bg-pink-600 text-white rounded-sm hover:bg-pink-700 transition-all font-bold border-4 border-pink-500 font-mono text-sm flex items-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      Connect AniList
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => importAniListWithToken(anilistToken)}
                        className="px-4 py-2 bg-pink-600 text-white rounded-sm hover:bg-pink-700 transition-all font-bold border-4 border-pink-500 font-mono text-sm flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Sync {anilistUsername}
                      </button>
                      <button
                        onClick={disconnectAniList}
                        className="px-3 py-2 bg-slate-600 text-white rounded-sm hover:bg-slate-700 transition-all font-bold border-4 border-slate-500 font-mono text-sm"
                        title="Disconnect AniList"
                      >
                        🔌
                      </button>
                    </>
                  )}
                  {anilistUsername && (
                    <button
                      onClick={() => {
                        const newUsername = prompt('Cambia username AniList:', anilistUsername);
                        if (newUsername && newUsername !== anilistUsername) {
                          importFromAniList(newUsername);
                        }
                      }}
                      className="px-4 py-2 bg-slate-600 text-white rounded-sm hover:bg-slate-700 transition-all font-bold border-4 border-slate-500 font-mono text-sm"
                      title="Change AniList username"
                    >
                      ⚙️
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddAnimeModal(true)}
                    className="px-4 py-2 bg-amber-600 text-white rounded-sm hover:bg-amber-700 transition-all font-bold border-4 border-amber-500 font-mono text-sm"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Anime
                  </button>
                </div>
              </div>
            </div>

            {anime.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-slate-800 rounded-sm border-4 border-pink-700">
                <Star className="w-12 h-12 sm:w-16 sm:h-16 text-pink-600 mx-auto mb-4" />
                <p className="text-slate-400 font-mono text-sm sm:text-base mb-4">NO ANIME YET</p>
                <button
                  onClick={() => setShowAddAnimeModal(true)}
                  className="px-4 sm:px-6 py-2 bg-pink-600 text-white rounded-sm hover:bg-pink-700 transition-all font-bold border-4 border-pink-500 font-mono text-sm"
                >
                  Add Your First Anime
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 auto-rows-fr items-stretch">
                {filteredAnime.map(item => (
                  <AnimeCard
                    key={item.id}
                    item={item}
                    onClick={() => setShowAnimeDetails(item)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Manga Tab */}
        {activeTab === 'manga' && (
          <>
            <div className="mb-4 sm:mb-6 bg-slate-800 p-3 sm:p-4 rounded-sm border-4 border-blue-700">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-slate-400 font-mono text-sm">
                  {filteredManga.length} manga
                </div>
                <button
                  onClick={() => setShowAddMangaModal(true)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-sm hover:bg-amber-700 transition-all font-bold border-4 border-amber-500 font-mono text-sm"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add Manga
                </button>
              </div>
            </div>

            {filteredManga.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-slate-800 rounded-sm border-4 border-blue-700">
                <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-4" />
                <p className="text-slate-400 font-mono text-sm sm:text-base mb-4">NO MANGA YET</p>
                <button
                  onClick={() => setShowAddMangaModal(true)}
                  className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-all font-bold border-4 border-blue-500 font-mono text-sm"
                >
                  Add Your First Manga
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 auto-rows-fr items-stretch">
                {filteredManga.map(item => (
                  <MangaCard
                    key={item.id}
                    item={item}
                    onClick={() => setShowMangaDetails(item)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-slate-800 rounded-sm border-4 border-slate-700 p-4 sm:p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-3 bg-slate-950"></div>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-slate-400 text-xs sm:text-sm mb-1 font-mono">TOTAL GAMES</p>
                    <p className="text-3xl sm:text-4xl font-black text-white font-mono">{totalGames}</p>
                  </div>
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />
                </div>
              </div>
              <div className="bg-slate-800 rounded-sm border-4 border-purple-700 p-4 sm:p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-3 bg-slate-950"></div>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-slate-400 text-xs sm:text-sm mb-1 font-mono">WISHLIST</p>
                    <p className="text-3xl sm:text-4xl font-black text-white font-mono">{totalWishlist}</p>
                  </div>
                  <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400" />
                </div>
              </div>
            <div className="bg-slate-800 rounded-sm border-4 border-green-700 p-4 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-3 bg-slate-950"></div>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <p className="text-slate-400 text-xs sm:text-sm mb-1 font-mono">COLLECTION VALUE</p>
                  <p className="text-3xl sm:text-4xl font-black text-white font-mono">
                    {isLoadingPrices ? '...' : `$${collectionValue.toFixed(0)}`}
                  </p>
                  <button
                    onClick={calculateCollectionValue}
                    disabled={isLoadingPrices || games.length === 0}
                    className="mt-2 text-xs text-green-400 hover:text-green-300 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingPrices ? '⏳ Loading...' : '🔄 Calculate'}
                  </button>
                </div>
                <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-green-400" />
              </div>
            </div>
              <div className="bg-slate-800 rounded-sm border-4 border-slate-700 p-4 sm:p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-3 bg-slate-950"></div>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-slate-400 text-xs sm:text-sm mb-1 font-mono">CONSOLES</p>
                    <p className="text-3xl sm:text-4xl font-black text-white font-mono">{consoleStats.length}</p>
                  </div>
                  <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-sm border-4 border-slate-700 p-4 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-3 bg-slate-950"></div>
              <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 font-mono mt-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                CONSOLE BREAKDOWN
              </h3>
              {consoleStats.length === 0 ? (
                <p className="text-slate-400 text-center py-6 sm:py-8 font-mono text-sm">No data yet - start adding games!</p>
              ) : (
                <div className="space-y-3">
                  {consoleStats.sort((a, b) => b.count - a.count).map(stat => (
                    <div key={stat.shortName} className="flex items-center gap-3 sm:gap-4">
                      <span className="text-xl sm:text-2xl w-6 sm:w-8">{CONSOLE_ICONS[stat.shortName]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="font-mono text-white text-sm sm:text-base truncate">{stat.name}</span>
                          <span className="font-mono text-slate-400 text-sm ml-2">{stat.count}</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${(stat.count / totalGames) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-800 rounded-sm border-4 border-slate-700 p-4 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-3 bg-slate-950"></div>
              <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 font-mono mt-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                ANIME BREAKDOWN
              </h3>
                <div className="space-y-3">
                  <div className="bg-slate-700 rounded-sm p-3 sm:p-4 border-2 border-pink-600">
                    <p className="text-slate-400 text-xs sm:text-sm mb-1 font-mono">COMPLETED</p>
                    <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {animeStats.completed}
                    </p>
                  </div>
                  <div className="bg-slate-700 rounded-sm p-3 sm:p-4 border-2 border-pink-600">
                    <p className="text-slate-400 text-xs sm:text-sm mb-1 font-mono">WATCHING</p>
                    <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {animeStats.watching}
                    </p>
                  </div>
                  <div className="bg-slate-700 rounded-sm p-3 sm:p-4 border-2 border-pink-600">
                    <p className="text-slate-400 text-xs sm:text-sm mb-1 font-mono">PLAN TO WATCH</p>
                    <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {animeStats.planToWatch}
                    </p>
                  </div>
                  <div className="bg-slate-700 rounded-sm p-3 sm:p-4 border-2 border-amber-600">
                    <p className="text-slate-400 text-xs sm:text-sm mb-1 font-mono">AVG SCORE</p>
                    <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {animeStats.avgScore}
                    </p>
                  </div>
                </div>
            </div>

            <div className="bg-slate-800 rounded-sm border-4 border-slate-700 p-4 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-3 bg-slate-950"></div>
              <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 font-mono mt-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                MANGA BREAKDOWN
              </h3>
                  <div className="bg-slate-700 rounded-sm p-3 sm:p-4 border-2 border-blue-600">
                    <p className="text-slate-400 text-xs sm:text-sm mb-1 font-mono">COMPLETED</p>
                    <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {mangaStats.completed}
                    </p>
                  </div>
                  <div className="bg-slate-700 rounded-sm p-3 sm:p-4 border-2 border-blue-600">
                    <p className="text-slate-400 text-xs sm:text-sm mb-1 font-mono">READING</p>
                    <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {mangaStats.reading}
                    </p>
                  </div>
                  <div className="bg-slate-700 rounded-sm p-3 sm:p-4 border-2 border-blue-600">
                    <p className="text-slate-400 text-xs sm:text-sm mb-1 font-mono">PLAN TO READ</p>
                    <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {mangaStats.planToRead}
                    </p>
                  </div>
                  <div className="bg-slate-700 rounded-sm p-3 sm:p-4 border-2 border-amber-600">
                    <p className="text-slate-400 text-xs sm:text-sm mb-1 font-mono">AVG SCORE</p>
                    <p className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {mangaStats.avgScore}
                    </p>
                  </div>
            </div>

        {/* Achievements Section */}
        <div className="bg-slate-800 rounded-sm border-4 border-amber-700 p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-3 bg-slate-950"></div>
          <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 font-mono mt-2">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            ACHIEVEMENTS ({unlockedBadges.length}/{ACHIEVEMENTS.length})
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {ACHIEVEMENTS.map(achievement => {
              const isUnlocked = unlockedBadges.includes(achievement.id);
              return (
                <div 
                  key={achievement.id}
                  className={`relative group ${isUnlocked ? 'opacity-100' : 'opacity-30 grayscale'}`}
                  title={achievement.desc}
                >
                  <div 
                    className="w-full aspect-square rounded-sm border-4 transition-all"
                    style={{
                      backgroundImage: `url(${achievement.image})`,
                      backgroundPosition: achievement.imagePosition,
                      backgroundSize: '860px 596px',
                      backgroundRepeat: 'no-repeat',
                      borderColor: isUnlocked ? '#f59e0b' : '#475569'
                    }}
                  />
                  <div className="mt-2 text-center">
                    <p className="text-xs font-bold font-mono text-white truncate">{achievement.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{achievement.desc}</p>
                  </div>
                  {isUnlocked && (
                    <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-amber-300">
                      <span className="text-xs">✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
            {versionStats.length > 0 && (
              <div className="bg-slate-800 rounded-sm border-4 border-slate-700 p-4 sm:p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-3 bg-slate-950"></div>
                <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 font-mono mt-2">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6" />
                  VERSION DISTRIBUTION
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {versionStats.map(stat => (
                    <div key={stat.name} className="bg-slate-700 rounded-sm p-3 sm:p-4 border-2 border-slate-600">
                      <p className="text-slate-400 text-xs sm:text-sm mb-1 font-mono">{stat.name}</p>
                      <p className="text-2xl sm:text-3xl font-black text-white font-mono">{stat.count}</p>
                      <p className="text-slate-500 text-xs mt-1 font-mono">
                        {((stat.count / totalGames) * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Modal - Continuing in next part due to character limit... */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-800 rounded-sm max-w-4xl w-full border-4 border-slate-600 shadow-2xl my-8 relative max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 left-0 right-0 h-3 sm:h-4 bg-slate-900 rounded-t-sm"></div>
              <div className="p-4 sm:p-6 pt-6 sm:pt-8">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 font-mono">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                    {addToWishlist ? 'ADD TO WISHLIST' : 'ADD GAME'}
                  </h2>
                  <button onClick={() => {
                    setShowAddModal(false);
                    setNewGame({
                      title: '',
                      console: '',
                      version: 'PAL',
                      cover_url: '',
                      release_date: '',
                      api_id: null
                    });
                    setSearchResults([]);
                    setAddToWishlist(false);
                  }} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-amber-400 text-sm font-semibold font-mono">SEARCH DATABASE</label>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-mono text-xs mr-1">fonte:</span>
                      <button
                        type="button"
                        onClick={() => { setUseIGDBSearch(false); setSearchResults([]); }}
                        className={`px-2 py-0.5 font-mono text-xs rounded-sm border font-bold transition-colors ${
                          !useIGDBSearch ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-white'
                        }`}
                        title="TheGamesDB — ricerca con filtro piattaforma"
                      >TGDB</button>
                      <button
                        type="button"
                        onClick={() => { setUseIGDBSearch(true); setSearchResults([]); }}
                        className={`px-2 py-0.5 font-mono text-xs rounded-sm border font-bold transition-colors ${
                          useIGDBSearch ? 'bg-teal-600 border-teal-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-white'
                        }`}
                        title="IGDB — database più completo, cover migliori"
                      >IGDB</button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {!useIGDBSearch && (
                      <select
                        onChange={(e) => {
                          setNewGame({ ...newGame, console: e.target.value });
                        }}
                        className="px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-amber-500 font-mono text-sm"
                        value={newGame.console}
                      >
                        <option value="">All Platforms</option>
                        {CONSOLES.map(c => (
                          <option key={c.name} value={c.name}>{c.fullName}</option>
                        ))}
                      </select>
                    )}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type="text"
                        placeholder={useIGDBSearch ? 'Search on IGDB (200k+ games)...' : 'Search game title...'}
                        onChange={(e) => {
                          const query = e.target.value;
                          if (query.length >= 2) {
                            if (useIGDBSearch) {
                              igdbSearchGames(query);
                            } else {
                              const consoleObj = CONSOLES.find(c => c.name === newGame.console);
                              searchGames(query, consoleObj?.id);
                            }
                          } else {
                            setSearchResults([]);
                          }
                        }}
                        className={`w-full pl-9 sm:pl-10 pr-4 py-2 bg-slate-700 text-white rounded-sm border-2 focus:outline-none font-mono text-sm ${
                          useIGDBSearch
                            ? 'border-teal-700 focus:border-teal-500'
                            : 'border-slate-600 focus:border-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                  
                  {isSearching && (
                    <div className="mt-4 text-center py-4 bg-slate-700 rounded-sm border-2 border-slate-600">
                      <p className="text-slate-400 font-mono text-sm">Searching...</p>
                    </div>
                  )}
                  
                  {searchResults.length > 0 && (
                    <div className="mt-4 max-h-48 sm:max-h-64 overflow-y-auto bg-slate-700 rounded-sm border-2 border-slate-600">
                      {searchResults.map(game => (
                        <button
                          key={game.uniqueKey}
                          onClick={() => selectGameFromSearch(game)}
                          className="w-full p-3 hover:bg-slate-600 transition-colors text-left flex items-center gap-3 border-b border-slate-600 last:border-0"
                        >
                          {game.cover_url ? (
                            <LazyImage src={game.cover_url} alt={game.game_title} className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded" />
                          ) : (
                            <div className="w-10 h-14 sm:w-12 sm:h-16 bg-slate-800 rounded flex items-center justify-center">
                              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate font-mono text-sm">{game.game_title}</p>
                            <p className="text-xs sm:text-sm text-slate-400 font-mono">{game.platformName}</p>
                            {game.release_date && (
                              <p className="text-xs text-slate-500 font-mono">{game.release_date}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-slate-700 pt-4 sm:pt-6 mb-4 sm:mb-6">
                  <p className="text-slate-400 text-sm mb-4 font-mono">OR ADD MANUALLY:</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                      Titolo *
                    </label>
                    <input
                      type="text"
                      value={newGame.title}
                      onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-amber-500 font-mono text-sm"
                      placeholder="Es: The Last of Us"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                      Console *
                    </label>
                    <select
                      value={newGame.console}
                      onChange={(e) => setNewGame({ ...newGame, console: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-amber-500 font-mono text-sm"
                    >
                      <option value="">Seleziona console</option>
                      {CONSOLES.map(c => (
                        <option key={c.name} value={c.name}>{c.fullName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                      Versione
                    </label>
                    <select
                      value={newGame.version}
                      onChange={(e) => setNewGame({ ...newGame, version: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-amber-500 font-mono text-sm"
                    >
                      {VERSIONS.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                      URL Copertina
                    </label>
                    <input
                      type="text"
                      value={newGame.cover_url}
                      onChange={(e) => setNewGame({ ...newGame, cover_url: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-amber-500 font-mono text-sm"
                      placeholder="https://..."
                    />
                  </div>

                </div>

                {newGame.cover_url && (
                  <div className="mt-4">
                    <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                      PREVIEW
                    </label>
                    <div className="w-24 h-32 sm:w-32 sm:h-44 bg-slate-900 rounded overflow-hidden border-2 border-slate-600">
                      <LazyImage src={newGame.cover_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={addGame}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 text-white rounded-sm hover:bg-slate-600 transition-all font-bold border-4 border-slate-600 hover:border-slate-500 font-mono text-sm"
                  >
                    {addToWishlist ? '💜 ADD TO WISHLIST' : '💾 ADD TO COLLECTION'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewGame({
                        title: '',
                        console: '',
                        version: 'PAL',
                        cover_url: '',
                        release_date: '',
                        api_id: null
                      });
                      setSearchResults([]);
                      setAddToWishlist(false);
                    }}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-900 text-slate-400 rounded-sm hover:bg-slate-800 transition-colors border-4 border-slate-700 font-mono text-sm"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal with proper API search */}
        {showEditModal && editingGame && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-800 rounded-sm max-w-2xl w-full border-4 border-slate-600 shadow-2xl my-8 relative max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 left-0 right-0 h-3 sm:h-4 bg-slate-900 rounded-t-sm"></div>
              <div className="p-4 sm:p-6 pt-6 sm:pt-8">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 font-mono">
                    <Edit2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    EDIT GAME
                  </h2>
                  <button onClick={() => {
                    setShowEditModal(false);
                    setEditingGame(null);
                    setApiSearchResults([]);
                  }} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="mb-4 sm:mb-6 bg-slate-700 p-3 sm:p-4 rounded-sm border-2 border-slate-600">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <p className="text-amber-400 text-sm font-mono font-semibold">FIND COVER FROM API</p>
                    <div className="flex items-center gap-2">
                      <select
                        value={apiSearchSource}
                        onChange={(e) => {
                          setApiSearchSource(e.target.value);
                          setApiSearchResults([]);
                        }}
                        className="px-2 py-1.5 bg-slate-800 text-white rounded-sm border-2 border-slate-600 font-mono text-xs"
                      >
                        <option value={GAME_DATA_SOURCES.IGDB}>IGDB</option>
                        <option value={GAME_DATA_SOURCES.TGDB}>TGDB</option>
                      </select>
                      <button
                        onClick={() => searchAPIForCover(editingGame.title, editingGame.console, apiSearchSource)}
                        disabled={!editingGame.title || !editingGame.console || isSearchingAPI}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-all font-bold border-2 border-blue-500 font-mono text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isSearchingAPI ? 'animate-spin' : ''}`} />
                        {isSearchingAPI ? 'SEARCHING...' : 'SEARCH API'}
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs font-mono">
                    Cerca copertine e info su {apiSearchSource === GAME_DATA_SOURCES.IGDB ? 'IGDB' : 'TheGamesDB'} per questo gioco
                  </p>
                </div>

                {apiSearchResults.length > 0 && (
                  <div className="mb-4 sm:mb-6 max-h-48 overflow-y-auto bg-slate-700 rounded-sm border-2 border-slate-600">
                    <p className="text-amber-400 text-sm font-mono font-semibold p-3 border-b border-slate-600">
                      SELECT A COVER:
                    </p>
                    {apiSearchResults.map(game => (
                      <button
                        key={game.uniqueKey}
                        onClick={() => selectCoverFromAPI(game)}
                        className="w-full p-3 hover:bg-slate-600 transition-colors text-left flex items-center gap-3 border-b border-slate-600 last:border-0"
                      >
                        {game.cover_url ? (
                          <LazyImage src={game.cover_url} alt={game.game_title} className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-14 sm:w-12 sm:h-16 bg-slate-800 rounded flex items-center justify-center">
                            <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate font-mono text-sm">{game.game_title}</p>
                          <p className="text-xs sm:text-sm text-slate-400 font-mono">{game.platformName}</p>
                          {game.release_date && (
                            <p className="text-xs text-slate-500 font-mono">{game.release_date}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                      Titolo *
                    </label>
                    <input
                      type="text"
                      value={editingGame.title}
                      onChange={(e) => setEditingGame({ ...editingGame, title: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-amber-500 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                      Console *
                    </label>
                    <select
                      value={editingGame.console}
                      onChange={(e) => setEditingGame({ ...editingGame, console: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-amber-500 font-mono text-sm"
                    >
                      <option value="">Seleziona console</option>
                      {CONSOLES.map(c => (
                        <option key={c.name} value={c.name}>{c.fullName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                      Versione
                    </label>
                    <select
                      value={editingGame.version}
                      onChange={(e) => setEditingGame({ ...editingGame, version: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-amber-500 font-mono text-sm"
                    >
                      {VERSIONS.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                      URL Copertina
                    </label>
                    <input
                      type="text"
                      value={editingGame.cover_url}
                      onChange={(e) => setEditingGame({ ...editingGame, cover_url: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-amber-500 font-mono text-sm"
                      placeholder="https://..."
                    />
                  </div>

                </div>

                {editingGame.cover_url && (
                  <div className="mt-4">
                    <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                      CURRENT COVER
                    </label>
                    <div className="w-24 h-32 sm:w-32 sm:h-44 bg-slate-900 rounded overflow-hidden border-2 border-slate-600">
                      <LazyImage src={editingGame.cover_url} alt="Current cover" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={saveEdit}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 text-white rounded-sm hover:bg-slate-600 transition-all font-bold border-4 border-slate-600 hover:border-slate-500 font-mono text-sm"
                  >
                    💾 SAVE CHANGES
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingGame(null);
                      setApiSearchResults([]);
                    }}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-900 text-slate-400 rounded-sm hover:bg-slate-800 transition-colors border-4 border-slate-700 font-mono text-sm"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Anime Details Modal */}
        {showAnimeDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-800 rounded-sm max-w-3xl w-full border-4 border-pink-600 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 left-0 right-0 h-3 sm:h-4 bg-slate-900 rounded-t-sm"></div>
              
              {showAnimeDetails.banner_url && (
                <div className="h-48 overflow-hidden">
                  <LazyImage src={showAnimeDetails.banner_url} alt="" className="w-full h-full object-cover opacity-50" />
                </div>
              )}
              
              <div className="p-6 pt-8">
                <button
                  onClick={() => setShowAnimeDetails(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex gap-6 mb-6">
                  <div className="flex-shrink-0">
                    <LazyImage 
                      src={showAnimeDetails.cover_url} 
                      alt={showAnimeDetails.title}
                      className="w-48 h-64 object-cover rounded-sm border-4 border-pink-600"
                    />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-white font-mono mb-2">
                      {showAnimeDetails.title}
                    </h2>
                    {/* Sync Status Badge */}
                    <div className="flex gap-2 mb-4">
                      {showAnimeDetails.anilist_entry_id ? (
                        <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-mono font-bold flex items-center gap-1">
                          ✓ Synced to AniList
                        </span>
                      ) : showAnimeDetails.anilist_id ? (
                        <span className="px-3 py-1 bg-amber-600 text-white rounded-full text-xs font-mono font-bold flex items-center gap-1">
                          ⏳ Will sync on update
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-600 text-white rounded-full text-xs font-mono font-bold flex items-center gap-1">
                          ✗ Not on AniList
                        </span>
                      )}
                    </div>
                    {showAnimeDetails.title_english && showAnimeDetails.title_english !== showAnimeDetails.title && (
                      <p className="text-slate-400 font-mono mb-4">{showAnimeDetails.title_english}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-700 p-3 rounded-sm">
                        <p className="text-slate-400 text-xs font-mono">FORMAT</p>
                        <p className="text-white font-bold font-mono">{showAnimeDetails.format}</p>
                      </div>
                      <div className="bg-slate-700 p-3 rounded-sm">
                        <p className="text-slate-400 text-xs font-mono">EPISODES</p>
                        <p className="text-white font-bold font-mono">{showAnimeDetails.episodes || '?'}</p>
                      </div>
                      <div className="bg-slate-700 p-3 rounded-sm">
                        <p className="text-slate-400 text-xs font-mono">YEAR</p>
                        <p className="text-white font-bold font-mono">{showAnimeDetails.year || '?'}</p>
                      </div>
                      <div className="bg-slate-700 p-3 rounded-sm">
                        <p className="text-slate-400 text-xs font-mono">SEASON</p>
                        <p className="text-white font-bold font-mono">{showAnimeDetails.season || '?'}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 mb-4">
                        <select
                          value={showAnimeDetails.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            const updated = { ...showAnimeDetails, status: newStatus };
                            
                            console.log('📝 [AnimeModal] Changing status to:', newStatus);
                            
                            setAnime(anime.map(a => a.id === updated.id ? updated : a));
                            setShowAnimeDetails(updated);
                            
                            // Save to database
                            await supabase
                              .from('anime')
                              .update({ status: newStatus })
                              .eq('id', updated.id);
                            
                            // Sync to AniList if connected
                            if (isAnilistConnected && anilistToken) {
                              console.log('🔄 [AnimeModal] Syncing to AniList...');
                              const success = await updateAnimeOnAniList(updated);
                              if (success) {
                                console.log('✅ [AnimeModal] Synced to AniList');
                              } else {
                                console.warn('⚠️ [AnimeModal] Failed to sync to AniList');
                              }
                            }
                          }}
                        className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-pink-600 focus:outline-none font-mono text-sm"
                      >
                        <option value="watching">Watching</option>
                        <option value="completed">Completed</option>
                        <option value="plan_to_watch">Plan to Watch</option>
                        <option value="dropped">Dropped</option>
                        <option value="on_hold">On Hold</option>
                      </select>

                      <select
                        value={showAnimeDetails.score}
                        onChange={async (e) => {
                          const newScore = parseInt(e.target.value);
                          const updated = { ...showAnimeDetails, score: newScore };
                          
                          setAnime(anime.map(a => a.id === updated.id ? updated : a));
                          setShowAnimeDetails(updated);
                          
                          await supabase
                            .from('anime')
                            .update({ score: newScore })
                            .eq('id', updated.id);
                          
                          // Sync to AniList
                            if (isAnilistConnected && anilistToken) {
                              console.log('🔄 [AnimeModal] Syncing to AniList...');
                              const success = await updateAnimeOnAniList(updated);
                              if (success) {
                                console.log('✅ [AnimeModal] Synced to AniList');
                              } else {
                                console.warn('⚠️ [AnimeModal] Failed to sync to AniList');
                              }
                            }
                        }}
                        className="w-24 px-4 py-2 bg-amber-600 text-white rounded-sm border-2 border-amber-500 focus:outline-none font-mono text-sm font-bold"
                      >
                        <option value="0">⭐ 0</option>
                        <option value="1">⭐ 1</option>
                        <option value="2">⭐ 2</option>
                        <option value="3">⭐ 3</option>
                        <option value="4">⭐ 4</option>
                        <option value="5">⭐ 5</option>
                        <option value="6">⭐ 6</option>
                        <option value="7">⭐ 7</option>
                        <option value="8">⭐ 8</option>
                        <option value="9">⭐ 9</option>
                        <option value="10">⭐ 10</option>
                      </select>
                    </div>

                    {showAnimeDetails.genres && showAnimeDetails.genres.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {showAnimeDetails.genres.map(genre => (
                          <span key={genre} className="px-3 py-1 bg-pink-600 text-white rounded-full text-xs font-mono">
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                <button
                  onClick={async () => {
                    const confirmMessage = showAnimeDetails.anilist_entry_id
                      ? `Eliminare "${showAnimeDetails.title}"?\n\n⚠️ Verrà rimosso anche da AniList!`
                      : `Eliminare "${showAnimeDetails.title}"?`;
                    
                    if (window.confirm(confirmMessage)) {
                      console.log('🗑️ [Delete Anime] Starting deletion:', showAnimeDetails.title);
                      
                      // Delete from local state
                      setAnime(anime.filter(a => a.id !== showAnimeDetails.id));
                      
                      // Delete from database
                      await supabase.from('anime').delete().eq('id', showAnimeDetails.id);
                      console.log('✅ [Delete Anime] Deleted from database');
                      
                      // Delete from AniList if connected and has entry_id
                      if (isAnilistConnected && anilistToken && showAnimeDetails.anilist_entry_id) {
                        console.log('🔄 [Delete Anime] Deleting from AniList...');
                        const success = await deleteAnimeFromAniList(showAnimeDetails);
                        if (success) {
                          console.log('✅ [Delete Anime] Deleted from AniList');
                        } else {
                          console.warn('⚠️ [Delete Anime] Failed to delete from AniList (already deleted or not found)');
                        }
                      }
                      
                      setShowAnimeDetails(null);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-all font-bold border-4 border-red-500 font-mono"
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Delete
                </button>
                  {showAnimeDetails.anilist_id && (
                    <a
                      href={`https://anilist.co/anime/${showAnimeDetails.anilist_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-sm hover:bg-pink-700 transition-all font-bold border-4 border-pink-500 font-mono text-center"
                    >
                      View on AniList
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manga Details Modal */}
        {showMangaDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-800 rounded-sm max-w-3xl w-full border-4 border-blue-600 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 left-0 right-0 h-3 sm:h-4 bg-slate-900 rounded-t-sm"></div>
              
              {showMangaDetails.banner_url && (
                <div className="h-48 overflow-hidden">
                  <img src={showMangaDetails.banner_url} alt="" className="w-full h-full object-cover opacity-50" />
                </div>
              )}
              
              <div className="p-6 pt-8">
                <button
                  onClick={() => setShowMangaDetails(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex gap-6 mb-6">
                  <div className="flex-shrink-0">
                    <img 
                      src={showMangaDetails.cover_url} 
                      alt={showMangaDetails.title}
                      className="w-48 h-64 object-cover rounded-sm border-4 border-blue-600"
                    />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-white font-mono mb-2">
                      {showMangaDetails.title}
                    </h2>
                    
                    {/* Sync Status Badge */}
                    <div className="flex gap-2 mb-4">
                      {showMangaDetails.anilist_entry_id ? (
                        <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-mono font-bold">
                          ✓ Synced to AniList
                        </span>
                      ) : showMangaDetails.anilist_id ? (
                        <span className="px-3 py-1 bg-amber-600 text-white rounded-full text-xs font-mono font-bold">
                          ⏳ Will sync on update
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-600 text-white rounded-full text-xs font-mono font-bold">
                          ✗ Not on AniList
                        </span>
                      )}
                    </div>
                    
                    {showMangaDetails.title_english && showMangaDetails.title_english !== showMangaDetails.title && (
                      <p className="text-slate-400 font-mono mb-4">{showMangaDetails.title_english}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-700 p-3 rounded-sm">
                        <p className="text-slate-400 text-xs font-mono">TYPE</p>
                        <p className="text-white font-bold font-mono">{showMangaDetails.type || 'MANGA'}</p>
                      </div>
                      <div className="bg-slate-700 p-3 rounded-sm">
                        <p className="text-slate-400 text-xs font-mono">VOLUMES</p>
                        <p className="text-white font-bold font-mono">{showMangaDetails.volumes || '?'}</p>
                      </div>
                      <div className="bg-slate-700 p-3 rounded-sm">
                        <p className="text-slate-400 text-xs font-mono">CHAPTERS</p>
                        <p className="text-white font-bold font-mono">{showMangaDetails.chapters || '?'}</p>
                      </div>
                      <div className="bg-slate-700 p-3 rounded-sm">
                        <p className="text-slate-400 text-xs font-mono">YEAR</p>
                        <p className="text-white font-bold font-mono">{showMangaDetails.year || '?'}</p>
                      </div>
                    </div>

                    {showMangaDetails.author && (
                      <div className="bg-slate-700 p-3 rounded-sm mb-4">
                        <p className="text-slate-400 text-xs font-mono">AUTHOR</p>
                        <p className="text-white font-bold font-mono">{showMangaDetails.author}</p>
                      </div>
                    )}

                    <div className="flex gap-3 mb-4">
                      <select
                        value={showMangaDetails.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          const updated = { ...showMangaDetails, status: newStatus };
                          
                          console.log('📝 [MangaModal] Changing status to:', newStatus);
                          
                          setManga(manga.map(m => m.id === updated.id ? updated : m));
                          setShowMangaDetails(updated);
                          
                          await supabase
                            .from('manga')
                            .update({ status: newStatus })
                            .eq('id', updated.id);
                          
                          if (isAnilistConnected && anilistToken) {
                            console.log('🔄 [MangaModal] Syncing to AniList...');
                            const success = await updateMangaOnAniList(updated);
                            if (success) {
                              console.log('✅ [MangaModal] Synced to AniList');
                            }
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-blue-600 focus:outline-none font-mono text-sm"
                      >
                        <option value="reading">Reading</option>
                        <option value="completed">Completed</option>
                        <option value="plan_to_read">Plan to Read</option>
                        <option value="dropped">Dropped</option>
                        <option value="on_hold">On Hold</option>
                      </select>

                      <select
                        value={showMangaDetails.score}
                        onChange={async (e) => {
                          const newScore = parseInt(e.target.value);
                          const updated = { ...showMangaDetails, score: newScore };
                          
                          setManga(manga.map(m => m.id === updated.id ? updated : m));
                          setShowMangaDetails(updated);
                          
                          await supabase
                            .from('manga')
                            .update({ score: newScore })
                            .eq('id', updated.id);
                          
                          if (isAnilistConnected && anilistToken) {
                            await updateMangaOnAniList(updated);
                          }
                        }}
                        className="w-24 px-4 py-2 bg-amber-600 text-white rounded-sm border-2 border-amber-500 focus:outline-none font-mono text-sm font-bold"
                      >
                        <option value="0">⭐ 0</option>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <option key={n} value={n}>⭐ {n}</option>
                        ))}
                      </select>
                    </div>

                    {showMangaDetails.genres && showMangaDetails.genres.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {showMangaDetails.genres.map(genre => (
                          <span key={genre} className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-mono">
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      const confirmMessage = showMangaDetails.anilist_entry_id
                        ? `Eliminare "${showMangaDetails.title}"?\n\n⚠️ Verrà rimosso anche da AniList!`
                        : `Eliminare "${showMangaDetails.title}"?`;
                      
                      if (window.confirm(confirmMessage)) {
                        console.log('🗑️ [Delete Manga] Starting deletion');
                        
                        setManga(manga.filter(m => m.id !== showMangaDetails.id));
                        await supabase.from('manga').delete().eq('id', showMangaDetails.id);
                        
                        if (isAnilistConnected && anilistToken && showMangaDetails.anilist_entry_id) {
                          console.log('🔄 [Delete Manga] Deleting from AniList...');
                          const success = await deleteMangaFromAniList(showMangaDetails);
                          if (success) {
                            console.log('✅ [Delete Manga] Deleted from AniList');
                          }
                        }
                        
                        setShowMangaDetails(null);
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-all font-bold border-4 border-red-500 font-mono"
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    Delete
                  </button>
                  {showMangaDetails.anilist_id && (
                    <a
                      href={`https://anilist.co/manga/${showMangaDetails.anilist_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-all font-bold border-4 border-blue-500 font-mono text-center"
                    >
                      View on AniList
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Series Tracker Modal */}
      {showSeriesModal && (() => {
        const normalize = (s) => normalizeGameTitle(s);
        const baseTitle = (s) => normalize(s).replace(/\s*[:\-–([].*/u, '').trim();
        const titleMatches = (a, b) => {
          const na = normalize(a), nb = normalize(b);
          return na === nb || (baseTitle(a).length >= 6 && baseTitle(a) === baseTitle(b));
        };
        const isOwned = (title) => games.some(g => titleMatches(title, g.title));
        const isWishlisted = (title) => !isOwned(title) && wishlist.some(g => titleMatches(title, g.title));

        const quickAddToWishlist = (item) => {
          const gameToAdd = {
            id: generateUniqueId(),
            user_id: userId,
            title: item.title,
            console: item.platformCandidates?.[0]?.name || '',
            version: 'PAL',
            cover_url: item.cover_url,
            release_date: item.year ? String(item.year) : '',
            api_id: item.igdbId || null,
            is_wishlist: true,
            added_date: new Date().toISOString()
          };
          setWishlist(prev => [...prev, gameToAdd]);
          setSeriesAddedIds(prev => new Set([...prev, item.igdbId]));
        };

        // seriesResults already deduplicated by title by processIGDBGames
        const sorted = [...seriesResults].sort((a, b) => {
          const rankA = isOwned(a.title) ? 0 : isWishlisted(a.title) ? 1 : 2;
          const rankB = isOwned(b.title) ? 0 : isWishlisted(b.title) ? 1 : 2;
          if (rankA !== rankB) return rankA - rankB;
          return (a.year || 9999) - (b.year || 9999);
        });

        const localOnly = seriesQuery.trim().length >= 2
          ? games.filter(g =>
              normalize(g.title).includes(normalize(seriesQuery)) &&
              !seriesResults.some(r => titleMatches(r.title, g.title))
            )
          : [];

        const ownedCount = seriesResults.filter(r => isOwned(r.title)).length + localOnly.length;
        const wishlistCount = seriesResults.filter(r => isWishlisted(r.title)).length;
        const missingCount = seriesResults.filter(r => !isOwned(r.title) && !isWishlisted(r.title)).length;

        const GameRow = ({ item, owned, wishlisted, added, fromLocal }) => (
          <div className={`flex items-center gap-3 p-2 rounded-sm border-2 transition-colors ${
            owned ? 'border-green-700 bg-green-900 bg-opacity-20'
            : wishlisted ? 'border-purple-700 bg-purple-900 bg-opacity-20'
            : 'border-slate-700 bg-slate-700 bg-opacity-30'
          }`}>
            <div className="w-10 h-14 flex-shrink-0 bg-slate-700 rounded-sm overflow-hidden border border-slate-600">
              {item.cover_url
                ? <img src={item.cover_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                : <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">🎮</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-mono text-sm font-bold truncate">{item.title}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                {item.year && <span className="text-slate-500 font-mono text-xs">{item.year}</span>}
                {!fromLocal && item.platforms?.length > 0 && (
                  <span className="text-slate-400 font-mono text-xs truncate">
                    {item.platforms.slice(0, 5).join(' · ')}
                    {item.platforms.length > 5 ? ` +${item.platforms.length - 5}` : ''}
                  </span>
                )}
                {fromLocal && <span className="text-slate-400 font-mono text-xs">{item.console}</span>}
              </div>
            </div>
            <div className="flex-shrink-0">
              {owned
                ? <span className="px-2 py-1 bg-green-700 text-green-200 rounded-sm font-mono text-xs font-bold">✓ OWNED</span>
                : wishlisted || added
                ? <span className="px-2 py-1 bg-purple-700 text-purple-200 rounded-sm font-mono text-xs font-bold">❤ WL</span>
                : <button
                    onClick={() => quickAddToWishlist(item)}
                    className="px-2 py-1 bg-slate-600 hover:bg-purple-700 text-slate-300 hover:text-white rounded-sm font-mono text-xs font-bold border border-slate-500 hover:border-purple-500 transition-colors"
                  >+ WL</button>
              }
            </div>
          </div>
        );

        return (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-sm w-full max-w-2xl border-4 border-slate-600 shadow-2xl relative flex flex-col max-h-[90vh]">
              <div className="absolute top-0 left-0 right-0 h-3 bg-slate-900 rounded-t-sm"></div>

              {/* Header */}
              <div className="p-5 pt-7 border-b-4 border-slate-700 flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
                    <Layers className="w-5 h-5 text-teal-400" />
                    SERIES TRACKER
                    <span className="text-xs text-teal-600 font-normal">via IGDB</span>
                  </h2>
                  <button onClick={() => setShowSeriesModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={seriesQuery}
                    onChange={(e) => setSeriesQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && seriesQuery.trim().length >= 2) searchSeriesGames(seriesQuery);
                    }}
                    placeholder="Es: Tales of, Atelier, Final Fantasy, Persona..."
                    className="flex-1 px-3 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-teal-500 font-mono text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => searchSeriesGames(seriesQuery)}
                    disabled={seriesQuery.trim().length < 2 || isSearchingSeries}
                    className="px-4 py-2 bg-teal-600 text-white rounded-sm hover:bg-teal-700 transition-all font-bold border-4 border-teal-500 font-mono text-sm disabled:opacity-50"
                  >
                    {isSearchingSeries ? '⏳' : '🔍'}
                  </button>
                  {(seriesResults.length > 0 || igdbCollections.length > 0 || seriesQuery) && !isSearchingSeries && (
                    <button
                      onClick={() => {
                        setSeriesResults([]);
                        setSeriesQuery('');
                        setIgdbCollections([]);
                        setSelectedCollection(null);
                      }}
                      className="px-3 py-2 bg-slate-700 text-slate-400 hover:text-white rounded-sm border-2 border-slate-600 font-mono text-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Collection/franchise picker — shown when IGDB returns multiple matches */}
                {igdbCollections.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-slate-400 font-mono text-xs">Più serie trovate — scegli:</p>
                    {igdbCollections.map(col => (
                      <button
                        key={`${col._type}-${col.id}`}
                        onClick={() => {
                          setSelectedCollection(col);
                          setIgdbCollections([]);
                          searchSeriesGames(seriesQuery, `${col._type}:${col.id}`);
                        }}
                        className="w-full text-left px-3 py-2 bg-slate-700 hover:bg-teal-700 text-white rounded-sm border border-slate-600 hover:border-teal-500 font-mono text-sm transition-colors"
                      >
                        {col.name}
                        <span className="text-slate-500 text-xs ml-2">
                          {col._type === 'franchise' ? '[franchise]' : '[collection]'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedCollection && seriesResults.length > 0 && (
                  <p className="mt-2 text-teal-400 font-mono text-xs">
                    Serie: <span className="font-bold">{selectedCollection.name}</span>
                    {selectedCollection._type && (
                      <span className="text-slate-500 ml-1">({selectedCollection._type})</span>
                    )}
                  </p>
                )}

                {seriesError && (
                  <div className="mt-3 px-3 py-2 bg-red-900 bg-opacity-50 border border-red-700 rounded-sm text-red-300 font-mono text-xs">
                    ⚠ {seriesError}
                  </div>
                )}

                {(seriesResults.length > 0 || localOnly.length > 0) && (
                  <div className="flex flex-wrap gap-3 mt-3 text-xs font-mono items-center">
                    <span className="text-green-400">✓ {ownedCount} posseduti</span>
                    <span className="text-purple-400">❤ {wishlistCount} wishlist</span>
                    <span className="text-slate-400">✗ {missingCount} mancanti</span>
                    <span className="text-slate-500 ml-auto">{seriesResults.length} titoli IGDB</span>
                  </div>
                )}
              </div>

              {/* Results */}
              <div className="overflow-y-auto flex-1 p-3 space-y-2">
                {isSearchingSeries && (
                  <div className="text-center py-12 text-slate-400 font-mono text-sm">⏳ Interrogazione IGDB...</div>
                )}
                {!isSearchingSeries && seriesResults.length === 0 && localOnly.length === 0 && igdbCollections.length === 0 && seriesQuery.length === 0 && (
                  <div className="text-center py-12 text-slate-500 font-mono text-sm">
                    <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>Inserisci il nome di una serie per scoprire</p>
                    <p>quali titoli hai e quali ti mancano.</p>
                    <p className="mt-2 text-slate-600 text-xs">Database: IGDB (oltre 200.000 giochi)</p>
                  </div>
                )}
                {!isSearchingSeries && seriesResults.length === 0 && localOnly.length === 0 && igdbCollections.length === 0 && seriesQuery.length >= 2 && !seriesError && (
                  <div className="text-center py-12 text-slate-400 font-mono text-sm">Nessun risultato trovato per "{seriesQuery}".</div>
                )}

                {sorted.map((item) => (
                  <GameRow
                    key={item.igdbId}
                    item={item}
                    owned={isOwned(item.title)}
                    wishlisted={isWishlisted(item.title)}
                    added={seriesAddedIds.has(item.igdbId)}
                    fromLocal={false}
                  />
                ))}

                {localOnly.length > 0 && (
                  <>
                    <div className="pt-2 pb-1 px-1">
                      <p className="text-slate-500 font-mono text-xs uppercase tracking-wider">
                        Nella tua collezione (non su IGDB)
                      </p>
                    </div>
                    {localOnly.map((g) => (
                      <GameRow
                        key={g.id}
                        item={{ igdbId: null, title: g.title, cover_url: g.cover_url, year: null, platforms: [], console: g.console }}
                        owned={true}
                        wishlisted={false}
                        added={false}
                        fromLocal={true}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Footer */}
      <div className="mt-auto border-t-4 border-slate-700 bg-slate-900 py-4 sm:py-6 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-slate-950 opacity-30 rounded-tl-full"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-2 sm:mb-3">
            <p className="text-slate-400 font-mono text-xs sm:text-sm">
              💾 SAVE SLOT v2.0 © 2025 • Powered by <span className="text-blue-400 font-bold">Bluemoon_Coder</span>
            </p>
            <p className="text-slate-600 font-mono text-xs mt-1">
              Total Files: {totalGames} • Cloud Sync: {syncStatus === 'synced' ? '✓' : syncStatus === 'syncing' ? '...' : '✗'}
            </p>
          </div>
          <div className="text-center border-t border-slate-800 pt-2 sm:pt-3">
            <p className="text-slate-600 font-mono text-xs">
              Credits: <a href="https://thegamesdb.net/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400">TheGamesDB</a> • 
              <a href="https://www.igdb.com/" target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:text-teal-400 ml-1">IGDB</a>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default App;
