import { useState, useEffect } from 'react';
import { UserProfileInput } from './components/UserProfileInput.tsx';
import { UserList } from './components/UserList.tsx';
import Chat from './components/Chat.tsx';
import { CharacterProfile } from './components/CharacterProfile.tsx';
import { DiaryPopup } from './components/DiaryPopup.tsx';
import { DiaryLoadingScreen } from './components/DiaryLoadingScreen.tsx';
import { AIServiceFactory } from './services/AIServiceFactory.ts';
import diaryService from './services/diaryService';
import { ChocolatePopup } from './components/ChocolatePopup';
import chatService from './services/ChatService';
import { MorningSelection } from './components/MorningSelection';
import { useGameStore } from './services/GameService';

interface UserProfile {
  name: string;
  description: string;
}

interface User {
  id: number;
  name: string;
  description: string;
  avatar: string;
  group: string;
}

interface SavedDiary {
  userId: number;
  content: string;
  timestamp: string;
}

type ViewType = 'splash' | 'profile' | 'userList' | 'chat' | 'characterProfile' | 'diaryLoading' | 'morning';

type GamePhase = 'splash' | 'profile' | 'morning' | 'character' | 'diary_drop' | 'character_profile' | 'chat' | 'end';

const users: User[] = [
  { 
    id: 1, 
    name: 'まりぴ', 
    description: '高校2年生の元気なギャル。パソコン部の幽霊部員。原宿のレインボーわたあめ屋さんでバイト中。グミ（特にハリボーゴールドベア）が大好き。平成ギャル系のファッションとメイクに興味あり。', 
    avatar: '/images/maripi.png', 
    group: 'ま'
  },
  { 
    id: 2, 
    name: 'のんたん', 
    description: '深夜のローソンでバイトをする文学少女。精神的に不安定で人混みが苦手。甘いもの（パイの実）が大好き。自己否定的だが友達には素直に愛情表現ができる。', 
    avatar: '/images/nontan.png', 
    group: 'な'
  },
  { 
    id: 3, 
    name: 'ななほまる', 
    description: '軽音部の女子高生でギター担。弟をわりと溺愛している。感情表現が豊かで自己主張が強いが、恋愛感情がよく分からない。', 
    avatar: '/images/nanaho.png', 
    group: 'な'
  }
];

