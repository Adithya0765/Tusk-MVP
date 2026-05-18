import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiKey, markKeyRateLimited } from './key-manager';

export async function callGemini(
  systemPrompt: string,
  userMessage: string,
  retries = 3
): Promise<string> {
  if (retries === 0) throw new Error('Gemini failed after all retries.');
  const key = getGeminiKey();
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });
    const result = await model.generateContent(userMessage);
    return result.response.text();
  } catch (error: any) {
    const isRateLimited =
      error?.status === 429 ||
      error?.message?.includes('429') ||
      error?.message?.includes('RESOURCE_EXHAUSTED') ||
      error?.message?.includes('quota');
    if (isRateLimited) {
      markKeyRateLimited(key, 'gemini');
      return callGemini(systemPrompt, userMessage, retries - 1);
    }
    throw error;
  }
}
