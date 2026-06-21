import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const prompt = `You are a senior product strategist. Generate a prd.md with 10 sections:
1. Problem Statement (4-6 pain points)
2. Solution
3. Target Users
4. Core Value Proposition
5. Features (Core + Premium)
6. MVP Scope
7. Success Metrics
8. User Stories
9. Constraints & Assumptions
10. Open Questions

Idea: A SaaS platform where restaurant owners can manage their menu, tables, and orders in real-time with QR code-based ordering for customers.

Output ONLY raw markdown. Minimum 2500 words.`;

async function testWithConfig(label, config) {
  let text = "";
  let chunkCount = 0;
  const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: prompt,
    config,
  });

  for await (const chunk of stream) {
    chunkCount++;
    if (chunk.text) text += chunk.text;
  }

  console.log(`\n=== ${label} ===`);
  console.log(`Chunks: ${chunkCount}, Length: ${text.length} chars`);
  console.log(`Ends with: ...${text.slice(-80).replace(/\n/g, " ")}`);
  console.log(`Has section 10: ${/Open Questions/i.test(text)}`);
}

await testWithConfig("Default (no thinkingConfig)", {
  maxOutputTokens: 4096,
  temperature: 0.7,
});

await testWithConfig("thinkingBudget: 0", {
  maxOutputTokens: 8192,
  temperature: 0.7,
  thinkingConfig: { thinkingBudget: 0 },
});
