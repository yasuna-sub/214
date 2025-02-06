export interface BaseAIService {
  getResponse(message: string, userName: string): Promise<string>;
  generateDiary(user: any, userProfile: any): Promise<string>;
} 