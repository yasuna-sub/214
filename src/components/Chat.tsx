import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatService, CharacterConfig } from '../services/ChatService';
import emotionService, { EmotionScore } from '../services/emotionService';
import { EmotionIndicator } from './EmotionIndicator';
import { characterPrompts } from '../services/prompts/characterPrompts';
import { ChocolatePopup } from './ChocolatePopup';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isRead: boolean;
}

interface User {
  id: number;
  name: string;
  description: string;
  avatar: string;
  group: string;
}

interface ChatProps {
  user: User;
  onBack: () => void;
  userProfile: {
    name: string;
    description: string;
  };
}

export default function Chat({ user, onBack, userProfile }: ChatProps) {
  const [showChocolate, setShowChocolate] = useState(false);

  const getInitialMessage = (name: string) => {
    const character = characterPrompts[name as keyof typeof characterPrompts];
    console.log('Initial Message - Character:', character);
    if (character) {
      const message = character.example_tweets[Math.floor(Math.random() * 3)];
      console.log('Initial Message Selected:', message);
      return message;
    }
    return "お話しましょう！";
  };

  const chatServiceRef = useRef<ChatService>(new ChatService({
    name: user.name,
    description: user.description,
    avatar: user.avatar,
    personality: characterPrompts[user.name as keyof typeof characterPrompts]?.personality || 'フレンドリーで明るい'
  }, () => setShowChocolate(true)));
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      content: getInitialMessage(user.name),
      isUser: false,
      timestamp: new Date(),
      isRead: false
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [emotionScore, setEmotionScore] = useState(0);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初期スコアを取得
  useEffect(() => {
    const initialScore = chatServiceRef.current.getEmotionScore(user.id);
    setEmotionScore(initialScore);
    console.log('Current character:', user.name);
  }, [user.id, user.name]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date(),
      isRead: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    // 少し遅延を入れて既読表示を更新
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, isRead: true } : msg
      ));
    }, 1000);

    try {
      const { response, emotionScore: newScore } = await chatServiceRef.current.getResponse(inputMessage, user.name);

      // 返答が200文字を超える場合は表示しない
      if (response.length > 250) {
        console.log('Response exceeded 200 characters, ignoring:', response);
        setIsLoading(false);
        return;
      }

      const aiMessage: Message = {
        id: uuidv4(),
        content: response,
        isUser: false,
        timestamp: new Date(),
        isRead: true
      };
      setMessages(prev => [...prev, aiMessage]);

      // 感情分析を実行
      try {
        const emotionAnalysis = await emotionService.analyzeEmotion(response);
        setCurrentEmotion(emotionAnalysis.total);
        // 感情スコアを更新
        setEmotionScore(newScore);
      } catch (emotionError) {
        console.error('Emotion analysis failed:', emotionError);
      }

    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage = error instanceof Error ? error.message : 'メッセージの送信に失敗しました。';
      setError(errorMessage);

      // エラーメッセージをチャットに表示
      const errorChatMessage: Message = {
        id: uuidv4(),
        content: "申し訳ありません。メッセージの送信中にエラーが発生しました。",
        isUser: false,
        timestamp: new Date(),
        isRead: true
      };
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="hidden md:block h-[95vh] w-[calc(min(100%,420px))]">
        <div className="mockup-phone">
          <div className="camera"></div>
          <div className="display">
            <div className="phone-5 artboard artboard-demo pt-[15px]" style={{ 
              backgroundImage: `url('/images/${user.name === 'まりぴ' ? 'maripi' : user.name === 'のんたん' ? 'nontan' : 'nanaho'}.png')`,
              backgroundSize: 'cover', 
              backgroundPosition: 'center' 
            }}>
              <div className="flex flex-col h-[calc(100%-15px)] w-[calc(100%-15px)]">
                {/* ヘッダー */}
                <div className="sticky top-0 backdrop-blur-md z-10 px-4 py-3 border-b border-white/20">
                  <div className="flex items-center">
                    <button onClick={onBack} className="btn btn-ghost btn-sm text-white">
                      ←
                    </button>
                    <div className="flex items-center ml-2">
                      <div className="avatar">
                        <div className="w-8 h-8 rounded-full ring ring-white/50 hover:ring-white/80 transition-all">
                          <img src={user.avatar} alt={user.name} />
                        </div>
                      </div>
                      <span className="ml-2 font-medium text-white drop-shadow-md">{user.name}</span>
                    </div>
                  </div>
                </div>

                {/* メッセージエリア */}
                <div className="flex-1 overflow-y-auto p-4 w-full">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`chat ${message.isUser ? 'chat-end' : 'chat-start'}`}
                    >
                      <div className={`chat-bubble backdrop-blur-sm ${
                        message.isUser 
                          ? 'bg-primary/90 text-primary-content' 
                          : 'bg-white/60 text-black'
                      }`}>
                        {message.content}
                      </div>
                      {message.isUser && message.isRead && (
                        <div className="text-xs text-gray-400 mt-1 mr-2">既読</div>
                      )}
                    </div>
                  ))}
                  {error && (
                    <div className="text-error text-sm mt-2 backdrop-blur-sm bg-white/40 rounded-lg p-2">
                      {error}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* 感情メーター */}
                <EmotionIndicator 
                  score={emotionScore}
                  maxScore={1000}
                  currentEmotion={currentEmotion}
                  isMobile={false}
                />

                {/* 入力エリア */}
                <div className="sticky bottom-0 backdrop-blur-md border-t border-white/20 p-4 w-[calc(100%-20px)] mx-auto">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="メッセージを入力..."
                      className="input input-bordered backdrop-blur-sm bg-white/40 flex-1 placeholder:text-gray-600"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="btn btn-primary backdrop-blur-sm bg-primary/90"
                      disabled={isLoading || !inputMessage.trim()}
                    >
                      {isLoading ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        "送信"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* モバイル表示用 */}
      <div className="md:hidden fixed inset-0 flex flex-col items-center" style={{ 
        backgroundImage: `url('/images/${user.name === 'まりぴ' ? 'maripi' : user.name === 'のんたん' ? 'nontan' : 'nanaho'}.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="w-full min-w-[320px] max-w-[420px] h-full overflow-hidden">
          <div className="flex flex-col h-full">
            {/* ヘッダー */}
            <div className="sticky top-0 backdrop-blur-md z-10 px-4 py-3 border-b border-white/20">
              <div className="flex items-center">
                <button onClick={onBack} className="btn btn-ghost btn-sm text-white">
                  ←
                </button>
                <div className="flex items-center ml-2">
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full ring ring-white/50 hover:ring-white/80 transition-all">
                      <img src={user.avatar} alt={user.name} />
                    </div>
                  </div>
                  <span className="ml-2 font-medium text-white drop-shadow-md">{user.name}</span>
                </div>
              </div>
            </div>

            {/* メッセージリスト */}
            <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`chat ${message.isUser ? 'chat-end' : 'chat-start'}`}
                >
                  <div className={`chat-bubble backdrop-blur-sm ${
                    message.isUser 
                      ? 'bg-primary/90 text-primary-content' 
                      : 'bg-white/60 text-black'
                  }`}>
                    {message.content}
                  </div>
                  {message.isUser && message.isRead && (
                    <div className="text-xs text-gray-400 mt-1 mr-2">既読</div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} className="h-[1px]" />

              {/* エラーメッセージ */}
              {error && (
                <div className="text-error text-sm mt-2 backdrop-blur-sm bg-white/40 rounded-lg p-2">
                  {error}
                </div>
              )}

              {/* ローディングインジケーター */}
              {isLoading && (
                <div className="chat chat-start">
                  <div className="chat-bubble backdrop-blur-sm bg-white/60">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 感情メーター */}
            <EmotionIndicator 
              score={emotionScore}
              maxScore={1000}
              currentEmotion={currentEmotion}
              isMobile={true}
            />

            {/* 入力フォーム */}
            <div className="sticky bottom-0 backdrop-blur-md border-t border-white/20 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="メッセージを入力..."
                  className="input input-bordered backdrop-blur-sm bg-white/40 flex-1 placeholder:text-gray-600"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  className="btn btn-primary backdrop-blur-sm bg-primary/90"
                  disabled={isLoading || !inputMessage.trim()}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "送信"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showChocolate && (
        <ChocolatePopup 
          onClose={() => setShowChocolate(false)} 
          characterName={user.name}
        />
      )}
    </div>
  );
} 