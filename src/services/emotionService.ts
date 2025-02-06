import { BaseAIService, Character } from './base/BaseAIService';

export interface EmotionScore {
  total: number;
  lastUpdate: string;
  emotion: string;  // optionalを削除
}

const EMOTION_RANGES = {
  '嬉しい': { min: 80, max: 100 },
  '楽しい': { min: 60, max: 79 },
  '好き': { min: 90, max: 100 },
  'キュン': { min: 70, max: 89 },
  'ドキドキ': { min: 70, max: 89 },
  '期待': { min: 40, max: 59 },
  'わくわく': { min: 50, max: 69 },
  '照れ': { min: 30, max: 49 },
  '恥ずかしい': { min: 20, max: 39 },
  '不安': { min: -39, max: -20 },
  '悲しい': { min: -69, max: -40 },
  '怒り': { min: -100, max: -70 },
  '興奮': { min: 70, max: 89 }
};

export class EmotionService extends BaseAIService {
  private apiUrl: string;
  private readonly storageKey = 'emotion_scores';

  constructor() {
    super();
    this.apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    if (!this.apiUrl) {
      throw new Error('バックエンドURLが設定されていません。');
    }
    console.log('Backend URL:', this.apiUrl);  // デバッグ用
  }

  private getApiEndpoint(path: string): string {
    const baseUrl = this.apiUrl.endsWith('/api') ? this.apiUrl : `${this.apiUrl}/api`;
    return `${baseUrl}${path}`;
  }

  // BaseAIServiceの抽象メソッドを実装
  public async getResponse(message: string, characterName: string): Promise<string> {
    return this.sendMessage(message, characterName);
  }

  private async sendMessage(message: string, characterName: string): Promise<string> {
    try {
      const endpoint = `${this.apiUrl}/api/chat`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, userName: characterName })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('メッセージの送信に失敗しました。');
    }
  }

  private getEmotionLabel(score: number): 'positive' | 'neutral' | 'negative' {
    if (score > 30) return 'positive';
    if (score < -30) return 'negative';
    return 'neutral';
  }

  // スコアから感情を判定する関数を追加
  private determineEmotion(score: number): string {
    for (const [emotion, range] of Object.entries(EMOTION_RANGES)) {
      if (score >= range.min && score <= range.max) {
        return emotion;
      }
    }
    return '通常';
  }

  // 感情分析メソッドを修正
  async analyzeEmotion(text: string): Promise<EmotionScore> {
    try {
      // デフォルトの感情スコアを設定
      const defaultScore: EmotionScore = {
        total: 0,
        lastUpdate: new Date().toISOString(),
        emotion: '通常'
      };

      // テキストが空の場合はデフォルト値を返す
      if (!text.trim()) {
        return defaultScore;
      }

      // APIベースの感情分析を実行
      const endpoint = this.getApiEndpoint('/chat');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `
以下のテキストの感情分析を行い、-100から100の間のスコアで評価してください。
ポジティブな感情が強いほど高いスコアを、ネガティブな感情が強いほど低いスコアを付けてください。
返答は数値のみにしてください。

テキスト：
${text}
`,
          userName: 'analyzer'
        }),
      });

      if (!response.ok) {
        console.error('Emotion API Error:', {
          status: response.status,
          statusText: response.statusText
        });
        return defaultScore;
      }

      const data = await response.json();
      if (!data.response) {
        console.error('Invalid emotion response format:', data);
        return defaultScore;
      }

      // 数値以外の文字を除去して数値のみを抽出
      const score = parseInt(data.response.replace(/[^-0-9]/g, ''));
      
      // スコアが有効な範囲内かチェック
      if (isNaN(score) || score < -100 || score > 100) {
        console.error('Invalid emotion score:', score);
        return defaultScore;
      }

      // スコアから感情を判定
      const emotion = this.determineEmotion(score);

      return {
        total: score,
        lastUpdate: new Date().toISOString(),
        emotion: emotion
      };
    } catch (error) {
      console.error('Emotion analysis error:', error);
      return {
        total: 0,
        lastUpdate: new Date().toISOString(),
        emotion: '通常'
      };
    }
  }

  // 未使用のメソッドを実装
  public async resetConversation(): Promise<void> {
    // 会話履歴をリセットする必要がない場合は空の実装
  }

  public async clearAllData(): Promise<void> {
    // データのクリアが必要ない場合は空の実装
  }

  public async generateDiary(character: Character): Promise<string> {
    throw new Error('このサービスでは日記生成はサポートされていません。');
  }

  public async analyzeMaleProfile(userProfile: { name: string; description: string }): Promise<string> {
    throw new Error('このサービスではプロフィール分析はサポートされていません。');
  }

  public async generateFemaleThoughts(maleProfile: string, character: Character): Promise<string> {
    throw new Error('このサービスでは思考生成はサポートされていません。');
  }

  public async generateDiaryContent(thoughts: string, character: Character): Promise<string> {
    throw new Error('このサービスでは日記コンテンツ生成はサポートされていません。');
  }

  getEmotionScore(userId: number): EmotionScore {
    const scores = this.getAllScores();
    return scores[userId] || { total: 0, lastUpdate: new Date().toISOString(), emotion: '通常' };
  }

  private getAllScores(): { [key: number]: EmotionScore } {
    const scoresJson = localStorage.getItem(this.storageKey);
    return scoresJson ? JSON.parse(scoresJson) : {};
  }

  getScore(userId: number): number {
    try {
      // 新形式のスコアを確認
      const scores = this.getAllScores();
      const score = scores[userId]?.total ?? 0;
      
      // 旧形式のスコアも確認
      const oldScore = localStorage.getItem(`emotion_score_${userId}`);
      const parsedOldScore = oldScore ? parseInt(oldScore, 10) : 0;
      
      // より大きい方のスコアを返す
      const finalScore = Math.max(score, parsedOldScore);
      console.log(`Getting score for user ${userId}:`, { score, oldScore, finalScore });
      return finalScore;
    } catch (error) {
      console.error('Error getting score:', error);
      return 0;
    }
  }

  updateScore(userId: number, newScore: number): number {
    try {
      // スコアが負にならないように制限
      const finalScore = Math.max(0, newScore);
      
      // 新形式でスコアを保存
      const scores = this.getAllScores();
      scores[userId] = {
        total: finalScore,
        lastUpdate: new Date().toISOString(),
        emotion: this.determineEmotion(finalScore)
      };
      localStorage.setItem(this.storageKey, JSON.stringify(scores));
      
      // 旧形式でも保存（後方互換性のため）
      localStorage.setItem(`emotion_score_${userId}`, finalScore.toString());
      
      console.log(`Set score for user ${userId}:`, {
        newScore: finalScore
      });
      
      return finalScore;
    } catch (error) {
      console.error('Error updating score:', error);
      return this.getScore(userId);
    }
  }

  resetScore(userId: number): void {
    try {
      // 新形式のスコアをリセット
      const scores = this.getAllScores();
      delete scores[userId];
      localStorage.setItem(this.storageKey, JSON.stringify(scores));
      
      // 旧形式のスコアもリセット
      localStorage.removeItem(`emotion_score_${userId}`);
      
      console.log(`Reset score for user ${userId}`);
    } catch (error) {
      console.error('Error resetting score:', error);
    }
  }
}

// デフォルトのインスタンスをエクスポート
export default new EmotionService(); 