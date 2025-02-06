import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import App from '../App'

// AIServiceFactoryのモック
vi.mock('../services/AIServiceFactory', () => ({
  AIServiceFactory: {
    createService: () => ({
      generateResponse: vi.fn(),
      generateDiary: vi.fn()
    })
  }
}))

// localStorage のモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('App', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  it('renders splash screen initially', () => {
    render(<App />)
    expect(screen.getByTestId('splash-screen')).toBeInTheDocument()
  })

  it('transitions to user list after splash screen', async () => {
    // ユーザープロフィールが存在する状態をモック
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      name: 'Test User',
      description: 'Test Description'
    }));

    vi.useFakeTimers()
    render(<App />)
    
    // スプラッシュ画面の表示を確認
    expect(screen.getByTestId('splash-screen')).toBeInTheDocument()
    
    // タイマーを進める
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    
    // UserListの表示を確認
    expect(screen.getByTestId('user-list')).toBeInTheDocument()
    
    vi.useRealTimers()
  })
}) 