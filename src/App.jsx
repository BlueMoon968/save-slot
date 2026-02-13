import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Plus, Grid3x3, List, Trash2, Edit2, X, BarChart3, Heart, Camera, TrendingUp, Package, Star, Gamepad2, Download, Upload, RefreshCw, Cloud, CloudOff, LogOut, User } from 'lucide-react';
import { supabase } from './supabase';
import achievementsImage from './assets/achievements.png';

const SERVER_API = import.meta.env.VITE_SUPABASE_BARCODE
const THEGAMESDB_BASE_URL = import.meta.env.VITE_SUPABASE_TGDB

// Unique ID generator
let uniqueIdCounter = 0;
const generateUniqueId = () => {
  uniqueIdCounter++;
  return `${Date.now()}-${uniqueIdCounter}-${Math.random().toString(36).substr(2, 9)}`;
};

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

const CONSOLE_ICONS = {
  'PS1': '🎮', 'PS2': '🎮', 'PS3': '🎮', 'PS4': '🎮', 'PS5': '🎮',
  'PSP': '🎮', 'PSP GO': '🎮', 'PS VITA': '🎮',
  'GB': '🎲', 'GBC': '🎲', 'GBA': '🎲', 'NDS': '🎲', '3DS': '🎲',
  'NES': '🕹️', 'SNES': '🕹️', 'N64': '🕹️',
  'GAMECUBE': '🎯', 'WII': '🎯', 'WII U': '🎯', 'SWITCH': '🎯',
  'XBOX': '🎮', 'XBOX 360': '🎮', 'XBOX ONE': '🎮', 'XBOX SERIES X/S': '🎮'
};

