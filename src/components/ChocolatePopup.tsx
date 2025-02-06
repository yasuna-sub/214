import { useEffect, useState } from 'react';

interface ChocolatePopupProps {
  onClose: () => void;
  characterName: string;
}

export function ChocolatePopup({ onClose, characterName }: ChocolatePopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  const getCharacterImage = () => {
    switch (characterName) {
      case 'まりぴ':
        return '/images/maripi_love.png';
      case 'のんたん':
        return '/images/nontan_love.png';
      case 'ななほまる':
        return '/images/nanaho_love.png';
      default:
        return '/images/maripi_key.png';
    }
  };

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/20 backdrop-blur-sm">
      <div 
        className={`transform transition-all duration-1000 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      >
        <div className="relative p-8">
          {/* 背景エフェクト */}
          <div className="absolute inset-0 bg-gradient-to-b from-pink-200/30 to-white/30 rounded-3xl"></div>
          
          {/* メインの画像コンテナ */}
          <div className="relative z-10">
            <img 
              src={getCharacterImage()} 
              alt={`${characterName}からのチョコレート`} 
              className="w-[500px] h-[500px] object-contain drop-shadow-2xl animate-float-gentle"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>

          {/* メッセージオーバーレイ */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-full z-20">
            <div className="text-5xl font-bold text-primary-content text-center drop-shadow-2xl bg-gradient-to-r from-pink-400/80 to-rose-400/80 backdrop-blur-none py-6 px-8 rounded-2xl animate-pulse border-4 border-white/50">
              はい、チョコレート💝
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 