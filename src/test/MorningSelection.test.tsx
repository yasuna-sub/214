import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MorningSelection } from '../components/MorningSelection';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

describe('MorningSelection Component', () => {
  const mockOnCharacterSelect = vi.fn();
  const mockOnResetProfile = vi.fn();

  beforeEach(() => {
    // Reset mocks
    mockOnCharacterSelect.mockClear();
    mockOnResetProfile.mockClear();
  });

  test('renders all characters correctly', () => {
    render(
      <MorningSelection
        onCharacterSelect={mockOnCharacterSelect}
        initialHeartGauge={0}
        onResetProfile={mockOnResetProfile}
      />
    );

    expect(screen.getByText('まりぴ')).toBeInTheDocument();
    expect(screen.getByText('ななほまる')).toBeInTheDocument();
    expect(screen.getByText('のんたん')).toBeInTheDocument();
  });

  test('allows character selection with keyboard', () => {
    render(
      <MorningSelection
        onCharacterSelect={mockOnCharacterSelect}
        initialHeartGauge={0}
        onResetProfile={mockOnResetProfile}
      />
    );

    // 下キーで次のキャラクターへ
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(screen.getByText('ななほまる')).toBeInTheDocument();

    // 上キーで前のキャラクターへ
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(screen.getByText('まりぴ')).toBeInTheDocument();
  });

  test('shows confirmation dialog on Enter key', () => {
    render(
      <MorningSelection
        onCharacterSelect={mockOnCharacterSelect}
        initialHeartGauge={0}
        onResetProfile={mockOnResetProfile}
      />
    );

    fireEvent.keyDown(document, { key: 'Enter' });
    expect(screen.getByText('まりぴに話しかけますか？')).toBeInTheDocument();
  });

  test('calls onCharacterSelect when confirmed', () => {
    render(
      <MorningSelection
        onCharacterSelect={mockOnCharacterSelect}
        initialHeartGauge={0}
        onResetProfile={mockOnResetProfile}
      />
    );

    fireEvent.keyDown(document, { key: 'Enter' });
    const confirmButton = screen.getByText('はい');
    fireEvent.click(confirmButton);

    expect(mockOnCharacterSelect).toHaveBeenCalledWith(expect.objectContaining({
      id: 'maripi',
      name: 'まりぴ'
    }));
  });

  test('closes confirmation dialog with Escape key', () => {
    render(
      <MorningSelection
        onCharacterSelect={mockOnCharacterSelect}
        initialHeartGauge={0}
        onResetProfile={mockOnResetProfile}
      />
    );

    fireEvent.keyDown(document, { key: 'Enter' });
    expect(screen.getByText('まりぴに話しかけますか？')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('まりぴに話しかけますか？')).not.toBeInTheDocument();
  });

  test('shows reset confirmation dialog', () => {
    render(
      <MorningSelection
        onCharacterSelect={mockOnCharacterSelect}
        initialHeartGauge={0}
        onResetProfile={mockOnResetProfile}
      />
    );

    const resetButton = screen.getByText('リセット');
    fireEvent.click(resetButton);

    expect(screen.getByText('プロフィールをリセット')).toBeInTheDocument();
  });

  test('calls onResetProfile when reset is confirmed', () => {
    render(
      <MorningSelection
        onCharacterSelect={mockOnCharacterSelect}
        initialHeartGauge={0}
        onResetProfile={mockOnResetProfile}
      />
    );

    const resetButton = screen.getByText('リセット');
    fireEvent.click(resetButton);

    const confirmResetButton = screen.getByText('リセットする');
    fireEvent.click(confirmResetButton);

    expect(mockOnResetProfile).toHaveBeenCalled();
  });
}); 