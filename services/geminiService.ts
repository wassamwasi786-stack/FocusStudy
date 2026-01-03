import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAiClient() {
  // Use typeof check to prevent ReferenceError in strict browser environments
  if (!ai && typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

export async function fetchMotivationalQuote(sessionType: string) {
  const isWork = sessionType === 'work';
  const instruction = isWork 
    ? "Generate a short, deeply motivational quote for someone beginning or finishing a deep focus session. Focus on discipline, presence, or the beauty of the craft." 
    : "Generate a short, beautiful creative mindfulness prompt or a gentle affirmation for someone taking a restorative break. Focus on breathing, nature, or internal peace.";

  const client = getAiClient();
  if (!client) {
    console.warn("Gemini API key not found, using fallback quotes.");
    return {
      text: isWork ? "Focus is the art of knowing what to ignore." : "Rest is the foundation of every great achievement.",
      author: "FocusStudy"
    };
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${instruction} Keep it under 15 words.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: "The motivational quote or creative prompt.",
            },
            author: {
              type: Type.STRING,
              description: "The author or 'FocusStudy' if anonymous.",
            },
          },
          required: ["text", "author"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: isWork ? "Focus is the art of knowing what to ignore." : "Rest is the foundation of every great achievement.",
      author: "FocusStudy"
    };
  }
}