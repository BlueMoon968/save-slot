import React from 'react';
import { Star } from 'lucide-react';

const AnimeCard = React.memo(({ item, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-slate-800 rounded-sm border-4 border-pink-700 hover:border-pink-600 overflow-hidden transition-all shadow-lg cursor-pointer flex flex-col h-full"
  >
    {/* Cover Image - Fixed aspect ratio */}
    <div className="aspect-[2/3] bg-slate-900 relative overflow-hidden flex-shrink-0">
      {item.cover_url ? (
        <img 
          src={item.cover_url} 
          alt={item.title} 
          className="w-full h-full object-cover" 
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Star className="w-12 h-12 text-pink-700" />
        </div>
      )}
      
      {/* Status Badge */}
      <div className="absolute top-2 right-2 bg-pink-600 rounded px-2 py-1 text-xs font-bold font-mono shadow-lg">
        {item.status?.replace('_', ' ').toUpperCase()}
      </div>
      
      {/* Score Badge */}
      {item.score > 0 && (
        <div className="absolute top-2 left-2 bg-amber-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg">
          {item.score}
        </div>
      )}
    </div>
    
    {/* Info Section - Fixed height */}
    <div className="p-2 sm:p-3 flex-grow flex flex-col justify-between">
      <h3 className="font-bold text-xs sm:text-sm line-clamp-2 font-mono mb-1">
        {item.title}
      </h3>
      <p className="text-xs text-slate-400 font-mono">
        {item.episodes ? `${item.episodes} eps` : 'Ongoing'} • {item.format || 'TV'}
      </p>
    </div>
  </div>
));

AnimeCard.displayName = 'AnimeCard';

export default AnimeCard;