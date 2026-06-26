import { NextRequest } from "next/server";
import { z } from "zod";
import { orchestrateGeneration, ALL_FILES } from "@/lib/ai/orchestrator";
import { prisma } from "@/lib/db/prisma";
import type { GenerationInput, FileKey } from "@/lib/ai/prompts/shared";
import type { Prisma } from "@prisma/client";
import {
  getSupabaseUser,
  getEffectiveTier,
  assertCanGenerate,
} from "@/lib/auth";


// ─── Input validation schema ────────────────────────────────────────────────

const GenerationInputSchema = z.object({
  idea: z
    .string()
    .min(50, "Idea must be at least 50 characters")
    .max(2000, "Idea must not exceed 2000 characters"),
  clarifications: z.object({
    platform: z.enum(["web", "mobile", "desktop", "api"]).optional(),
    monetization: z
      .enum(["free", "paid", "freemium", "open-source"])
      .optional(),
    scope: z.enum(["mvp", "full-product", "experiment"]).optional(),
  }),
  presets: z.object({
    framework: z.enum(["nextjs", "laravel", "django", "rails", "fastapi"]),
    design: z.enum([
      "neo-brutalist",
      "minimal",
      "corporate",
      "bold",
      "apple",
      "linear",
      "stripe",
      "notion",
      "vercel",
    ]),
    agentTool: z.enum([
      "cursor",
      "claude-code",
      "windsurf",
      "cline",
      "opencode",
    ]),
  }),
  tier: z.enum(["free", "paid", "unlimited"]).optional().default("free"),
  modelId: z.string().optional(),
  selectedDocs: z.array(
    z.enum([
      "prd",
      "context",
      "plan",
      "design-system",
      "agents",
      "production-hardening",
      "scale-performance",
      "growth-quality",
    ])
  ).optional(),
});

// ─── Route Handler ────────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const maxDuration = 180; // Increased for unlimited tier (8 files)

export async function POST(req: NextRequest) {
  // 1. Parse and validate input
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = GenerationInputSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabaseUser = await getSupabaseUser();
  const userId = supabaseUser?.id ?? null;
  const effectiveTier = await getEffectiveTier(userId);

  const gate = await assertCanGenerate(
    userId,
    effectiveTier,
    parsed.data.modelId
  );
  if (!gate.ok) {
    return new Response(JSON.stringify({ error: gate.error }), {
      status: gate.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const input: GenerationInput = {
    ...parsed.data,
    tier: effectiveTier,
  };

  // 2. Create Project record in database
  let projectId: string;
  try {
    const project = await prisma.project.create({
      data: {
        idea: input.idea,
        clarifications: input.clarifications as unknown as Prisma.InputJsonValue,
        presets: input.presets as unknown as Prisma.InputJsonValue,
        status: "GENERATING",
        userId,
      },
    });
    projectId = project.id;
  } catch (dbError) {
    console.error("Failed to create project in database:", dbError);
    return new Response(
      JSON.stringify({ error: "Database error — failed to create project" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. Create SSE stream
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      }

      // Send projectId immediately so client can reference it
      send({ type: "project_created", projectId });

      try {
        for await (const event of orchestrateGeneration(input)) {
          send(event);

          // Persist each completed file to database
          if (event.type === "file_done" && event.fileKey && event.content) {
            const fileKey = event.fileKey as FileKey;
            const fileDef = ALL_FILES[fileKey];
            await prisma.generatedFile.create({
              data: {
                projectId,
                fileKey,
                fileName: fileDef?.fileName ?? `${fileKey}.md`,
                label: fileDef?.label ?? fileKey,
                content: event.content,
              },
            }).catch((err: unknown) => {
              console.error(`Failed to save file ${fileKey}:`, err);
              // Non-fatal — don't break the stream
            });
          }

          // Mark project status when generation finishes
          if (event.type === "all_done") {
            const success = event.success !== false;
            await prisma.project
              .update({
                where: { id: projectId },
                data: { status: success ? "DONE" : "FAILED" },
              })
              .catch((err: unknown) =>
                console.error("Failed to update project status:", err)
              );
            break;
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unexpected server error";
        send({ type: "error", error: message });

        // Mark project as FAILED
        await prisma.project
          .update({
            where: { id: projectId },
            data: { status: "FAILED" },
          })
          .catch(() => {});
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
