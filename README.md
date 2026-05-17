# ðŸ’¾ SAVE SLOT

<div align="center">

![Save Slot Banner](https://img.shields.io/badge/Save%20Slot-v2.0-brightgreen?style=for-the-badge&logo=gamepad)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**A retro-styled video game collection manager with cloud sync** ðŸŽ®

*Track your collection â€¢ Manage your wishlist â€¢ Never lose a game again*

[âœ¨ Features](#-features) â€¢ [ðŸš€ Quick Start](#-quick-start) â€¢ [ðŸ› ï¸ Tech Stack](#ï¸-tech-stack)

</div>

---

## ðŸŽ¯ What is Save Slot?

Save Slot is a modern web application designed for video game collectors who want to:
- **Track their collection** across 25+ gaming platforms
- **Manage wishlists** for games they want to buy
- **Sync data to the cloud** with real-time updates
- **Search games easily** using IGDB or TheGamesDB APIs
- **Export/Import** collections via CSV

Built with a nostalgic 90s floppy disk aesthetic, Save Slot brings retro charm to modern game collecting! ðŸ’¾

---

## âœ¨ Features

### ðŸŽ® Core Features
- **Multi-User Authentication** - Secure login system with per-user data isolation
- **Cloud Sync** - Automatic sync to Supabase with offline fallback
- **Dual Collections** - Separate "Collection" and "Wishlist" management
- **25+ Consoles Supported** - PlayStation, Xbox, Nintendo, and retro systems
- **API Integration** - Auto-fetch game covers and metadata from IGDB or TheGamesDB
- **CSV Import/Export** - Bulk operations and data portability

### ðŸŽ¨ User Experience
- **Grid & List Views** - Toggle between card grid and detailed list
- **Advanced Filtering** - Search by title, filter by console/version
- **Statistics Dashboard** - Collection insights and breakdowns
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Real-time Sync Status** - Visual indicators (syncing/synced/error)
- **Retro UI Theme** - Nostalgic floppy disk aesthetic with modern UX

### âš¡ Performance
- **Optimized Rendering** - React.memo for game cards
- **Debounced Saves** - 1-second delay prevents excessive DB writes
- **Lazy Image Loading** - Fast initial page load
- **Local Storage Fallback** - Works offline with auto-sync

---

## ðŸš€ Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Supabase account ([sign up free](https://supabase.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/save-slot.git
cd save-slot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase

#### Create Your Supabase Project
1. Go to [supabase.com](https://supabase.com/) and create a new project
2. Note your Project URL and Anon Key

#### Create Database Tables

Run this SQL in your Supabase SQL Editor:

```sql
-- Games table
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  console TEXT NOT NULL,
  version TEXT DEFAULT 'PAL',
  cover_url TEXT,
  release_date TEXT,
  api_id INTEGER,
  is_wishlist BOOLEAN DEFAULT FALSE,
  added_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_is_wishlist ON games(is_wishlist);
CREATE INDEX idx_games_console ON games(console);
CREATE INDEX idx_games_user_wishlist ON games(user_id, is_wishlist);

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);

-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable all operations for all users" 
ON games FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users" 
ON users FOR ALL TO public USING (true) WITH CHECK (true);
```

#### Create Test Users

```sql
INSERT INTO users (id, username, password) VALUES
  ('user-mario', 'mario', 'password123'),
  ('user-luigi', 'luigi', 'password456');
```

> âš ï¸ **Security Note:** Production apps should use bcrypt for password hashing!

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Deploy Supabase Edge Functions

Deploy the API proxy functions:

```bash
npx supabase functions deploy tgdb
npx supabase functions deploy igdb
```

> ðŸ’¡ These functions proxy requests to TheGamesDB and IGDB APIs

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser!

### 7. Login

Use the test credentials:
- Username: `mario`
- Password: `password123`

---

## ðŸ› ï¸ Tech Stack

### Frontend
- **[React 19](https://react.dev/)** - UI framework
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Backend & Services
- **[Supabase](https://supabase.com/)** - PostgreSQL database and auth
- **[Supabase Edge Functions](https://supabase.com/docs/guides/functions)** - Serverless API proxies
- **[TheGamesDB API](https://thegamesdb.net/)** - Game metadata and cover art
- **[IGDB](https://www.igdb.com/)** - Game metadata, covers, franchises and series

### Additional Libraries
- **[React Hooks](https://react.dev/reference/react)** - State management (useState, useEffect, useMemo, useCallback)

---

## ðŸ“ Project Structure

```
save-slot/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ App.jsx           # Main application component
â”‚   â”œâ”€â”€ supabase.js       # Supabase client configuration
â”‚   â”œâ”€â”€ main.jsx          # React entry point
â”‚   â””â”€â”€ index.css         # Tailwind CSS imports
â”œâ”€â”€ public/               # Static assets
â”œâ”€â”€ supabase/
â”‚   â””â”€â”€ functions/        # Edge Functions
â”‚       â”œâ”€â”€ tgdb/         # TheGamesDB API proxy
│       └── igdb/         # IGDB API proxy
â”œâ”€â”€ .env                  # Environment variables (create this)
â”œâ”€â”€ package.json          # Dependencies
â”œâ”€â”€ vite.config.js        # Vite configuration
â””â”€â”€ tailwind.config.js    # Tailwind configuration
```

---

## ðŸŽ® Supported Consoles

Save Slot supports **25 gaming platforms:**

| Sony               | Nintendo              | Microsoft         | Handhelds / Others      |
|--------------------|-----------------------|-------------------|-------------------------|
| PlayStation (PS1)  | NES                   | Xbox              | Game Boy                |
| ID: 10             | ID: 7                 | ID: 14            | ID: 4                   |
| Aliases: PS1, PSX  | Aliases: NES          | Aliases: Xbox     | Aliases: GB             |
|                    |                       |                   |                         |
| PlayStation 2      | SNES                  | Xbox 360          | Game Boy Color          |
| ID: 11             | ID: 6                 | ID: 15            | ID: 41                  |
| Aliases: PS2       | Aliases: Super Nintendo, SNES | Aliases: Xbox 360 | Aliases: GBC       |
|                    |                       |                   |                         |
| PlayStation 3      | Nintendo 64           | Xbox One          | Game Boy Advance        |
| ID: 12             | ID: 3                 | ID: 4920          | ID: 5                   |
| Aliases: PS3       | Aliases: N64          | Aliases: Xbox One | Aliases: GBA            |
|                    |                       |                   |                         |
| PlayStation 4      | GameCube              | Xbox Series X     | Nintendo DS             |
| ID: 4919           | ID: 2                 | ID: 4981          | ID: 8                   |
| Aliases: PS4       | Aliases: NGC          | Aliases: Series X | Aliases: NDS, DS        |
|                    |                       |                   |                         |
| PlayStation 5      | Wii                   | PC (Windows)      | Nintendo 3DS            |
| ID: 4980           | ID: 9                 | ID: 1             | ID: 4912                |
| Aliases: PS5       | Aliases: Wii          | Aliases: PC, Windows | Aliases: 3DS         |
|                    |                       |                   |                         |
| PSP                | Wii U                 | Mac               | PS Vita                 |
| ID: 13             | ID: 38                | ID: 37            | ID: 39                  |
| Aliases: PSP       | Aliases: Wii U        | Aliases: macOS    | Aliases: PS Vita, Vita  |
|                    |                       |                   |                         |
| Dreamcast          | Nintendo Switch       | Android           | iOS                     |
| ID: 23             | ID: 4971              | ID: 4916          | ID: 4915                |
| Aliases: Sega Dreamcast | Aliases: Switch | Aliases: Android  | Aliases: iPhone, iPad   |
|                    |                       |                   |                         |
| Sega Genesis       | Nintendo Switch 2     |                   | Sega Game Gear          |
| ID: 18             | ID: 5021              |                   | ID: 20                  |
| Aliases: Mega Drive| Aliases: Switch 2     |                   | Aliases: Game Gear      |
|                    |                       |                   |                         |
| Sega CD            |                       |                   | Sega Master System      |
| ID: 21             |                       |                   | ID: 35                  |
| Aliases: Mega-CD   |                       |                   | Aliases: Master System  |
|                    |                       |                   |                         |
| Sega Saturn        |                       |                   | Sega Mega Drive         |
| ID: 17             |                       |                   | ID: 36                  |
| Aliases: Saturn    |                       |                   | Aliases: Mega Drive     |
|                    |                       |                   |                         |
| TurboGrafx-16      | Neo Geo               |                   |                         |
| ID: 34             | ID: 24                |                   |                         |
| Aliases: TG-16     | Aliases: Neo Geo      |                   |                         |

---

## ðŸ”‘ Key Features Explained

### Authentication System
- Simple username/password authentication
- Session persistence via localStorage
- Per-user data isolation in database
- Logout functionality with confirmation

### Cloud Sync
- Automatic sync to Supabase every 1 second (debounced)
- Visual sync status indicators (green/blue/red)
- LocalStorage fallback for offline use
- Conflict resolution on reconnect

### Game Management
- Add games via search (TheGamesDB API)
- Manual entry option
- Edit game details with API cover search
- Move games between collection/wishlist
- Delete with confirmation

### Data Portability
- Export collection as CSV
- Import CSV files (bulk add)
- Preserves game metadata
- Compatible with spreadsheet apps

---

## ðŸš¦ Database Conventions

### Snake Case Naming
All database columns use `snake_case` (PostgreSQL convention):

```javascript
// âœ… Correct
game.cover_url
game.added_date
game.api_id
game.release_date

// âŒ Incorrect
game.coverUrl
game.addedDate
```

### User ID Format
User IDs follow the pattern: `user-{username}`

Example: `user-mario`, `user-luigi`

---

## ðŸ› Known Issues & Limitations

### Security
- **Current:** Plain text passwords (development only)
- **Recommended:** Implement bcrypt hashing or use Supabase Auth for production

### API Rate Limits
- TheGamesDB: Limited requests per day
- Implement caching and rate limiting for production use

---

## ðŸ›£ï¸ Roadmap

### Planned Features
- [ ] **Completion Status Tracking** - Mark games as playing/completed/backlog
- [ ] **Rating System** - Rate your games 1-5 stars
- [O] **Collection Value Estimator** - Track collection worth via PriceCharting API (currently using custom method)
- [ ] **Advanced Sorting** - Sort by title, date, rating, console
- [ ] **Notes/Comments** - Add personal notes to games
- [X] **Duplicate Detection** - Prevent accidental duplicate purchases
- [ ] **PWA Support** - Install as mobile app
- [ ] **Dark/Light Themes** - Theme toggle
- [ ] **Social Features** - Share collections, compare with friends
- [ ] **Achievement Badges** - Unlock milestones

---

## ðŸ“ License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## ðŸ™ Acknowledgments

- **[TheGamesDB](https://thegamesdb.net/)** - Game metadata and cover art API
- **[Supabase](https://supabase.com/)** - Backend infrastructure
- **[Lucide](https://lucide.dev/)** - Beautiful open-source icons
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling framework
- Inspired by retro floppy disk aesthetics ðŸ’¾

## ðŸŒŸ Star History

If you find Save Slot useful, please consider giving it a â­ on GitHub!

---

<div align="center">

**Made with â¤ï¸ by game collectors, for game collectors**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/save-slot?style=social)](https://github.com/yourusername/save-slot/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/save-slot?style=social)](https://github.com/yourusername/save-slot/network/members)

ðŸ’¾ **SAVE SLOT v2.0** ðŸ’¾

</div>
