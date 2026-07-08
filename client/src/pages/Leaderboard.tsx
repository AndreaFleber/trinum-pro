import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { Difficulty } from '../../../shared/gameLogic';

export default function Leaderboard() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [, navigate] = useLocation();
  
  const { data: scores, isLoading } = trpc.game.getTopScores.useQuery({
    limit: 100,
    difficulty,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            CLASSIFICA
          </h1>
          <p className="text-slate-400 text-sm">I migliori giocatori di TRINUM</p>
        </div>

        {/* Difficulty Selector */}
        <div className="flex gap-4 justify-center mb-8">
          {(['easy', 'hard'] as const).map(diff => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                difficulty === diff
                  ? diff === 'easy'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {diff === 'easy' ? '🟢 Easy' : '🔴 Hard'}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Caricamento...</div>
          ) : scores && scores.length > 0 ? (
            <div className="divide-y divide-slate-700">
              {scores.map((score, index) => (
                <div
                  key={score.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl font-black w-12 text-center">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white">{score.userName || 'Anonimo'}</div>
                      <div className="text-sm text-slate-400">
                        {score.isPerfect ? '🎯 Perfetto!' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-emerald-400">{score.score}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(score.createdAt).toLocaleDateString('it-IT')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">Nessun punteggio ancora</div>
          )}
        </Card>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate('/game')}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-8"
          >
            ← Torna al Gioco
          </Button>
        </div>
      </div>
    </div>
  );
}
