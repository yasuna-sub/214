import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chat from '../components/Chat';
import { ChatService } from '../services/ChatService';
import { characterPrompts } from '../services/prompts/characterPrompts';

// AIServiceFactoryのモック
vi.mock('../services/AIServiceFactory', () => ({
  AIServiceFactory: {
    createService: () => ({
      generateResponse: vi.fn().mockImplementation(async (message: string) => {
        if (message.includes('エラー')) {
          throw new Error('エラーが発生しました');
        }
        return 'AIからの返信です';
      }),
      generateDiary: vi.fn()
    })
  }
}));

// ChatServiceのモック
vi.mock('../services/ChatService', () => ({
  ChatService: vi.fn(() => ({
    getResponse: vi.fn().mockResolvedValue({ response: 'テスト返信です', emotionScore: 50 }),
    getEmotionScore: vi.fn().mockReturnValue(0)
  }))
}));

// スクロール関数のモック
const mockScrollIntoView = vi.fn();
window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

describe('Chat Component', () => {
  // テスト用のモックデータ
  const mockUser = {
    id: 1,
    name: 'まりぴ',
    description: '運動部のギャル後輩',
    avatar: '/images/maripi.png',
    group: 'ま'
  };
  const mockUserProfile = {
    name: 'テストユーザー',
    description: 'テストユーザーの説明'
  };
  const mockOnBack = vi.fn();

  // 各テストの前にモックをリセット
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  // 初期表示のテスト
  describe('Initial Render', () => {
    it('キャラクター別の初期メッセージが正しく表示される', () => {
      render(
        <Chat 
          user={mockUser} 
          onBack={mockOnBack}
          userProfile={mockUserProfile}
        />
      );
      expect(screen.getByText('お話しよ❤')).toBeInTheDocument();
    });

    it('キャラクター情報が正しく表示される', () => {
      render(
        <Chat 
          user={mockUser} 
          onBack={mockOnBack}
          userProfile={mockUserProfile}
        />
      );
      expect(screen.getByText('まりぴ')).toBeInTheDocument();
      expect(screen.getAllByAltText('まりぴ')[0]).toHaveAttribute('src', '/images/maripi.png');
    });
  });

  // メッセージ送信のテスト
  describe('Message Sending', () => {
    it('メッセージを入力して送信できる', async () => {
      render(
        <Chat 
          user={mockUser} 
          onBack={mockOnBack}
          userProfile={mockUserProfile}
        />
      );
      
      const input = screen.getAllByPlaceholderText('メッセージを入力...')[0];
      const sendButton = screen.getAllByRole('button').find(button => 
        button.textContent === '送信'
      )!;

      // 初期状態では送信ボタンが無効
      expect(sendButton).toBeDisabled();

      // メッセージを入力
      await userEvent.type(input, 'こんにちは');
      expect(input).toHaveValue('こんにちは');
      expect(sendButton).not.toBeDisabled();

      // メッセージを送信
      await userEvent.click(sendButton);

      // ユーザーのメッセージが表示される
      expect(screen.getByText('こんにちは')).toBeInTheDocument();

      // AIの返信を待つ
      await waitFor(() => {
        expect(screen.getByText('AIからの返信です')).toBeInTheDocument();
      });

      // スクロールが呼び出されたことを確認
      expect(mockScrollIntoView).toHaveBeenCalled();
    });

    it('送信中は入力が無効化される', async () => {
      render(
        <Chat 
          user={mockUser} 
          onBack={mockOnBack}
          userProfile={mockUserProfile}
        />
      );
      
      const input = screen.getAllByPlaceholderText('メッセージを入力...')[0];
      const sendButton = screen.getAllByRole('button').find(button => 
        button.textContent === '送信'
      )!;

      // メッセージを入力して送信
      await userEvent.type(input, 'こんにちは');
      await userEvent.click(sendButton);

      // 送信中は入力と送信ボタンが無効化される
      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();

      // AIの返信後に入力が有効化される
      await waitFor(() => {
        expect(input).not.toBeDisabled();
        expect(sendButton).toBeDisabled(); // 新しい入力がないので無効のまま
      });
    });

    it('エラー時に適切なメッセージが表示される', async () => {
      render(
        <Chat 
          user={mockUser} 
          onBack={mockOnBack}
          userProfile={mockUserProfile}
        />
      );
      
      const input = screen.getAllByPlaceholderText('メッセージを入力...')[0];
      const sendButton = screen.getAllByRole('button').find(button => 
        button.textContent === '送信'
      )!;

      // エラーを発生させるメッセージを送信
      await userEvent.type(input, 'エラーテスト');
      await userEvent.click(sendButton);

      // エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText('ごめんね、うまく返事できなかった...')).toBeInTheDocument();
        expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      });
    });
  });

  // ナビゲーションのテスト
  describe('Navigation', () => {
    it('戻るボタンで前の画面に戻れる', () => {
      render(
        <Chat 
          user={mockUser} 
          onBack={mockOnBack}
          userProfile={mockUserProfile}
        />
      );
      
      const backButton = screen.getAllByRole('button').find(button => 
        button.textContent === '←'
      )!;
      fireEvent.click(backButton);
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  it('Enterキーでメッセージを送信できる', async () => {
    render(
      <Chat
        user={mockUser}
        onBack={mockOnBack}
        userProfile={mockUserProfile}
      />
    );

    const input = screen.getByPlaceholderText('メッセージを入力...');
    await userEvent.type(input, 'こんにちは{enter}');

    await waitFor(() => {
      expect(screen.getByText('こんにちは')).toBeInTheDocument();
      expect(screen.getByText('AIからの返信です')).toBeInTheDocument();
    });
  });

  it('空のメッセージは送信できない', async () => {
    render(
      <Chat
        user={mockUser}
        onBack={mockOnBack}
        userProfile={mockUserProfile}
      />
    );

    const sendButton = screen.getByText('送信');
    expect(sendButton).toBeDisabled();

    const input = screen.getByPlaceholderText('メッセージを入力...');
    await userEvent.type(input, '   ');
    expect(sendButton).toBeDisabled();
  });
}); 