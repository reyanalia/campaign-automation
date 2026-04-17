import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, PLATFORM_LABELS, PLATFORM_COLORS, formatCurrency, formatDate, type Platform } from "@/lib/utils";
import Link from "next/link";
import { OnboardingProgress } from "./onboarding-progress";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await db.client.findUnique({
    where: { id },
    include: {
      campaigns: { orderBy: { createdAt: "desc" } },
      alertRules: true,
      onboardings: {
        include: { sequence: { include: { steps: { orderBy: { order: "asc" } } } } },
        orderBy: { startedAt: "desc" },
      },
    },
  });
  if (!client) notFound();

  return (
    <div>
      <PageHeader
        title={client.name}
        description={`${client.company}${client.industry ? ` · ${client.industry}` : ""}`}
        action={
          <Badge className={STATUS_COLORS[client.status] ?? "bg-gray-100 text-gray-700"}>
            {client.status}
          </Badge>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaigns ({client.campaigns.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {client.campaigns.length === 0 ? (
                <p className="px-6 py-4 text-sm text-gray-500">No campaigns yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {client.campaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3">
                          <Link href={`/campaigns/${c.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                            {c.name}
                          </Link>
                        </td>
                        <td className="px-6 py-3">
                          <Badge className={PLATFORM_COLORS[c.platform as Platform]}>
                            {PLATFORM_LABELS[c.platform as Platform] ?? c.platform}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-gray-600">{formatCurrency(c.budget)}</td>
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
            <CardHeader><CardTitle>Alert Rules</CardTitle></CardHeader>
            <CardContent className="p-0">
              {client.alertRules.length === 0 ? (
                <p className="px-6 py-4 text-sm text-gray-500">No alert rules.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {client.alertRules.map((r) => (
                    <div key={r.id} className="px-6 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.metric.toUpperCase()} {r.operator} {r.threshold}</p>
                      </div>
                      <Badge className={r.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                        {r.enabled ? "enabled" : "disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Contact Info</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="text-gray-500">Email:</span> <span className="text-gray-900">{client.email}</span></div>
              <div><span className="text-gray-500">Company:</span> <span className="text-gray-900">{client.company}</span></div>
              {client.industry && <div><span className="text-gray-500">Industry:</span> <span className="text-gray-900">{client.industry}</span></div>}
              <div><span className="text-gray-500">Client since:</span> <span className="text-gray-900">{formatDate(client.createdAt)}</span></div>
            </CardContent>
          </Card>

          {client.onboardings.map((ob) => (
            <OnboardingProgress key={ob.id} onboarding={ob} />
          ))}
        </div>
      </div>
    </div>
  );
}
