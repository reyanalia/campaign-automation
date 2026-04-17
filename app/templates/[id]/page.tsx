import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_LABELS, PLATFORM_COLORS, formatDate, type Platform } from "@/lib/utils";

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = await db.campaignTemplate.findUnique({ where: { id }, include: { campaigns: { include: { client: true }, take: 5 } } });
  if (!template) notFound();

  const vars: string[] = JSON.parse(template.variables || "[]");
  const tags: string[] = JSON.parse(template.tags || "[]");
  const content = JSON.parse(template.content || "{}");

  return (
    <div>
      <PageHeader
        title={template.name}
        description={template.description ?? undefined}
        action={
          <Badge className={PLATFORM_COLORS[template.platform as Platform] ?? "bg-gray-100 text-gray-700"}>
            {PLATFORM_LABELS[template.platform as Platform] ?? template.platform}
          </Badge>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Template Content</CardTitle></CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-50 rounded-lg p-4 overflow-auto text-gray-700">
                {JSON.stringify(content, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Used In Campaigns ({template.campaigns.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              {template.campaigns.length === 0 ? (
                <p className="px-6 py-4 text-sm text-gray-500">Not used in any campaigns yet.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {template.campaigns.map((c) => (
                    <div key={c.id} className="px-6 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.client.company}</p>
                      </div>
                      <Badge className="bg-gray-100 text-gray-600">{c.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Variables</CardTitle></CardHeader>
            <CardContent>
              {vars.length === 0 ? (
                <p className="text-sm text-gray-400">No variables defined.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {vars.map((v) => (
                    <code key={v} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {`{{${v}}}`}
                    </code>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div><span className="text-gray-500">Category:</span> <span>{template.category ?? "—"}</span></div>
              <div><span className="text-gray-500">Created:</span> <span>{formatDate(template.createdAt)}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
