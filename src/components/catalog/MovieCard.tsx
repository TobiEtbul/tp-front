import type { CatalogEntry } from '../../lib/supabase';

const STATUS_CONFIG = {
  watching: { label: 'Viendo', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  completed: { label: 'Completado', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  wishlist: { label: 'Por ver', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  dropped: { label: 'Abandonado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

interface Props {
  entry: CatalogEntry;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MovieCard({ entry, onEdit, onDelete }: Props) {
  const status = STATUS_CONFIG[entry.status];

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-600 transition-all duration-200 group flex flex-col">
      {/* Poster */}
      <div className="aspect-[2/3] bg-slate-800 relative overflow-hidden flex-shrink-0">
        {entry.poster_url ? (
          <img
            src={entry.poster_url}
            alt={entry.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="w-full h-full flex items-center justify-center text-slate-600"
          style={{ display: entry.poster_url ? 'none' : 'flex' }}
        >
          <span className="text-5xl">{entry.type === 'movie' ? '🎬' : '📺'}</span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={onEdit}
            className="bg-amber-500 hover:bg-amber-400 text-black p-2.5 rounded-lg transition-colors"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 hover:bg-red-500 text-white p-2.5 rounded-lg transition-colors"
            title="Eliminar"
          >
            🗑️
          </button>
        </div>

        {/* Rating badge */}
        {entry.rating !== null && (
          <div className="absolute top-2 right-2 bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-md shadow">
            ⭐ {entry.rating}
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-md">
          {entry.type === 'movie' ? 'Película' : 'Serie'}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5">
        <h3 className="text-white font-medium text-sm leading-snug line-clamp-2">{entry.title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full border w-fit ${status.color}`}>
          {status.label}
        </span>
        {(entry.year || entry.genre) && (
          <p className="text-slate-500 text-xs">
            {[entry.year, entry.genre].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </div>
  );
}
