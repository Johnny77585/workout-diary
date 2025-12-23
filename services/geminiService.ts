import { GoogleGenAI } from "@google/genai";
import { WorkoutLog } from '../types';

const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateWorkoutAdvice = async (
  history: WorkoutLog,
  currentDate: string
): Promise<string> => {
  const client = getAIClient();
  if (!client) return "請先設定 API Key 以使用 AI 教練功能。";

  // Prepare context: last 7 days of logs
  const relevantHistory = Object.entries(history)
    .sort((a, b) => b[0].localeCompare(a[0])) // Sort new to old
    .slice(0, 7)
    .map(([date, exercises]) => {
      const details = exercises.map(e => 
        `${e.name}: ${e.sets.length} sets (Best: ${Math.max(...e.sets.map(s => s.weight))}kg)`
      ).join(', ');
      return `Date: ${date} | Activities: ${details}`;
    }).join('\n');

  const prompt = `
    You are an encouraging and knowledgeable fitness coach for a beginner.
    
    Current Date: ${currentDate}
    
    User's Recent Activity (Last 7 days):
    ${relevantHistory || "No recent history."}
    
    Task:
    1. Briefly analyze their recent consistency and volume.
    2. Suggest a specific focus or a few exercises for today based on what they HAVEN'T done recently (muscle balance).
    3. Keep it short, motivating, and under 150 words.
    4. Use Traditional Chinese (zh-TW).
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "無法產生建議，請稍後再試。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 連線發生錯誤，請檢查網路或 API Key。";
  }
};