export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "@/lib/utils";
import Link from "next/link";
import { NewClientButton } from "./new-client-button";

export default async function ClientsPage() {
  const clients = await db.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { campaigns: true, onboardings: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Manage agency clients and their onboarding"
        action={<NewClientButton />}
      />

      <div className="grid grid-cols-3 gap-4">
        {clients.map((client) => (
          <Link key={client.id} href={`/clients/${client.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="py-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <Badge className={STATUS_COLORS[client.status] ?? "bg-gray-100 text-gray-700"}>
                    {client.status}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900">{client.name}</h3>
                <p className="text-sm text-gray-500">{client.company}</p>
                {client.industry && <p className="text-xs text-gray-400 mt-0.5">{client.industry}</p>}
                <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                  <span>{client._count.campaigns} campaigns</span>
                  <span>{client._count.onboardings} onboardings</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {clients.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">
            No clients yet. Add your first client to get started.
          </div>
        )}
      </div>
    </div>
  );
}
