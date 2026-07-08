import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import AppHeader from "@/components/AppHeader";

export default function Home() {
  const { user, logout, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <AppHeader />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-7xl font-black mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          TRINUM
        </h1>
        <p className="text-2xl text-slate-300 mb-2">Il Gioco Matematico Più Avvincente</p>
        <p className="text-slate-400 mb-12 max-w-2xl mx-auto">
          Raggiungi il numero target usando tre numeri casuali e operazioni matematiche. Sfida te stesso e i tuoi amici nella classifica globale!
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center mb-20">
          <Button
            onClick={() => navigate("/game")}
            className="px-8 py-6 text-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg"
          >
            🎮 Gioca Ora
          </Button>
          <Button
            onClick={() => navigate("/how-to-play")}
            className="px-8 py-6 text-lg bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg"
          >
            📖 Come Si Gioca
          </Button>
          <Button
            onClick={() => navigate("/leaderboard")}
            className="px-8 py-6 text-lg bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg"
          >
            🏆 Classifica
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <Card className="bg-slate-800 border-slate-700 p-8">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-3">Veloce e Avvincente</h3>
            <p className="text-slate-300">
              Partite da 30-45 secondi che mettono alla prova le tue abilità matematiche e di strategia.
            </p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-8">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-3">Classifica Globale</h3>
            <p className="text-slate-300">
              Competi con giocatori da tutto il mondo. Raggiungi il primo posto nella classifica!
            </p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-8">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold mb-3">Ottimizzato per Mobile</h3>
            <p className="text-slate-300">
              Gioca ovunque, su qualsiasi dispositivo. Design responsive e intuitivo.
            </p>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-4xl font-black mb-12 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Come Funziona
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: "1", title: "Genera", desc: "Ricevi 3-4 numeri casuali e un target" },
              { num: "2", title: "Calcola", desc: "Usa +, −, ×, ÷ per raggiungere il target" },
              { num: "3", title: "Punteggi", desc: "Guadagna punti in base alla precisione" },
              { num: "4", title: "Condividi", desc: "Sfida i tuoi amici con i tuoi risultati" },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center">
                  <span className="text-2xl font-black text-slate-900">{step.num}</span>
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Modes */}
        <div className="mb-20">
          <h2 className="text-4xl font-black mb-12 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Modalità di Difficoltà
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-emerald-900/30 to-slate-800 border-emerald-700 p-8">
              <h3 className="text-2xl font-bold mb-4 text-emerald-400">🟢 Easy</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• 3 numeri casuali</li>
                <li>• Target: 10-120</li>
                <li>• Timer: 30 secondi</li>
                <li>• Perfetto per iniziare</li>
              </ul>
            </Card>

            <Card className="bg-gradient-to-br from-red-900/30 to-slate-800 border-red-700 p-8">
              <h3 className="text-2xl font-bold mb-4 text-red-400">🔴 Hard</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• 4 numeri casuali</li>
                <li>• Target: 10-200</li>
                <li>• Timer: 45 secondi</li>
                <li>• Per i campioni</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <h2 className="text-4xl font-black mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Pronto a Giocare?
          </h2>
          <Button
            onClick={() => navigate("/game")}
            className="px-12 py-6 text-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold rounded-lg"
          >
            🎮 Inizia Ora
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 mt-20 py-8 text-center text-slate-400">
        <p>© 2026 Andrea Fleber. Tutti i diritti riservati.</p>
        <p className="text-xs text-slate-500 mt-2">TRINUM Pro - Gioco Matematico Premium</p>
      </footer>
    </div>
  );
}
