import { GoogleGenerativeAI } from "@google/generative-ai";

// Access API key from environment variables
const apiKey = (import.meta as any).env.VITE_GOOGLE_API_KEY || '';

// Initialize the Google Generative AI client
export const genAI = new GoogleGenerativeAI(apiKey);
