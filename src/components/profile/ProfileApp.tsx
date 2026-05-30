import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ProfileApp() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/login';
      return;
    }

    setEmail(session.user.email ?? '');
    setUserId(session.user.id);

    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single();

    if (data) setUsername(data.username ?? '');
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({ username, updated_at: new Date().toISOString() })
      .eq('id', userId);

    setMessage(
      error
        ? { text: 'Error al guardar los cambios.', ok: false }
        : { text: 'Perfil actualizado correctamente.', ok: true }
    );
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Cargando perfil...</div>
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
            <a href="/catalog" className="text-slate-400 hover:text-white transition-colors text-sm">
              Catálogo
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

      <main className="max-w-lg mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-8">Mi Perfil</h1>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-4">
          {message && (
            <div
              className={`rounded-lg p-3 mb-5 text-sm border ${
                message.ok
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed"
              />
              <p className="text-slate-600 text-xs mt-1">El email no se puede modificar</p>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">
                Nombre de usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Tu nombre de usuario"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-2.5 rounded-lg transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-white font-semibold mb-4">Cuenta</h2>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 py-2.5 rounded-lg transition-colors font-medium"
          >
            Cerrar sesión
          </button>
        </div>
      </main>
    </div>
  );
}