// Memoized Game Card Component
const GameCard = React.memo(({ game, onEdit, onDelete, onMove, isWishlist }) => {
  return (
    <div className={`bg-slate-800 rounded-sm border-4 ${isWishlist ? 'border-purple-700 hover:border-purple-600' : 'border-slate-700 hover:border-slate-600'} overflow-hidden transition-all shadow-lg group`}>
      <div className="aspect-[3/4] bg-slate-900 relative overflow-hidden">
        {game.cover_url ? (
          <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover" loading="lazy" />
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
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScanningBarcode, setIsScanningBarcode] = useState(false);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [isSearchingAPI, setIsSearchingAPI] = useState(false);
  const [apiSearchResults, setApiSearchResults] = useState([]);
  const csvInputRef = useRef(null);
  const html5QrCodeRef = useRef(null);
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
  const [username, setUsername] = useState('');               
  const [loginForm, setLoginForm] = useState({ username: '', password: '' }); 
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [newGame, setNewGame] = useState({
    title: '',
    console: '',
    version: 'PAL',
    cover_url: '',
    release_date: '',
    api_id: null,
    barcode: ''
  });

  // Initialize user session
  useEffect(() => {
    checkAuth();
  }, []);

const checkAuth = async () => {
  const storedAuth = localStorage.getItem('saveslot-auth');
  
  if (storedAuth) {
    try {
      const auth = JSON.parse(storedAuth);
      
      // Verify user still exists in database
      const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .eq('id', auth.userId)
        .single();
      
      if (!error && data) {
        setUserId(data.id);
        setUsername(data.username);
        await loadFromSupabase(data.id);
      } else {
        // Invalid auth, show login
        localStorage.removeItem('saveslot-auth');
        setShowLoginModal(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setShowLoginModal(true);
    }
  } else {
    setShowLoginModal(true);
  }
};

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

      setGames(collectionData || []);
      setWishlist(wishlistData || []);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error loading from Supabase:', error);
      setSyncStatus('error');
      
      // Fallback to localStorage
      const savedGames = localStorage.getItem('saveslot-collection');
      const savedWishlist = localStorage.getItem('saveslot-wishlist');
      
      if (savedGames) {
        try {
          setGames(JSON.parse(savedGames));
        } catch (e) {
          console.error('Error parsing saved games:', e);
        }
      }
      
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
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

    } finally {
      setIsSyncing(false);
    }
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      // Check credentials
      const { data, error } = await supabase
        .from('users')
        .select('id, username, password')
        .eq('username', loginForm.username)
        .single();

      if (error || !data) {
        alert('Username non trovato');
        setIsLoggingIn(false);
        return;
      }

      // Simple password check (in production, use bcrypt or similar)
      if (data.password !== loginForm.password) {
        alert('Password errata');
        setIsLoggingIn(false);
        return;
      }

      // Save auth to localStorage
      const auth = {
        userId: data.id,
        username: data.username
      };
      localStorage.setItem('saveslot-auth', JSON.stringify(auth));

      setUserId(data.id);
      setUsername(data.username);
      setShowLoginModal(false);
      setLoginForm({ username: '', password: '' });

      // Load user's data
      await loadFromSupabase(data.id);
    } catch (error) {
      console.error('Login error:', error);
      alert('Errore durante il login. Riprova.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Vuoi davvero disconnetterti?')) {
      localStorage.removeItem('saveslot-auth');
      setUserId(null);
      setUsername('');
      setGames([]);
      setWishlist([]);
      setShowLoginModal(true);
    }
  };

  // Save to Supabase with debouncing
  const saveToSupabase = useCallback(async (gamesData, wishlistData) => {
    if (!userId) return;

    try {
      setSyncStatus('syncing');

      // Prepare games for upsert
      const allGames = [
        ...gamesData.map(g => ({
          ...g,
          user_id: userId,
          is_wishlist: false,
          added_date: g.added_date || new Date().toISOString()
        })),
        ...wishlistData.map(g => ({
          ...g,
          user_id: userId,
          is_wishlist: true,
          added_date: g.added_date || new Date().toISOString()
        }))
      ];

      // Delete all existing games for this user
      await supabase
        .from('games')
        .delete()
        .eq('user_id', userId);

      // Insert new games
      if (allGames.length > 0) {
        const { error } = await supabase
          .from('games')
          .insert(allGames);

        if (error) throw error;
      }

      setSyncStatus('synced');
      
      // Also save to localStorage as backup
      localStorage.setItem('saveslot-collection', JSON.stringify(gamesData));
      localStorage.setItem('saveslot-wishlist', JSON.stringify(wishlistData));
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      setSyncStatus('error');
      
      // Save to localStorage as fallback
      localStorage.setItem('saveslot-collection', JSON.stringify(gamesData));
      localStorage.setItem('saveslot-wishlist', JSON.stringify(wishlistData));
    }
  }, [userId]);

  // Debounced save effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userId) {
        saveToSupabase(games, wishlist);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [games, wishlist, userId, saveToSupabase]);

  // Check achievements when games or wishlist change
  useEffect(() => {
    if (games.length > 0 || wishlist.length > 0) {
      checkAchievements();
    }
  }, [games.length, wishlist.length, checkAchievements]);

  const searchGames = async (query, platformId) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
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
        const baseImageUrl = data.include?.boxart?.base_url?.large || 'https://cdn.thegamesdb.net/images/original/';
        
        const gamesWithImages = data.data.games.map(game => {
          let cover_url = '';
          
          if (data.include?.boxart?.data && data.include.boxart.data[game.id]) {
            const boxartArray = data.include.boxart.data[game.id];
            const frontBoxart = boxartArray.find(img => img.side === 'front');
            if (frontBoxart) {
              cover_url = `${baseImageUrl}${frontBoxart.filename}`;
            }
          }
          
          let matchedConsole = CONSOLES.find(c => c.id === game.platform);

          // Debug: log platform ID to find correct mapping
          if (!matchedConsole) {
            console.log('🔍 Unknown platform ID:', game.platform, 'for game:', game.game_title);
          }
                    
          return {
            ...game,
            cover_url,
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

  const searchAPIForCover = async (title, consoleShortName) => {
    setIsSearchingAPI(true);
    setApiSearchResults([]);
    
    try {
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
        const baseImageUrl = data.include?.boxart?.base_url?.large || 'https://cdn.thegamesdb.net/images/original/';
        
        const gamesWithImages = data.data.games.map(game => {
          let cover_url = '';
          
          if (data.include?.boxart?.data && data.include.boxart.data[game.id]) {
            const boxartArray = data.include.boxart.data[game.id];
            const frontBoxart = boxartArray.find(img => img.side === 'front');
            if (frontBoxart) {
              cover_url = `${baseImageUrl}${frontBoxart.filename}`;
            }
          }
          
          let matchedConsole = CONSOLES.find(c => c.id === game.platform);

          // Debug: log platform ID to find correct mapping
          if (!matchedConsole) {
            console.log('🔍 Unknown platform ID:', game.platform, 'for game:', game.game_title);
          }

          return {
            ...game,
            cover_url,
            platformName: matchedConsole ? matchedConsole.fullName : 'Unknown Platform',
            uniqueKey: generateUniqueId()
          };
        });
        
        setApiSearchResults(gamesWithImages);
        
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

  // Improved barcode search with TGDB fallback
  const searchByBarcode = async (barcode) => {
    setIsScanningBarcode(true);
    try {
      // First try UPC lookup
      const response = await fetch(`${SERVER_API}?upc=${barcode}`);
      const data = await response.json();

      let gameTitle = null;
      let detectedConsole = '';

      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        gameTitle = item.title;
        
        const searchText = (gameTitle + ' ' + (item.description || '')).toLowerCase();
        
        for (const console of CONSOLES) {
          for (const alias of console.aliases) {
            if (searchText.includes(alias.toLowerCase())) {
              detectedConsole = console.name;
              break;
            }
          }
          if (detectedConsole) break;
        }
      } else {
        // UPC not found - try to extract game info from barcode patterns
        // Many game barcodes have patterns we can use
        alert('Barcode non trovato nel database UPC.\n\nInserisci manualmente il titolo del gioco per cercarlo.');
        setShowBarcodeModal(false);
        setShowAddModal(true);
        return;
      }

      if (gameTitle) {
        if (detectedConsole) {
          const consoleObj = CONSOLES.find(c => c.name === detectedConsole);
          await searchGames(gameTitle, consoleObj?.id);
        } else {
          await searchGames(gameTitle);
        }

        setShowBarcodeModal(false);
        setBarcodeInput('');
        setShowAddModal(true);
      } else {
        alert('Impossibile identificare il gioco da questo barcode. Prova la ricerca manuale.');
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      alert('Errore durante la scansione del barcode. Prova la ricerca manuale.');
      setShowBarcodeModal(false);
      setShowAddModal(true);
    } finally {
      setIsScanningBarcode(false);
      stopCamera();
    }
  };

  const startCamera = () => {
    setIsUsingCamera(true);
    
    setTimeout(async () => {
      try {
        if (window.Html5Qrcode) {
          initializeScanner();
        } else {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
          script.async = false;
          
          script.onload = () => {
            console.log('html5-qrcode library loaded');
            initializeScanner();
          };
          
          script.onerror = () => {
            console.error('Failed to load html5-qrcode library');
            alert('Errore nel caricamento dello scanner. Inserisci il barcode manualmente.');
            setIsUsingCamera(false);
          };
          
          document.head.appendChild(script);
        }
      } catch (error) {
        console.error('Error in startCamera:', error);
        alert('Errore nell\'inizializzazione della fotocamera.');
        setIsUsingCamera(false);
      }
    }, 100);
  };

  const initializeScanner = async () => {
    try {
      const Html5Qrcode = window.Html5Qrcode;
      
      if (!Html5Qrcode) {
        throw new Error('Html5Qrcode not available');
      }

      const html5QrCode = new Html5Qrcode("barcode-reader");
      html5QrCodeRef.current = html5QrCode;
      
      const qrCodeSuccessCallback = (decodedText) => {
        console.log('Barcode detected:', decodedText);
        setBarcodeInput(decodedText);
        stopCamera();
        searchByBarcode(decodedText);
      };
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 }
      };
      
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          // Ignore continuous scanning errors
        }
      );
      
      console.log('Scanner started successfully');
    } catch (err) {
      console.error('Error initializing scanner:', err);
      alert('Impossibile accedere alla fotocamera. Verifica i permessi nel browser e riprova.');
      setIsUsingCamera(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        console.log('Scanner stopped');
      } catch (error) {
        console.error('Error stopping camera:', error);
      }
    }
    setIsUsingCamera(false);
  };

  const selectGameFromSearch = (game) => {
    let matchedConsole = CONSOLES.find(c => c.id === game.platform);

      // Debug: log platform ID to find correct mapping
      if (!matchedConsole) {
        console.log('🔍 Unknown platform ID:', game.platform, 'for game:', game.game_title);
      }


    setNewGame({
      title: game.game_title,
      console: matchedConsole ? matchedConsole.name : '',
      version: 'PAL',
      cover_url: game.cover_url || '',
      release_date: game.release_date || '',
      api_id: game.id,
      barcode: ''
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
    api_id: null,
    barcode: ''
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

    if (editingGame.is_wishlist) {
      setWishlist(wishlist.map(g => g.id === editingGame.id ? editingGame : g));
    } else {
      setGames(games.map(g => g.id === editingGame.id ? editingGame : g));
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
            api_id: null,
            barcode: ''
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

const uniqueConsoles = [...new Set(games.map(g => g.console))].sort();
  const uniqueVersions = [...new Set(games.map(g => g.version).filter(Boolean))].sort();

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

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                  Username
                </label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full px-6 py-3 bg-amber-600 text-white rounded-sm hover:bg-amber-700 transition-all font-bold border-4 border-amber-500 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? '⏳ LOGGING IN...' : '🔓 LOGIN'}
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
                onClick={() => setShowBarcodeModal(true)}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-all font-bold border-4 border-blue-500 hover:border-blue-400 shadow-lg flex items-center gap-2 font-mono text-xs sm:text-sm"
              >
                <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">SCAN</span>
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
            </div>
          </div>

          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setActiveTab('collection')}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-sm font-bold font-mono transition-all border-4 text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'collection'
                  ? 'bg-slate-700 text-white border-slate-600'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Package className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">COLLECTION</span> ({totalGames})
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-sm font-bold font-mono transition-all border-4 text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'wishlist'
                  ? 'bg-slate-700 text-white border-slate-600'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">WISHLIST</span> ({totalWishlist})
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
                      placeholder="SEARCH GAMES..."
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
              <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover" loading="lazy" />
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
              <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover" loading="lazy" />
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
                      api_id: null,
                      barcode: ''
                    });
                    setSearchResults([]);
                    setAddToWishlist(false);
                  }} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="mb-4 sm:mb-6">
                  <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                    SEARCH DATABASE
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
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
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type="text"
                        placeholder="Search game title..."
                        onChange={(e) => {
                          const query = e.target.value;
                          if (query.length >= 2) {
                            const consoleObj = CONSOLES.find(c => c.name === newGame.console);
                            searchGames(query, consoleObj?.id);
                          } else {
                            setSearchResults([]);
                          }
                        }}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-amber-500 font-mono text-sm"
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
                            <img src={game.cover_url} alt={game.game_title} className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded" />
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

                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                      Barcode
                    </label>
                    <input
                      type="text"
                      value={newGame.barcode}
                      onChange={(e) => setNewGame({ ...newGame, barcode: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-amber-500 font-mono text-sm"
                      placeholder="Es: 045496730130"
                    />
                  </div>
                </div>

                {newGame.cover_url && (
                  <div className="mt-4">
                    <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                      PREVIEW
                    </label>
                    <div className="w-24 h-32 sm:w-32 sm:h-44 bg-slate-900 rounded overflow-hidden border-2 border-slate-600">
                      <img src={newGame.cover_url} alt="Preview" className="w-full h-full object-cover" />
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
                        api_id: null,
                        barcode: ''
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
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-amber-400 text-sm font-mono font-semibold">🔍 FIND COVER FROM API</p>
                    <button
                      onClick={() => searchAPIForCover(editingGame.title, editingGame.console)}
                      disabled={!editingGame.title || !editingGame.console || isSearchingAPI}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-all font-bold border-2 border-blue-500 font-mono text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isSearchingAPI ? 'animate-spin' : ''}`} />
                      {isSearchingAPI ? 'SEARCHING...' : 'SEARCH API'}
                    </button>
                  </div>
                  <p className="text-slate-400 text-xs font-mono">
                    Cerca copertine e info su TheGamesDB per questo gioco
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
                          <img src={game.cover_url} alt={game.game_title} className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded" />
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

                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                      Barcode
                    </label>
                    <input
                      type="text"
                      value={editingGame.barcode || ''}
                      onChange={(e) => setEditingGame({ ...editingGame, barcode: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-amber-500 font-mono text-sm"
                      placeholder="Es: 045496730130"
                    />
                  </div>
                </div>

                {editingGame.cover_url && (
                  <div className="mt-4">
                    <label className="block text-amber-400 text-sm font-semibold mb-2 font-mono">
                      CURRENT COVER
                    </label>
                    <div className="w-24 h-32 sm:w-32 sm:h-44 bg-slate-900 rounded overflow-hidden border-2 border-slate-600">
                      <img src={editingGame.cover_url} alt="Current cover" className="w-full h-full object-cover" />
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

        {/* Barcode Scanner Modal */}
        {showBarcodeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-sm max-w-md w-full border-4 border-slate-600 shadow-2xl relative">
              <div className="absolute top-0 left-0 right-0 h-3 sm:h-4 bg-slate-900 rounded-t-sm"></div>
              <div className="p-4 sm:p-6 pt-6 sm:pt-8">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 font-mono">
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                    BARCODE SCAN
                  </h2>
                  <button onClick={() => {
                    setShowBarcodeModal(false);
                    setBarcodeInput('');
                    stopCamera();
                  }} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {!isUsingCamera ? (
                    <>
                      <div className="bg-slate-700 rounded-sm p-4 sm:p-6 border-2 border-slate-600 text-center">
                        <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400 mx-auto mb-4" />
                        <p className="text-white mb-2 font-mono text-sm sm:text-base">INSERISCI BARCODE/UPC</p>
                        <p className="text-slate-400 text-xs sm:text-sm mb-4 font-mono">
                          Inserisci il codice manualmente o usa la fotocamera
                        </p>
                        
                        <input
                          type="text"
                          value={barcodeInput}
                          onChange={(e) => setBarcodeInput(e.target.value)}
                          placeholder="Es: 045496730130"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-slate-500 text-center font-mono text-base sm:text-lg mb-4"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && barcodeInput) {
                              searchByBarcode(barcodeInput);
                            }
                          }}
                        />

                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => barcodeInput && searchByBarcode(barcodeInput)}
                            disabled={!barcodeInput || isScanningBarcode}
                            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-slate-700 text-white rounded-sm hover:bg-slate-600 transition-all font-bold border-4 border-slate-600 hover:border-slate-500 font-mono disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {isScanningBarcode ? '⏳ RICERCA...' : '🔍 CERCA'}
                          </button>
                          <button
                            onClick={startCamera}
                            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-all font-bold border-4 border-blue-500 font-mono text-sm"
                          >
                            📷 USA CAMERA
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-700 rounded-sm p-3 sm:p-4 border-2 border-slate-600">
                        <p className="text-slate-300 text-xs sm:text-sm font-mono mb-2">💡 SUGGERIMENTI:</p>
                        <ul className="text-slate-400 text-xs space-y-1 font-mono">
                          <li>• Il barcode si trova sul retro della confezione</li>
                          <li>• Formato: codice a 12-13 cifre (UPC/EAN)</li>
                          <li>• Usa uno scanner USB o la fotocamera</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className="bg-slate-700 rounded-sm p-4 border-2 border-slate-600">
                      <div id="barcode-reader" className="w-full rounded-sm mb-4"></div>
                      <p className="text-white text-center font-mono text-sm mb-4">
                        Inquadra il barcode con la fotocamera
                      </p>
                      <button
                        onClick={stopCamera}
                        className="w-full px-6 py-3 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-all font-bold border-4 border-red-500 font-mono"
                      >
                        CHIUDI CAMERA
                      </button>
                    </div>
                  )}
                </div>

                {!isUsingCamera && (
                  <button
                    onClick={() => {
                      setShowBarcodeModal(false);
                      setBarcodeInput('');
                    }}
                    className="w-full mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-slate-900 text-slate-400 rounded-sm hover:bg-slate-800 transition-colors border-4 border-slate-700 font-mono text-sm"
                  >
                    CHIUDI
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

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
              <a href="https://www.upcitemdb.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 ml-1">UPC Item DB</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;