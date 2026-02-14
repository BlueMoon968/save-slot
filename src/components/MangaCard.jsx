import React from 'react';
import { TrendingUp } from 'lucide-react';

const MangaCard = React.memo(({ item, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-slate-800 rounded-sm border-4 border-blue-700 hover:border-blue-600 overflow-hidden transition-all shadow-lg cursor-pointer h-full"
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
          <TrendingUp className="w-12 h-12 text-blue-700" />
        </div>
      )}
      <div className="absolute top-2 right-2 bg-blue-600 rounded px-2 py-1 text-xs font-bold font-mono">
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
        {item.volumes ? `Vol ${item.volumes}` : 'Ongoing'} • {item.type}
      </p>
    </div>
  </div>
));

MangaCard.displayName = 'MangaCard';

export default MangaCard;