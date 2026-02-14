import React from 'react';
import { Star } from 'lucide-react';

const AnimeCard = React.memo(({ item, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-slate-800 rounded-sm border-4 border-pink-700 hover:border-pink-600 overflow-hidden transition-all shadow-lg cursor-pointer"
  >
    <div className="aspect-[3/4] bg-slate-900 relative overflow-hidden">
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
      <div className="absolute top-2 right-2 bg-pink-600 rounded px-2 py-1 text-xs font-bold font-mono">
        {item.status?.toUpperCase()}
      </div>
      {item.score > 0 && (
        <div className="absolute top-2 left-2 bg-amber-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
          {item.score}
        </div>
      )}
    </div>
    <div className="p-2">
      <h3 className="font-bold text-xs truncate font-mono">{item.title}</h3>
      <p className="text-xs text-slate-400 font-mono">
        {item.episodes ? `${item.episodes} eps` : 'Ongoing'} • {item.format}
      </p>
    </div>
  </div>
));

AnimeCard.displayName = 'AnimeCard';

export default AnimeCard;