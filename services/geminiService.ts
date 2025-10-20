
import { GoogleGenAI, Type } from "@google/genai";
import type { FileData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        files: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    content: { type: Type.STRING }
                },
                required: ['name', 'content']
            }
        }
    },
    required: ['files']
};

export const generateWebsiteCode = async (prompt: string): Promise<FileData[]> => {
    if (!API_KEY) {
        throw new Error("API Key is not configured.");
    }
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                systemInstruction: `You are an expert web developer AI. Your task is to generate the complete code for a website based on a user's description.
- Generate the necessary HTML, CSS, and JavaScript files.
- The main HTML file MUST be named 'index.html'.
- The main CSS file MUST be named 'style.css'.
- The main JavaScript file MUST be named 'script.js'.
- The 'index.html' MUST correctly link to 'style.css' and 'script.js' using relative paths, like '<link rel="stylesheet" href="style.css">' and '<script src="script.js" defer></script>'.
- Ensure the code is clean, modern, and follows best practices.
- The generated website should be visually appealing and functional.
- Provide the output as a single JSON object that strictly adheres to the provided schema.`,
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            },
        });

        const jsonString = result.text;
        const parsedResult = JSON.parse(jsonString);
        
        if (parsedResult && Array.isArray(parsedResult.files)) {
            return parsedResult.files;
        } else {
            throw new Error("Invalid response format from AI.");
        }

    } catch (error) {
        console.error("Error generating website code:", error);
        throw new Error("Failed to generate website from AI. Please check your prompt or API key.");
    }
};
