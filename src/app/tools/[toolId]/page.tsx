import { notFound } from "next/navigation";
import MiniToolRunner from "@/components/tools/MiniToolRunner";
import { MINI_TOOLS, type MiniToolId } from "@/lib/config/mini-tools";

const VALID_IDS = new Set(Object.keys(MINI_TOOLS));

interface PageProps {
  params: Promise<{ toolId: string }>;
}

export default async function MiniToolPage({ params }: PageProps) {
  const { toolId } = await params;
  if (!VALID_IDS.has(toolId)) notFound();

  const tool = MINI_TOOLS[toolId as MiniToolId];
  return <MiniToolRunner tool={tool} />;
}
