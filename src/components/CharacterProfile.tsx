import diaryService from '../services/diaryService';

interface User {
  id: number;
  name: string;
  description: string;
  avatar: string;
  group: string;
}

interface CharacterProfileProps {
  user: User;
  onBack: () => void;
  onChatStart: (user: User) => void;
  onDiaryClick: (user: User) => void;
}

export function CharacterProfile({ user, onBack, onChatStart, onDiaryClick }: CharacterProfileProps) {
  const hasDiary = diaryService.getSavedDiaries().some(d => d.userId === user.id);
  
  const backgroundStyle = {
    backgroundImage: `url('/images/${user.name === 'まりぴ' ? 'maripi' : user.name === 'のんたん' ? 'nontan' : 'nanaho'}.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  const Content = () => (
    <div className="flex flex-col h-full w-full md:h-[calc(100%-60px)] md:w-full">
      {/* ヘッダー */}
      <div className="sticky top-0 backdrop-blur-md z-10 px-4 py-3 border-b border-white/20">
        <div className="flex items-center">
          <button onClick={onBack} className="btn btn-ghost btn-sm text-white">
            ←
          </button>
          <h1 className="text-xl font-bold text-white drop-shadow-md ml-2">プロフィール</h1>
        </div>
      </div>

      {/* プロフィール内容 */}
      <div className="flex-1 overflow-y-auto p-4 w-full">
        <div className="card backdrop-blur-sm bg-white/40 shadow-xl w-full">
          <div className="card-body w-full">
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="avatar">
                <div className="w-32 h-32 rounded-full ring ring-white/50">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="text-center w-full">
                <h2 className="text-2xl font-bold text-white drop-shadow-md">{user.name}</h2>
                <div className="badge badge-outline text-white/90 mt-2">{user.group}</div>
                <p className="mt-4 text-white/90 break-words">{user.description}</p>
              </div>
              <button
                onClick={() => onDiaryClick(user)}
                className="btn btn-secondary w-full backdrop-blur-sm bg-secondary/90"
              >
                日記を読む
              </button>
              {hasDiary && (
                <button
                  onClick={() => onChatStart(user)}
                  className="btn btn-primary w-full backdrop-blur-sm bg-primary/90"
                >
                  チャットを始める
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen flex items-center justify-center">
      {/* PC表示用 */}
      <div className="hidden md:block h-[95vh] w-[calc(min(100%,420px))]">
        <div className="mockup-phone">
          <div className="camera"></div>
          <div className="display">
            <div className="phone-5 artboard artboard-demo pt-[60px]" style={backgroundStyle}>
              <Content />
            </div>
          </div>
        </div>
      </div>

      {/* モバイル表示用 */}
      <div className="md:hidden fixed inset-0 flex flex-col items-center" style={backgroundStyle}>
        <div className="w-full min-w-[320px] max-w-[420px] h-full overflow-hidden">
          <Content />
        </div>
      </div>
    </div>
  );
} 