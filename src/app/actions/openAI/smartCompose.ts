"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function smartCompose(
  prompt: string,
  type: "reason" | "project"
): Promise<string> {
  try {
    let content = "";
    if (type === "project") {
      content = `You are a project manager at Wisitech InfoSolutions Pvt. Ltd. tasked with writing a concise and grammatically correct project description. The project details begin with: "${prompt}". Return only one single word that professionally and meaningfully continues the sentence. Do not include any punctuation, explanation, or multiple words. Respond with exactly one word only.`;
    } else if (type === "reason") {
      content = `You are an auto-suggestion tool for a leave application form at Wisitech InfoSolutions Pvt. Ltd. The user is typing their reason for leave. Based on their partial input "${prompt}", suggest the next most likely word to complete a common and grammatically correct leave reason. Prioritize common phrases for personal leave, sick leave, vacation, or other general absences.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: content,
    });

    return response.text ? response.text.trim() : "";
  } catch (error: any) {
    console.error(
      "Gemini Smart Compose Axios Error:",
      error?.response?.data || error.message
    );
    return "";
  }
}
