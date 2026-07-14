import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { getSupabaseUser, syncDbUser } from "@/lib/auth";
import {
  DraftServiceError,
  listDrafts,
  saveDraft,
  deleteDraft,
  MAX_DRAFTS_PER_USER,
} from "@/lib/services/draft.service";

const SaveSchema = z.object({
  draftId: z.string().optional(),
  idea: z.string().min(1).max(12000),
  planData: z.record(z.string(), z.unknown()),
  clarifications: z.record(z.string(), z.unknown()).optional(),
  presets: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) {
    return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  }
  await syncDbUser(supabaseUser);
  const drafts = await listDrafts(supabaseUser.id);
  return NextResponse.json({
    drafts,
    maxDrafts: MAX_DRAFTS_PER_USER,
  });
}

export async function POST(req: NextRequest) {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) {
    return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  }
  await syncDbUser(supabaseUser);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  try {
    const saved = await saveDraft(supabaseUser.id, {
      draftId: parsed.data.draftId,
      idea: parsed.data.idea,
      planData: parsed.data.planData as Prisma.InputJsonValue,
      clarifications: parsed.data.clarifications as Prisma.InputJsonValue | undefined,
      presets: parsed.data.presets as Prisma.InputJsonValue | undefined,
    });
    return NextResponse.json({ ok: true, ...saved });
  } catch (err) {
    if (err instanceof DraftServiceError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.statusCode }
      );
    }
    throw err;
  }
}

export async function DELETE(req: NextRequest) {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) {
    return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  }

  const draftId = new URL(req.url).searchParams.get("id");
  if (!draftId) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }

  try {
    await deleteDraft(supabaseUser.id, draftId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof DraftServiceError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.statusCode }
      );
    }
    throw err;
  }
}
