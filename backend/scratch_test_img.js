require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      config: {
        responseModalities: ['IMAGE'],
      },
      contents: 'Generate a simple red circle.'
    });
    console.log(JSON.stringify(res, null, 2));
  } catch(e) { console.error(e); }
}
run();
