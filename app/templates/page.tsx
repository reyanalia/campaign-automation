export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_LABELS, PLATFORM_COLORS, type Platform } from "@/lib/utils";
import Link from "next/link";
import { NewTemplateButton } from "./new-template-button";
import { FileText } from "lucide-react";

export default async function TemplatesPage() {
  const templates = await db.campaignTemplate.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader
        title="Campaign Templates"
        description="Reusable campaign structures for any platform"
        action={<NewTemplateButton />}
      />

      <div className="grid grid-cols-3 gap-4">
        {templates.map((t) => {
          const tags: string[] = JSON.parse(t.tags || "[]");
          const vars: string[] = JSON.parse(t.variables || "[]");
          return (
            <Link key={t.id} href={`/templates/${t.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="py-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <Badge className={PLATFORM_COLORS[t.platform as Platform] ?? "bg-gray-100 text-gray-700"}>
                      {PLATFORM_LABELS[t.platform as Platform] ?? t.platform}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t.name}</h3>
                  {t.description && <p className="text-sm text-gray-500 mb-3">{t.description}</p>}
                  {t.category && (
                    <Badge variant="outline" className="text-xs text-gray-600 mb-3">{t.category}</Badge>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">{vars.length} variables</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {templates.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">
            No templates yet. Create your first campaign template.
          </div>
        )}
      </div>
    </div>
  );
}
