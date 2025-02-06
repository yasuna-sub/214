import { characterPrompts } from './prompts/characterPrompts';
import diaryService from './diaryService';
import emotionService from './emotionService';

// キャラクターIDのマッピング
const CHARACTER_IDS = {
  'まりぴ': 1,
  'のんたん': 2,
  'ななほまる': 3
};

export interface CharacterConfig {
  name: string;
  description: string;
  avatar?: string;
  personality?: string;
  valentine?: string;
  role?: string;
  speaking_style?: string;
  situation?: string;
  base_prompt?: string;
}

interface CharacterPromptConfig extends CharacterConfig {
  name: string;
  role: string;
  personality: string;
  speaking_style: string;
  situation: string;
  valentine: string;
  base_prompt: string;
  example_tweets: string[];
  diary?: string;
}

const defaultCharacter: CharacterConfig = {
  name: 'まりぴ',
  description: '高校2年生の元気なギャル。原宿のレインボーわたあめ屋さんでバイト中。',
  avatar: '/images/maripi.png',
  personality: 'フレンドリーで明るい'
};

export class ChatService {
  private apiUrl: string;
  private character: CharacterConfig;
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private currentEmotion: string = '通常';
  private maxHistoryLength: number = 5;
  private contextWindow: string = '';
  private emotionThreshold = 1000;
  public onChocolateGet?: () => void;

  constructor(character: CharacterConfig = defaultCharacter, onChocolateGet?: () => void) {
    this.apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    if (!this.apiUrl) {
      throw new Error('バックエンドURLが設定されていません。');
    }
    this.character = character;
    this.onChocolateGet = onChocolateGet;
  }

  private getApiEndpoint(path: string): string {
    const baseUrl = this.apiUrl.endsWith('/api') ? this.apiUrl : `${this.apiUrl}/api`;
    return `${baseUrl}${path}`;
  }

  private async updateEmotion(message: string, response: string) {
    try {
      // メッセージとレスポンスの感情分析を実行
      const [messageAnalysis, responseAnalysis] = await Promise.all([
        emotionService.analyzeEmotion(message),
        emotionService.analyzeEmotion(response)
      ]);

      // メッセージの感情が通常以外の場合はそれを採用
      if (messageAnalysis.emotion !== '通常') {
        this.currentEmotion = messageAnalysis.emotion;
      }
      // そうでない場合はレスポンスの感情を採用
      else if (responseAnalysis.emotion !== '通常') {
        this.currentEmotion = responseAnalysis.emotion;
      }
    } catch (error) {
      console.error('Error in emotion analysis:', error);
      // エラー時は現在の感情を維持
    }
  }

  private selectRelevantExamples(message: string, characterConfig: CharacterPromptConfig): string[] {
    const allExamples = characterConfig.example_tweets;
    const keywords = message.split(' ');
    
    // メッセージの文脈に関連する例文を選択
    const relevantExamples = allExamples.filter(example => 
      keywords.some(keyword => example.includes(keyword))
    );

    // 感情に基づく例文を追加
    const emotionExamples = allExamples.filter(example => 
      example.includes(this.currentEmotion)
    );

    // 関連する例文と感情ベースの例文を組み合わせて、最大5つを返す
    return [...new Set([...relevantExamples, ...emotionExamples, ...allExamples])]
      .slice(0, 5);
  }

  private buildContext(): string {
    return `# キャラクター設定
      名前は${this.character.name}です。
      ${this.character.role}
      ${this.character.personality}

      # 現在の状況
      今日は2025年2月14日、バレンタインデーです。
      ${this.character.situation}
      ${this.character.valentine}

      # 会話の口調
      ${this.character.speaking_style}

      # 現在の感情
      ${this.currentEmotion}

      # 直近の会話
      ${this.conversationHistory.slice(-6).map(msg => 
        `${msg.role === 'user' ? '相手' : '私'}: ${msg.content}`
      ).join('\n')}`;
        }

  private updateContextWindow(message: string, response: string) {
    console.log('updateContextWindow called with:', { message, response });
    const contextUpdate = `
    - 相手が「${message}」と言った
    - 私は「${response}」と答えた
    - 感情は${this.currentEmotion}だった`;
  
    // 文脈窓を更新（最新の情報を保持）
    this.contextWindow = [this.contextWindow, contextUpdate]
      .join('\n')
      .split('\n')
      .slice(-10) // 最新の10行のみ保持
      .join('\n');
  
  console.log('Updated context window:', this.contextWindow);
}

