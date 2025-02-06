import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ChatService } from '../services/ChatService';
import emotionService from '../services/emotionService';

// emotionServiceのモック
vi.mock('../services/emotionService', () => ({
  default: {
    analyzeEmotion: vi.fn(),
    getScore: vi.fn(),
    updateScore: vi.fn(),
    resetScore: vi.fn(),
    getEmotionScore: vi.fn()
  }
}));

describe('ChatService', () => {
  let chatService: ChatService;
  let mockOnChocolateGet: () => void;

  beforeEach(() => {
    // モックをリセット
    vi.clearAllMocks();
    
    // チョコレートポップアップのコールバックをモック
    mockOnChocolateGet = vi.fn();
    
    // ChatServiceのインスタンスを作成
    chatService = new ChatService(undefined, mockOnChocolateGet);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('感情スコアの計算', () => {
    it('まりぴの感情スコアが正しく計算される', async () => {
      const emotionScore = 90; // 強いポジティブ感情
      const userName = 'まりぴ';
      const userId = 1;

      // emotionServiceのモックを設定
      vi.mocked(emotionService.analyzeEmotion).mockResolvedValue({ 
        total: emotionScore, 
        lastUpdate: new Date().toISOString(),
        emotion: '通常'
      });
      vi.mocked(emotionService.getScore).mockReturnValue(0);

      const response = await chatService.getResponse('こんにちは', userName);

      // 基本ポイント100 × まりぴの係数0.8 = 80
      expect(vi.mocked(emotionService.updateScore)).toHaveBeenCalledWith(userId, 80);
      expect(response.emotionScore).toBeDefined();
    });

    it('のんたんの感情スコアが正しく計算される', async () => {
      const emotionScore = 90; // 強いポジティブ感情
      const userName = 'のんたん';
      const userId = 2;

      vi.mocked(emotionService.analyzeEmotion).mockResolvedValue({ 
        total: emotionScore, 
        lastUpdate: new Date().toISOString(),
        emotion: '通常'
      });
      vi.mocked(emotionService.getScore).mockReturnValue(0);

      const response = await chatService.getResponse('こんにちは', userName);

      // 基本ポイント100 × のんたんの係数1.2 = 120
      expect(vi.mocked(emotionService.updateScore)).toHaveBeenCalledWith(userId, 120);
      expect(response.emotionScore).toBeDefined();
    });

    it('ななほまるの感情スコアが正しく計算される', async () => {
      const emotionScore = 90; // 強いポジティブ感情
      const userName = 'ななほまる';
      const userId = 3;

      vi.mocked(emotionService.analyzeEmotion).mockResolvedValue({ 
        total: emotionScore, 
        lastUpdate: new Date().toISOString(),
        emotion: '通常'
      });
      vi.mocked(emotionService.getScore).mockReturnValue(0);

      const response = await chatService.getResponse('こんにちは', userName);

      // 基本ポイント100 × ななほまるの係数0.9 = 90
      expect(vi.mocked(emotionService.updateScore)).toHaveBeenCalledWith(userId, 90);
      expect(response.emotionScore).toBeDefined();
    });
  });

  describe('チョコレートポップアップの表示', () => {
    it('スコアが閾値を超えたときにチョコレートポップアップが表示される', async () => {
      const userName = 'まりぴ';
      const userId = 1;
      const threshold = 2000;

      // 閾値ぎりぎりのスコアを設定
      vi.mocked(emotionService.getScore).mockReturnValue(1950);
      vi.mocked(emotionService.analyzeEmotion).mockResolvedValue({ 
        total: 90, 
        lastUpdate: new Date().toISOString(),
        emotion: '通常'
      });

      const response = await chatService.getResponse('こんにちは', userName);

      // スコアが閾値を超えたことを確認
      expect(mockOnChocolateGet).toHaveBeenCalled();
      expect(vi.mocked(emotionService.resetScore)).toHaveBeenCalledWith(userId);
      expect(response.emotionScore).toBe(0);
    });

    it('スコアが閾値未満の場合はチョコレートポップアップが表示されない', async () => {
      const userName = 'まりぴ';
      const userId = 1;

      // 閾値より低いスコアを設定
      vi.mocked(emotionService.getScore).mockReturnValue(1000);
      vi.mocked(emotionService.analyzeEmotion).mockResolvedValue({ 
        total: 90, 
        lastUpdate: new Date().toISOString(),
        emotion: '通常'
      });

      const response = await chatService.getResponse('こんにちは', userName);

      expect(mockOnChocolateGet).not.toHaveBeenCalled();
      expect(vi.mocked(emotionService.resetScore)).not.toHaveBeenCalled();
      expect(response.emotionScore).toBeGreaterThan(0);
    });
  });

  describe('感情分析のエラーハンドリング', () => {
    it('感情分析に失敗した場合は小さな固定ポイントが加算される', async () => {
      const userName = 'まりぴ';
      const userId = 1;

      // 感情分析を失敗させる
      vi.mocked(emotionService.analyzeEmotion).mockRejectedValue(new Error('分析エラー'));
      vi.mocked(emotionService.getScore).mockReturnValue(0);

      const response = await chatService.getResponse('こんにちは', userName);

      // 固定ポイント10が加算されることを確認
      expect(vi.mocked(emotionService.updateScore)).toHaveBeenCalledWith(userId, 10);
      expect(response.emotionScore).toBeDefined();
    });
  });
}); 