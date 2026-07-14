import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseUser, syncDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import * as tierCapabilities from "@/lib/services/tier-capabilities";

const BodySchema = z.object({
  title: z.string().min(3).max(120).optional(),
  message: z.string().min(10).max(2000).optional(),
  projectId: z.string().min(1).max(64).optional(),
});

export async function GET() {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) {
    return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
  }

  const dbUser = await syncDbUser(supabaseUser);
  const quota = await tierCapabilities.getWhatsappQuota(dbUser.id);
  return NextResponse.json({ quota });
}

export async function POST(req: NextRequest) {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) {
    return NextResponse.json({ error: "Login diperlukan" }, { status: 401 });
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
    return NextResponse.json({ error: "Data tidak valid" }, { status: 422 });
  }

  try {
    await tierCapabilities.assertTierCapability(dbUser.id, "whatsapp_chat");
  } catch (err) {
    if (err instanceof tierCapabilities.TierCapabilityError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }

  const now = new Date();
  const defaultMessage =
    parsed.data.message ??
    (parsed.data.projectId
      ? `Halo, saya user ArroBuild (${dbUser.email}). Butuh bantuan untuk project ${parsed.data.projectId}.`
      : `Halo, saya user ArroBuild (${dbUser.email}). Butuh bantuan terkait dokumentasi / generate project.`);

  const chat = await prisma.whatsappChat.create({
    data: {
      userId: dbUser.id,
      title: parsed.data.title ?? "Chat founder",
      status: "OPEN",
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  });

  const founderNumber = process.env.FOUNDER_WHATSAPP_NUMBER ?? "";
  const waLink = founderNumber
    ? `https://wa.me/${founderNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
        defaultMessage
      )}`
    : null;

  const quota = await tierCapabilities.getWhatsappQuota(dbUser.id);

  return NextResponse.json({
    ok: true,
    chatId: chat.id,
    whatsappLink: waLink,
    quota,
    message:
      waLink ??
      "Permintaan chat tercatat. Founder akan menghubungi kamu via email terdaftar.",
  });
}
