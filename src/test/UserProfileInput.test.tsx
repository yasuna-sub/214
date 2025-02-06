import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfileInput } from '../components/UserProfileInput';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

describe('UserProfileInput Component', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    // モックをリセット
    mockOnSubmit.mockClear();
    // ローカルストレージをクリア
    localStorage.clear();
    // DOMをクリーンアップ
    cleanup();
  });

  // 基本的なレンダリングテスト
  test('renders all form elements correctly', () => {
    render(<UserProfileInput onSubmit={mockOnSubmit} />);

    // 必要な要素が存在することを確認
    expect(screen.getByText('利用規約')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /利用規約に同意します/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /同意して始める/i })).toBeInTheDocument();
  });

  // 利用規約の同意プロセスのテスト
  describe('Terms of Service Agreement', () => {
    test('start button is disabled until terms are agreed', () => {
      render(<UserProfileInput onSubmit={mockOnSubmit} />);
      
      const agreeButton = screen.getByRole('button', { name: /同意して始める/i });
      expect(agreeButton).toBeDisabled();

      const checkbox = screen.getByRole('checkbox', { name: /利用規約に同意します/i });
      fireEvent.click(checkbox);
      expect(agreeButton).not.toBeDisabled();
    });

    test('shows form after agreeing to terms', async () => {
      render(<UserProfileInput onSubmit={mockOnSubmit} />);
      
      const checkbox = screen.getByRole('checkbox', { name: /利用規約に同意します/i });
      await userEvent.click(checkbox);
      
      const agreeButton = screen.getByRole('button', { name: /同意して始める/i });
      await userEvent.click(agreeButton);

      expect(screen.getAllByText('名前')[0]).toBeInTheDocument();
      expect(screen.getAllByText('自己紹介')[0]).toBeInTheDocument();
    });
  });

  // 名前の入力テスト
  describe('Name Input Validation', () => {
    test('accepts valid name input', async () => {
      render(<UserProfileInput onSubmit={mockOnSubmit} />);

      // 利用規約に同意して進む
      const checkbox = screen.getByRole('checkbox', { name: /利用規約に同意します/i });
      await userEvent.click(checkbox);
      const agreeButton = screen.getByRole('button', { name: /同意して始める/i });
      await userEvent.click(agreeButton);

      const nameInput = screen.getByPlaceholderText('あなたの名前を入力してください');
      await userEvent.type(nameInput, 'まりぴ');
      expect(nameInput).toHaveValue('まりぴ');
    });

    test('validates name characters', async () => {
      render(<UserProfileInput onSubmit={mockOnSubmit} />);

      // 利用規約に同意して進む
      const checkbox = screen.getByRole('checkbox', { name: /利用規約に同意します/i });
      await userEvent.click(checkbox);
      const agreeButton = screen.getByRole('button', { name: /同意して始める/i });
      await userEvent.click(agreeButton);

      const nameInput = screen.getByPlaceholderText('あなたの名前を入力してください');
      await userEvent.type(nameInput, '<script>alert("test")</script>');

      const submitButton = screen.getAllByRole('button', { name: /プロフィールを設定/i })[0];
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/名前に使用できない文字が含まれています/)).toBeInTheDocument();
      });
    });
  });

  // 自己紹介の入力テスト
  describe('Description Input Validation', () => {
    test('accepts valid description input', async () => {
      render(<UserProfileInput onSubmit={mockOnSubmit} />);

      // 利用規約に同意して進む
      const checkbox = screen.getByRole('checkbox', { name: /利用規約に同意します/i });
      await userEvent.click(checkbox);
      const agreeButton = screen.getByRole('button', { name: /同意して始める/i });
      await userEvent.click(agreeButton);

      const descriptionInput = screen.getAllByTestId('description-input')[0];
      await userEvent.type(descriptionInput, 'よろしくお願いします！');
      expect(descriptionInput).toHaveValue('よろしくお願いします！');
    });

    test('validates description content', async () => {
      render(<UserProfileInput onSubmit={mockOnSubmit} />);

      // 利用規約に同意して進む
      const checkbox = screen.getByRole('checkbox', { name: /利用規約に同意します/i });
      await userEvent.click(checkbox);
      const agreeButton = screen.getByRole('button', { name: /同意して始める/i });
      await userEvent.click(agreeButton);

      const descriptionInput = screen.getAllByTestId('description-input')[0];
      await userEvent.type(descriptionInput, '<script>alert("test")</script>');

      const submitButton = screen.getAllByRole('button', { name: /プロフィールを設定/i })[0];
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/自己紹介に不適切な内容が含まれています/)).toBeInTheDocument();
      });
    });
  });

  // フォーム送信テスト
  describe('Form Submission', () => {
    test('submits form with valid data', async () => {
      render(<UserProfileInput onSubmit={mockOnSubmit} />);

      // 利用規約に同意して進む
      const checkbox = screen.getByRole('checkbox', { name: /利用規約に同意します/i });
      await userEvent.click(checkbox);
      const agreeButton = screen.getByRole('button', { name: /同意して始める/i });
      await userEvent.click(agreeButton);

      // 有効なデータを入力
      const nameInput = screen.getByPlaceholderText('あなたの名前を入力してください');
      const descriptionInput = screen.getAllByTestId('description-input')[0];
      await userEvent.type(nameInput, 'まりぴ');
      await userEvent.type(descriptionInput, 'よろしくお願いします！');

      const submitButton = screen.getAllByRole('button', { name: /プロフィールを設定/i })[0];
      await userEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'まりぴ',
        description: 'よろしくお願いします！'
      });
    });

    test('saves profile to localStorage after submission', async () => {
      render(<UserProfileInput onSubmit={mockOnSubmit} />);

      // 利用規約に同意して進む
      const checkbox = screen.getByRole('checkbox', { name: /利用規約に同意します/i });
      await userEvent.click(checkbox);
      const agreeButton = screen.getByRole('button', { name: /同意して始める/i });
      await userEvent.click(agreeButton);

      // 有効なデータを入力して送信
      const nameInput = screen.getByPlaceholderText('あなたの名前を入力してください');
      const descriptionInput = screen.getAllByTestId('description-input')[0];
      await userEvent.type(nameInput, 'まりぴ');
      await userEvent.type(descriptionInput, 'よろしくお願いします！');

      const submitButton = screen.getAllByRole('button', { name: /プロフィールを設定/i })[0];
      await userEvent.click(submitButton);

      const savedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      expect(savedProfile).toEqual({
        name: 'まりぴ',
        description: 'よろしくお願いします！'
      });
    });
  });

  // 初期値のテスト
  test('loads initial profile correctly', async () => {
    const initialProfile = {
      name: 'まりぴ',
      description: 'よろしくお願いします！'
    };

    render(<UserProfileInput onSubmit={mockOnSubmit} initialProfile={initialProfile} />);

    // 利用規約に同意して進む
    const checkbox = screen.getByRole('checkbox', { name: /利用規約に同意します/i });
    await userEvent.click(checkbox);
    const agreeButton = screen.getByRole('button', { name: /同意して始める/i });
    await userEvent.click(agreeButton);

    expect(screen.getByPlaceholderText('あなたの名前を入力してください')).toHaveValue('まりぴ');
    expect(screen.getAllByTestId('description-input')[0]).toHaveValue('よろしくお願いします！');
  });
}); 