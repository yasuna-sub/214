import type { Character, UserProfile } from './base/BaseAIService';
import { BaseAIService } from './base/BaseAIService';

export class VertexAIService extends BaseAIService {
  private apiUrl: string;

  constructor() {
    super();
    this.apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
  }

  async getResponse(message: string, userName: string): Promise<string> {
    throw new Error('This method is moved to ChatService');
  }

  async resetConversation(characterName: string): Promise<void> {
    // Vertex AIでは会話履歴を保持しないため、何もしない
  }

  async clearAllData(): Promise<void> {
    // 必要に応じて実装
  }

  async generateDiary(character: Character, userProfile: UserProfile): Promise<string> {
    // DiaryServiceに移譲
    throw new Error('This method is moved to DiaryService');
  }

  async analyzeMaleProfile(userProfile: UserProfile): Promise<string> {
    // DiaryServiceに移譲
    throw new Error('This method is moved to DiaryService');
  }

  async generateFemaleThoughts(maleProfile: string, character: Character): Promise<string> {
    // DiaryServiceに移譲
    throw new Error('This method is moved to DiaryService');
  }

  async generateDiaryContent(thoughts: string, character: Character): Promise<string> {
    // DiaryServiceに移譲
    throw new Error('This method is moved to DiaryService');
  }
}

export class AIServiceFactory {
  static createService(type: string = 'vertex'): BaseAIService {
    switch (type) {
      case 'vertex':
        return new VertexAIService();
      default:
        return new VertexAIService();
    }
  }
}

const aiServiceFactory = AIServiceFactory.createService(import.meta.env.VITE_DEFAULT_AI_SERVICE || 'vertex');
export default aiServiceFactory; 