export default function App(): JSX.Element {
  const [view, setView] = useState<ViewType>('splash');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [selectedDiary, setSelectedDiary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('splash');
  const [showDiaryDrop, setShowDiaryDrop] = useState(false);
  const [savedDiaries, setSavedDiaries] = useState<SavedDiary[]>(() => {
    const saved = localStorage.getItem('savedDiaries');
    return saved ? JSON.parse(saved) : [];
  });
  const [showChocolate, setShowChocolate] = useState(false);
  const emotionThreshold = 2000;

  const aiService = useState(() => 
    AIServiceFactory.createService(import.meta.env.VITE_DEFAULT_AI_SERVICE || 'dify')
  )[0];

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });

  const { 
    setSelectedCharacter, 
    increaseHeartGauge,
    gamePhase: gamePhaseFromStore,
    setGamePhase: setGamePhaseFromStore 
  } = useGameStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      // プロフィールの有無によって遷移先を分岐
      if (userProfile) {
        setGamePhase('morning');
      } else {
        setGamePhase('profile');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [userProfile]);

  useEffect(() => {
    // チャットサービスの初期化
    chatService.onChocolateGet = () => setShowChocolate(true);
  }, []);

  const handleProfileSubmit = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setGamePhase('morning');
  };

  const handleResetProfile = () => {
    // すべての情報をリセット
    setUserProfile(null);
    setSavedDiaries([]);
    setSelectedUser(null);
    setSelectedDiary(null);
    setError(null);
    
    // ローカルストレージもクリア
    localStorage.removeItem('userProfile');
    localStorage.removeItem('savedDiaries');
    localStorage.removeItem('heartGauge');
    localStorage.removeItem('gameState');
    
    // プロフィール入力画面に遷移
    setGamePhase('profile');
  };

  const handleChatStart = (user: User) => {
    setSelectedUser(user);
    setView('chat');
  };

  const handleProfileView = (user: User) => {
    setSelectedUser(user);
    setView('characterProfile');
  };

  const handleDiaryClose = () => {
    setSelectedDiary(null);
    setView('characterProfile');
  };

  const handleDiaryClick = async (user: User) => {
    try {
      const savedDiary = diaryService.getSavedDiaries().find(d => d.userId === user.id);
      if (savedDiary) {
        setSelectedDiary(savedDiary.content);
      }
    } catch (error) {
      console.error('Failed to load diary:', error);
      setError(error instanceof Error ? error.message : '日記の読み込みに失敗しました。');
    }
  };

  const handleCharacterSelect = async (character: any) => {
    setSelectedCharacter(character);
    increaseHeartGauge(character.id, 2);
    const selectedUserInfo = users.find(user => user.name === character.name);
    if (selectedUserInfo) {
      setSelectedUser(selectedUserInfo);
      
      // 日記の存在確認
      const hasDiary = diaryService.getSavedDiaries().some(d => d.userId === selectedUserInfo.id);
      
      if (!hasDiary) {
        // 日記がない場合はローディング画面を表示
        setGamePhase('diary_drop');
      }
      else {
        setGamePhase('character_profile');
      }
    }
  };

  const handleDiaryFound = (diary: string) => {
    setSelectedDiary(diary);
    setGamePhase('character_profile');
  };

  const handleDiaryRead = () => {
    setGamePhase('chat');
  };

  // スプラッシュ画面のコンポーネント
  const SplashScreen = () => (
    <div data-testid="splash-screen" className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="relative w-full h-screen">
        <img 
          src="/images/top.png"
          alt="Welcome"
          className="w-full h-full object-cover md:object-contain"
        />
      </div>
    </div>
  );

  // フェードアニメーション用のラッパーコンポーネント
  const FadeTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="animate-fade-in">
    {children}
  </div>
);

  return (
    <div className="App">
      {gamePhase === 'splash' && <SplashScreen />}
      
      {gamePhase === 'profile' && (
        <UserProfileInput onSubmit={handleProfileSubmit} />
      )}
      
      {gamePhase === 'morning' && (
        <MorningSelection
          onCharacterSelect={handleCharacterSelect}
          initialHeartGauge={0}
          onResetProfile={handleResetProfile}
        />
      )}

      {gamePhase === 'diary_drop' && selectedUser && (
        <DiaryLoadingScreen
          onDiaryFound={handleDiaryFound}
          character={selectedUser}
          onError={(error) => {
            console.error('日記生成エラー:', error);
            setError(error.message);
            // エラーメッセージを表示する時間を確保するため、
            // 画面遷移を遅延させない
          }}
          onBack={() => setGamePhase('morning')}
          userProfile={userProfile!}
        />
      )}

      {gamePhase === 'character_profile' && selectedUser && (
        <CharacterProfile
          user={selectedUser}
          onBack={() => setGamePhase('morning')}
          onChatStart={() => setGamePhase('chat')}
          onDiaryClick={handleDiaryClick}
        />
      )}
      
      {gamePhase === 'chat' && selectedUser && (
        <Chat
          user={selectedUser}
          onBack={() => setGamePhase('character_profile')}
          userProfile={userProfile!}
        />
      )}

      {selectedDiary && selectedUser && (
        <DiaryPopup
          diary={selectedDiary}
          character={selectedUser}
          onClose={() => setSelectedDiary(null)}
          userProfile={userProfile!}
        />
      )}

      {showChocolate && selectedUser && (
        <ChocolatePopup 
          onClose={() => {
            setShowChocolate(false);
            setGamePhase('end');
          }}
          characterName={selectedUser.name}
        />
      )}
    </div>
  );
}