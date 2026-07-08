/**
 * Shared game logic for TRINUM
 * This file contains pure functions that can be used on both client and server
 */

export type Difficulty = 'easy' | 'hard';

export interface GameConfig {
  difficulty: Difficulty;
  numberCount: number;
  targetMin: number;
  targetMax: number;
  timerSeconds: number;
}

export const GAME_CONFIGS: Record<Difficulty, GameConfig> = {
  easy: {
    difficulty: 'easy',
    numberCount: 3,
    targetMin: 10,
    targetMax: 120,
    timerSeconds: 30,
  },
  hard: {
    difficulty: 'hard',
    numberCount: 4,
    targetMin: 10,
    targetMax: 200,
    timerSeconds: 45,
  },
};

/**
 * Generate random number between min and max (inclusive)
 */
export function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random numbers for a game
 */
export function generateNumbers(difficulty: Difficulty): number[] {
  const config = GAME_CONFIGS[difficulty];
  const numbers: number[] = [];
  for (let i = 0; i < config.numberCount; i++) {
    numbers.push(rand(1, 9));
  }
  return numbers;
}

/**
 * Generate target number for a game
 */
export function generateTarget(difficulty: Difficulty): number {
  const config = GAME_CONFIGS[difficulty];
  return rand(config.targetMin, config.targetMax);
}

/**
 * Calculate result from expression (sequential, no operator precedence)
 * Expression format: [num, op, num, op, num, ...]
 * Returns null if expression is invalid
 */
export function calculateExpression(expression: (number | string)[]): number | null {
  if (expression.length === 0) return null;
  if (typeof expression[0] !== 'number') return null;

  let result = expression[0] as number;

  for (let i = 1; i < expression.length; i += 2) {
    const operator = expression[i] as string;
    const operand = expression[i + 1];

    if (typeof operand !== 'number') return null;

    switch (operator) {
      case '+':
        result = result + operand;
        break;
      case '-':
        result = result - operand;
        break;
      case '*':
        result = result * operand;
        break;
      case '/':
        if (operand === 0) return null;
        result = result / operand;
        break;
      default:
        return null;
    }
  }

  // Round to 2 decimal places
  return Math.round(result * 100) / 100;
}

/**
 * Calculate score based on difference from target
 */
export function calculateScore(difference: number): number {
  if (difference === 0) return 100;
  if (difference === 1) return 95;
  if (difference === 2) return 90;
  if (difference <= 5) return 80;
  if (difference <= 10) return 60;
  if (difference <= 20) return 40;
  return 20;
}

/**
 * Add time bonus if score is good
 */
export function addTimeBonus(score: number, timeTaken: number, difficulty: Difficulty): number {
  const config = GAME_CONFIGS[difficulty];
  const timeBonus = Math.max(0, config.timerSeconds - timeTaken);
  
  // Only add bonus if score is at least 60 (close or perfect)
  if (score >= 60) {
    return score + timeBonus;
  }
  
  return score;
}

/**
 * Format expression for display
 */
export function formatExpression(expression: (number | string)[]): string {
  return expression
    .map((item, index) => {
      if (item === '*') return '×';
      if (item === '/') return '÷';
      if (item === '-') return '−';
      return String(item);
    })
    .join(' ');
}

/**
 * Create shareable result text (Wordle-style)
 */
export function createShareText(
  target: number,
  result: number,
  score: number,
  difficulty: Difficulty,
  siteUrl: string
): string {
  const difference = Math.abs(target - result);
  let stars = '⭐';
  
  if (difference === 0) {
    stars = '⭐⭐⭐ 🎯 PERFETTO!';
  } else if (difference <= 5) {
    stars = '⭐⭐ 🔥 QUASI!';
  }

  const difficultyLabel = difficulty === 'easy' ? '🟢 Easy' : '🔴 Hard';

  return `🧩 TRINUM ${difficultyLabel}
🎯 Target: ${target}
🔢 Risultato: ${result}
📊 Differenza: ${difference}
🏆 Punteggio: ${score} ${stars}

Gioca anche tu: ${siteUrl}`;
}
