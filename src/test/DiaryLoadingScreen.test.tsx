import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiaryLoadingScreen } from '../components/DiaryLoadingScreen';
import diaryService from '../services/diaryService';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// diaryServiceのモック
vi.mock('../services/diaryService', () => ({
  default: {
    handleDiaryClick: vi.fn()
  }
}));

describe('DiaryLoadingScreen', () => {
  const mockCharacter = {
    id: 1,
    name: 'まりぴ',
    description: 'テスト用キャラクター',
    avatar: '/images/maripi.png',
    group: 'ま'
  };

  const mockUserProfile = {
    name: 'テストユーザー',
    description: 'テスト用プロフィール'
  };

  const mockOnDiaryFound = vi.fn();
  const mockOnError = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('初期表示で正しいローディングメッセージが表示される', () => {
    render(
      <DiaryLoadingScreen
        character={mockCharacter}
        onDiaryFound={mockOnDiaryFound}
        onError={mockOnError}
        onBack={mockOnBack}
        userProfile={mockUserProfile}
      />
    );

    expect(screen.getByText('わたあめ屋のバイト終わりに書いてるの～🌈')).toBeInTheDocument();
    expect(screen.getByText('TikTokで見た可愛い日記の書き方真似してみたの！')).toBeInTheDocument();
  });

  it('5秒ごとにメッセージが切り替わる', async () => {
    render(
      <DiaryLoadingScreen
        character={mockCharacter}
        onDiaryFound={mockOnDiaryFound}
        onError={mockOnError}
        onBack={mockOnBack}
        userProfile={mockUserProfile}
      />
    );

    // 最初のメッセージ
    expect(screen.getByText('わたあめ屋のバイト終わりに書いてるの～🌈')).toBeInTheDocument();

    // 5秒経過
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // 次のメッセージ
    expect(screen.getByText('グミ食べながら考え中˙˚ʚ(꒪ˊ꒳ˋ꒪)ɞ˚')).toBeInTheDocument();
  });

  it('日記生成が成功した場合、onDiaryFoundが呼ばれる', async () => {
    const mockDiary = 'テスト用の日記内容';
    vi.mocked(diaryService.handleDiaryClick).mockResolvedValueOnce({
      diary: mockDiary,
      isNewDiary: true
    });

    render(
      <DiaryLoadingScreen
        character={mockCharacter}
        onDiaryFound={mockOnDiaryFound}
        onError={mockOnError}
        onBack={mockOnBack}
        userProfile={mockUserProfile}
      />
    );

    // 20秒経過
    await act(async () => {
      vi.advanceTimersByTime(20000);
    });

    await waitFor(() => {
      expect(mockOnDiaryFound).toHaveBeenCalledWith(mockDiary);
    });
  });

  it('1回目の失敗後にリトライメッセージが表示される', async () => {
    vi.mocked(diaryService.handleDiaryClick)
      .mockRejectedValueOnce(new Error('エラー1'));

    render(
      <DiaryLoadingScreen
        character={mockCharacter}
        onDiaryFound={mockOnDiaryFound}
        onError={mockOnError}
        onBack={mockOnBack}
        userProfile={mockUserProfile}
      />
    );

    // 20秒経過（最初の試行）
    await act(async () => {
      vi.advanceTimersByTime(20000);
    });

    await waitFor(() => {
      expect(screen.getByText('あれ？なんかうまくいかないかも...')).toBeInTheDocument();
      expect(screen.getByText('ごめん！もう一回書き直してみる！')).toBeInTheDocument();
    });
  });

  it('2回失敗後にプロフィール変更提案が表示される', async () => {
    vi.mocked(diaryService.handleDiaryClick)
      .mockRejectedValueOnce(new Error('エラー1'))
      .mockRejectedValueOnce(new Error('エラー2'));

    render(
      <DiaryLoadingScreen
        character={mockCharacter}
        onDiaryFound={mockOnDiaryFound}
        onError={mockOnError}
        onBack={mockOnBack}
        userProfile={mockUserProfile}
      />
    );

    // 20秒経過（最初の試行）
    await act(async () => {
      vi.advanceTimersByTime(20000);
    });

    // 10秒経過（リトライ）
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    await waitFor(() => {
      expect(screen.getByText('ごめん...うまく書けないかも...')).toBeInTheDocument();
      expect(screen.getByText('プロフィールを変えてみたら、もっと上手く書けるかも！')).toBeInTheDocument();
      expect(screen.getByText('プロフィールを変更する')).toBeInTheDocument();
    });
  });

  it('プロフィール変更ボタンをクリックするとonBackが呼ばれる', async () => {
    vi.mocked(diaryService.handleDiaryClick)
      .mockRejectedValueOnce(new Error('エラー1'))
      .mockRejectedValueOnce(new Error('エラー2'));

    render(
      <DiaryLoadingScreen
        character={mockCharacter}
        onDiaryFound={mockOnDiaryFound}
        onError={mockOnError}
        onBack={mockOnBack}
        userProfile={mockUserProfile}
      />
    );

    // エラーを発生させて、プロフィール変更ボタンを表示
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // プロフィール変更ボタンをクリック
    const changeButton = await screen.findByText('プロフィールを変更する');
    await userEvent.click(changeButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('キャラクターごとに異なるスタイルが適用される', () => {
    const { rerender } = render(
      <DiaryLoadingScreen
        character={mockCharacter}
        onDiaryFound={mockOnDiaryFound}
        onError={mockOnError}
        onBack={mockOnBack}
        userProfile={mockUserProfile}
      />
    );

    // まりぴのスタイル確認
    expect(screen.getByRole('img')).toHaveClass('ring-pink-300');

    // のんたんのスタイル確認
    rerender(
      <DiaryLoadingScreen
        character={{ ...mockCharacter, name: 'のんたん' }}
        onDiaryFound={mockOnDiaryFound}
        onError={mockOnError}
        onBack={mockOnBack}
        userProfile={mockUserProfile}
      />
    );
    expect(screen.getByRole('img')).toHaveClass('ring-cyan-300');

    // ななほまるのスタイル確認
    rerender(
      <DiaryLoadingScreen
        character={{ ...mockCharacter, name: 'ななほまる' }}
        onDiaryFound={mockOnDiaryFound}
        onError={mockOnError}
        onBack={mockOnBack}
        userProfile={mockUserProfile}
      />
    );
    expect(screen.getByRole('img')).toHaveClass('ring-yellow-300');
  });

  // APIエラーのテストケースを追加
  it('Vertex AIのAPIエラーが適切に処理される', async () => {
    const apiError = new Error('API error: 500 - {"error":"Internal server error","message":"Invalid response format from Vertex AI","name":"Error"}');
    vi.mocked(diaryService.handleDiaryClick).mockRejectedValueOnce(apiError);

    render(
      <DiaryLoadingScreen
        character={mockCharacter}
        onDiaryFound={mockOnDiaryFound}
        onError={mockOnError}
        onBack={mockOnBack}
        userProfile={mockUserProfile}
      />
    );

    // 20秒経過（最初の試行）
    await act(async () => {
      vi.advanceTimersByTime(20000);
    });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(apiError);
      expect(screen.getByText('あれ？なんかうまくいかないかも...')).toBeInTheDocument();
    });
  });

  it('日記生成中のエラーが適切に処理される', async () => {
    const generationError = new Error('日記の生成中にエラーが発生しました。');
    vi.mocked(diaryService.handleDiaryClick).mockRejectedValueOnce(generationError);

    render(
      <DiaryLoadingScreen
        character={mockCharacter}
        onDiaryFound={mockOnDiaryFound}
        onError={mockOnError}
        onBack={mockOnBack}
        userProfile={mockUserProfile}
      />
    );

    // 20秒経過
    await act(async () => {
      vi.advanceTimersByTime(20000);
    });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(generationError);
      expect(screen.getByText('あれ？なんかうまくいかないかも...')).toBeInTheDocument();
    });
  });

  it('エラー発生時にプログレスバーが赤くなる', async () => {
    const error = new Error('テストエラー');
    vi.mocked(diaryService.handleDiaryClick).mockRejectedValueOnce(error);

    render(
      <DiaryLoadingScreen
        character={mockCharacter}
        onDiaryFound={mockOnDiaryFound}
        onError={mockOnError}
        onBack={mockOnBack}
        userProfile={mockUserProfile}
      />
    );

    // 20秒経過
    await act(async () => {
      vi.advanceTimersByTime(20000);
    });

    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-red-400');
    });
  });
}); 