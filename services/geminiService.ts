/**
 * OroDrop Neural Engine Service
 * Handles all communication with the Google Gemini API.
 */

import { GoogleGenAI, Type } from "@google/genai";
import { LaunchSequence } from "../types";

/**
 * Exponential Backoff Retry Wrapper
 * Specifically handles 429 (Rate Limit) errors from the API to ensure 
 * high reliability during peak congestion.
 */
const withRetry = async <T>(fn: () => Promise<T>, retries = 5, delay = 3000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorMessage = error?.message?.toLowerCase() || "";
    const errorStatus = error?.status || error?.code || 0;
    
    let errorStr = "";
    try {
      errorStr = JSON.stringify(error).toLowerCase();
    } catch (e) {
      errorStr = "";
    }

    // Check for rate limit or quota exhaustion flags
    const isQuotaError = 
      errorStatus === 429 || 
      errorMessage.includes("quota") || 
      errorMessage.includes("exhausted") || 
      errorMessage.includes("rate limit") ||
      errorStr.includes("429") ||
      errorStr.includes("quota");
    
    if (retries > 0 && isQuotaError) {
      console.warn(`[OroDrop] Neural engine congestion (429). Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

/**
 * Main Content Generation Function
 * Synthesizes the 14-day sequence using Gemini-3-Pro-Preview.
 */
export const generateStorySequence = async (
  prompt: string, 
  imageBase64?: string, 
  directorMode: boolean = false,
  previousResult?: LaunchSequence
): Promise<LaunchSequence> => {
  // Initialize the SDK with the environment API key
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  
  const contents: any[] = [{ text: prompt }];
  
  // Handle optional image input for visual context
  if (imageBase64 && imageBase64.includes('base64,')) {
    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.split(',')[1]
      }
    });
  }

  // Logic for refining existing sequences without losing original context
  let refinementInstruction = "";
  if (previousResult) {
    refinementInstruction = `
REFINEMENT PROTOCOL:
You are updating an existing sequence. 
PREVIOUS DATA: ${JSON.stringify(previousResult)}

CRITICAL: If the user's prompt is identical to the original intent or is just requesting 'Director Mode', you MUST keep every single word in 'productName', 'audience', and the 'hook', 'value', 'cta', 'visualIdea', and 'moveForwardCriteria' of every day EXACTLY AS THEY WERE in the previous data. 
ONLY add the 'shotList' (3-4 cinematic technical directives) to each day to fulfill the Director Mode request. 
Do not hallucinate changes to existing text if the core product/audience hasn't changed.`;
  }

  // The primary personality and technical constraints for the AI
  const systemInstruction = `You are an elite Instagram Sales Strategist and Cinematographer. Your task is to generate or refine a premium 14-day Instagram Story sequence. 

PHASES:
1. Days 1–3: Awareness (Problem-focused)
2. Days 4–7: Authority (Expertise-focused)
3. Days 8–10: Lead Gen (Waitlist-focused)
4. Days 11–14: Conversion (Direct selling)

For EVERY day, you MUST provide 'moveForwardCriteria'. This is advice for the user (MAX 15 words) describing what engagement or result they should see before moving to the next day.

${directorMode ? "DIRECTOR MODE ACTIVE: Provide a 'shotList' (3-4 items) of technical camera movements (panning, bokeh, zoom, etc.) for each day." : ""}

${refinementInstruction}

CRITICAL CONSTRAINTS:
- Audience summary: MAX 6 words.
- Visual ideas: Aesthetic, high-end.
- CTAs: MAX 5 words.`;

  // Define the strict JSON schema to ensure predictable UI rendering
  const properties: any = {
    productName: { type: Type.STRING },
    audience: { type: Type.STRING },
    sequence: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER },
          hook: { type: Type.STRING },
          value: { type: Type.STRING },
          cta: { type: Type.STRING },
          visualIdea: { type: Type.STRING },
          moveForwardCriteria: { type: Type.STRING },
        },
        required: ["day", "hook", "value", "cta", "visualIdea", "moveForwardCriteria"],
      },
    },
  };

  // Add director-specific fields if mode is enabled
  if (directorMode) {
    (properties.sequence.items.properties as any).shotList = {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    };
    properties.sequence.items.required.push("shotList");
  }

  return withRetry(async () => {
    // Generate content with structured output
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: contents },
config: {
  systemInstruction,
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.OBJECT,
    properties,
    required: ["productName", "audience", "sequence"],
  },
},
    });

    if (!response.text) throw new Error("Neural output failed.");
    return JSON.parse(response.text);
  });
};