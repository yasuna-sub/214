import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmotionIndicator } from '../components/EmotionIndicator';

describe('EmotionIndicator', () => {
  it('ドキドキメーターとチョコメーターを正しく表示する', () => {
    render(
      <EmotionIndicator
        score={1000}
        maxScore={2000}
        currentEmotion={50}
        isMobile={false}
      />
    );

    // ドキドキメーターの表示を確認
    expect(screen.getByText('ドキドキメーター')).toBeInTheDocument();
    expect(screen.getByText('50.0')).toBeInTheDocument();

    // チョコメーターの表示を確認
    expect(screen.getByText('チョコメーター')).toBeInTheDocument();
    expect(screen.getByText('1000 / 2000 (50.0%)')).toBeInTheDocument();
  });

  it('モバイル表示で正しく表示される', () => {
    render(
      <EmotionIndicator
        score={1000}
        maxScore={2000}
        currentEmotion={50}
        isMobile={true}
      />
    );

    // モバイル表示でも同じ要素が存在することを確認
    expect(screen.getByText('ドキドキメーター')).toBeInTheDocument();
    expect(screen.getByText('チョコメーター')).toBeInTheDocument();
  });

  it('最大値を超えないことを確認', () => {
    render(
      <EmotionIndicator
        score={2500}
        maxScore={2000}
        currentEmotion={150}
        isMobile={false}
      />
    );

    // チョコメーターが100%を超えないことを確認
    expect(screen.getByText('2500 / 2000 (100.0%)')).toBeInTheDocument();
  });
}); 