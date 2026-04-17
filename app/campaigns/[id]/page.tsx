import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, PLATFORM_LABELS, PLATFORM_COLORS, formatCurrency, formatDate, type Platform } from "@/lib/utils";
import { QAPanel } from "./qa-panel";
import Link from "next/link";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [campaign, qaTemplates] = await Promise.all([
    db.campaign.findUnique({
      where: { id },
      include: {
        client: true,
        template: true,
        qaRuns: { include: { results: true, template: true }, orderBy: { createdAt: "desc" }, take: 3 },
        executions: { include: { stepResults: true, workflow: true }, orderBy: { startedAt: "desc" }, take: 3 },
      },
    }),
    db.qAChecklistTemplate.findMany(),
  ]);
  if (!campaign) notFound();

  const variables = JSON.parse(campaign.variables || "{}");

  const statusIcon = (s: string) => {
    if (s === "pass" || s === "completed") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (s === "fail" || s === "failed") return <XCircle className="w-4 h-4 text-red-500" />;
    if (s === "warning") return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div>
      <PageHeader
        title={campaign.name}
        description={`${campaign.client.company} · ${PLATFORM_LABELS[campaign.platform as Platform] ?? campaign.platform}`}
        action={
          <div className="flex gap-2">
            <Badge className={PLATFORM_COLORS[campaign.platform as Platform] ?? "bg-gray-100"}>
              {PLATFORM_LABELS[campaign.platform as Platform] ?? campaign.platform}
            </Badge>
            <Badge className={STATUS_COLORS[campaign.status] ?? "bg-gray-100 text-gray-700"}>
              {campaign.status}
            </Badge>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <QAPanel campaignId={id} qaTemplates={qaTemplates} lastRun={campaign.qaRuns[0] ?? null} />

          <Card>
            <CardHeader><CardTitle>Recent Workflow Executions</CardTitle></CardHeader>
            <CardContent className="p-0">
              {campaign.executions.length === 0 ? (
                <p className="px-6 py-4 text-sm text-gray-500">No workflow executions yet.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {campaign.executions.map((ex) => (
                    <div key={ex.id} className="px-6 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">{ex.workflow.name}</p>
                        <Badge className={STATUS_COLORS[ex.status] ?? "bg-gray-100 text-gray-700"}>{ex.status}</Badge>
                      </div>
                      <div className="space-y-1">
                        {ex.stepResults.map((sr) => (
                          <div key={sr.id} className="flex items-center gap-2 text-xs text-gray-500">
                            {statusIcon(sr.status)}
                            <span>{sr.stepTitle}</span>
                            {sr.output && <span className="text-gray-400">— {sr.output}</span>}
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

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Campaign Details</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div><span className="text-gray-500">Client:</span> <Link href={`/clients/${campaign.clientId}`} className="text-blue-600 hover:underline">{campaign.client.name}</Link></div>
              <div><span className="text-gray-500">Budget:</span> <span>{formatCurrency(campaign.budget)}</span></div>
              <div><span className="text-gray-500">Start:</span> <span>{formatDate(campaign.startDate)}</span></div>
              <div><span className="text-gray-500">End:</span> <span>{formatDate(campaign.endDate)}</span></div>
              {campaign.template && (
                <div><span className="text-gray-500">Template:</span> <Link href={`/templates/${campaign.templateId}`} className="text-blue-600 hover:underline">{campaign.template.name}</Link></div>
              )}
            </CardContent>
          </Card>

          {Object.keys(variables).length > 0 && (
            <Card>
              <CardHeader><CardTitle>Variables</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                {Object.entries(variables).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-gray-500 truncate">{k}:</span>
                    <span className="text-gray-900 truncate">{String(v)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
