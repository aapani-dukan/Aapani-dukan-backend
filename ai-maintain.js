const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();  // .env से API_KEY पढ़ने के लिए

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ Error: GEMINI_API_KEY not found in environment variables.');
  process.exit(1);
}

// फिक्स करने वाली फाइलें
const FILES_TO_FIX = ['server.js', 'src/AiFix.jsx'];

async function fixFile(filePath) {
  try {
    const absolutePath = path.resolve(__dirname, filePath);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`⚠️ File not found: ${filePath}`);
      return;
    }

    const code = fs.readFileSync(absolutePath, 'utf-8');
    const prompt = `Fix and improve the following code. Return only the corrected code inside a proper code block:\n\n${code}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }),
    });

    if (!res.ok) {
      console.error(`❌ API call failed with status ${res.status}: ${res.statusText}`);
      return;
    }

    const json = await res.json();
    const responseText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const fixedMatch = responseText.match(/```(?:\w+)?\n([\s\S]*?)```/);
    if (fixedMatch) {
      const fixedCode = fixedMatch[1].trim();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${absolutePath}.bak-${timestamp}`;

      fs.writeFileSync(backupPath, code);
      fs.writeFileSync(absolutePath, fixedCode);

      console.log(`✅ Fixed and updated: ${filePath}`);
    } else {
      console.warn(`⚠️ Could not extract valid code block from Gemini response for: ${filePath}`);
    }
  } catch (err) {
    console.error(`❌ Error fixing file ${filePath}:`, err.message);
  }
}
