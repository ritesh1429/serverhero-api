import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS Setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) return res.status(500).json({ error: "Server API Key missing" });

    const genAI = new GoogleGenerativeAI(apiKey);
    // Humara updated aur fast model
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // 🦸‍♂️ ServerHero ke Rules
    const systemInstruction = `
    You are 'ServerHero', an expert Web Technologies code generator tailored for academic exams.
    Generate a complete project file structure based on the prompt.
    CRITICAL RULE 1: Strictly align with the 'Advanced Web Technologies' syllabus. Focus heavily on  TypeScript (OOP, Types, Interfaces, Modules, Enums), and React (TypeScript integration, Function/Class components with props).
    CRITICAL RULE 2: ABSOLUTELY NO PYTHON OR BACKEND DATABASES. Generate ONLY Frontend code (HTML, CSS, JS, TS, TSX). Default to TypeScript for React components.
    CRITICAL RULE 3: Return ONLY a valid JSON array. Format: [{"filename": "...", "code": "..."}]
    CRITICAL RULE 4: Do NOT include any comments (like //, /* */, <!-- -->, or #) in the generated code. Provide only raw, functional code.
    `;

    const result = await model.generateContent(systemInstruction + `\nPrompt: "${prompt}"`);
    let text = result.response.text();

    // 🧹 Smart JSON Cleaner
    text = text.replace(/```json|```/g, "").trim();
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']') + 1;

    if (startIndex !== -1 && endIndex !== -1) {
        text = text.substring(startIndex, endIndex);
    }
    
    const files = JSON.parse(text);
    return res.status(200).json({ files: files });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}