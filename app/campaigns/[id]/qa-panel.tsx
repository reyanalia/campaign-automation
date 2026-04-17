"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Clock, Play } from "lucide-react";

type QATemplate = { id: string; name: string; platform: string };
type QAResult = { id: string; itemTitle: string; checkType: string; status: string; message: string | null };
type QARun = { id: string; status: string; createdAt: Date; template: QATemplate; results: QAResult[] };

const STATUS_ICON = {
  pass: <CheckCircle className="w-4 h-4 text-green-500" />,
  fail: <XCircle className="w-4 h-4 text-red-500" />,
  warning: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  pending: <Clock className="w-4 h-4 text-gray-400" />,
};

export function QAPanel({
  campaignId,
  qaTemplates,
  lastRun,
}: {
  campaignId: string;
  qaTemplates: QATemplate[];
  lastRun: QARun | null;
}) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(qaTemplates[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [currentRun, setCurrentRun] = useState<QARun | null>(lastRun);

  async function runQA() {
    if (!selectedTemplate) return;
    setLoading(true);
    const res = await fetch(`/api/campaigns/${campaignId}/qa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId: selectedTemplate }),
    });
    if (res.ok) {
      router.refresh();
      setTimeout(() => {
        fetch(`/api/campaigns/${campaignId}/qa`)
          .then((r) => r.json())
          .then((runs) => runs[0] && setCurrentRun(runs[0]));
      }, 500);
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>QA Checklist</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              className="w-48 text-sm"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              {qaTemplates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
            <Button size="sm" onClick={runQA} disabled={loading || !selectedTemplate}>
              <Play className="w-3.5 h-3.5" />
              {loading ? "Running..." : "Run QA"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!currentRun ? (
          <p className="px-6 py-6 text-sm text-gray-400 text-center">No QA runs yet. Select a checklist and run QA.</p>
        ) : (
          <div>
            <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">{currentRun.template.name}</span>
              <Badge
                className={
                  currentRun.status === "passed"
                    ? "bg-green-100 text-green-700"
                    : currentRun.status === "failed"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }
              >
                {currentRun.status}
              </Badge>
            </div>
            <div className="divide-y divide-gray-50">
              {currentRun.results.map((r) => (
                <div key={r.id} className="px-6 py-3 flex items-start gap-3">
                  {STATUS_ICON[r.status as keyof typeof STATUS_ICON] ?? STATUS_ICON.pending}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.itemTitle}</p>
                    {r.message && <p className="text-xs text-gray-500">{r.message}</p>}
                    <Badge className="mt-1 text-xs bg-gray-100 text-gray-500">{r.checkType}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
