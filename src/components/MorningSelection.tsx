import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Character {
  id: string;
  name: string;
  club: string;
  personality: string;
  greeting: string;
  image: string;
}

const characters: Character[] = [
  {
    id: 'maripi',
    name: 'まりぴ',
    club: 'パソコン部',
    personality: '天然',
    greeting: 'おはよ～！まりぴしか勝たん♡',
    image: '/images/maripi.png'
  },
  {
    id: 'nanaho',
    name: 'ななほまる',
    club: '軽音部',
    personality: 'ツンデレ',
    greeting: 'こっち見んな！',
    image: '/images/nanaho.png'
  },
  {
    id: 'nontan',
    name: 'のんたん',
    club: '文芸部',
    personality: 'メンヘラ',
    greeting: '…なんですか',
    image: '/images/nontan.png'
  }
];

interface MorningSelectionProps {
  onCharacterSelect: (character: Character) => void;
  initialHeartGauge: number;
  onResetProfile: () => void;
}

export const MorningSelection: React.FC<MorningSelectionProps> = ({
  onCharacterSelect,
  initialHeartGauge,
  onResetProfile
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // スマホサイズ時の自動スクロール
  useEffect(() => {
    // スマホサイズかどうかを判定
    const isMobile = window.innerWidth < 768;
    
    if (isMobile && !showConfirm) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          // 最後のキャラクターの場合は最初に戻る
          if (prevIndex >= characters.length - 1) {
            return 0;
          }
          return prevIndex + 1;
        });
      }, 2000); // 2秒ごとに切り替え

      return () => clearInterval(timer);
    }
  }, [showConfirm]);

  // キーボード操作の追加
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showConfirm) return;

      switch (event.key) {
        case 'ArrowUp':
        case 'k':
          event.preventDefault();
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          }
          break;
        case 'ArrowDown':
        case 'j':
          event.preventDefault();
          if (currentIndex < characters.length - 1) {
            setCurrentIndex(currentIndex + 1);
          }
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          setShowConfirm(true);
          break;
        case 'Escape':
          event.preventDefault();
          setShowConfirm(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, showConfirm]);

  // マウスホイール操作（PCのみ）
  const handleWheel = (event: React.WheelEvent) => {
    if (showConfirm || window.innerWidth < 768) return;

    if (event.deltaY > 0 && currentIndex < characters.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (event.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleConfirm = () => {
    onCharacterSelect(characters[currentIndex]);
  };

  // ナビゲーションボタンの追加
  const NavButtons = () => (
    <div className={`absolute right-8 top-1/2 -translate-y-1/2 flex flex-col space-y-4 z-20 ${
      showConfirm ? 'hidden' : ''
    }`}>
      <button
        onClick={() => {
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          } else {
            // 最初のキャラクターの場合は最後に移動
            setCurrentIndex(characters.length - 1);
          }
        }}
        className="p-2 rounded-full bg-white/20 backdrop-blur-sm transition-opacity hover:bg-white/30"
      >
        ↑
      </button>
      <button
        onClick={() => {
          if (currentIndex < characters.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            // 最後のキャラクターの場合は最初に移動
            setCurrentIndex(0);
          }
        }}
        className="p-2 rounded-full bg-white/20 backdrop-blur-sm transition-opacity hover:bg-white/30"
      >
        ↓
      </button>
    </div>
  );

  // モバイル用ナビゲーションボタン
  const MobileNavButtons = () => (
    <div className={`md:hidden absolute right-4 top-1/2 -translate-y-1/2 flex flex-col space-y-4 z-20 ${
      showConfirm ? 'hidden' : ''
    }`}>
      <button
        onClick={() => {
          if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
          } else {
            setCurrentIndex(characters.length - 1);
          }
        }}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-opacity hover:bg-white/30 text-white text-2xl"
      >
        ↑
      </button>
      <button
        onClick={() => {
          if (currentIndex < characters.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            setCurrentIndex(0);
          }
        }}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-opacity hover:bg-white/30 text-white text-2xl"
      >
        ↓
      </button>
    </div>
  );

  // キャラクターコンテンツのレンダリング
  const Content = () => (
    <div className="relative h-full w-full overflow-hidden" onWheel={handleWheel}>
      <motion.div className="h-full w-full">
        {/* リセットボタン */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="btn btn-sm gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            リセット
          </button>
        </div>

        {/* 操作ガイド */}
        <div className="absolute top-4 left-0 right-0 flex justify-center text-white/70">
          <div className="hidden md:block">
            ↑↓キー または マウスホイールで選択 • Enterで決定
          </div>
          <div className="md:hidden">
            タップして選択 • 矢印で切り替え
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full relative"
          >
            {/* フルスクリーン背景画像 */}
            <div 
              className="absolute inset-0 cursor-pointer"
              onClick={() => !showConfirm && setShowConfirm(true)}
            >
              <img
                src={characters[currentIndex].image}
                alt={characters[currentIndex].name}
                className="w-full h-full object-cover"
              />
              {/* グラデーションオーバーレイ */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-90" />
            </div>

            {/* キャラクター情報 */}
            <div className="absolute bottom-16 left-4 right-4 text-white z-10">
              {/* キャラクター名と挨拶 */}
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-3xl font-bold text-white">
                    {characters[currentIndex].name}
                  </h2>
                  <div className="px-2 py-1 bg-white/20 rounded-full text-sm">
                    (16)
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-[80%] bg-pink-500/80 rounded-full"></div>
                  <p className="text-xl font-medium pl-4 text-white/90">
                    {characters[currentIndex].greeting}
                  </p>
                </div>
              </div>

              {/* ステータス情報 */}
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-white/60 text-sm">所属</div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-blue-400/80 rounded-full"></div>
                      <div className="text-lg font-medium">{characters[currentIndex].club}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-white/60 text-sm">性格</div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-purple-400/80 rounded-full"></div>
                      <div className="text-lg font-medium">{characters[currentIndex].personality}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PCのみナビゲーションボタンを表示 */}
            <div className="hidden md:block">
              <NavButtons />
            </div>

            {/* モバイル用ナビゲーションボタン */}
            <MobileNavButtons />

            {/* スワイプインジケーター */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col space-y-2">
              {characters.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* キャラクター選択の確認ダイアログ */}
      {showConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/70 flex items-center justify-center p-6 z-30"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg font-bold mb-4 text-center text-black">
              {characters[currentIndex].name}の日記をのぞいてみる？
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                className="w-full bg-pink-500 text-white py-4 rounded-xl font-bold hover:bg-pink-600 transition-colors"
              >
                はい
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                いいえ
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* リセット確認ダイアログ */}
      {showResetConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/70 flex items-center justify-center p-6 z-30"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">
                プロフィールをリセット
              </h3>
              <p className="text-gray-600 text-center">
                あなたのプロフィールをリセットします。これまでの会話や日記が消去されますがよろしいですか？
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  onResetProfile();
                  setShowResetConfirm(false);
                }}
                className="w-full bg-red-500 text-white py-4 rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                リセットする
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br to-purple-100">
      {/* PC表示用 - 768px以上 */}
      <div className="hidden md:block h-[95vh] w-[calc(min(100%,420px))]">
        <div className="mockup-phone">
          <div className="camera"></div>
          <div className="display">
            <div className="phone-5 artboard artboard-demo">
              <Content />
            </div>
          </div>
        </div>
      </div>

      {/* モバイル表示用 - 768px未満 */}
      <div className="block md:hidden fixed inset-0 bg-black">
        <div className="relative w-full h-full">
          <Content />
        </div>
      </div>
    </div>
  );
}; 