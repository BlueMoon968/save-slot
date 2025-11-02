import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Grid3x3, List, Trash2, Edit2, X, BarChart3, Heart, Camera, TrendingUp, Package, Star, Gamepad2, Download, Upload } from 'lucide-react';

const THEGAMESDB_API_KEY = 'd4f09c2009ff436d869f140a77b4caaf2523f5c2365906539e99a970a8642e4c';
const THEGAMESDB_BASE_URL = 'https://api.thegamesdb.net/v1';
const UPC_API_KEY = 'test'; // Use 'test' for trial, or get free key from https://www.upcitemdb.com/

const CONSOLES = [
  { id: 10, name: 'PS1', fullName: 'PlayStation', aliases: ['PlayStation', 'PS1', 'PSX'] },
  { id: 11, name: 'PS2', fullName: 'PlayStation 2', aliases: ['PlayStation 2', 'PS2'] },
  { id: 12, name: 'PS3', fullName: 'PlayStation 3', aliases: ['PlayStation 3', 'PS3'] },
  { id: 4919, name: 'PS4', fullName: 'PlayStation 4', aliases: ['PlayStation 4', 'PS4'] },
  { id: 4976, name: 'PS5', fullName: 'PlayStation 5', aliases: ['PlayStation 5', 'PS5'] },
  { id: 16, name: 'PSP', fullName: 'PlayStation Portable', aliases: ['PSP'] },
  { id: 17, name: 'PSP GO', fullName: 'PSP Go', aliases: ['PSP Go'] },
  { id: 46, name: 'PS VITA', fullName: 'PlayStation Vita', aliases: ['PS Vita', 'Vita'] },
  { id: 4, name: 'GB', fullName: 'Game Boy', aliases: ['Game Boy', 'GB'] },
  { id: 41, name: 'GBC', fullName: 'Game Boy Color', aliases: ['Game Boy Color', 'GBC'] },
  { id: 5, name: 'GBA', fullName: 'Game Boy Advance', aliases: ['Game Boy Advance', 'GBA'] },
  { id: 8, name: 'NDS', fullName: 'Nintendo DS', aliases: ['Nintendo DS', 'NDS', 'DS'] },
  { id: 4912, name: '3DS', fullName: 'Nintendo 3DS', aliases: ['Nintendo 3DS', '3DS'] },
  { id: 7, name: 'NES', fullName: 'Nintendo Entertainment System', aliases: ['NES'] },
  { id: 6, name: 'SNES', fullName: 'Super Nintendo', aliases: ['Super Nintendo', 'SNES'] },
  { id: 3, name: 'N64', fullName: 'Nintendo 64', aliases: ['Nintendo 64', 'N64'] },
  { id: 2, name: 'GAMECUBE', fullName: 'Nintendo GameCube', aliases: ['GameCube', 'NGC'] },
  { id: 9, name: 'WII', fullName: 'Nintendo Wii', aliases: ['Wii'] },
  { id: 38, name: 'WII U', fullName: 'Wii U', aliases: ['Wii U'] },
  { id: 4971, name: 'SWITCH', fullName: 'Nintendo Switch', aliases: ['Nintendo Switch', 'Switch'] },
  { id: 14, name: 'XBOX', fullName: 'Xbox', aliases: ['Xbox'] },
  { id: 15, name: 'XBOX 360', fullName: 'Xbox 360', aliases: ['Xbox 360'] },
  { id: 4920, name: 'XBOX ONE', fullName: 'Xbox One', aliases: ['Xbox One'] },
  { id: 4977, name: 'XBOX SERIES X/S', fullName: 'Xbox Series X/S', aliases: ['Xbox Series X', 'Xbox Series S'] }
];

const VERSIONS = ['PAL', 'NTSC', 'NTSC-J', 'JP'];

// Console emoji icons
const CONSOLE_ICONS = {
  'PS1': '🎮',
  'PS2': '🎮',
  'PS3': '🎮',
  'PS4': '🎮',
  'PS5': '🎮',
  'PSP': '🎮',
  'PSP GO': '🎮',
  'PS VITA': '🎮',
  'GB': '🎲',
  'GBC': '🎲',
  'GBA': '🎲',
  'NDS': '🎲',
  '3DS': '🎲',
  'NES': '🕹️',
  'SNES': '🕹️',
  'N64': '🕹️',
  'GAMECUBE': '🎯',
  'WII': '🎯',
  'WII U': '🎯',
  'SWITCH': '🎯',
  'XBOX': '🎮',
  'XBOX 360': '🎮',
  'XBOX ONE': '🎮',
  'XBOX SERIES X/S': '🎮'
};

