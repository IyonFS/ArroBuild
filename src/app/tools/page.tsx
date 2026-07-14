"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import ToolsShowcase from "@/components/tools/ToolsShowcase";

export default function ToolsHubPage() {
  const [tierId, setTierId] = useState<string | null>(null);
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    fetch("/api/tools/run")
      .then((r) => r.json())
      .then((d: { tierId?: string; requiresLogin?: boolean }) => {
        setTierId(d.tierId ?? null);
        setRequiresLogin(Boolean(d.requiresLogin));
      })
      .catch(() => {});
  }, []);

  return (
    <AppShell tone="marketing" showFooter padded={false}>
      <ToolsShowcase requiresLogin={requiresLogin} tierId={tierId} />
    </AppShell>
  );
}
