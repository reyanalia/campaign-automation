export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Megaphone, Bell, CheckSquare, GitBranch, AlertTriangle } from "lucide-react";
import { STATUS_COLORS, PLATFORM_LABELS, PLATFORM_COLORS, type Platform } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const [clients, campaigns, alertRules, alertEvents, workflows] = await Promise.all([
    db.client.count(),
    db.campaign.groupBy({ by: ["status"], _count: true }),
    db.alertRule.count({ where: { enabled: true } }),
    db.alertEvent.count({ where: { status: "active" } }),
    db.workflowTemplate.count(),
  ]);

  const recentCampaigns = await db.campaign.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { client: true },
  });

  const recentAlerts = await db.alertEvent.findMany({
    take: 5,
    orderBy: { firedAt: "desc" },
    include: { rule: { include: { client: true } } },
  });

  const campaignCounts = Object.fromEntries(
    campaigns.map((g) => [g.status, g._count])
  );

  const stats = [
    { label: "Total Clients", value: clients, icon: Users, href: "/clients", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Campaigns", value: campaignCounts.active ?? 0, icon: Megaphone, href: "/campaigns", color: "text-green-600", bg: "bg-green-50" },
    { label: "Alert Rules", value: alertRules, icon: Bell, href: "/alerts", color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Active Alerts", value: alertEvents, icon: AlertTriangle, href: "/alerts", color: "text-red-600", bg: "bg-red-50" },
    { label: "Workflows", value: workflows, icon: GitBranch, href: "/workflows", color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Draft Campaigns", value: campaignCounts.draft ?? 0, icon: CheckSquare, href: "/campaigns", color: "text-gray-600", bg: "bg-gray-50" },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Agency campaign automation overview" />

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 py-5">
                <div className={`p-3 rounded-xl ${s.bg}`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentCampaigns.length === 0 ? (
              <p className="px-6 py-4 text-sm text-gray-500">No campaigns yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentCampaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <Link href={`/campaigns/${c.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                          {c.name}
                        </Link>
                        <p className="text-xs text-gray-400">{c.client.company}</p>
                      </td>
                      <td className="px-6 py-3">
                        <Badge className={PLATFORM_COLORS[c.platform as Platform]}>
                          {PLATFORM_LABELS[c.platform as Platform] ?? c.platform}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <Badge className={STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-700"}>
                          {c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentAlerts.length === 0 ? (
              <p className="px-6 py-4 text-sm text-gray-500">No alerts fired yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentAlerts.map((e) => (
                  <div key={e.id} className="px-6 py-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{e.rule.name}</p>
                        <p className="text-xs text-gray-400">{e.rule.client.company}</p>
                      </div>
                      <Badge className={e.status === "active" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}>
                        {e.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{e.metric.toUpperCase()}: {e.actualValue} (threshold: {e.threshold})</p>
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
