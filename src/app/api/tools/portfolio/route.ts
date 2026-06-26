import { NextRequest } from "next/server";
import { generateStream } from "@/lib/ai/generator";

export const runtime = "nodejs";
export const maxDuration = 300;

const PORTFOLIO_SYSTEM_PROMPT = `You are an expert developer relations engineer creating a top-tier GitHub README profile. 
Given the user's name, skills, bio, and description of projects, generate a beautiful, professional, and highly-structured README.md that acts as their developer portfolio.
Use modern Markdown features like tables, blockquotes, emoji, and clean typography.
Output ONLY the raw markdown content without any extra conversational text.

Follow this exact structure, embellishing and improving the text to make it sound highly professional:

# Hi there, I'm [Name] 👋

> [Engaging, polished, and professional Bio based on the user's input]

## 🛠️ Tech Stack & Tools

Use a markdown table or bulleted list with clear categories (e.g., Frontend, Backend, DevOps, Tools) based on the user's skills:
| Category | Technologies |
| --- | --- |
| ... | ... |

## 🚀 Featured Projects

For each project described by the user, create a clean section with:
- **Project Name** 
- A concise, impactful description.
- **Key Features:** (Bullet points)
- **Tech Stack:** (Inferred or provided)

## 📈 GitHub Stats

(Add placeholder markdown image links for GitHub stats, like github-readme-stats with username placeholders)

## 📫 Get In Touch

- **LinkedIn:** [linkedin.com/in/username](#)
- **Portfolio:** [yourwebsite.com](#)
- **Email:** [email@example.com](mailto:email@example.com)
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, bio, skills, description } = body;

    // Format prompt
    const prompt = `
${PORTFOLIO_SYSTEM_PROMPT}

User Name: ${name || "A Developer"}
Bio: ${bio || "Passionate about building great software."}
Skills: ${skills || "Full-stack development"}
Projects Description:
${description || "I have built various web applications."}
`;

    const stream = await generateStream(prompt, {
      model: "gemini-2.5-flash",
      temperature: 0.7,
      maxOutputTokens: 2000,
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        } catch (e) {
          console.error("Stream error:", e);
          controller.error(e);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Portfolio gen error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
