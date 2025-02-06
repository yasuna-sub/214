import { BaseAIService, Character as BaseCharacter } from './base/BaseAIService';

interface User extends BaseCharacter {
  id: number;
  avatar: string;
  group: string;
}

interface UserProfile {
  name: string;
  description: string;
}

export interface SavedDiary {
  userId: number;
  content: string;
  timestamp: string;
}

interface APIResponse {
  response?: string;
  error?: string;
}

export class DiaryService extends BaseAIService {
  private apiUrl: string;

  constructor() {
    super();

    this.apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    if (!this.apiUrl) {
      throw new Error('バックエンドURLが設定されていません。');
    }
  }

  // BaseAIServiceの抽象メソッドを実装
  public async getResponse(message: string, characterName: string): Promise<string> {
    return this.sendMessage(message, characterName);
  }

  private async sendMessage(message: string, characterName: string): Promise<string> {
    try {
      const endpoint = `${this.apiUrl}/api/chat`;
      console.log('Sending request to:', endpoint, { message, userName: characterName });  // デバッグ用

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, userName: characterName })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data: APIResponse = await response.json();
      if (!data.response) {
        console.error('Invalid response:', data);  // デバッグ用
        throw new Error('Invalid response format');
      }

      return data.response;
    } catch (error) {
      console.error('Vertex AI Error:', error);
      throw new Error(`日記の生成に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 日記の保存と取得の機能
  public getSavedDiaries(): SavedDiary[] {
    const diariesJson = localStorage.getItem('savedDiaries');
    return diariesJson ? JSON.parse(diariesJson) : [];
  }

  public saveDiary(diary: SavedDiary): void {
    const diaries = this.getSavedDiaries();
    const newDiaries = [...diaries];
    const existingIndex = newDiaries.findIndex(d => d.userId === diary.userId);
    
    if (existingIndex !== -1) {
      newDiaries[existingIndex] = diary;
    } else {
      newDiaries.push(diary);
    }
    
    localStorage.setItem('savedDiaries', JSON.stringify(newDiaries));
  }

  public async handleDiaryClick(user: User, userProfile: UserProfile): Promise<{ diary: string; isNewDiary: boolean }> {
    // 既存の日記があるか確認
    const savedDiaries = this.getSavedDiaries();
    const existingDiary = savedDiaries.find(d => d.userId === user.id);
    
    if (existingDiary) {
      return { diary: existingDiary.content, isNewDiary: false };
    }

    // 新規生成の場合
    try {
      const startTime = Date.now();
      const diary = await this.generateDiary(user, userProfile);
      
      // 最小10秒の表示時間を確保
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 10000) {
        await new Promise(resolve => setTimeout(resolve, 10000 - elapsedTime));
      }

      // 新しい日記を保存
      this.saveDiary({
        userId: user.id,
        content: diary,
        timestamp: new Date().toISOString()
      });

      return { diary, isNewDiary: true };
    } catch (error) {
      console.error('Failed to generate diary:', error);
      throw new Error(error instanceof Error ? error.message : '日記の生成に失敗しました。');
    }
  }

  public async generateDiary(character: BaseCharacter, userProfile: UserProfile): Promise<string> {
    try {
      console.log('Step 1: Analyzing male profile...'); // デバッグ用
      const maleProfile = await this.analyzeMaleProfile(userProfile);
      
      console.log('Step 2: Generating thoughts...'); // デバッグ用
      const thoughts = await this.generateFemaleThoughts(maleProfile, character);
      
      console.log('Step 3: Creating diary...'); // デバッグ用
      return this.generateDiaryContent(thoughts, character);
    } catch (error) {
      console.error('Generate diary error:', error);
      throw new Error('日記の生成中にエラーが発生しました。');
    }
  }

  public async analyzeMaleProfile(userProfile: UserProfile): Promise<string> {
    const prompt = `
あなたは心理カウンセラーとして、以下の人物の性格分析を行ってください。
分析結果は、後で女子高生が片思いの気持ちを書くための参考情報として使用されます。

対象の人物：
名前：${userProfile.name}さん
プロフィール：${userProfile.description}

以下の項目について、具体的に分析してください：

1. 性格特性
- 外向性/内向性
- 几帳面さ/おおらかさ
- コミュニケーションスタイル

2. 趣味・興味
- 好きそうな活動
- 休日の過ごし方
- 興味を持ちそうな話題

3. 学校生活での様子
- 友人関係
- 授業中の態度
- 部活やイベントでの行動

4. 恋愛傾向
- 異性との関わり方
- 恋愛に対する考え方
- アプローチされた時の反応

分析は具体的なエピソードを交えて、200文字程度でまとめてください。
`;
    return this.sendMessage(prompt, '心理カウンセラー');
  }

  public async generateFemaleThoughts(maleProfile: string, character: BaseCharacter): Promise<string> {
    const prompt = `
あなたは${character.name}として、片思いの気持ちを独白形式で表現してください。
${character.description}という設定を意識して書いてください。

片思いの相手の特徴：
${maleProfile}

以下の時間帯ごとの心情を、具体的な場面や行動とともに書いてください：

1. 朝
- 登校時の期待感
- 朝の挨拶や廊下でのすれ違い
- 朝礼や HR での様子

2. 昼
- 授業中にこっそり見つめる様子
- 昼休みの様子
- 共同作業や当番活動での出来事

3. 放課後
- 部活動や委員会活動での関わり
- 下校時の様子
- バレンタインのチョコレート作りの計画

それぞれの場面で感じた気持ちや印象を、${character.name}らしい言葉遣いで表現してください。
全体で300文字程度にまとめてください。
`;
    return this.sendMessage(prompt, character.name);
  }

  public async generateDiaryContent(thoughts: string, character: BaseCharacter): Promise<string> {
    const prompt = `
あなたは${character.name}として、2025年2月13日の日記を書いてください。
${character.description}という設定を意識して書いてください。

今日の出来事と気持ち：
${thoughts}

以下の要素を含めて日記を書いてください：

1. 日記の基本要素
- 2025年2月13日の日付
- 天気と気分
- 時系列に沿った出来事の記述

2. 文体とトーン
- ${character.name}らしい言葉遣い
- 独り言のような親密な文体
- 繊細な感情表現

3. 内容の構成
- 朝から夜までの時間の流れ
- 学校生活の細かい描写
- 片思いの気持ちの表現
- 明日のバレンタインへの期待と不安
- キャラクターの特徴的な行動（例：TikTok撮影、わたあめ作り、ライブ参加など）

4. 表現上の注意点
- 絵文字は使用しない
- 300文字程度の長さ
- 情景描写を交えた表現
- 心情の変化がわかる展開
- キャラクターの口癖や特徴的な表現を適度に使用

日記を書く際は、バレンタイン前日という特別な日であることを意識し、キャラクターの個性が強く出るように書いてください。
`;
    return this.sendMessage(prompt, character.name);
  }

  public async chatBasedOnDiary(message: string, character: BaseCharacter, diaryContent: string): Promise<string> {
    const prompt = `
あなたは${character.name}として、以下の日記を書いた本人です。
${character.description}という設定で、日記に書かれた出来事と気持ちを覚えています。
今日は2025年2月14日、バレンタインデーです。昨日書いた日記の内容を踏まえて、今日の気持ちで返信してください。

あなたの昨日（2月13日）の日記：
${diaryContent}

ユーザーからのメッセージ：
${message}

以下の点に注意して返信してください：

1. 返信の基本姿勢
- ${character.name}らしい言葉遣いを維持（例：「しか勝たん」「神」などのスラング）
- 昨日の日記に書かれた出来事や気持ちを踏まえつつ、バレンタイン当日の気持ちで返答
- チョコレートを渡せたかどうか、その時の様子や気持ちにも触れる

2. 感情表現
- キャラクターの個性に合わせた感情表現
- 恥ずかしがりながらも誠実に答える
- 相手の質問や共感に対して自然な反応

3. 会話の展開
- 昨日の日記の内容に基づいた具体的なエピソードの共有
- 今日のバレンタインでの出来事も織り交ぜる
- キャラクターの特徴的な行動（例：TikTok撮影、わたあめ作り、ライブ参加など）に触れる

4. 表現上の注意点
- 20文字程度の短い返答
- 絵文字は使用しない
- キャラクターの口癖や特徴的な表現を使用
- 個性的な言い回しを適度に取り入れる

返信は会話形式で、自然な対話になるようにしてください。
`;
    return this.sendMessage(prompt, character.name);
  }

  public async resetConversation(characterName: string): Promise<void> {
    // Vertex AIでは会話履歴を保持しないため、何もしない
  }

  public async clearAllData(): Promise<void> {
    Object.keys(localStorage).forEach(key => {
      if (key.includes('diary_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

// デフォルトのインスタンスをエクスポート
export default new DiaryService(); 