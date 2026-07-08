import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import AppHeader from '@/components/AppHeader';

export default function HowToPlay() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <AppHeader />
      <div className="max-w-3xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            COME SI GIOCA
          </h1>
          <p className="text-slate-400 text-sm">Regole e strategie</p>
        </div>

        {/* Rules */}
        <div className="space-y-6 mb-8">
          {/* Rule 1 */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-2xl font-bold mb-3 text-emerald-400">🎯 Obiettivo</h2>
            <p className="text-slate-200 leading-relaxed">
              Raggiungi il numero <strong>TARGET</strong> usando i tre numeri forniti e gli operatori matematici (+, −, ×, ÷). Più ti avvicini al target, più punti guadagni!
            </p>
          </Card>

          {/* Rule 2 */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-2xl font-bold mb-3 text-emerald-400">⚡ Regola Fondamentale</h2>
            <p className="text-slate-200 leading-relaxed mb-4">
              Le operazioni vengono eseguite <strong>nell'ordine di inserimento</strong>, <strong>senza rispettare la precedenza degli operatori</strong>.
            </p>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-300 mb-2">Esempio:</p>
              <p className="text-lg font-mono font-bold text-emerald-400">2 + 7 × 9 = 81</p>
              <p className="text-xs text-slate-400 mt-2">Non è 2 + (7 × 9) = 65, ma (2 + 7) × 9 = 81</p>
            </div>
          </Card>

          {/* Rule 3 */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-2xl font-bold mb-3 text-emerald-400">⏱️ Tempo</h2>
            <p className="text-slate-200 leading-relaxed">
              Hai <strong>30 secondi</strong> in modalità Easy e <strong>45 secondi</strong> in modalità Hard. Il tempo rimanente aggiunge bonus al punteggio se sei vicino al target!
            </p>
          </Card>

          {/* Rule 4 */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-2xl font-bold mb-3 text-emerald-400">🏆 Punteggio</h2>
            <div className="space-y-2 text-slate-200">
              <p className="flex justify-between"><span>Differenza 0 (Perfetto!)</span> <span className="font-bold text-emerald-400">100 punti</span></p>
              <p className="flex justify-between"><span>Differenza 1</span> <span className="font-bold text-emerald-400">95 punti</span></p>
              <p className="flex justify-between"><span>Differenza 2</span> <span className="font-bold text-emerald-400">90 punti</span></p>
              <p className="flex justify-between"><span>Differenza minore o uguale a 5</span> <span className="font-bold text-yellow-400">80 punti</span></p>
              <p className="flex justify-between"><span>Differenza minore o uguale a 10</span> <span className="font-bold text-yellow-400">60 punti</span></p>
              <p className="flex justify-between"><span>Differenza minore o uguale a 20</span> <span className="font-bold text-slate-300">40 punti</span></p>
              <p className="flex justify-between"><span>Differenza maggiore di 20</span> <span className="font-bold text-slate-400">20 punti</span></p>
            </div>
          </Card>

          {/* Rule 5 */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-2xl font-bold mb-3 text-emerald-400">💡 Strategie</h2>
            <ul className="space-y-2 text-slate-200">
              <li className="flex gap-3">
                <span className="text-emerald-400">✓</span>
                <span>Prova a raggiungere il target esatto per il massimo dei punti.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400">✓</span>
                <span>Usa il pulsante "Annulla" per correggere gli errori.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400">✓</span>
                <span>Ricorda: ogni operazione modifica il risultato precedente.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-400">✓</span>
                <span>Condividi i tuoi risultati perfetti con gli amici!</span>
              </li>
            </ul>
          </Card>

          {/* Difficulty */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-2xl font-bold mb-3 text-emerald-400">🎮 Modalità Difficoltà</h2>
            <div className="space-y-4">
              <div>
                <p className="font-bold text-emerald-400 mb-1">🟢 Easy</p>
                <p className="text-slate-300 text-sm">3 numeri • Target 10-120 • 30 secondi</p>
              </div>
              <div>
                <p className="font-bold text-red-400 mb-1">🔴 Hard</p>
                <p className="text-slate-300 text-sm">4 numeri • Target 10-200 • 45 secondi</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => navigate('/game')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8"
          >
            🎮 Gioca Ora
          </Button>
          <Button
            onClick={() => navigate('/leaderboard')}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-8"
          >
            🏆 Classifica
          </Button>
        </div>
      </div>
    </div>
  );
}
