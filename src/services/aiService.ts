import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generatePostcardText(prompt: string, language: 'en' | 'zh' | 'bilingual') {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API Key is missing. Please configure it in the AI Studio Secrets panel.');
  }

  const systemInstruction = `
    You are an expert postcard writer. 
    Your task is to write a short, emotional, and beautiful postcard message based on the user's keywords or mood.
    The message should be 50-100 words.
    Language settings:
    - If 'en': Write in English only.
    - If 'zh': Write in Chinese only.
    - If 'bilingual': Write each sentence in Chinese followed by its English translation.
    Format the output as plain text. No markdown headers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    return response.text || '';
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}
