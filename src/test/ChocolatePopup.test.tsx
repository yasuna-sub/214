import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChocolatePopup } from '../components/ChocolatePopup';
import emotionService from '../services/emotionService';

// emotionServiceのモック
vi.mock('../services/emotionService', () => ({
  default: {
    getScore: vi.fn().mockReturnValue(0),
    getEmotionScore: vi.fn().mockReturnValue({ emotion: '通常', total: 0 })
  }
}));

describe('ChocolatePopup', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnClose.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('まりぴのチョコレート画像が表示される', () => {
    render(
      <ChocolatePopup 
        onClose={mockOnClose} 
        characterName="まりぴ"
      />
    );

    const image = screen.getByAltText(/まりぴからの実は\/\/\/.*チョコ/);
    expect(image).toBeInTheDocument();
    expect(image.getAttribute('src')).toBe('/images/maripi_love.png');
  });

  it('のんたんのチョコレート画像が表示される', () => {
    render(
      <ChocolatePopup 
        onClose={mockOnClose} 
        characterName="のんたん"
      />
    );

    const image = screen.getByAltText(/のんたんからの実は\/\/\/.*チョコ/);
    expect(image).toBeInTheDocument();
    expect(image.getAttribute('src')).toBe('/images/nontan_love.png');
  });

  it('ななほまるのチョコレート画像が表示される', () => {
    render(
      <ChocolatePopup 
        onClose={mockOnClose} 
        characterName="ななほまる"
      />
    );

    const image = screen.getByAltText(/ななほまるからの実は\/\/\/.*チョコ/);
    expect(image).toBeInTheDocument();
    expect(image.getAttribute('src')).toBe('/images/nanaho_love.png');
  });

  it('3秒後に自動的にクローズする', async () => {
    render(
      <ChocolatePopup 
        onClose={mockOnClose} 
        characterName="まりぴ"
      />
    );

    // アニメーションの確認
    const popup = screen.getByRole('img');
    expect(popup.parentElement?.parentElement).toHaveClass('scale-100', 'opacity-100');

    // 3秒経過
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    // フェードアウトアニメーション
    expect(popup.parentElement?.parentElement).toHaveClass('scale-0', 'opacity-0');

    // さらに0.5秒経過
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // onCloseが呼ばれる
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('アンマウント時にタイマーをクリアする', () => {
    const { unmount } = render(
      <ChocolatePopup 
        onClose={mockOnClose} 
        characterName="まりぴ"
      />
    );

    unmount();

    // 3.5秒経過
    vi.advanceTimersByTime(3500);

    // コンポーネントがアンマウントされているので、onCloseは呼ばれない
    expect(mockOnClose).not.toHaveBeenCalled();
  });
}); 