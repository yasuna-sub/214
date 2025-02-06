import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmotionService } from '../services/emotionService';

describe('EmotionService', () => {
  let emotionService: EmotionService;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    mockLocalStorage = {};
    global.localStorage = {
      getItem: (key: string) => mockLocalStorage[key] || null,
      setItem: (key: string, value: string) => { mockLocalStorage[key] = value },
      removeItem: (key: string) => { delete mockLocalStorage[key] },
      clear: () => { mockLocalStorage = {} },
      length: 0,
      key: () => null,
    };

    emotionService = new EmotionService();
  });

  describe('updateScore', () => {
    it('スコアを正しく更新する', () => {
      const userId = 1;
      const points = 100;

      const newScore = emotionService.updateScore(userId, points);
      expect(newScore).toBe(100);

      const storedScore = emotionService.getScore(userId);
      expect(storedScore).toBe(100);
    });

    it('負のスコアも正しく処理する', () => {
      const userId = 1;
      
      emotionService.updateScore(userId, 100);
      const newScore = emotionService.updateScore(userId, -50);
      
      expect(newScore).toBe(50);
    });
  });

  describe('getScore', () => {
    it('存在しないユーザーのスコアは0を返す', () => {
      const score = emotionService.getScore(999);
      expect(score).toBe(0);
    });

    it('既存のスコアを正しく取得する', () => {
      const userId = 1;
      emotionService.updateScore(userId, 100);
      
      const score = emotionService.getScore(userId);
      expect(score).toBe(100);
    });
  });

  describe('resetScore', () => {
    it('スコアを正しくリセットする', () => {
      const userId = 1;
      emotionService.updateScore(userId, 100);
      
      emotionService.resetScore(userId);
      const score = emotionService.getScore(userId);
      
      expect(score).toBe(0);
    });
  });
}); 