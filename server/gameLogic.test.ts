import { describe, it, expect } from 'vitest';
import {
  calculateExpression,
  calculateScore,
  createShareText,
  formatExpression,
  generateNumbers,
  generateTarget,
  GAME_CONFIGS,
} from '../shared/gameLogic';

describe('Game Logic', () => {
  describe('calculateExpression', () => {
    it('should calculate simple addition', () => {
      const result = calculateExpression([2, '+', 3]);
      expect(result).toBe(5);
    });

    it('should calculate sequential operations without precedence', () => {
      // 2 + 7 × 9 should equal 81 (not 65)
      const result = calculateExpression([2, '+', 7, '*', 9]);
      expect(result).toBe(81);
    });

    it('should handle subtraction', () => {
      const result = calculateExpression([10, '-', 3]);
      expect(result).toBe(7);
    });

    it('should handle division', () => {
      const result = calculateExpression([20, '/', 4]);
      expect(result).toBe(5);
    });

    it('should handle division by zero', () => {
      const result = calculateExpression([10, '/', 0]);
      expect(result).toBeNull();
    });

    it('should return null for empty expression', () => {
      const result = calculateExpression([]);
      expect(result).toBeNull();
    });

    it('should return null for incomplete expression', () => {
      const result = calculateExpression([2, '+']);
      expect(result).toBeNull();
    });

    it('should handle complex sequential operations', () => {
      // 5 × 2 + 3 - 1 = (5 × 2) + 3 - 1 = 10 + 3 - 1 = 12
      const result = calculateExpression([5, '*', 2, '+', 3, '-', 1]);
      expect(result).toBe(12);
    });

    it('should round to 2 decimal places', () => {
      const result = calculateExpression([10, '/', 3]);
      expect(result).toBe(3.33);
    });
  });

  describe('calculateScore', () => {
    it('should return 100 for perfect match', () => {
      expect(calculateScore(0)).toBe(100);
    });

    it('should return 95 for difference of 1', () => {
      expect(calculateScore(1)).toBe(95);
    });

    it('should return 90 for difference of 2', () => {
      expect(calculateScore(2)).toBe(90);
    });

    it('should return 80 for difference <= 5', () => {
      expect(calculateScore(5)).toBe(80);
    });

    it('should return 60 for difference <= 10', () => {
      expect(calculateScore(10)).toBe(60);
    });

    it('should return 40 for difference <= 20', () => {
      expect(calculateScore(20)).toBe(40);
    });

    it('should return 20 for large difference', () => {
      expect(calculateScore(100)).toBe(20);
    });
  });

  describe('formatExpression', () => {
    it('should format expression with symbols', () => {
      const formatted = formatExpression([2, '+', 3, '*', 4]);
      expect(formatted).toBe('2 + 3 × 4');
    });

    it('should replace division symbol', () => {
      const formatted = formatExpression([10, '/', 2]);
      expect(formatted).toBe('10 ÷ 2');
    });

    it('should replace minus symbol', () => {
      const formatted = formatExpression([5, '-', 2]);
      expect(formatted).toBe('5 − 2');
    });
  });

  describe('generateNumbers', () => {
    it('should generate correct count for easy mode', () => {
      const numbers = generateNumbers('easy');
      expect(numbers).toHaveLength(GAME_CONFIGS.easy.numberCount);
    });

    it('should generate correct count for hard mode', () => {
      const numbers = generateNumbers('hard');
      expect(numbers).toHaveLength(GAME_CONFIGS.hard.numberCount);
    });

    it('should generate numbers between 1 and 9', () => {
      const numbers = generateNumbers('easy');
      numbers.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(9);
      });
    });
  });

  describe('generateTarget', () => {
    it('should generate target in easy range', () => {
      const target = generateTarget('easy');
      expect(target).toBeGreaterThanOrEqual(GAME_CONFIGS.easy.targetMin);
      expect(target).toBeLessThanOrEqual(GAME_CONFIGS.easy.targetMax);
    });

    it('should generate target in hard range', () => {
      const target = generateTarget('hard');
      expect(target).toBeGreaterThanOrEqual(GAME_CONFIGS.hard.targetMin);
      expect(target).toBeLessThanOrEqual(GAME_CONFIGS.hard.targetMax);
    });
  });

  describe('createShareText', () => {
    it('should create share text with perfect score', () => {
      const text = createShareText(50, 50, 100, 'easy', 'https://trinum.game');
      expect(text).toContain('🎯 PERFETTO!');
      expect(text).toContain('Target: 50');
      expect(text).toContain('Punteggio: 100');
    });

    it('should create share text with close score', () => {
      const text = createShareText(50, 48, 80, 'hard', 'https://trinum.game');
      expect(text).toContain('🔥 QUASI!');
      expect(text).toContain('🔴 Hard');
    });
  });
});
