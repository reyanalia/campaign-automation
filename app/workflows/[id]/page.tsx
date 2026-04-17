export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, formatDate } from "@/lib/utils";
import { ExecuteWorkflowButton } from "./execute-button";
import { CheckCircle, XCircle, Clock, Circle } from "lucide-react";

export default async function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workflow = await db.workflowTemplate.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { order: "asc" } },
      executions: {
        include: { stepResults: true },
        orderBy: { startedAt: "desc" },
        take: 5,
      },
    },
  });
  if (!workflow) notFound();

  const stepTypeColors: Record<string, string> = {
    create_campaign: "bg-blue-100 text-blue-700",
    send_email: "bg-green-100 text-green-700",
    notify: "bg-yellow-100 text-yellow-700",
    wait: "bg-gray-100 text-gray-700",
    set_budget: "bg-purple-100 text-purple-700",
    set_audience: "bg-pink-100 text-pink-700",
  };

  const statusIcon = (s: string) => {
    if (s === "completed") return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
    if (s === "failed") return <XCircle className="w-3.5 h-3.5 text-red-500" />;
    if (s === "running") return <Clock className="w-3.5 h-3.5 text-blue-500" />;
    return <Circle className="w-3.5 h-3.5 text-gray-300" />;
  };

  return (
    <div>
      <PageHeader
        title={workflow.name}
        description={workflow.description ?? undefined}
        action={<ExecuteWorkflowButton workflowId={id} />}
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Steps ({workflow.steps.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {workflow.steps.map((step, i) => {
                  const config = JSON.parse(step.config || "{}");
                  return (
                    <div key={step.id} className="px-6 py-4 flex items-start gap-4">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900">{step.title}</p>
                          <Badge className={stepTypeColors[step.stepType] ?? "bg-gray-100 text-gray-700"}>
                            {step.stepType.replace("_", " ")}
                          </Badge>
                          {step.platform && (
                            <Badge className="bg-gray-100 text-gray-500">{step.platform}</Badge>
                          )}
                        </div>
                        {Object.keys(config).length > 0 && (
                          <pre className="text-xs text-gray-400 mt-1">{JSON.stringify(config)}</pre>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent Executions</CardTitle></CardHeader>
            <CardContent className="p-0">
              {workflow.executions.length === 0 ? (
                <p className="px-6 py-4 text-sm text-gray-500">No executions yet.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {workflow.executions.map((ex) => (
                    <div key={ex.id} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">{formatDate(ex.startedAt)}</span>
                        <Badge className={STATUS_COLORS[ex.status] ?? "bg-gray-100 text-gray-700"}>{ex.status}</Badge>
                      </div>
                      <div className="space-y-1">
                        {ex.stepResults.map((sr) => (
                          <div key={sr.id} className="flex items-center gap-2 text-xs">
                            {statusIcon(sr.status)}
                            <span className="text-gray-700">{sr.stepTitle}</span>
                            {sr.output && <span className="text-gray-400">— {sr.output}</span>}
                            {sr.error && <span className="text-red-400">⚠ {sr.error}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle>Info</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div><span className="text-gray-500">Trigger:</span> <Badge className="ml-1 bg-gray-100 text-gray-700">{workflow.trigger}</Badge></div>
              <div><span className="text-gray-500">Steps:</span> <span>{workflow.steps.length}</span></div>
              <div><span className="text-gray-500">Total runs:</span> <span>{workflow.executions.length}</span></div>
              <div><span className="text-gray-500">Created:</span> <span>{formatDate(workflow.createdAt)}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
