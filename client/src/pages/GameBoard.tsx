import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import AppHeader from '@/components/AppHeader';
import {
  GAME_CONFIGS,
  calculateExpression,
  calculateScore,
  createShareText,
  formatExpression,
  generateNumbers,
  generateTarget,
  addTimeBonus,
  Difficulty,
} from '../../../shared/gameLogic';

export default function GameBoard() {
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [numbers, setNumbers] = useState<number[]>([]);
  const [target, setTarget] = useState<number>(0);
  const [expression, setExpression] = useState<(number | string)[]>([]);
  const [used, setUsed] = useState<boolean[]>([]);
  const [timer, setTimer] = useState<number>(0);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [result, setResult] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const utils = trpc.useUtils();
  const saveScoreMutation = trpc.game.saveScore.useMutation({
    onSuccess: async () => {
      await utils.game.getTopScores.invalidate();
      await utils.game.getUserStats.invalidate();
    },
    onError: (error) => {
      console.error('Errore nel salvataggio del punteggio:', error);
      // Optionally show a toast or alert to user
    },
  });
  const getTopScoresQuery = trpc.game.getTopScores.useQuery({ limit: 50, difficulty });
  const getUserStatsQuery = trpc.game.getUserStats.useQuery(undefined, { enabled: !!user });

  const config = GAME_CONFIGS[difficulty];
  const numberGridCols = difficulty === 'easy' ? 'grid-cols-3' : 'grid-cols-4';

  // Initialize game
  const startNewGame = useCallback(() => {
    const newNumbers = generateNumbers(difficulty);
    const newTarget = generateTarget(difficulty);
    const newConfig = GAME_CONFIGS[difficulty];
    setNumbers(newNumbers);
    setTarget(newTarget);
    setExpression([]);
    setUsed(new Array(newNumbers.length).fill(false));
    setTimer(newConfig.timerSeconds);
    setGameActive(true);
    setShowResult(false);
    setResult(null);
    setScore(0);
  }, [difficulty]);

  // Timer effect
  useEffect(() => {
    if (!gameActive || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          setGameActive(false);
          finishGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameActive, timer]);

  // Load user stats
  useEffect(() => {
    if (getUserStatsQuery.data) {
      const stats = getUserStatsQuery.data;
      const best = difficulty === 'easy' ? stats.bestScoreEasy : stats.bestScoreHard;
      setBestScore(best);
    }
  }, [getUserStatsQuery.data, difficulty]);

  // Load best score from localStorage for guests
  useEffect(() => {
    if (!user) {
      const localBest = localStorage.getItem(`trinum_best_${difficulty}`);
      if (localBest) {
        setBestScore(parseInt(localBest, 10));
      }
    }
  }, [difficulty, user]);

  const addNumber = (index: number) => {
    if (!gameActive || used[index]) return;
    if (expression.length > 0 && typeof expression[expression.length - 1] === 'number') return;

    const newUsed = [...used];
    newUsed[index] = true;
    setUsed(newUsed);
    setExpression([...expression, numbers[index]]);
  };

  const addOperator = (op: string) => {
    if (!gameActive || expression.length === 0) return;
    if (typeof expression[expression.length - 1] !== 'number') return;

    const usedCount = used.filter(u => u).length;
    if (usedCount === numbers.length) return;

    setExpression([...expression, op]);
  };

  const undoMove = () => {
    if (expression.length === 0) return;

    const last = expression[expression.length - 1];
    const newExpression = expression.slice(0, -1);

    if (typeof last === 'number') {
      const newUsed = [...used];
      for (let i = 0; i < numbers.length; i++) {
        if (newUsed[i] && numbers[i] === last) {
          newUsed[i] = false;
          break;
        }
      }
      setUsed(newUsed);
    }

    setExpression(newExpression);
  };

  const finishGame = () => {
    setGameActive(false);

    const calcResult = calculateExpression(expression);
    if (calcResult === null) {
      setShowResult(true);
      return;
    }

    const difference = Math.abs(target - calcResult);
    const baseScore = calculateScore(difference);
    const timeTaken = config.timerSeconds - timer;
    const finalScore = addTimeBonus(baseScore, timeTaken, difficulty);

    setResult(calcResult);
    setScore(finalScore);
    setShowResult(true);

    // Update best score
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      if (!user) {
        localStorage.setItem(`trinum_best_${difficulty}`, String(finalScore));
      }
    }

    // Save to database if user is authenticated
    if (user) {
      saveScoreMutation.mutate({
        score: finalScore,
        difficulty,
        target,
        result: Math.round(calcResult * 100) / 100,
        difference,
        isPerfect: difference === 0 ? 1 : 0,
        timeTaken,
      });
    }
  };

  const shareResult = () => {
    if (result === null) return;

    const shareText = createShareText(
      target,
      result,
      score,
      difficulty,
      window.location.href
    );

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          alert('Impossibile copiare negli appunti. Prova di nuovo.');
        });
    } else {
      // Fallback for browsers without clipboard API
      alert('Copia manualmente: ' + shareText);
    }
  };

  // Initialize game on mount and when difficulty changes
  useEffect(() => {
    startNewGame();
  }, [difficulty]); // Only depend on difficulty, startNewGame will use current difficulty

  const isPerfect = result !== null && Math.abs(target - result) === 0;
  const isClose = result !== null && Math.abs(target - result) <= 5;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <AppHeader />

      <div className="max-w-2xl mx-auto w-full px-3 sm:px-4 py-2 sm:py-3">

        {/* Title — hidden on mobile (already shown in AppHeader) */}
        <div className="hidden sm:block text-center mb-3 pt-2">
          <h1 className="text-5xl font-black mb-1 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            TRINUM
          </h1>
          <p className="text-slate-400 text-sm">Gioco Matematico Premium</p>
        </div>

        {/* Difficulty Selector */}
        <div className="flex gap-3 justify-center mb-2 sm:mb-4">
          {(['easy', 'hard'] as const).map(diff => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              disabled={gameActive}
              className={`px-5 py-1.5 rounded-lg font-bold text-sm sm:text-base transition-all ${
                difficulty === diff
                  ? diff === 'easy'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              } disabled:opacity-50`}
            >
              {diff === 'easy' ? '🟢 Easy' : '🔴 Hard'}
            </button>
          ))}
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-2 sm:mb-4">
          <Card className="bg-slate-800 border-slate-700 p-2 sm:p-4 text-center">
            <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">Best</div>
            <div className="text-xl sm:text-3xl font-black text-emerald-400">{bestScore}</div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-2 sm:p-4 text-center">
            <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">Tempo</div>
            <div className={`text-xl sm:text-3xl font-black ${timer <= 10 ? 'text-red-400' : 'text-yellow-400'}`}>
              {timer}s
            </div>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-2 sm:p-4 text-center">
            <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">Target</div>
            <div className="text-xl sm:text-3xl font-black text-emerald-400">{target}</div>
          </Card>
        </div>

        {/* Expression Display */}
        <Card className="bg-slate-800 border-slate-700 px-4 py-2 sm:p-4 mb-2 sm:mb-4 min-h-[52px] sm:min-h-20 flex items-center justify-center">
          <div className="text-2xl sm:text-4xl font-bold text-center text-slate-100 break-words">
            {expression.length === 0 ? '...' : formatExpression(expression)}
          </div>
        </Card>

        {/* Numbers */}
        <div className="mb-2 sm:mb-4">
          <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">Numeri</div>
          <div className={`grid ${numberGridCols} gap-2 sm:gap-3`}>
            {numbers.map((num, i) => (
              <button
                key={i}
                onClick={() => addNumber(i)}
                disabled={!gameActive || used[i]}
                className={`h-14 sm:h-16 rounded-xl font-bold text-xl sm:text-2xl transition-all ${
                  used[i]
                    ? 'bg-slate-700 text-slate-500 opacity-30 cursor-not-allowed'
                    : 'bg-slate-700 text-white hover:bg-slate-600 active:scale-95'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Operators */}
        <div className="mb-2 sm:mb-4">
          <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">Operatori</div>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {['+', '-', '*', '/'].map(op => (
              <button
                key={op}
                onClick={() => addOperator(op)}
                disabled={!gameActive}
                className={`h-12 sm:h-14 rounded-xl font-bold text-xl sm:text-2xl transition-all ${
                  !gameActive
                    ? 'bg-slate-700 text-slate-500 opacity-50 cursor-not-allowed'
                    : 'bg-slate-600 text-emerald-400 hover:bg-slate-500 active:scale-95'
                }`}
              >
                {op === '*' ? '×' : op === '/' ? '÷' : op === '-' ? '−' : op}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 mb-2 sm:mb-4">
          <Button
            onClick={undoMove}
            disabled={!gameActive || expression.length === 0}
            variant="outline"
            className="flex-1 h-10 sm:h-11 bg-slate-700 border-slate-600 text-white hover:bg-slate-600 text-sm"
          >
            ↶ Annulla
          </Button>
          <Button
            onClick={finishGame}
            disabled={!gameActive}
            className="flex-1 h-10 sm:h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm"
          >
            ✓ Verifica
          </Button>
          <Button
            onClick={startNewGame}
            className="flex-1 h-10 sm:h-11 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm"
          >
            ⟳ Nuova
          </Button>
        </div>

        {/* Result Display */}
        {showResult && (
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6 animate-in fade-in">
            {result === null ? (
              <div className="text-center">
                <div className="text-xl font-bold text-red-400 mb-4">Operazione Incompleta</div>
                <Button
                  onClick={startNewGame}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold"
                >
                  ⟳ Ricomincia
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">RISULTATO</div>
                  <div className="text-4xl font-black text-white">{result}</div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">DIFFERENZA</div>
                  <div className="text-2xl font-bold text-slate-200">
                    {Math.abs(target - result)}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">PUNTEGGIO</div>
                  <div
                    className={`text-3xl font-black ${
                      isPerfect
                        ? 'text-emerald-400'
                        : isClose
                          ? 'text-yellow-400'
                          : 'text-slate-300'
                    }`}
                  >
                    {score}
                    {isPerfect && ' 🎯'}
                    {isClose && !isPerfect && ' 🔥'}
                  </div>
                </div>

                <Button
                  onClick={shareResult}
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold"
                >
                  {copied ? '✓ Copiato!' : '🔗 Condividi'}
                </Button>

                <Button
                  onClick={startNewGame}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold"
                >
                  ⟳ Nuova Sfida
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
