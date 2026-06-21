import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

// ─── PATCH /api/project/[id] — save email after download ─────────────────────

const PatchSchema = z.object({
  email: z.string().email("Invalid email address"),
  emailOptIn: z.boolean().optional().default(false),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { email, emailOptIn } = parsed.data;

  try {
    const project = await prisma.project.update({
      where: { id },
      data: { email, emailOptIn },
      select: { id: true, email: true, emailOptIn: true },
    });

    return NextResponse.json({ ok: true, project });
  } catch (err) {
    console.error("Failed to update project email:", err);
    return NextResponse.json(
      { error: "Project not found or database error" },
      { status: 404 }
    );
  }
}
