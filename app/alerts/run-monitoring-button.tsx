"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function RunMonitoringButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function run() {
    setLoading(true);
    await fetch("/api/monitoring", { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={run} disabled={loading}>
      <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Checking..." : "Run Monitoring Now"}
    </Button>
  );
}
