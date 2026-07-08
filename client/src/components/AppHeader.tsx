import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { startLogin } from '@/const';

export default function AppHeader() {
  const { user, logout, loading } = useAuth();
  const [location, navigate] = useLocation();

  const isHome = location === '/';

  return (
    <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          TRINUM
        </button>

        <div className="flex gap-6 items-center">
          {!isHome && (
            <div className="hidden sm:flex gap-4">
              <button
                onClick={() => navigate('/game')}
                className="text-sm text-slate-300 hover:text-emerald-400 transition-colors"
              >
                🎮 Gioca
              </button>
              <button
                onClick={() => navigate('/leaderboard')}
                className="text-sm text-slate-300 hover:text-emerald-400 transition-colors"
              >
                🏆 Classifica
              </button>
              <button
                onClick={() => navigate('/how-to-play')}
                className="text-sm text-slate-300 hover:text-emerald-400 transition-colors"
              >
                📖 Regole
              </button>
            </div>
          )}

          <div className="flex gap-4 items-center">
            {loading ? (
              <div className="text-sm text-slate-400">Caricamento...</div>
            ) : user ? (
              <>
                <span className="text-sm text-slate-300 hidden sm:inline">{user.name}</span>
                <Button
                  onClick={() => logout()}
                  variant="outline"
                  className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 text-sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => startLogin()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
