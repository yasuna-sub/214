/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiaryPopup } from '../components/DiaryPopup';

describe('DiaryPopup', () => {
  const mockCharacter = {
    id: 1,
    name: 'テストキャラクター',
    description: 'テスト用の説明文',
    avatar: '/images/test-avatar.png',
    group: 'テストグループ'
  };

  const mockDiary = '今日はとても良い一日でした。\n天気も良くて気分爽快です。';
  const mockOnClose = vi.fn();
  const mockUserProfile = {
    name: 'テストユーザー',
    description: 'テストユーザーの説明'
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders character information correctly', () => {
    render(
      <DiaryPopup
        diary={mockDiary}
        character={mockCharacter}
        onClose={mockOnClose}
        userProfile={mockUserProfile}
      />
    );

    expect(screen.getByText(mockCharacter.name)).toBeInTheDocument();
    expect(screen.getByText(mockCharacter.description)).toBeInTheDocument();
    expect(screen.getByAltText(mockCharacter.name)).toHaveAttribute('src', mockCharacter.avatar);
  });

  it('renders diary content correctly', () => {
    render(
      <DiaryPopup
        diary={mockDiary}
        character={mockCharacter}
        onClose={mockOnClose}
        userProfile={mockUserProfile}
      />
    );

    // 正規表現を使用して改行を含むテキストを検索
    const diaryRegex = new RegExp(mockDiary.replace(/\n/g, '\\s*'));
    expect(screen.getByText(diaryRegex)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <DiaryPopup
        diary={mockDiary}
        character={mockCharacter}
        onClose={mockOnClose}
        userProfile={mockUserProfile}
      />
    );

    const closeButtons = screen.getAllByRole('button');
    closeButtons.forEach(button => {
      fireEvent.click(button);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('applies correct styling to diary content', () => {
    render(
      <DiaryPopup
        diary={mockDiary}
        character={mockCharacter}
        onClose={mockOnClose}
        userProfile={mockUserProfile}
      />
    );

    // 正規表現を使用して改行を含むテキストを検索
    const diaryRegex = new RegExp(mockDiary.replace(/\n/g, '\\s*'));
    const diaryContent = screen.getByText(diaryRegex);
    
    expect(diaryContent).toHaveStyle({
      lineHeight: '40px',
      fontFeatureSettings: '"palt"',
      textOrientation: 'upright',
      writingMode: 'horizontal-tb',
      fontWeight: 400,
      letterSpacing: '0.05em'
    });
  });
}); 