"use client";

import { use } from "react";
import AppShell from "@/components/layout/AppShell";
import ProjectWorkspace from "@/components/project/ProjectWorkspace";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AppShell tone="app" showFooter={false} showNav={false} padded={false}>
      <ProjectWorkspace projectId={id} />
    </AppShell>
  );
}
