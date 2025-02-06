import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface UserProfile {
  name: string;
  description: string;
}

interface UserProfileInputProps {
  onSubmit: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

const TERMS_OF_SERVICE = `## にーいちよん利用規約

本規約は、エンタメチャットアプリ「にーいちよん」（以下「本サービス」）の利用条件を定めるものです。

## 1. サービスの提供と変更
- 提供者は、本サービスの内容をいつでも予告なく変更、停止、または終了する権利を有します。
- キャラクターの性格、設定、日記の内容等は、提供者の判断により随時変更される場合があります。

## 2. データの取り扱い
- 本サービスの利用にあたり、ユーザーの入力内容はAI提供サービスに送信されます。
- プロフィール情報と日記データは一時的にブラウザのローカルストレージに保存されます。
- 本サービスは独自のクラウドデータベースを保持せず、データは永続的に保存されません。

## 3. プライバシーとセキュリティ
- ユーザーのプロフィールと日記内容は、ブラウザのローカルストレージにのみ保存されます。
- 本サービスは、ユーザーの個人情報を収集・保存しません。
- 実際の個人情報は入力しないでください。架空の情報をご使用ください。

## 4. 免責事項
- 本サービスは、AIによる自動生成コンテンツを含むため、日記の内容や応答の正確性を保証するものではありません。
- 本サービスの利用により生じたいかなる損害についても、提供者は責任を負いません。

## 5. 規約の変更
- 本規約は、提供者の判断により予告なく変更される場合があります。
- 変更後の利用規約は、本サービス上に表示された時点で効力を生じるものとします。

## 6. お問い合わせ
本アプリに関するフィードバックおよびお問い合わせは [@yasun_ai](https://x.com/yasun_ai) までお寄せください
`;

// 入力値のサニタイズと検証を行う関数
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>{}]/g, '') // HTMLタグやJSON構造に使用される文字を除去
    .replace(/['"\\]/g, '') // クォートやバックスラッシュを除去
    .replace(/\s+/g, ' ')   // 連続する空白を1つに
    .trim();                // 前後の空白を除去
};

// 名前のバリデーション
const validateName = (name: string): boolean => {
  const nameRegex = /^[ぁ-んァ-ンー一-龯a-zA-Z0-9\s]{1,20}$/;
  return nameRegex.test(name);
};

// 自己紹介のバリデーション
const validateDescription = (description: string): boolean => {
  // 禁止文字や危険なパターンのチェック
  const dangerousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /onload/i,
    /onerror/i,
    /onclick/i,
    /eval\(/i,
    /alert\(/i,
  ];

  return !dangerousPatterns.some(pattern => pattern.test(description));
};

export function UserProfileInput({ onSubmit, initialProfile }: UserProfileInputProps) {
  const [name, setName] = useState(initialProfile?.name || '');
  const [description, setDescription] = useState(initialProfile?.description || '');
  const [showTerms, setShowTerms] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 入力値のサニタイズと検証
    const sanitizedName = sanitizeInput(name);
    const sanitizedDescription = sanitizeInput(description);

    // バリデーションチェック
    if (!validateName(sanitizedName)) {
      alert('名前に使用できない文字が含まれています。ひらがな、カタカナ、漢字、英数字のみ使用可能です。');
      return;
    }

    if (!validateDescription(sanitizedDescription)) {
      alert('自己紹介に不適切な内容が含まれています。');
      return;
    }

    // 文字数制限のチェック
    if (sanitizedDescription.length > 200) {
      alert('自己紹介は200文字以内で入力してください。');
      return;
    }

    // サニタイズされた値でプロフィールを更新
    const sanitizedProfile = {
      name: sanitizedName,
      description: sanitizedDescription,
    };

    // ローカルストレージに保存
    localStorage.setItem('userProfile', JSON.stringify(sanitizedProfile));
    
    onSubmit(sanitizedProfile);
  };

  // 入力時のハンドラーを更新
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 20) { // 名前の最大長を20文字に制限
      setName(value);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 200) {
      setDescription(value);
    }
  };

  // 利用規約ポップアップ
  const TermsPopup = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col relative overflow-hidden"
      >
        {/* 背景画像 */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "url('/images/maripi_key.png')",
            backgroundSize: '100px',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
            transform: 'rotate(-10deg)'
          }}
        />

        <h2 className="text-2xl font-bold mb-4 text-center relative z-10 text-black">利用規約</h2>
        
        {/* 規約本文 */}
        <div className="flex-1 overflow-y-auto mb-6 prose prose-sm max-w-none relative z-10 prose-headings:text-black prose-p:text-black">
          <ReactMarkdown className="text-black">{TERMS_OF_SERVICE}</ReactMarkdown>
        </div>

        {/* 同意チェックボックス */}
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <input
            type="checkbox"
            id="terms-agreement"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="checkbox checkbox-secondary"
          />
          <label htmlFor="terms-agreement" className="text-sm text-black">
            利用規約に同意します
          </label>
        </div>

        {/* 同意ボタン */}
        <button
          onClick={() => agreedToTerms && setShowTerms(false)}
          disabled={!agreedToTerms}
          className="btn btn-secondary w-full disabled:opacity-50 relative z-10"
        >
          同意して始める
        </button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <AnimatePresence>
        {showTerms && <TermsPopup />}
      </AnimatePresence>

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
              <div className="flex flex-col h-full md:h-[calc(100%-10px)]">
                {/* ヘッダー */}
                <div className="sticky top-0 backdrop-blur-md z-10 px-4 py-1 border-b border-white/20">
                  <h1 className="text-xl font-bold text-white drop-shadow-md text-center">あなたのこと知りたいな</h1>
                </div>
                {/* キャラクター画像 */}
                <div className="flex justify-center p-4">
                  <img 
                    src={[
                      '/images/maripi_key.png',
                      '/images/nontan_key.png',
                      '/images/nanaho_key.png'
                    ][Math.floor(Math.random() * 3)]}
                    alt="キャラクター" 
                    className="w-32 h-32 object-contain drop-shadow-lg"
                  />
                </div>

                {/* フォーム */}
                <div className="flex-1 overflow-y-auto p-4">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="card bg-white/80 shadow-xl">
                      <div className="card-body">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="name" className="label">
                              <span className="label-text text-white font-medium drop-shadow-md">名前</span>
                            </label>
                            <input
                              id="name"
                              name="name"
                              type="text"
                              value={name}
                              onChange={handleNameChange}
                              className="input input-bordered w-full bg-white text-gray-800 placeholder-gray-500"
                              placeholder="あなたの名前を入力してください"
                              maxLength={20}
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="description" className="label">
                              <span className="label-text text-white font-medium drop-shadow-md">自己紹介</span>
                            </label>
                            <textarea
                              id="description"
                              name="description"
                              className="textarea textarea-bordered w-full h-32 bg-white text-gray-800 placeholder-gray-500"
                              placeholder="あなたのことを教えてください（200文字以内）"
                              maxLength={200}
                              required
                              value={description}
                              onChange={handleDescriptionChange}
                              data-testid="description-input"
                            />
                            <div className="text-right text-sm text-gray-500">
                              {description.length}/200文字
                            </div>
                          </div>
                      {/* 個人情報に関する注意事項 */}
                      <div className="alert alert-warning bg-yellow-100/90 text-yellow-800 shadow-lg">
                        <div className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div className="ml-2">
                            <h3 className="font-bold">ご注意ください</h3>
                            <p className="text-sm">実際の個人情報は入力しないでください。架空の情報をご使用ください。</p>
                          </div>
                        </div>
                      </div>
                          <div className="card-actions justify-end mt-4">
                            <button
                              type="submit"
                              className="btn btn-primary w-full backdrop-blur-sm bg-primary/90"
                              disabled={!name || !description}
                            >
                              "プロフィールを設定"
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* モバイル表示用 */}
      <div className="md:hidden fixed inset-0 flex flex-col items-center">
        <div 
          className="absolute inset-0 -z-10" 
          style={{
            backgroundImage: "url('/images/back.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="w-full min-w-[320px] max-w-[420px] h-full overflow-hidden">
          <div className="flex flex-col h-full md:h-[calc(100%-60px)]">
            {/* ヘッダー */}
            <div className="sticky top-0 backdrop-blur-md z-10 px-4 py-3 border-b border-white/20">
              <h1 className="text-xl font-bold text-white drop-shadow-md text-center">あなたのこと知りたいな</h1>
            </div>
                {/* キャラクター画像 */}
                <div className="flex justify-center p-4">
                  <img 
                    src={[
                      '/images/maripi_key.png',
                      '/images/nontan_key.png',
                      '/images/nanaho_key.png'
                    ][Math.floor(Math.random() * 3)]}
                    alt="キャラクター" 
                    className="w-32 h-32 object-contain drop-shadow-lg"
                  />
                </div>
            {/* フォーム */}
            <div className="flex-1 overflow-y-auto p-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card bg-white/80 shadow-xl max-w-none">
                  <div className="card-body">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name-mobile" className="label">
                          <span className="label-text text-white font-medium drop-shadow-md">名前</span>
                        </label>
                        <input
                          id="name-mobile"
                          name="name"
                          type="text"
                          value={name}
                          onChange={handleNameChange}
                          className="input input-bordered w-full bg-white text-gray-800 placeholder-gray-500"
                          placeholder="あなたの名前を入力してください（20文字以内）"
                          maxLength={20}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="description-mobile" className="label">
                          <span className="label-text text-white font-medium drop-shadow-md">自己紹介</span>
                        </label>
                        <textarea
                          id="description-mobile"
                          name="description"
                          value={description}
                          onChange={handleDescriptionChange}
                          className="textarea textarea-bordered w-full h-32 bg-white text-gray-800 placeholder-gray-500"
                          placeholder="あなたのことを教えてください（200文字以内）"
                          maxLength={200}
                          required
                          data-testid="description-input"
                        />
                        <div className="text-right text-sm text-gray-500">
                          {description.length}/200文字
                        </div>
                      </div>
                      {/* 個人情報に関する注意事項 */}
                      <div className="alert alert-warning bg-yellow-100/90 text-yellow-800 shadow-lg">
                        <div className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div className="ml-2">
                            <h3 className="font-bold">ご注意ください</h3>
                            <p className="text-sm">実際の個人情報は入力しないでください。架空の情報をご使用ください。</p>
                          </div>
                        </div>
                      </div>

                      <div className="card-actions justify-end mt-4">
                        <button
                          type="submit"
                          className="btn btn-primary w-full backdrop-blur-sm bg-primary/90"
                          disabled={!name || !description}
                        >
                          "プロフィールを設定"
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 