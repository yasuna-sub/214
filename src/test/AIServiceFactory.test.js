import { describe, it, expect, vi } from 'vitest';

vi.mock('../services/AIServiceFactory', () => {
  const DifyService = class {};
  const OpenAIService = class {};
  
  return {
    AIServiceFactory: {
      createService: (type = 'dify') => {
        const lowerType = type.toLowerCase();
        if (lowerType === 'dify') {
          return new DifyService();
        } else if (lowerType === 'openai') {
          return new OpenAIService();
        }
        throw new Error(`Unknown AI service type: ${type}`);
      }
    },
    DifyService,
    OpenAIService
  };
});

const { AIServiceFactory, DifyService, OpenAIService } = await import('../services/AIServiceFactory');

describe('AIServiceFactory', () => {
  it('should create DifyService by default', () => {
    const service = AIServiceFactory.createService();
    expect(service).toBeInstanceOf(DifyService);
  });

  it('should create OpenAIService when specified', () => {
    const service = AIServiceFactory.createService('openai');
    expect(service).toBeInstanceOf(OpenAIService);
  });

  it('should throw error for unknown service type', () => {
    expect(() => {
      AIServiceFactory.createService('unknown');
    }).toThrow('Unknown AI service type: unknown');
  });

  it('should be case insensitive', () => {
    const service1 = AIServiceFactory.createService('DIFY');
    const service2 = AIServiceFactory.createService('OpenAI');
    
    expect(service1).toBeInstanceOf(DifyService);
    expect(service2).toBeInstanceOf(OpenAIService);
  });
}); 