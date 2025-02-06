import React, { useState, useEffect } from 'react';
import { FaHeart } from 'react-icons/fa';
import { GiChocolateBar } from 'react-icons/gi';

interface EmotionIndicatorProps {
  score: number;
  maxScore: number;
  currentEmotion: number;
  isMobile: boolean;
}

export const EmotionIndicator: React.FC<EmotionIndicatorProps> = ({
  score,
  maxScore,
  currentEmotion,
  isMobile
}) => {
  const [showHeart, setShowHeart] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowHeart(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // チョコメーターの進捗率を計算（累積値）
  const chocolateProgress = Math.min((score / maxScore) * 100, 100);
  
  // ドキドキメーターの進捗率を計算（個別の感情値）
  const emotionProgress = Math.min(Math.max((currentEmotion + 100) / 200 * 100, 0), 100);

  return (
    <div className={`flex flex-col gap-2 ${isMobile ? 'w-full' : 'w-48'} p-4 rounded-lg backdrop-blur-md bg-white/10 shadow-lg border border-white/20`}>
      {/* ドキドキメーター */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <FaHeart 
            className={`text-red-500 text-xl ${showHeart ? 'opacity-100' : 'opacity-50'}`} 
          />
          <span className="text-sm font-medium text-white/90">ドキドキメーター</span>
        </div>
        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-pink-300 to-red-500 transition-all duration-300"
            style={{ width: `${emotionProgress}%` }}
          />
        </div>
        <div className="text-xs text-white/80 text-right">
          {currentEmotion.toFixed(1)}
        </div>
      </div>

      {/* チョコメーター */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍫</span>
          <span className="text-sm font-medium text-white/90">チョコメーター</span>
        </div>
        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-amber-300 to-brown-500 transition-all duration-300"
            style={{ width: `${chocolateProgress}%` }}
          />
        </div>
        <div className="text-xs text-white/80 text-right">
          {score} / {maxScore} ({chocolateProgress.toFixed(1)}%)
        </div>
      </div>
    </div>
  );
};

export default EmotionIndicator; 