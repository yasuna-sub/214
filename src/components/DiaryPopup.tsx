import { DiaryLoadingScreen } from './DiaryLoadingScreen';

interface User {
  id: number;
  name: string;
  description: string;
  avatar: string;
  group: string;
}

interface DiaryPopupProps {
  diary: string;
  character: User;
  onClose: () => void;
  isLoading?: boolean;
  onDiaryFound?: () => void;
  userProfile: { name: string; description: string; };
}

export function DiaryPopup({ diary, character, onClose, isLoading = false, onDiaryFound, userProfile }: DiaryPopupProps) {
  if (isLoading) {
    return <DiaryLoadingScreen 
      character={character} 
      onDiaryFound={onDiaryFound || (() => {})} 
      onBack={onClose}
      userProfile={userProfile}
    />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-secondary/10 rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
        {/* ヘッダー */}
        <div className="p-4 border-b border-secondary/30 flex items-center justify-between bg-secondary/20 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden ring ring-secondary/30">
              <img
                src={character.avatar}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="font-diary font-semibold text-lg text-secondary-content">
              {character.name}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-secondary/30 rounded-full text-secondary-content transition-colors hover:bg-secondary/40"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 日記本文 */}
        <div className="p-6 overflow-y-auto flex-1 bg-[url('/images/paper-texture.png')] bg-repeat">
          <div 
            className="whitespace-pre-wrap font-diary text-lg leading-relaxed text-secondary-content tracking-wide"
            style={{
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 39px, rgba(var(--secondary), 0.3) 39px, rgba(var(--secondary), 0.3) 40px)',
              paddingTop: '8px',
              lineHeight: '40px',
              fontFeatureSettings: '"palt"',
              textOrientation: 'upright',
              writingMode: 'horizontal-tb',
              fontWeight: 400,
              letterSpacing: '0.05em'
            }}
          >
            {diary}
          </div>
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-secondary/30 bg-secondary/20 rounded-b-lg">
          <button
            onClick={onClose}
            className="btn w-full bg-secondary hover:bg-secondary-focus text-secondary-content border-none font-diary"
          >
            日記を閉じる
          </button>
        </div>
      </div>
    </div>
  );
} 