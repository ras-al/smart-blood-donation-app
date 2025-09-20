import { GoogleGenerativeAI } from "@google/generative-ai";

// Get the API key from environment variables
const API_KEY = "AIzaSyADKvwdIZZxAhDGJV1Xeh5m-pmteyuUrD4";

if (!API_KEY) {
  throw new Error("Missing Gemini API Key. Please set REACT_APP_GEMINI_API_KEY in your .env.local file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Uses the Gemini API to predict future blood demand based on historical data.
 * In a real-world scenario, you would pass more context like historical request data.
 *
 * @param location - The city or region for the prediction.
 * @param bloodType - The specific blood type to forecast for.
 * @returns A string containing the AI's prediction.
 */
export const getDemandPrediction = async (location: string, bloodType: string): Promise<string> => {
  try {
    const prompt = `Based on typical seasonal and event-based patterns for a city like ${location}, what is the predicted demand for ${bloodType} blood in the next 7 days? Provide a brief, one-sentence analysis.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error in getDemandPrediction:", error);
    return "Could not retrieve AI demand prediction at this time.";
  }
};

/**
 * Generates a personalized and encouraging notification message for a donor.
 *
 * @param donorName - The name of the donor to personalize the message for.
 * @param hospitalName - The name of the hospital making the request.
 * @returns A personalized string message.
 */
export const generateDonorMessage = async (donorName: string, hospitalName: string): Promise<string> => {
  try {
    const prompt = `Create a short, friendly, and encouraging notification message (under 25 words) for a blood donor named ${donorName}. The request is from ${hospitalName}. Emphasize that their help is urgently needed.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error in generateDonorMessage:", error);
    // Return a fallback message in case of an error
    return `Hi ${donorName}, your blood type is urgently needed at ${hospitalName}. Please consider donating.`;
  }
};