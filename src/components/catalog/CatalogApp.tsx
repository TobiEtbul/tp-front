import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { CatalogEntry, CatalogFormData } from '../../lib/supabase';
import MovieCard from './MovieCard';
import MovieForm from './MovieForm';

type FilterType = 'all' | 'movie' | 'series';
type FilterStatus = 'all' | 'watching' | 'completed' | 'wishlist' | 'dropped';
type SortBy = 'newest' | 'oldest' | 'title' | 'rating';

const STATUS_FILTERS: [FilterStatus, string][] = [
  ['all', 'Todos'],
  ['watching', 'Viendo'],
  ['completed', 'Completados'],
  ['wishlist', 'Por ver'],
  ['dropped', 'Abandonados'],
];

export default function CatalogApp() {
  const [entries, setEntries] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CatalogEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [username, setUsername] = useState('');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/login';
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single();

    setUsername(profile?.username || session.user.email?.split('@')[0] || 'Usuario');
    await loadEntries();
  };

  const loadEntries = async () => {
    const { data, error } = await supabase
      .from('catalog')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setEntries(data as CatalogEntry[]);
    setLoading(false);
  };

  const handleAdd = async (formData: CatalogFormData) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('catalog').insert({ ...formData, user_id: session.user.id });
    if (!error) {
      await loadEntries();
      setShowForm(false);
    }
  };

  const handleEdit = async (formData: CatalogFormData) => {
    if (!editingEntry) return;
    const { error } = await supabase
      .from('catalog')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('id', editingEntry.id);

    if (!error) {
      await loadEntries();
      setEditingEntry(null);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('catalog').delete().eq('id', id);
    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setDeleteId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const filtered = entries
    .filter((e) => {
      if (filterType !== 'all' && e.type !== filterType) return false;
      if (filterStatus !== 'all' && e.status !== filterStatus) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title, 'es');
        case 'rating':
          return (b.rating ?? 0) - (a.rating ?? 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const stats = {
    total: entries.length,
    movies: entries.filter((e) => e.type === 'movie').length,
    series: entries.filter((e) => e.type === 'series').length,
    completed: entries.filter((e) => e.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🎬</div>
          <p className="text-slate-400">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 select-none">
            <span className="text-2xl">🎬</span>
            <span className="text-white font-bold text-lg">CineLog</span>
          </a>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm hidden sm:block">
              Hola, <span className="text-white font-medium">{username}</span>
            </span>
            <a href="/profile" className="text-slate-400 hover:text-white transition-colors text-sm">
              Perfil
            </a>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 transition-colors text-sm"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        {stats.total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total', value: stats.total, icon: '🎞️' },
              { label: 'Películas', value: stats.movies, icon: '🎬' },
              { label: 'Series', value: stats.series, icon: '📺' },
              { label: 'Completados', value: stats.completed, icon: '✅' },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white">Mi Catálogo</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {filtered.length !== entries.length
                ? `${filtered.length} de ${entries.length} títulos`
                : `${entries.length} títulos`}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> Agregar
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="🔍 Buscar título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors min-w-[180px]"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="title">A → Z</option>
            <option value="rating">Mejor puntuación</option>
          </select>

          <div className="flex gap-1.5 bg-slate-800 rounded-lg p-1">
            {(['all', 'movie', 'series'] as FilterType[]).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filterType === t
                    ? 'bg-amber-500 text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'all' ? 'Todos' : t === 'movie' ? 'Películas' : 'Series'}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(([s, label]) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filterStatus === s
                    ? 'bg-slate-600 text-white font-medium'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-5">🍿</div>
            <h3 className="text-white text-xl font-semibold mb-2">
              {entries.length === 0 ? 'Tu catálogo está vacío' : 'Sin resultados'}
            </h3>
            <p className="text-slate-400 mb-6">
              {entries.length === 0
                ? 'Agregá tu primera película o serie para empezar'
                : 'Probá con otros filtros de búsqueda'}
            </p>
            {entries.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-lg transition-colors"
              >
                Agregar ahora
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((entry) => (
              <MovieCard
                key={entry.id}
                entry={entry}
                onEdit={() => setEditingEntry(entry)}
                onDelete={() => setDeleteId(entry.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit modal */}
      {(showForm || editingEntry) && (
        <MovieForm
          entry={editingEntry}
          onSubmit={editingEntry ? handleEdit : handleAdd}
          onClose={() => {
            setShowForm(false);
            setEditingEntry(null);
          }}
        />
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-6 max-w-sm w-full border border-slate-700 shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-2">¿Eliminar título?</h3>
            <p className="text-slate-400 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