  // 感情の強度に基づくポイント計算
  private calculateEmotionPoints(emotionScore: number, characterName: string): number {
    // キャラクター別の感情係数
    const characterMultipliers = {
      'まりぴ': 0.8,    
      'のんたん': 1.2,  
      'ななほまる': 0.9 
    };

    // 感情の強度に応じた基本ポイント（-100から100のスコアを想定）
    let basePoints = 0;
    if (emotionScore > 80) basePoints = 100;
    else if (emotionScore > 60) basePoints = 80;
    else if (emotionScore > 40) basePoints = 60;
    else if (emotionScore > 20) basePoints = 40;
    else if (emotionScore > 0) basePoints = 20;
    else if (emotionScore > -20) basePoints = 10;
    else if (emotionScore > -40) basePoints = -10;
    else if (emotionScore > -60) basePoints = -20;
    else basePoints = -30;

    // キャラクター別の係数を適用
    const multiplier = characterMultipliers[characterName as keyof typeof characterMultipliers] || 1.0;
    return Math.round(basePoints * multiplier);
  }

  private updateEmotionScore(userId: number, points: number): number {
    // 前回のスコアを取得
    const currentScore = emotionService.getScore(userId);
    
    // 新しいスコアを計算
    const newScore = currentScore + points;
    
    // スコアがしきい値を超えた場合のみチョコレートポップアップを表示
    if (newScore >= this.emotionThreshold) {
      // チョコレートポップアップをトリガー
      if (this.onChocolateGet) {
        this.onChocolateGet();
        // スコアをリセット
        emotionService.resetScore(userId);
        return 0;
      }
    }

    // 新しいスコアを保存（現在のスコアではなく、計算済みの新しいスコアを保存）
    emotionService.updateScore(userId, newScore);
    
    console.log('Emotion score updated:', {
      userId,
      currentScore,
      addedPoints: points,
      newScore,
      threshold: this.emotionThreshold
    });
    
    return newScore;
  }

