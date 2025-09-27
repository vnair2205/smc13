// server/utils/apiKeyManager.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

let geminiApiKeys = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : [];
let youtubeApiKeys = process.env.YOUTUBE_API_KEYS ? process.env.YOUTUBE_API_KEYS.split(',') : [];
let pexelsApiKeys = process.env.PEXELS_API_KEYS ? process.env.PEXELS_API_KEYS.split(',') : [];

let currentGeminiKeyIndex = 0;
let currentYoutubeKeyIndex = 0;
let currentPexelsKeyIndex = 0;

const getNextKey = (keys, currentIndex) => {
    if (keys.length === 0) return null;
    const key = keys[currentIndex];
    currentIndex = (currentIndex + 1) % keys.length;
    return { key, nextIndex: currentIndex };
};

exports.getNextGeminiKey = () => {
    const result = getNextKey(geminiApiKeys, currentGeminiKeyIndex);
    if (result) {
        currentGeminiKeyIndex = result.nextIndex;
        return result.key;
    }
    return null;
};

exports.getNextYoutubeKey = () => {
    const result = getNextKey(youtubeApiKeys, currentYoutubeKeyIndex);
    if (result) {
        currentYoutubeKeyIndex = result.nextIndex;
        return result.key;
    }
    return null;
};

exports.getNextPexelsKey = () => {
    const result = getNextKey(pexelsApiKeys, currentPexelsKeyIndex);
    if (result) {
        currentPexelsKeyIndex = result.nextIndex;
        return result.key;
    }
    return null;
};

exports.generateWithFallback = async (prompt, generationConfig = {}) => {
    const totalKeys = geminiApiKeys.length;
    if (totalKeys === 0) {
        throw new Error("No Gemini API keys configured.");
    }

    for (let i = 0; i < totalKeys; i++) {
        const apiKey = exports.getNextGeminiKey();
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-pro", // Switched to a more stable model
                generationConfig
            });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error(`Gemini key ending in ...${apiKey.slice(-4)} failed. Error: ${error}. Trying next key...`);
            if (i === totalKeys - 1) { // Last key failed
                throw new Error("All available Gemini API keys failed.");
            }
        }
    }
};