import { useState } from 'react';
import { DiaryPopup } from './DiaryPopup';
import { AIServiceFactory } from '../services/AIServiceFactory';

interface User {
  id: number;
  name: string;
  description: string;
  avatar: string;
  group: string;
}

interface UserProfile {
  name: string;
  description: string;
}

interface UserListProps {
  userProfile: UserProfile;
  users: User[];
  onChatStart: (user: User) => void;
  onProfileView: (user: User) => void;
  onResetProfile: () => void;
  onDiaryGenerated: (diary: string, user: User) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function UserList({ users, onChatStart, onProfileView, userProfile, onResetProfile, onDiaryGenerated, isLoading = false, error = null }: UserListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiary, setSelectedDiary] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<User | null>(null);

  // AIサービスのインスタンスを取得
  const aiService = useState(() => 
    AIServiceFactory.createService(import.meta.env.VITE_DEFAULT_AI_SERVICE || 'dify')
  )[0];

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedUsers: Record<string, User[]> = filteredUsers.reduce((groups, user) => {
    const group = user.group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(user);
    return groups;
  }, {} as Record<string, User[]>);

  const handleDiaryClick = async (user: User) => {
    try {
      const diary = await aiService.generateDiary(user, userProfile);
      setSelectedDiary(diary);
      onDiaryGenerated(diary, user);
    } catch (error) {
      console.error('Failed to generate diary:', error);
    }
  };

  const Content = () => (
    <div className="flex flex-col h-full w-full]">
      {/* ヘッダー */}
      <div className="sticky top-0 backdrop-blur-md z-10 px-4 py-3 border-b border-white/20">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white drop-shadow-md">にーいちよん</h1>
          <button
            onClick={onResetProfile}
            className="btn btn-ghost btn-sm text-white hover:bg-white/20"
          >
            もう一度はじめから
          </button>
        </div>
      </div>
      {/* キャラクターリスト */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="card backdrop-blur-sm bg-white/40 shadow-xl hover:bg-white/50 transition-all cursor-pointer"
              onClick={() => onProfileView(user)}
            >
              <div className="card-body p-4">
                <div className="flex items-center gap-4">
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-full ring ring-white/50 hover:ring-white/80 transition-all">
                      <img src={user.avatar} alt={user.name} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="card-title text-white drop-shadow-md">{user.name}</h2>
                    <p className="text-white/90">{user.description}</p>
                    <div className="badge badge-outline text-white/90 mt-2">{user.group}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4">
          <div className="alert alert-error backdrop-blur-sm bg-error/40">
            <span className="text-white">{error}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      {/* PC表示用 */}
      <div className="hidden md:block h-[95vh] w-[calc(min(100%,420px))]">
          <div className="mockup-phone">
          <div className="camera"></div>
          <div className="display">
            <div className="phone-5 artboard artboard-demo pt-[60px]" style={{ 
            backgroundImage: "url('/images/back.png')", 
              backgroundSize: 'cover', 
              backgroundPosition: 'center' 
            }}>
              <Content />
            </div>
          </div>
        </div>
      </div>

      {/* モバイル表示用 */}
      <div className="md:hidden fixed inset-0 flex flex-col items-center" style={{ 
        backgroundImage: "url('/images/back.png')", 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      }}>
        <div className="w-full min-w-[320px] max-w-[420px] h-full overflow-hidden">
          <Content />
        </div>
      </div>

      {/* 日記ポップアップ */}
      {selectedDiary && selectedCharacter && (
        <DiaryPopup
          diary={selectedDiary}
          character={selectedCharacter}
          onClose={() => {
            setSelectedDiary(null);
            setSelectedCharacter(null);
          }}
          userProfile={userProfile}
        />
      )}
    </div>
  );
} 