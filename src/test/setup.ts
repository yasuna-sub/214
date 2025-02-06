import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// RTLのマッチャーを拡張
expect.extend(matchers);

// 各テスト後にクリーンアップ
afterEach(() => {
  cleanup();
});

// グローバルなモックの設定
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})); 