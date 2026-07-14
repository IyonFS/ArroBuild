import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generate } from "@/lib/ai/generator";
import { resolveModelForClass } from "@/lib/ai-gateway/model-router";
import { getSupabaseUser, syncDbUser } from "@/lib/auth";
import { MINI_TOOLS, type MiniToolId } from "@/lib/config/mini-tools";
import {
  assertMiniToolAccess,
  runMiniToolCharge,
} from "@/lib/services/mini-tools.service";
import { TierCapabilityError } from "@/lib/services/tier-capabilities";

export const runtime = "nodejs";
export const maxDuration = 120;

const BodySchema = z.object({
  toolId: z.string(),
  input: z.record(z.string(), z.string()),
});

export async function POST(req: NextRequest) {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) {
    return NextResponse.json({ error: "Login diperlukan untuk mini tools." }, { status: 401 });
  }

  const dbUser = await syncDbUser(supabaseUser);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload tidak valid" }, { status: 422 });
  }

  const toolId = parsed.data.toolId as MiniToolId;
  const tool = MINI_TOOLS[toolId];
  if (!tool) {
    return NextResponse.json({ error: "Tool tidak ditemukan" }, { status: 404 });
  }

  for (const field of tool.fields) {
    if (field.required && !parsed.data.input[field.key]?.trim()) {
      return NextResponse.json(
        { error: `Field "${field.label}" wajib diisi.` },
        { status: 422 }
      );
    }
  }

  try {
    await assertMiniToolAccess(dbUser.id, toolId);
  } catch (err) {
    if (err instanceof TierCapabilityError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    throw err;
  }

  try {
    const routed = resolveModelForClass(tool.modelClass);
    const prompt = tool.buildPrompt(parsed.data.input);
    const output = await generate(prompt, {
      model: routed.modelName,
      provider: routed.provider,
      temperature: 0.6,
      maxOutputTokens: tool.maxOutputTokens,
    });

    const { balanceAfter } = await runMiniToolCharge(dbUser.id, toolId);

    return NextResponse.json({
      output,
      creditsUsed: tool.credits,
      balanceAfter,
      toolId,
    });
  } catch (err) {
    if (err instanceof TierCapabilityError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    console.error("Mini tool error:", err);
    return NextResponse.json({ error: "Gagal menjalankan mini tool." }, { status: 500 });
  }
}

export async function GET() {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) {
    return NextResponse.json({ tools: [], requiresLogin: true });
  }

  const dbUser = await syncDbUser(supabaseUser);
  const { listToolsForTier } = await import("@/lib/config/mini-tools");
  const { getUserTierId } = await import("@/lib/services/tier-capabilities");
  const tierId = await getUserTierId(dbUser.id);
  const tools = listToolsForTier(tierId).map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    credits: t.credits,
  }));

  return NextResponse.json({ tools, tierId });
}
