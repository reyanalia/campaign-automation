import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { GitBranch } from "lucide-react";

const TRIGGER_COLORS: Record<string, string> = {
  manual: "bg-gray-100 text-gray-700",
  onboarding: "bg-blue-100 text-blue-700",
  scheduled: "bg-purple-100 text-purple-700",
};

export default async function WorkflowsPage() {
  const workflows = await db.workflowTemplate.findMany({
    include: { steps: { orderBy: { order: "asc" } }, _count: { select: { executions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Workflows" description="Multi-platform automation sequences" />

      <div className="grid grid-cols-2 gap-4">
        {workflows.map((w) => (
          <Link key={w.id} href={`/workflows/${w.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="py-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <GitBranch className="w-5 h-5 text-purple-600" />
                  </div>
                  <Badge className={TRIGGER_COLORS[w.trigger] ?? "bg-gray-100 text-gray-700"}>
                    {w.trigger}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{w.name}</h3>
                {w.description && <p className="text-sm text-gray-500 mb-3">{w.description}</p>}
                <div className="flex gap-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
                  <span>{w.steps.length} steps</span>
                  <span>{w._count.executions} runs</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {workflows.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400">No workflows yet.</div>
        )}
      </div>
    </div>
  );
}
