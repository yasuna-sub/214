import { useState, useEffect } from 'react';
import diaryService from '../services/diaryService';

interface DiaryLoadingScreenProps {
  character: {
    name: string;
    description: string;
    avatar: string;
    id: number;
    group: string;
  };
  onDiaryFound: (diary: string) => void;
  onError?: (error: Error) => void;
  onBack: () => void;
  userProfile: {
    name: string;
    description: string;
  };
}

export function DiaryLoadingScreen({ 
  character, 
  onDiaryFound, 
  onError,
  onBack,
  userProfile 
}: DiaryLoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 1;  // 1回のリトライに制限

  // キャラクター別のメッセージを設定
  const getCharacterExplanations = () => {
    switch (character.name) {
      case 'まりぴ':
        return [
          {
            title: "文字書くの苦手だから音声入力で書いてるん天才🌈",
            description: "漢字とかなんで存在するの？"
          },
          {
            title: "グミ食べながら考え中˙˚ʚ(꒪ˊ꒳ˋ꒪)ɞ˚",
            description: "ハリボーのグミは普通にうまいからおすすめ"
          },
          {
            title: "できたよ～！",
            description: "めっちゃ可愛く仕上がったから見てね！神な日記になったわ～₍ᐢᵒ  ·̮ ᵒ ᐢ₎"
          }
        ];
      case 'のんたん':
        return [
          {
            title: "人混みは苦手だけど...",
            description: "今日見かけた時のこと、パイの実食べながら書いてます..."
          },
          {
            title: "めんどくさくなってきた...",
            description: "でも、あなたのことだから、最後まで書きます..."
          },
          {
            title: "完成、かな...",
            description: "読んでくれるかな...不安だけど..."
          }
        ];
      default: // ななほまる
        return [
          {
            title: "軽音部の練習後に書いてる",
            description: "ほんとは早く帰りてええええ"
          },
          {
            title: "感情を言葉にするのって難しい",
            description: "恋愛感情ってよく分かんないや"
          },
          {
            title: "もうすぐ完成か",
            description: "意外と書き始めると楽しいかも派"
          }
        ];
    }
  };

  const explanations = getCharacterExplanations();

  // 日記生成の処理
  const generateDiary = async () => {
    try {
      const { diary, isNewDiary } = await diaryService.handleDiaryClick(character, userProfile);
      onDiaryFound(diary);
    } catch (err) {
      console.error('日記生成エラー:', err);
      
      // APIエラーかどうかを判定
      const isApiError = (err as Error).message.includes('API error: 500');
      
      // onErrorコールバックを呼び出し
      if (onError) {
        onError(err as Error);
      }

      // 現在のリトライ回数をチェック
      const nextRetryCount = retryCount + 1;

      // APIエラーまたは最大リトライ回数に達した場合
      if (isApiError || nextRetryCount > MAX_RETRIES) {
        setError('profile_change_recommended');
        setRetryCount(MAX_RETRIES);
        // 3秒後にUserListに戻る
        setTimeout(() => {
          onBack();
        }, 5000);
        return;
      }
      
      // まだリトライ可能な場合
      setRetryCount(nextRetryCount);
      setError('generation_error');
      // 3秒後にUserListに戻る
      setTimeout(() => {
        onBack();
      }, 5000);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = (prev + 1) % explanations.length;
        return nextStep;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // エラー状態の場合はタイマーを設定しない
    if (error || retryCount > MAX_RETRIES) {
      return;
    }

    // 初回の生成開始
    if (retryCount === 0) {
      const checkDiaryTimer = setTimeout(() => {
        generateDiary();
      }, 20000);

      return () => clearTimeout(checkDiaryTimer);
    }
  }, [error, retryCount]);

  // キャラクター別のスタイルを設定
  const getCharacterStyle = () => {
    switch (character.name) {
      case 'まりぴ':
        return {
          bgColor: 'bg-pink-100',
          textColor: 'text-pink-600',
          ringColor: 'ring-pink-300',
          progressColor: 'bg-pink-400'
        };
      case 'のんたん':
        return {
          bgColor: 'bg-cyan-100',
          textColor: 'text-cyan-600', 
          ringColor: 'ring-cyan-300',
          progressColor: 'bg-cyan-400'
        };
      default: // ななほまる
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-lime-600',
          ringColor: 'ring-yellow-300',
          progressColor: 'bg-lime-400'
        };
    }
  };

  const style = getCharacterStyle();

  // キャラクターごとの背景画像を設定
  const getBackgroundImage = () => {
    switch (character.name) {
      case 'まりぴ':
        return '/images/maripi_key.png';
      case 'のんたん':
        return '/images/nontan_key.png';
      default:
        return '/images/nanaho_key.png';
    }
  };

  // エラーメッセージの取得
  const getErrorMessage = () => {
    if (error) {
      switch (character.name) {
        case 'まりぴ':
          return retryCount >= MAX_RETRIES ? {
            title: "ごめん...うまく書けないみたい...",
            description: "プロフィールを変えてみたら、もっと上手く書けるかもしれないよ！"
          } : {
            title: "あれ？なんかうまくいかないかも...",
            description: "もう一回だけ書き直してみるね！"
          };
        case 'のんたん':
          return retryCount >= MAX_RETRIES ? {
            title: "やっぱり無理みたい...",
            description: "プロフィールを変えてみませんか...？もっと上手く書けるかも..."
          } : {
            title: "うまく書けない...",
            description: "もう一度だけ...チャレンジしてみます..."
          };
        default: // ななほまる
          return retryCount >= MAX_RETRIES ? {
            title: "日記を書くのが難しいです...",
            description: "プロフィールを見直してみませんか？きっと良い日記が書けるはずです"
          } : {
            title: "日記、書けなくなっちゃった...",
            description: "最後にもう一度だけ、チャレンジさせてください"
          };
      }
    }
    
    // その他のエラー（通常は発生しない）
    return {
      title: "エラーが発生しました",
      description: "申し訳ありませんが、もう一度お試しください"
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-hidden">
      {/* 背景の装飾画像 */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float-gentle opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random() * 0.5})`,
            animationDelay: `${Math.random() * 2}s`,
            width: '100px',
            height: '100px',
            backgroundImage: `url(${getBackgroundImage()})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
      ))}

      <div className={`${style.bgColor} rounded-lg w-full max-w-lg p-8 flex flex-col items-center gap-6 shadow-xl relative z-10`}>
        {/* キャラクターアバター */}
        <div className="relative">
          <div className={`w-24 h-24 rounded-full overflow-hidden ring-4 ${style.ringColor} ${error ? 'animate-shake' : 'animate-pulse'}`}>
            <img
              src={character.avatar}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-1">
              <div className={`w-2 h-2 ${style.progressColor} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
              <div className={`w-2 h-2 ${style.progressColor} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
              <div className={`w-2 h-2 ${style.progressColor} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>

        {/* アニメーションするテキスト */}
        <div className="text-center space-y-2">
          <h3 className={`text-xl font-bold ${style.textColor} animate-fade-in font-diary`}>
            {error ? getErrorMessage().title : explanations[currentStep].title}
          </h3>
          <p className="text-gray-600 animate-fade-in font-diary">
            {error ? getErrorMessage().description : explanations[currentStep].description}
          </p>
          {error === 'profile_change_recommended' && (
            <div className="mt-4 space-y-2">
              <p className="text-gray-600 text-sm">
                プロフィールを変更すると、より良い日記が書けるかもしれません。
              </p>
              <button
                onClick={onBack}
                className={`mt-2 px-4 py-2 rounded-full ${style.bgColor} ${style.textColor} hover:opacity-80 transition-opacity`}
              >
                プロフィールを変更する
              </button>
            </div>
          )}
        </div>

        {/* プログレスバー */}
        <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5" role="progressbar">
          <div
            className={`${error ? 'bg-red-400' : style.progressColor} h-2.5 rounded-full transition-all duration-1000`}
            style={{ 
              width: error 
                ? '100%' 
                : `${((currentStep + 1) / explanations.length) * 100}%` 
            }}
          ></div>
        </div>

        {/* キャラクター名 */}
        <div className={`text-sm ${error ? 'text-red-500' : style.textColor} font-diary`}>
          {character.name}の日記
          {retryCount > 0 && !error && ` (${retryCount + 1}回目のチャレンジ)`}
        </div>
      </div>
    </div>
  );
} 