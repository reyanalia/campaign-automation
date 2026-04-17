import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  const rules = await db.alertRule.findMany({
    where: clientId ? { clientId } : {},
    include: { client: true, events: { orderBy: { firedAt: "desc" }, take: 10 } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rule = await db.alertRule.create({
    data: {
      clientId: body.clientId,
      name: body.name,
      platform: body.platform,
      metric: body.metric,
      operator: body.operator,
      threshold: Number(body.threshold),
      enabled: body.enabled ?? true,
    },
  });
  return NextResponse.json(rule, { status: 201 });
}