  async getResponse(message: string, userName: string): Promise<{ response: string; emotionScore: number }> {
    try {
      console.log('getResponse called with userName:', userName);
      
      // キャラクター名のマッピングを修正
      if (!(userName in CHARACTER_IDS)) {
        console.error('Invalid character name:', userName);
        return { response: 'よくわかんないなあ', emotionScore: 0 };
      }

      const characterKey = userName as keyof typeof characterPrompts;
      const characterConfig = characterPrompts[characterKey] as CharacterPromptConfig;
      const characterId = CHARACTER_IDS[characterKey];
      
      if (!characterConfig) {
        console.error('Character not found:', userName);
        return { response: 'よくわかんないなあ', emotionScore: 0 };
      }

      // センシティブなキーワードをフィルタリング
      const sensitiveKeywords = ['自殺', '死にたい'];
      if (sensitiveKeywords.some(keyword => message.includes(keyword))) {
        return { response: 'ごめんね、はなしたくない...。', emotionScore: 0 };
      }

      // メッセージの長さをチェック
      if (message.length > 200) {
        return { response: 'ごめんね、ちょっと何言ってるかわかんない...', emotionScore: 0 };
      }

      try {
        // ユーザーメッセージの感情分析を実行
        const messageEmotion = await emotionService.analyzeEmotion(message);
        
        // 感情状態を更新
        if (messageEmotion.emotion !== '通常') {
          this.currentEmotion = messageEmotion.emotion;
        }

        // 日記を取得
        const savedDiaries = diaryService.getSavedDiaries();
        const userDiary = savedDiaries.find(d => d.userId === characterId)?.content;

        // 会話履歴を更新
        this.conversationHistory.push({ role: 'user', content: message });
        if (this.conversationHistory.length > this.maxHistoryLength * 2) {
          this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
        }

        // 文脈に応じた例文を選択（現在の感情状態を考慮）
        const relevantExamples = this.selectRelevantExamples(message, characterConfig);

        // 現在のチョコメーター値を取得
        const currentScore = emotionService.getScore(characterId);
        const chocolateProgress = Math.min((currentScore / this.emotionThreshold) * 100, 100);

        const prompt = `
          # キャラクター設定
          名前は${characterConfig.name}です。
          - できるだけ短い返答（20文字程度）で返します。

          ${characterConfig.role}
          ${characterConfig.personality}

          # 会話の口調
          ${characterConfig.speaking_style}

          # 会話例（私の普段の話し方）
          ${relevantExamples.join('\n')}

          # 応答の制約
          - 私（${characterConfig.name}）として返答する
          - 昨日の日記の内容を、今話している相手との思い出として参照する
          - 相手の感情に適切に応答する
          - チョコメーターの進行度（${chocolateProgress.toFixed(1)}%）に応じた態度で接する
          - チョコメーターが100%になるまでは、チョコレートを渡す表現は使わない
          - チョコメーターは話題にしない。
          - 絵文字、()、「」は使用しない
          - 分かりました、了解などは言わない

          # 現在の状況と感情
          ${characterConfig.situation}
          今日は2025年2月14日、バレンタインデーです。
          バレンタインについて：${characterConfig.valentine}
          チョコメーター：${chocolateProgress.toFixed(1)}%
          ※チョコメーターが100%になるまでは、チョコレートは渡しません。
          ※チョコメーターの値が高いほど、相手への気持ちや信頼が高まっています。
          ※${chocolateProgress < 30 ? 'まだ気持ちが高まっていない段階です。' : 
              chocolateProgress < 60 ? '少しずつ気持ちが高まってきています。' :
              chocolateProgress < 90 ? 'かなり気持ちが高まってきています。' :
              'もうすぐチョコレートを渡せそうです。'}
          現在の感情: ${this.currentEmotion}
          相手の感情: ${messageEmotion.emotion}（強度: ${messageEmotion.total}）

          # 私の昨日の記憶（今話している相手について書いたもの）
          ${userDiary || '昨日は特に何も書いていません'}
          - この記憶は今話している相手との出来事や思い出です。
          - 記憶をたまに思い出しながら会話をしてください。

          # 今回の会話
          相手の発言: ${message}
          ※この相手は昨日の記憶に出てくる人と同じです。
          `;

        // プロンプトの内容をコンソールに出力
        console.log('=== Generated Prompt ===');
        console.log(prompt);
        console.log('=== Character Config ===');
        console.log(JSON.stringify(characterConfig, null, 2));
        console.log('=== Current State ===');
        console.log({
          currentEmotion: this.currentEmotion,
          chocolateProgress: `${chocolateProgress.toFixed(1)}%`,
          messageEmotion,
          conversationHistoryLength: this.conversationHistory.length,
          hasDiary: !!userDiary
        });

        const endpoint = this.getApiEndpoint('/chat');
        let response;
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              message: prompt,
              context: this.buildContext(),
              character: characterConfig.name,
              userEmotion: messageEmotion
            }),
          });
        } catch (networkError) {
          console.error('Network error:', networkError);
          return { response: 'ごめんね', emotionScore: 0 };
        }

        if (!response.ok) {
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText
          });
          return { response: 'ごめんね', emotionScore: 0 };
        }

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Failed to parse API response:', parseError);
          return { 
            response: 'ごめんね、応答の解析に失敗しちゃった...。もう一度話しかけてくれる？',
            emotionScore: 0 
          };
        }

        if (!data || !data.response) {
          console.error('Invalid response format:', data);
          return { 
            response: 'ごめんね、応答の形式がおかしいみたい...。もう一度話しかけてくれる？',
            emotionScore: 0 
          };
        }

        // 応答を履歴に追加
        this.conversationHistory.push({ role: 'assistant', content: data.response });

        // 文脈窓を更新
        this.updateContextWindow(message, data.response);

        // 応答の感情分析を実行してスコアを更新
        try {
          const responseEmotion = await emotionService.analyzeEmotion(data.response);
          
          // レスポンスの感情が通常以外の場合は更新
          if (responseEmotion.emotion !== '通常') {
            this.currentEmotion = responseEmotion.emotion;
          }
          
          const points = this.calculateEmotionPoints(responseEmotion.total, userName);
          const newScore = this.updateEmotionScore(characterId, points);

          return { response: data.response, emotionScore: newScore };
        } catch (emotionError) {
          console.error('Emotion analysis failed:', emotionError);
          const newScore = this.updateEmotionScore(characterId, 10);
          return { response: data.response, emotionScore: newScore };
        }

      } catch (processingError) {
        console.error('Error processing request:', processingError);
        return { 
          response: 'ごめんね、処理中にエラーが発生しちゃった...。もう一度試してみて？',
          emotionScore: 0 
        };
      }

    } catch (error) {
      console.error('Critical error in chat:', error);
      return { 
        response: 'ごめんね、深刻なエラーが発生しちゃった...。少し時間を置いてからまた話しかけてね。',
        emotionScore: 0 
      };
    }
  }

  async resetConversation(): Promise<void> {
    this.conversationHistory = [];
    this.currentEmotion = '通常';
    this.contextWindow = '';
  }

  getEmotionScore(userId: number): number {
    return emotionService.getEmotionScore(userId).total;
  }

  resetEmotionScore(userId: number): void {
    emotionService.resetScore(userId);
  }
}

// デフォルトのインスタンスをエクスポート
export default new ChatService(); 