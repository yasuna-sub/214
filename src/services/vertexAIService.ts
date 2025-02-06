import { VertexAI } from '@google-cloud/vertexai';
import { BaseAIService, Character, UserProfile } from './base/BaseAIService';

interface MessageParams {
  query?: string;
  messages?: Array<{ content: string }>;
}

export class VertexAIService extends BaseAIService {
  private apiUrl: string;
  private vertexai: VertexAI;
  private model: string;
  private location: string;
  private projectId: string;

  constructor() {
    super();
    this.apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
    this.projectId = import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID;
    this.location = import.meta.env.VITE_VERTEX_LOCATION || 'asia-northeast1';
    this.model = import.meta.env.VITE_VERTEX_MODEL || 'gemini-1.0-pro';
    
    this.vertexai = new VertexAI({
      project: this.projectId,
      location: this.location,
    });
  }

  private async sendMessage(params: MessageParams): Promise<string> {
    try {
      const generativeModel = this.vertexai.preview.getGenerativeModel({
        model: this.model,
      });

      const prompt = params.query || params.messages?.[0]?.content;
      if (!prompt) {
        throw new Error('No prompt provided');
      }

      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const response = result.response;
      if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Vertex AI');
      }

      return response.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Vertex AI API Error:', error);
      throw new Error(`メッセージの送信に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getResponse(message: string, characterName: string): Promise<string> {
    return this.sendMessage({ query: message });
  }

  setConversationId(conversationId: string): void {
    const userId = this.getUserId();
    const key = `vertex_conversation_${userId}`;
    localStorage.setItem(key, conversationId);
  }

  getUserId(): string {
    let userId = localStorage.getItem('vertex_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('vertex_user_id', userId);
    }
    return userId;
  }

  getConversationId(): string | null {
    const userId = this.getUserId();
    const key = `vertex_conversation_${userId}`;
    return localStorage.getItem(key);
  }

  async generateDiary(character: Character, userProfile: UserProfile): Promise<string> {
    try {
      const maleProfile = await this.analyzeMaleProfile(userProfile);
      const thoughts = await this.generateFemaleThoughts(maleProfile, character);
      return this.generateDiaryContent(thoughts, character);
    } catch (error) {
      console.error('Generate diary error:', error);
      throw new Error('日記の生成中にエラーが発生しました。');
    }
  }

  async analyzeMaleProfile(userProfile: UserProfile): Promise<string> {
    const query = `以下の片思いの人のプロフィールを分析してください：
    名前：${userProfile.name}
    プロフィール：${userProfile.description}
    
    分析項目：
    1. 性格特性
    2. コミュニケーションスタイル
    3. 行動パターン
    
    以下の点に注意して分析してください：
    - 具体的な性格の特徴
    - 趣味や興味からの推測
    - コミュニケーションの特徴
    - 日常生活での行動傾向`;

    return this.sendMessage({ query });
  }

  async generateFemaleThoughts(maleProfile: string, character: Character): Promise<string> {
    const query = `以下のキャラクターの視点から、片思いの人に対する一日の思考を生成してください：
    
    キャラクター：
    名前：${character.name}
    設定：${character.description}
    
    片思いの人の特徴：
    ${maleProfile}
    
    生成項目：
    1. 朝の心情（登校時や朝の様子を見かけた時の印象）
    2. 昼の出来事（授業中や昼休みでの様子）
    3. 夜の期待感（バレンタインのチョコレート作りと明日への期待）
    
    以下の点を意識して生成してください：
    - キャラクターの性格や立場に基づいた視点
    - 学校生活での具体的な場面
    - 季節感や時間帯に応じた描写
    - 片思いの人との関係性や距離感の表現`;

    return this.sendMessage({ query });
  }

  async generateDiaryContent(thoughts: string, character: Character): Promise<string> {
    const query = `以下の思考をもとに、${character.name}の日記を書いてください：
    
    キャラクター設定：
    ${character.description}
    
    一日の思考：
    ${thoughts}
    
    以下の点に注意して日記を書いてください：
    1. キャラクターの口調を維持
    2. 感情表現を豊かに（顔文字や絵文字も適度に使用）
    3. 独り言のような親密な文体で
    4. 時間の流れに沿った自然な展開
    5. 学校生活ならではの細かい描写
    6. 片思いの人を思い浮かべて恋愛感情の繊細な表現
    
    日記の形式：
    - 日付から始める
    - 天気や気分も記載
    - 時間の流れに沿って記述
    - 最後に締めの一言や明日への期待を書く`;

    return this.sendMessage({ query });
  }

  async resetConversation(): Promise<void> {
    const userId = this.getUserId();
    const key = `vertex_conversation_${userId}`;
    localStorage.removeItem(key);
  }

  async clearAllData(): Promise<void> {
    const userId = this.getUserId();
    Object.keys(localStorage).forEach(key => {
      if (key.includes('vertex_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

// シングルトンインスタンスをエクスポート
export const vertexAIService = new VertexAIService();
export default vertexAIService; 