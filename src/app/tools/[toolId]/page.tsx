import { notFound } from "next/navigation";
import MiniToolRunner from "@/components/tools/MiniToolRunner";
import { MINI_TOOLS, type MiniToolId } from "@/lib/config/mini-tools";

const VALID_IDS = new Set(Object.keys(MINI_TOOLS));

/** Dedicated wizard routes — must not fall through to generic runner */
const CUSTOM_TOOL_PAGES = new Set([
  "readme-generator",
  "copy-studio",
  "stack-advisor",
  "portfolio",
]);

interface PageProps {
  params: Promise<{ toolId: string }>;
}

export default async function MiniToolPage({ params }: PageProps) {
  const { toolId } = await params;
  if (!VALID_IDS.has(toolId) || CUSTOM_TOOL_PAGES.has(toolId)) notFound();

  const tool = MINI_TOOLS[toolId as MiniToolId];
  // Never pass buildPrompt (function) across the server→client boundary
  const { buildPrompt: _omit, ...serializable } = tool;
  return <MiniToolRunner tool={serializable} />;
}
