import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiaryService } from '../services/diaryService';
import type { SavedDiary } from '../services/diaryService';

// モックフェッチの設定
const mockFetch = vi.fn();
global.fetch = mockFetch;

// LocalStorageのモック
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('DiaryService', () => {
  let diaryService: DiaryService;

  beforeEach(() => {
    diaryService = new DiaryService();
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReset();
    mockLocalStorage.setItem.mockReset();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getSavedDiaries', () => {
    it('空のローカルストレージから空の配列を返す', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const diaries = diaryService.getSavedDiaries();
      expect(diaries).toEqual([]);
    });

    it('保存された日記を正しく取得する', () => {
      const mockDiaries: SavedDiary[] = [
        { userId: 1, content: '日記1', timestamp: '2024-02-13T00:00:00.000Z' },
        { userId: 2, content: '日記2', timestamp: '2024-02-13T00:00:00.000Z' },
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockDiaries));
      const diaries = diaryService.getSavedDiaries();
      expect(diaries).toEqual(mockDiaries);
    });
  });

  describe('saveDiary', () => {
    it('新しい日記を保存する', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      const newDiary: SavedDiary = {
        userId: 1,
        content: '新しい日記',
        timestamp: '2024-02-13T00:00:00.000Z',
      };

      diaryService.saveDiary(newDiary);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'savedDiaries',
        JSON.stringify([newDiary])
      );
    });

    it('既存の日記を更新する', () => {
      const existingDiaries = [
        { userId: 1, content: '古い日記', timestamp: '2024-02-12T00:00:00.000Z' },
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingDiaries));

      const updatedDiary: SavedDiary = {
        userId: 1,
        content: '更新された日記',
        timestamp: '2024-02-13T00:00:00.000Z',
      };

      diaryService.saveDiary(updatedDiary);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'savedDiaries',
        JSON.stringify([updatedDiary])
      );
    });
  });

  describe('handleDiaryClick', () => {
    const mockUser = {
      id: 1,
      name: 'テストユーザー',
      avatar: 'test.jpg',
      group: 'テストグループ',
      description: 'テストの説明',
    };

    const mockUserProfile = {
      name: 'テストユーザー',
      description: 'テストの説明',
    };

    it('既存の日記が存在する場合、それを返す', async () => {
      const existingDiary = {
        userId: 1,
        content: '既存の日記',
        timestamp: '2024-02-13T00:00:00.000Z',
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([existingDiary]));

      const result = await diaryService.handleDiaryClick(mockUser, mockUserProfile);
      expect(result).toEqual({
        diary: existingDiary.content,
        isNewDiary: false,
      });
    });

    it('新しい日記を生成して保存する', async () => {
      // タイムアウトを10秒に設定
      vi.setConfig({ testTimeout: 10000 });

      // モックの設定
      const mockFetch = vi.fn().mockImplementation((url, options) => {
        const response = {
          ok: true,
          json: async () => ({ response: 'テスト応答' })
        };
        return Promise.resolve(response);
      });
      global.fetch = mockFetch;

      const diaryService = new DiaryService();
      const result = await diaryService.handleDiaryClick(mockUser, mockUserProfile);

      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    }, 10000); // タイムアウトを10秒に設定

    it('APIエラー時に適切なエラーを投げる', async () => {
      mockLocalStorage.getItem.mockReturnValue('[]');
      mockFetch.mockRejectedValueOnce(new Error('日記の生成に失敗しました'));

      await expect(diaryService.handleDiaryClick(mockUser, mockUserProfile))
        .rejects
        .toThrow('日記の生成に失敗しました');
    });
  });

  describe('chatBasedOnDiary', () => {
    const mockCharacter = {
      name: 'テストキャラクター',
      description: 'テストの説明',
    };

    it('チャットレスポンスを正しく返す', async () => {
      const mockResponse = 'チャットの返信';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ response: mockResponse }),
      });

      const result = await diaryService.chatBasedOnDiary(
        'こんにちは',
        mockCharacter,
        '日記の内容'
      );

      expect(result).toBe(mockResponse);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('APIエラー時に適切なエラーを投げる', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Chat API Error'));

      await expect(
        diaryService.chatBasedOnDiary('こんにちは', mockCharacter, '日記の内容')
      ).rejects.toThrow('Chat API Error');
    });
  });

  describe('clearAllData', () => {
    it('日記関連のデータを全て削除する', async () => {
      // localStorage.keyのモックを設定
      mockLocalStorage.key
        .mockReturnValueOnce('diary_1')
        .mockReturnValueOnce('diary_2')
        .mockReturnValueOnce('other_key')
        .mockReturnValueOnce(null);
      
      // lengthプロパティを設定
      Object.defineProperty(mockLocalStorage, 'length', { value: 3 });

      await diaryService.clearAllData();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('diary_1');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('diary_2');
    });
  });

  describe('generateDiary', () => {
    const mockCharacter = {
      name: 'テストキャラクター',
      description: 'テストの説明',
    };

    const mockUserProfile = {
      name: 'テストユーザー',
      description: 'テストの説明',
    };

    it('日記を正しく生成する', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ response: '性格分析結果' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ response: '思考内容' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ response: '生成された日記' }),
        });

      const result = await diaryService.generateDiary(mockCharacter, mockUserProfile);
      
      expect(result).toBe('生成された日記');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('APIエラー時に適切なエラーを投げる', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      await expect(diaryService.generateDiary(mockCharacter, mockUserProfile))
        .rejects
        .toThrow('日記の生成に失敗しました');
    });
  });

  describe('analyzeMaleProfile', () => {
    const mockUserProfile = {
      name: 'テストユーザー',
      description: 'テストの説明',
    };

    it('性格分析を正しく実行する', async () => {
      const mockResponse = '性格分析結果';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ response: mockResponse }),
      });

      const result = await diaryService.analyzeMaleProfile(mockUserProfile);
      
      expect(result).toBe(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('APIエラー時に適切なエラーを投げる', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      await expect(diaryService.analyzeMaleProfile(mockUserProfile))
        .rejects
        .toThrow('日記の生成に失敗しました');
    });
  });

  describe('generateFemaleThoughts', () => {
    const mockCharacter = {
      name: 'テストキャラクター',
      description: 'テストの説明',
    };

    it('思考内容を正しく生成する', async () => {
      const mockResponse = '思考内容';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ response: mockResponse }),
      });

      const result = await diaryService.generateFemaleThoughts('性格分析結果', mockCharacter);
      
      expect(result).toBe(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('APIエラー時に適切なエラーを投げる', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      await expect(diaryService.generateFemaleThoughts('性格分析結果', mockCharacter))
        .rejects
        .toThrow('日記の生成に失敗しました');
    });
  });

  describe('generateDiaryContent', () => {
    const mockCharacter = {
      name: 'テストキャラクター',
      description: 'テストの説明',
    };

    it('日記内容を正しく生成する', async () => {
      const mockResponse = '生成された日記';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ response: mockResponse }),
      });

      const result = await diaryService.generateDiaryContent('思考内容', mockCharacter);
      
      expect(result).toBe(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('APIエラー時に適切なエラーを投げる', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      await expect(diaryService.generateDiaryContent('思考内容', mockCharacter))
        .rejects
        .toThrow('日記の生成に失敗しました');
    });
  });

  describe('resetConversation', () => {
    it('会話をリセットする', async () => {
      // Vertex AIでは会話履歴を保持しないため、何もしない
      await expect(diaryService.resetConversation('テストキャラクター'))
        .resolves
        .toBeUndefined();
    });
  });
}); 