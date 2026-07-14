import { NextRequest, NextResponse } from "next/server";
import { generateStream } from "@/lib/ai/generator";
import { getSupabaseUser, syncDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  assertTierCapability,
  TierCapabilityError,
  getUserTierId,
} from "@/lib/services/tier-capabilities";
import { getTierConfig } from "@/lib/config/tiers";

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

async function assertMiniToolAccess(userId: string) {
  const { config } = await assertTierCapability(userId, "mini_tools");
  const tierId = await getUserTierId(userId);
  if (!tierId) return;

  if (config.miniToolsIncluded === "all") return;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const used = await prisma.creditLedger.count({
    where: {
      userId,
      type: "TOOL_USAGE",
      createdAt: { gte: startOfMonth },
    },
  });

  const limit =
    typeof config.miniToolsIncluded === "number"
      ? config.miniToolsIncluded
      : config.miniToolTrialLimit ?? 3;

  if (used >= limit) {
    throw new TierCapabilityError(
      "MINI_TOOL_LIMIT",
      `Kuota mini tool bulan ini habis (${used}/${limit}). Upgrade untuk akses lebih banyak.`,
      429
    );
  }
}

export async function POST(req: NextRequest) {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) {
    return NextResponse.json({ error: "Login diperlukan untuk mini tools." }, { status: 401 });
  }

  const dbUser = await syncDbUser(supabaseUser);

  try {
    await assertMiniToolAccess(dbUser.id);
  } catch (err) {
    if (err instanceof TierCapabilityError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }

  try {
    const body = await req.json();
    const { name, bio, skills, description } = body;

    const prompt = `
${PORTFOLIO_SYSTEM_PROMPT}

User Name: ${name || "A Developer"}
Bio: ${bio || "Passionate about building great software."}
Skills: ${skills || "Full-stack development"}
Projects Description:
${description || "I have built various web applications."}
`;

    const stream = await generateStream(prompt, {
      model: "gemini-3.1-flash-lite",
      temperature: 0.7,
      maxOutputTokens: 2000,
    });

    await prisma.creditLedger.create({
      data: {
        userId: dbUser.id,
        type: "TOOL_USAGE",
        amount: 0,
        balanceAfter: dbUser.creditBalance,
        metadata: { tool: "portfolio", name },
      },
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
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Portfolio gen error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