function App() {
  const [activeTab, setActiveTab] = useState('collection'); // collection, wishlist, stats
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
  const fileInputRef = useRef(null);
  const [editingGame, setEditingGame] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addToWishlist, setAddToWishlist] = useState(false);
  const [newGame, setNewGame] = useState({
    title: '',
    console: '',
    version: 'PAL',
    coverUrl: '',
    releaseDate: '',
    apiId: null,
    barcode: ''
  });

  // Load data from localStorage
  useEffect(() => {
    const savedGames = localStorage.getItem('saveslot-collection');
    const savedWishlist = localStorage.getItem('saveslot-wishlist');
    
    if (savedGames) {
      try {
        setGames(JSON.parse(savedGames));
      } catch (error) {
        console.log('Error loading collection:', error);
      }
    }
    
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (error) {
        console.log('Error loading wishlist:', error);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (games.length > 0 || localStorage.getItem('saveslot-collection')) {
      localStorage.setItem('saveslot-collection', JSON.stringify(games));
    }
  }, [games]);

  useEffect(() => {
    if (wishlist.length > 0 || localStorage.getItem('saveslot-wishlist')) {
      localStorage.setItem('saveslot-wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist]);

  const searchGames = async (query, platformId) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        apikey: THEGAMESDB_API_KEY,
        name: query,
        include: 'boxart',
        ...(platformId && { filter: `platform:${platformId}` })
      });

      const corsProxy = 'https://corsproxy.io/?';
      const apiUrl = `${THEGAMESDB_BASE_URL}/Games/ByGameName?${params}`;
      const response = await fetch(`${corsProxy}${encodeURIComponent(apiUrl)}`);
      const data = await response.json();

      if (data.data && data.data.games) {
        const baseImageUrl = data.include?.boxart?.base_url?.large || 'https://cdn.thegamesdb.net/images/original/';
        
        const gamesWithImages = data.data.games.map(game => {
          let coverUrl = '';
          
          if (data.include?.boxart?.data && data.include.boxart.data[game.id]) {
            const boxartArray = data.include.boxart.data[game.id];
            const frontBoxart = boxartArray.find(img => img.side === 'front');
            if (frontBoxart) {
              coverUrl = `${baseImageUrl}${frontBoxart.filename}`;
            }
          }
          
          // Fix platform display - find console by matching platform ID
          const matchedConsole = CONSOLES.find(c => c.id === game.platform);
          
          return {
            ...game,
            coverUrl,
            platformName: matchedConsole ? matchedConsole.fullName : 'Unknown Platform'
          };
        });
        
        setSearchResults(gamesWithImages);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching games:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const searchByBarcode = async (barcode) => {
    setIsScanningBarcode(true);
    try {
      const corsProxy = 'https://corsproxy.io/?';
      const apiUrl = `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`;
      const response = await fetch(`${corsProxy}${encodeURIComponent(apiUrl)}`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        const title = item.title;
        
        // Try to detect console from title or category
        let detectedConsole = '';
        for (const console of CONSOLES) {
          if (console.aliases.some(alias => title.toLowerCase().includes(alias.toLowerCase()))) {
            detectedConsole = console.name;
            break;
          }
        }
        
        setNewGame({
          ...newGame,
          title: title,
          console: detectedConsole,
          barcode: barcode,
          coverUrl: item.images?.[0] || ''
        });
        
        alert(`Gioco trovato: ${title}${detectedConsole ? `\nConsole rilevata: ${detectedConsole}` : ''}`);
      } else {
        alert('Nessun prodotto trovato per questo barcode. Inserisci i dati manualmente.');
        setNewGame({ ...newGame, barcode: barcode });
      }
    } catch (error) {
      console.error('Error searching barcode:', error);
      alert('Errore nella ricerca del barcode. Inserisci i dati manualmente.');
      setNewGame({ ...newGame, barcode: barcode });
    } finally {
      setIsScanningBarcode(false);
      setShowBarcodeModal(false);
    }
  };

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
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const importedGames = [];
      let coversFound = 0;

      // Import without fetching covers first for speed
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
            id: Date.now().toString() + Math.random(),
            title: fields[0],
            console: fields[1],
            version: fields[2],
            coverUrl: '',
            releaseDate: '',
            apiId: null,
            barcode: ''
          });
        }
      }

      if (importedGames.length > 0) {
        setGames([...games, ...importedGames]);
        alert(`${importedGames.length} giochi importati con successo!\n\nLe copertine possono essere aggiunte individualmente modificando ogni gioco.`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const selectGameFromSearch = (game) => {
    const console = CONSOLES.find(c => c.id === game.platform);
    setNewGame({
      title: game.game_title,
      console: console ? console.name : '',
      version: 'PAL',
      coverUrl: game.coverUrl,
      releaseDate: game.release_date || '',
      apiId: game.id,
      barcode: ''
    });
    setSearchResults([]);
  };

  const addGame = () => {
    if (!newGame.title || !newGame.console) {
      alert('Inserisci almeno titolo e console');
      return;
    }

    const gameToAdd = {
      id: Date.now().toString(),
      ...newGame
    };

    if (addToWishlist) {
      setWishlist([...wishlist, gameToAdd]);
    } else {
      setGames([...games, gameToAdd]);
    }
    
    setShowAddModal(false);
    setAddToWishlist(false);
    setNewGame({
      title: '',
      console: '',
      version: 'PAL',
      coverUrl: '',
      releaseDate: '',
      apiId: null,
      barcode: ''
    });
    setSearchResults([]);
  };

  const deleteGame = (id, fromWishlist = false) => {
    if (window.confirm('Sei sicuro di voler eliminare questo gioco?')) {
      if (fromWishlist) {
        setWishlist(wishlist.filter(g => g.id !== id));
      } else {
        setGames(games.filter(g => g.id !== id));
      }
    }
  };

  const moveToCollection = (game) => {
    setWishlist(wishlist.filter(g => g.id !== game.id));
    setGames([...games, { ...game, id: Date.now().toString() }]);
  };

  const startEdit = (game, fromWishlist = false) => {
    setEditingGame({ ...game, isFromWishlist: fromWishlist });
    setShowEditModal(true);
  };

  const saveEdit = () => {
    if (!editingGame.title || !editingGame.console) {
      alert('Inserisci almeno titolo e console');
      return;
    }

    if (editingGame.isFromWishlist) {
      setWishlist(wishlist.map(g => 
        g.id === editingGame.id ? { ...editingGame, isFromWishlist: undefined } : g
      ));
    } else {
      setGames(games.map(g => 
        g.id === editingGame.id ? { ...editingGame, isFromWishlist: undefined } : g
      ));
    }
    
    setShowEditModal(false);
    setEditingGame(null);
  };

  const currentList = activeTab === 'wishlist' ? wishlist : games;
  const filteredGames = currentList.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesConsole = !filterConsole || game.console === filterConsole;
    const matchesVersion = !filterVersion || game.version === filterVersion;
    return matchesSearch && matchesConsole && matchesVersion;
  });

  const consoleCount = (consoleName) => {
    return games.filter(g => g.console === consoleName).length;
  };

  // Statistics calculations
  const totalGames = games.length;
  const totalWishlist = wishlist.length;
  const consoleStats = CONSOLES.map(console => ({
    name: console.name,
    fullName: console.fullName,
    count: games.filter(g => g.console === console.name).length
  })).filter(stat => stat.count > 0).sort((a, b) => b.count - a.count);

  const topConsole = consoleStats[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex flex-col">
      {/* Floppy Disk themed header */}
      <div className="border-b-4 border-slate-700 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 shadow-2xl relative overflow-hidden">
        {/* Metal shutter effect at top */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-900 to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto px-6 py-6 relative">
          <div className="flex items-center gap-4 mb-4">
            {/* Floppy disk icon */}
            <div className="relative">
              <div className="w-16 h-16 bg-slate-900 rounded-sm border-4 border-slate-600 shadow-xl relative overflow-hidden">
                {/* Metal shutter */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-slate-800"></div>
                {/* Label area */}
                <div className="absolute bottom-1 left-1 right-1 h-8 bg-white rounded-sm flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-slate-700" />
                </div>
                {/* Write protect notch */}
                <div className="absolute top-1 right-1 w-2 h-3 bg-slate-950"></div>
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white drop-shadow-lg" style={{fontFamily: 'monospace', letterSpacing: '0.1em'}}>
                💾 SAVE SLOT
              </h1>
              <p className="text-slate-400 text-sm mt-1 font-mono">La tua collezione di videogiochi • File #{totalGames}</p>
            </div>
          </div>
          
          {/* Navigation Tabs - Floppy disk style */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('collection')}
              className={`px-6 py-3 rounded-t-sm font-bold transition-all flex items-center gap-2 border-t-4 border-x-4 ${
                activeTab === 'collection' 
                  ? 'bg-slate-600 text-white border-slate-500 shadow-lg' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              style={{fontFamily: 'monospace'}}
            >
              <Package className="w-5 h-5" />
              COLLECTION ({totalGames})
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-6 py-3 rounded-t-sm font-bold transition-all flex items-center gap-2 border-t-4 border-x-4 ${
                activeTab === 'wishlist' 
                  ? 'bg-slate-600 text-white border-slate-500 shadow-lg' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              style={{fontFamily: 'monospace'}}
            >
              <Heart className="w-5 h-5" />
              WISHLIST ({totalWishlist})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 rounded-t-sm font-bold transition-all flex items-center gap-2 border-t-4 border-x-4 ${
                activeTab === 'stats' 
                  ? 'bg-slate-600 text-white border-slate-500 shadow-lg' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              style={{fontFamily: 'monospace'}}
            >
              <BarChart3 className="w-5 h-5" />
              STATS
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 flex-1">
        {activeTab === 'stats' ? (
          /* Statistics Dashboard */
          <div className="space-y-6">
            {/* Overview Cards - Floppy disk style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 rounded-sm p-6 border-4 border-slate-600 shadow-xl relative">
                <div className="absolute top-0 left-0 right-0 h-3 bg-slate-900"></div>
                <div className="flex items-center justify-between mb-2 mt-2">
                  <Package className="w-8 h-8 text-blue-400" />
                  <span className="text-4xl font-bold text-white font-mono">{totalGames}</span>
                </div>
                <p className="text-slate-300 font-semibold font-mono">Giochi Totali</p>
              </div>

              <div className="bg-slate-800 rounded-sm p-6 border-4 border-slate-600 shadow-xl relative">
                <div className="absolute top-0 left-0 right-0 h-3 bg-slate-900"></div>
                <div className="flex items-center justify-between mb-2 mt-2">
                  <Heart className="w-8 h-8 text-pink-400" />
                  <span className="text-4xl font-bold text-white font-mono">{totalWishlist}</span>
                </div>
                <p className="text-slate-300 font-semibold font-mono">In Wishlist</p>
              </div>

              <div className="bg-slate-800 rounded-sm p-6 border-4 border-slate-600 shadow-xl relative">
                <div className="absolute top-0 left-0 right-0 h-3 bg-slate-900"></div>
                <div className="flex items-center justify-between mb-2 mt-2">
                  <Star className="w-8 h-8 text-yellow-400" />
                  <span className="text-4xl font-bold text-white font-mono">{consoleStats.length}</span>
                </div>
                <p className="text-slate-300 font-semibold font-mono">Console Diverse</p>
              </div>
            </div>

            {/* Top Console */}
            {topConsole && (
              <div className="bg-slate-800 rounded-sm p-6 border-4 border-slate-600 shadow-xl relative">
                <div className="absolute top-0 left-0 right-0 h-3 bg-slate-900"></div>
                <div className="flex items-center gap-4 mt-2">
                  <TrendingUp className="w-12 h-12 text-green-400" />
                  <div>
                    <p className="text-slate-400 text-sm font-semibold font-mono">CONSOLE PREFERITA</p>
                    <h3 className="text-3xl font-bold text-white font-mono">{topConsole.fullName}</h3>
                    <p className="text-slate-300 mt-1 font-mono">{topConsole.count} giochi nella collezione</p>
                  </div>
                </div>
              </div>
            )}

            {/* Console Breakdown */}
            <div className="bg-slate-800 rounded-sm p-6 border-4 border-slate-600 shadow-xl relative">
              <div className="absolute top-0 left-0 right-0 h-3 bg-slate-900"></div>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2 mt-2 font-mono">
                <BarChart3 className="w-6 h-6" />
                Giochi per Console
              </h3>
              <div className="space-y-3">
                {consoleStats.map(stat => (
                  <div key={stat.name} className="bg-slate-700 rounded-sm p-4 border-2 border-slate-600">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold font-mono flex items-center gap-2">
                        <span className="text-2xl">{CONSOLE_ICONS[stat.name] || '🎮'}</span>
                        {stat.fullName}
                      </span>
                      <span className="text-blue-400 font-bold text-lg font-mono">{stat.count}</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-sm h-3 border border-slate-600">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-sm transition-all"
                        style={{ width: `${(stat.count / totalGames) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-slate-400 text-sm mt-1 font-mono">
                      {((stat.count / totalGames) * 100).toFixed(1)}% della collezione
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Collection/Wishlist View */
          <>
            {/* Toolbar - Two rows layout */}
            <div className="bg-slate-800 rounded-sm p-4 mb-6 shadow-xl border-4 border-slate-600">
              {/* First Row - Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cerca giochi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-slate-500 font-mono"
                  />
                </div>

                <select
                  value={filterConsole}
                  onChange={(e) => setFilterConsole(e.target.value)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-slate-500 font-mono"
                >
                  <option value="">Tutte le Console</option>
                  {CONSOLES.map(c => (
                    <option key={c.name} value={c.name}>{c.name} ({consoleCount(c.name)})</option>
                  ))}
                </select>

                <select
                  value={filterVersion}
                  onChange={(e) => setFilterVersion(e.target.value)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-slate-500 font-mono"
                >
                  <option value="">Tutte le Versioni</option>
                  {VERSIONS.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-sm border-2 ${viewMode === 'grid' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'} transition-colors`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-sm border-2 ${viewMode === 'list' ? 'bg-slate-600 border-slate-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'} transition-colors`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Second Row - Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowBarcodeModal(true)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 hover:bg-slate-600 transition-all flex items-center gap-2 font-semibold font-mono"
                >
                  <Camera className="w-5 h-5" />
                  Barcode
                </button>

                <button
                  onClick={exportCSV}
                  className="px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 hover:bg-slate-600 transition-all flex items-center gap-2 font-semibold font-mono"
                  title="Esporta CSV"
                >
                  <Download className="w-5 h-5" />
                  CSV
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-700 text-white rounded-sm border-2 border-slate-600 hover:bg-slate-600 transition-all flex items-center gap-2 font-semibold font-mono"
                  title="Importa CSV"
                >
                  <Upload className="w-5 h-5" />
                  Import
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={importCSV}
                  className="hidden"
                />

                <button
                  onClick={() => {
                    setAddToWishlist(activeTab === 'wishlist');
                    setShowAddModal(true);
                  }}
                  className="px-6 py-2 bg-slate-700 text-white rounded-sm hover:bg-slate-600 transition-all flex items-center gap-2 font-bold shadow-lg border-4 border-slate-600 font-mono ml-auto"
                >
                  <Plus className="w-5 h-5" />
                  ADD
                </button>
              </div>
            </div>

            <div className="mb-4 text-slate-300 font-semibold font-mono">
              💾 {filteredGames.length} FILE TROVATI
            </div>

            {/* Games Display */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredGames.map(game => (
                  <div key={game.id} className="bg-slate-800 rounded-sm overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105 group border-4 border-slate-600 hover:border-slate-500 relative">
                    {/* Floppy disk metal shutter effect */}
                    <div className="absolute top-0 left-0 right-0 h-3 bg-slate-900 z-10"></div>
                    <div className="aspect-[2/3] bg-slate-700 relative">
                      {game.coverUrl ? (
                        <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <Grid3x3 className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-4 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {activeTab === 'wishlist' && (
                          <button
                            onClick={() => moveToCollection(game)}
                            className="p-2 bg-green-600 rounded-sm hover:bg-green-700 transition-colors border-2 border-green-500"
                            title="Sposta in Collezione"
                          >
                            <Package className="w-4 h-4 text-white" />
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(game, activeTab === 'wishlist')}
                          className="p-2 bg-blue-600 rounded-sm hover:bg-blue-700 transition-colors border-2 border-blue-500"
                        >
                          <Edit2 className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => deleteGame(game.id, activeTab === 'wishlist')}
                          className="p-2 bg-red-600 rounded-sm hover:bg-red-700 transition-colors border-2 border-red-500"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-800">
                      <h3 className="text-white font-semibold text-sm mb-3 line-clamp-2 font-mono min-h-[2.5rem]">{game.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-slate-700 text-white rounded-sm font-bold border border-slate-600 font-mono">{game.console}</span>
                        <span className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded-sm border border-slate-500 font-mono">{game.version}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg overflow-hidden shadow-xl border-2 border-slate-600">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-amber-400 uppercase tracking-wider">Gioco</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-amber-400 uppercase tracking-wider">Console</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-amber-400 uppercase tracking-wider">Versione</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-amber-400 uppercase tracking-wider">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredGames.map(game => (
                      <tr key={game.id} className="hover:bg-slate-700 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {game.coverUrl && (
                              <img src={game.coverUrl} alt={game.title} className="w-12 h-16 object-cover rounded border-2 border-slate-600" />
                            )}
                            <span className="text-white font-medium">{game.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs px-3 py-1 bg-amber-500 text-slate-900 rounded-full font-bold">{game.console}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs px-3 py-1 bg-slate-700 text-slate-300 rounded-full">{game.version}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {activeTab === 'wishlist' && (
                            <button
                              onClick={() => moveToCollection(game)}
                              className="p-2 text-green-400 hover:text-green-300 transition-colors inline-flex"
                              title="Sposta in Collezione"
                            >
                              <Package className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => startEdit(game, activeTab === 'wishlist')}
                            className="p-2 text-blue-400 hover:text-blue-300 transition-colors inline-flex"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteGame(game.id, activeTab === 'wishlist')}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors inline-flex ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Add/Edit Modal - Floppy disk themed */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-slate-600 shadow-2xl relative">
              {/* Floppy disk metal shutter */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-slate-900 rounded-t-sm"></div>
              <div className="p-6 pt-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
                    💾 {addToWishlist ? 'SAVE TO WISHLIST' : 'SAVE TO COLLECTION'}
                  </h2>
                  <button onClick={() => {
                    setShowAddModal(false);
                    setSearchResults([]);
                    setAddToWishlist(false);
                    setNewGame({ title: '', console: '', version: 'PAL', coverUrl: '', releaseDate: '', apiId: null, barcode: '' });
                  }} className="text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* API Search */}
                <div className="mb-6 bg-slate-700 rounded-sm p-4 border-2 border-slate-600">
                  <label className="block text-white text-sm font-semibold mb-2 font-mono">
                    🔍 RICERCA AUTOMATICA SU THEGAMESDB
                  </label>
                  <p className="text-slate-400 text-xs mb-3 font-mono">
                    1. Seleziona prima una console (consigliato)<br/>
                    2. Digita il titolo del gioco in inglese<br/>
                    3. Clicca sul risultato per compilare automaticamente
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Es: Pokemon Crystal, Mario Kart..."
                      onChange={(e) => {
                        const query = e.target.value;
                        if (query.length >= 2) {
                          searchGames(query, CONSOLES.find(c => c.name === newGame.console)?.id);
                        } else {
                          setSearchResults([]);
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg border-2 border-slate-600 focus:outline-none focus:border-amber-500 text-base"
                    />
                  </div>
                  {isSearching && (
                    <div className="mt-3 p-3 bg-purple-900 bg-opacity-30 rounded-lg border border-purple-500">
                      <p className="text-purple-300 text-sm">⏳ Ricerca in corso...</p>
                    </div>
                  )}
                  {!isSearching && searchResults.length === 0 && newGame.console && (
                    <div className="mt-3 p-3 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-500">
                      <p className="text-blue-300 text-sm">💡 Scrivi almeno 2 caratteri per cercare</p>
                    </div>
                  )}
                  {!isSearching && searchResults.length > 0 && (
                    <div className="mt-3 bg-slate-800 rounded-lg max-h-64 overflow-y-auto border-2 border-amber-500">
                      <div className="p-2 bg-amber-900 bg-opacity-30 sticky top-0">
                        <p className="text-amber-300 text-xs font-semibold">
                          ✅ {searchResults.length} risultati trovati - Tocca per selezionare
                        </p>
                      </div>
                      {searchResults.map(result => (
                        <button
                          key={result.id}
                          onClick={() => selectGameFromSearch(result)}
                          className="w-full p-4 hover:bg-slate-700 active:bg-slate-600 transition-colors flex items-center gap-3 text-left border-b border-slate-700 last:border-b-0"
                        >
                          {result.coverUrl ? (
                            <img src={result.coverUrl} alt={result.game_title} className="w-12 h-16 object-cover rounded flex-shrink-0 border-2 border-slate-600" />
                          ) : (
                            <div className="w-12 h-16 bg-slate-600 rounded flex-shrink-0 flex items-center justify-center">
                              <span className="text-slate-400 text-xs">No cover</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium text-base">{result.game_title}</div>
                            <div className="text-slate-400 text-sm mt-1">
                              {result.platformName}
                            </div>
                          </div>
                          <div className="text-amber-400 text-xl flex-shrink-0">→</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-600 my-6"></div>

                {/* Manual Entry */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2">
                      Titolo *
                    </label>
                    <input
                      type="text"
                      value={newGame.title}
                      onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2">
                      Console *
                    </label>
                    <select
                      value={newGame.console}
                      onChange={(e) => setNewGame({ ...newGame, console: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Seleziona console</option>
                      {CONSOLES.map(c => (
                        <option key={c.name} value={c.name}>{c.fullName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2">
                      Versione
                    </label>
                    <select
                      value={newGame.version}
                      onChange={(e) => setNewGame({ ...newGame, version: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:outline-none focus:border-amber-500"
                    >
                      {VERSIONS.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2">
                      URL Copertina
                    </label>
                    <input
                      type="text"
                      value={newGame.coverUrl}
                      onChange={(e) => setNewGame({ ...newGame, coverUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:outline-none focus:border-amber-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2">
                      Barcode (opzionale)
                    </label>
                    <input
                      type="text"
                      value={newGame.barcode}
                      onChange={(e) => setNewGame({ ...newGame, barcode: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:outline-none focus:border-amber-500"
                      placeholder="Es: 045496730130"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={addGame}
                    className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-sm hover:bg-slate-600 transition-all font-bold border-4 border-slate-600 hover:border-slate-500 font-mono"
                  >
                    {addToWishlist ? '💾 SAVE TO WISHLIST' : '💾 SAVE TO COLLECTION'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSearchResults([]);
                      setAddToWishlist(false);
                      setNewGame({ title: '', console: '', version: 'PAL', coverUrl: '', releaseDate: '', apiId: null, barcode: '' });
                    }}
                    className="px-6 py-3 bg-slate-900 text-slate-400 rounded-sm hover:bg-slate-800 transition-colors border-4 border-slate-700 font-mono"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal - Floppy themed */}
        {showEditModal && editingGame && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-sm max-w-2xl w-full border-4 border-slate-600 shadow-2xl relative">
              <div className="absolute top-0 left-0 right-0 h-4 bg-slate-900 rounded-t-sm"></div>
              <div className="p-6 pt-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white font-mono">✏️ EDIT FILE</h2>
                  <button onClick={() => {
                    setShowEditModal(false);
                    setEditingGame(null);
                  }} className="text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2">
                      Titolo *
                    </label>
                    <input
                      type="text"
                      value={editingGame.title}
                      onChange={(e) => setEditingGame({ ...editingGame, title: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2">
                      Console *
                    </label>
                    <select
                      value={editingGame.console}
                      onChange={(e) => setEditingGame({ ...editingGame, console: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Seleziona console</option>
                      {CONSOLES.map(c => (
                        <option key={c.name} value={c.name}>{c.fullName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2">
                      Versione
                    </label>
                    <select
                      value={editingGame.version}
                      onChange={(e) => setEditingGame({ ...editingGame, version: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:outline-none focus:border-amber-500"
                    >
                      {VERSIONS.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2">
                      URL Copertina
                    </label>
                    <input
                      type="text"
                      value={editingGame.coverUrl}
                      onChange={(e) => setEditingGame({ ...editingGame, coverUrl: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:outline-none focus:border-amber-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-amber-400 text-sm font-semibold mb-2">
                      Barcode
                    </label>
                    <input
                      type="text"
                      value={editingGame.barcode || ''}
                      onChange={(e) => setEditingGame({ ...editingGame, barcode: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:outline-none focus:border-amber-500"
                      placeholder="Es: 045496730130"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={saveEdit}
                    className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-sm hover:bg-slate-600 transition-all font-bold border-4 border-slate-600 hover:border-slate-500 font-mono"
                  >
                    💾 SAVE CHANGES
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingGame(null);
                    }}
                    className="px-6 py-3 bg-slate-900 text-slate-400 rounded-sm hover:bg-slate-800 transition-colors border-4 border-slate-700 font-mono"
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
              <div className="absolute top-0 left-0 right-0 h-4 bg-slate-900 rounded-t-sm"></div>
              <div className="p-6 pt-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2 font-mono">
                    <Camera className="w-6 h-6" />
                    BARCODE SCAN
                  </h2>
                  <button onClick={() => {
                    setShowBarcodeModal(false);
                    setBarcodeInput('');
                  }} className="text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-700 rounded-sm p-6 border-2 border-slate-600 text-center">
                    <Camera className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-white mb-2 font-mono">INSERISCI BARCODE/UPC</p>
                    <p className="text-slate-400 text-sm mb-4 font-mono">
                      Inserisci il codice manualmente o usa uno scanner barcode esterno
                    </p>
                    
                    <input
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Es: 045496730130"
                      className="w-full px-4 py-3 bg-slate-800 text-white rounded-sm border-2 border-slate-600 focus:outline-none focus:border-slate-500 text-center font-mono text-lg mb-4"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && barcodeInput) {
                          searchByBarcode(barcodeInput);
                        }
                      }}
                    />

                    <button
                      onClick={() => barcodeInput && searchByBarcode(barcodeInput)}
                      disabled={!barcodeInput || isScanningBarcode}
                      className="w-full px-6 py-3 bg-slate-700 text-white rounded-sm hover:bg-slate-600 transition-all font-bold border-4 border-slate-600 hover:border-slate-500 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isScanningBarcode ? '⏳ RICERCA...' : '🔍 CERCA GIOCO'}
                    </button>
                  </div>

                  <div className="bg-slate-700 rounded-sm p-4 border-2 border-slate-600">
                    <p className="text-slate-300 text-sm font-mono mb-2">💡 SUGGERIMENTI:</p>
                    <ul className="text-slate-400 text-xs space-y-1 font-mono">
                      <li>• Il barcode si trova sul retro della confezione</li>
                      <li>• Formato: codice a 12-13 cifre (UPC/EAN)</li>
                      <li>• Usa uno scanner barcode USB o l'app del telefono</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowBarcodeModal(false);
                    setBarcodeInput('');
                  }}
                  className="w-full mt-6 px-6 py-3 bg-slate-900 text-slate-400 rounded-sm hover:bg-slate-800 transition-colors border-4 border-slate-700 font-mono"
                >
                  CHIUDI
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floppy disk footer - fixed at bottom */}
      <div className="mt-auto border-t-4 border-slate-700 bg-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-3">
            <p className="text-slate-400 font-mono text-sm">
              💾 SAVE SLOT © 2025 • Powered by <span className="text-blue-400 font-bold">Bluemoon_Coder</span>
            </p>
            <p className="text-slate-600 font-mono text-xs mt-1">
              Total Files: {totalGames} • Disk Space: {totalGames + totalWishlist} FILES
            </p>
          </div>
          <div className="text-center border-t border-slate-800 pt-3">
            <p className="text-slate-600 font-mono text-xs">
              Credits: <a href="https://thegamesdb.net/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400">TheGamesDB</a> • 
              <a href="https://www.upcitemdb.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 ml-1">UPC Item DB</a> • 
              <a href="https://corsproxy.io/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 ml-1">CORS Proxy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;