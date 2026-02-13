const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config({ path: __dirname + '/.env' });

const logFile = 'models_log.txt';
fs.writeFileSync(logFile, `Starting tests with key ending in ...${process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.slice(-4) : 'NONE'}\n`);

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const models = ["gemini-3-flash-preview", "gemini-2.0-flash-exp", "gemini-1.5-flash"];

  for (const modelName of models) {
    try {
        fs.appendFileSync(logFile, `Testing ${modelName}...\n`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        fs.appendFileSync(logFile, `SUCCESS: ${modelName} works. Response: ${result.response.text()}\n`);
    } catch (error) {
        fs.appendFileSync(logFile, `FAILED: ${modelName}. Error: ${error.message}\n`);
    }
  }
}

listModels();
