import { useState } from 'react';
import type { CatalogEntry, CatalogFormData } from '../../lib/supabase';

interface Props {
  entry?: CatalogEntry | null;
  onSubmit: (data: CatalogFormData) => Promise<void>;
  onClose: () => void;
}

const GENRES = [
  'Acción', 'Aventura', 'Comedia', 'Drama', 'Fantasía',
  'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animación',
  'Documental', 'Misterio', 'Otro',
];

export default function MovieForm({ entry, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<CatalogFormData>({
    title: entry?.title ?? '',
    type: entry?.type ?? 'movie',
    status: entry?.status ?? 'wishlist',
    rating: entry?.rating ?? null,
    review: entry?.review ?? null,
    poster_url: entry?.poster_url ?? null,
    genre: entry?.genre ?? null,
    year: entry?.year ?? null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof CatalogFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const numeric = name === 'rating' || name === 'year';
    set(name as keyof CatalogFormData, value === '' ? null : numeric ? Number(value) : value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit(form);
    } catch {
      setError('Ocurrió un error. Intentá de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h2 className="text-white font-bold text-lg">
            {entry ? 'Editar título' : 'Agregar al catálogo'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">
              Título <span className="text-amber-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleInput}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Nombre de la película o serie"
            />
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Tipo</label>
              <select
                name="type"
                value={form.type}
                onChange={handleInput}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="movie">Película</option>
                <option value="series">Serie</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Estado</label>
              <select
                name="status"
                value={form.status}
                onChange={handleInput}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="wishlist">Por ver</option>
                <option value="watching">Viendo</option>
                <option value="completed">Completado</option>
                <option value="dropped">Abandonado</option>
              </select>
            </div>
          </div>

          {/* Rating + Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">
                Puntuación (1–10)
              </label>
              <input
                type="number"
                name="rating"
                value={form.rating ?? ''}
                onChange={handleInput}
                min={1}
                max={10}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Año</label>
              <input
                type="number"
                name="year"
                value={form.year ?? ''}
                onChange={handleInput}
                min={1888}
                max={2030}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="2024"
              />
            </div>
          </div>

          {/* Genre */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Género</label>
            <select
              name="genre"
              value={form.genre ?? ''}
              onChange={handleInput}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="">Sin especificar</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Poster URL */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">URL del póster</label>
            <input
              name="poster_url"
              value={form.poster_url ?? ''}
              onChange={handleInput}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="https://..."
            />
          </div>

          {/* Review */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Reseña personal</label>
            <textarea
              name="review"
              value={form.review ?? ''}
              onChange={handleInput}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
              placeholder="¿Qué te pareció?"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !form.title.trim()}
              className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Guardando...' : entry ? 'Guardar cambios' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
