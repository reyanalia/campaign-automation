export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, PLATFORM_LABELS, PLATFORM_COLORS, formatCurrency, formatDate, type Platform } from "@/lib/utils";
import Link from "next/link";
import { NewCampaignButton } from "./new-campaign-button";

export default async function CampaignsPage() {
  const [campaigns, clients, templates] = await Promise.all([
    db.campaign.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true, template: true, qaRuns: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    db.client.findMany({ select: { id: true, name: true, company: true } }),
    db.campaignTemplate.findMany({ select: { id: true, name: true, platform: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="All campaigns across clients and platforms"
        action={<NewCampaignButton clients={clients} templates={templates} />}
      />

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.map((c) => {
                const lastQA = c.qaRuns[0];
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/campaigns/${c.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {c.name}
                      </Link>
                      <p className="text-xs text-gray-400">{c.client.company}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={PLATFORM_COLORS[c.platform as Platform] ?? "bg-gray-100 text-gray-700"}>
                        {PLATFORM_LABELS[c.platform as Platform] ?? c.platform}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatCurrency(c.budget)}</td>
                    <td className="px-6 py-4">
                      <Badge className={STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-700"}>{c.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {lastQA ? (
                        <Badge className={STATUS_COLORS[lastQA.status] ?? "bg-gray-100 text-gray-700"}>
                          {lastQA.status}
                        </Badge>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(c.startDate)}</td>
                  </tr>
                );
              })}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No campaigns yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
