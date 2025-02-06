import difyService from '../difyService';

describe('Dify Service Tests', () => {
  test('getResponse should return a response', async () => {
    const response = await difyService.getResponse('こんにちは', 'まりぴ');
    expect(response).toBeTruthy();
  });

  test('getUserId should return a valid user ID', () => {
    const userId = difyService.getUserId();
    expect(userId).toMatch(/^user_[a-z0-9]{9}$/);
  });

  test('conversation management should work', () => {
    const characterName = 'まりぴ';
    const conversationId = 'test_conversation_id';
    
    difyService.setConversationId(characterName, conversationId);
    expect(difyService.getConversationId(characterName)).toBe(conversationId);
  });
}); 

