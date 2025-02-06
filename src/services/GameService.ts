import { create } from 'zustand';

interface Character {
  id: string;
  name: string;
  club: string;
  personality: string;
  greeting: string;
  image: string;
}

interface GameState {
  selectedCharacter: Character | null;
  heartGauge: {
    maripi: number;
    nanaho: number;
    nontan: number;
  };
  gamePhase: 'morning' | 'chat' | 'afternoon' | 'end';
  setSelectedCharacter: (character: Character) => void;
  increaseHeartGauge: (characterId: string, amount: number) => void;
  setGamePhase: (phase: 'morning' | 'chat' | 'afternoon' | 'end') => void;
  resetGame: () => void;
}

const initialState = {
  selectedCharacter: null,
  heartGauge: {
    maripi: 0,
    nanaho: 0,
    nontan: 0,
  },
  gamePhase: 'morning' as const,
};

export const useGameStore = create<GameState>()((set) => ({
  ...initialState,

  setSelectedCharacter: (character: Character) =>
    set({ selectedCharacter: character }),

  increaseHeartGauge: (characterId: string, amount: number) =>
    set((state) => ({
      heartGauge: {
        ...state.heartGauge,
        [characterId]: state.heartGauge[characterId as keyof typeof state.heartGauge] + amount,
      },
    })),

  setGamePhase: (phase: GameState['gamePhase']) => 
    set({ gamePhase: phase }),

  resetGame: () => set(initialState),
})); 