"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export function ExecuteWorkflowButton({ workflowId }: { workflowId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function execute() {
    setLoading(true);
    await fetch(`/api/workflows/${workflowId}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button onClick={execute} disabled={loading}>
      <Play className="w-4 h-4" />
      {loading ? "Running..." : "Run Workflow"}
    </Button>
  );
}
