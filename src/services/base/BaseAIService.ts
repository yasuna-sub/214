export interface Character {
  name: string;
  description: string;
}

export interface UserProfile {
  name: string;
  description: string;
}

export abstract class BaseAIService {
  abstract getResponse(message: string, characterName: string): Promise<string>;

  abstract resetConversation(characterName: string): Promise<void>;

  abstract clearAllData(): Promise<void>;

  abstract generateDiary(character: Character, userProfile: UserProfile): Promise<string>;

  abstract analyzeMaleProfile(userProfile: UserProfile): Promise<string>;

  abstract generateFemaleThoughts(maleProfile: string, character: Character): Promise<string>;

  abstract generateDiaryContent(thoughts: string, character: Character): Promise<string>;
} 