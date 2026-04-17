export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { NewAlertButton } from "./new-alert-button";
import { RunMonitoringButton } from "./run-monitoring-button";
import { AlertTriangle, Bell } from "lucide-react";

export default async function AlertsPage() {
  const [rules, events, clients] = await Promise.all([
    db.alertRule.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }),
    db.alertEvent.findMany({
      include: { rule: { include: { client: true } } },
      orderBy: { firedAt: "desc" },
      take: 20,
    }),
    db.client.findMany({ select: { id: true, name: true, company: true } }),
  ]);

  const operatorLabel: Record<string, string> = { lt: "<", gt: ">", lte: "≤", gte: "≥" };

  return (
    <div>
      <PageHeader
        title="Performance Alerts"
        description="Monitor metrics and get notified via Telegram when thresholds are breached"
        action={
          <div className="flex gap-2">
            <RunMonitoringButton />
            <NewAlertButton clients={clients} />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" />
              <CardTitle>Alert Rules ({rules.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {rules.length === 0 ? (
              <p className="px-6 py-4 text-sm text-gray-500">No alert rules configured.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {rules.map((r) => (
                  <div key={r.id} className="px-6 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">{r.name}</p>
                      <Badge className={r.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                        {r.enabled ? "active" : "disabled"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {r.client.company} · {r.platform} · {r.metric.toUpperCase()} {operatorLabel[r.operator]} {r.threshold}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <CardTitle>Alert History</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {events.length === 0 ? (
              <p className="px-6 py-4 text-sm text-gray-500">No alerts fired yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {events.map((e) => (
                  <div key={e.id} className="px-6 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{e.rule.name}</p>
                        <p className="text-xs text-gray-400">{e.rule.client.company}</p>
                      </div>
                      <Badge
                        className={
                          e.status === "active"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-500"
                        }
                      >
                        {e.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {e.metric.toUpperCase()}: {e.actualValue} (threshold: {e.threshold})
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(e.firedAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
