import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  const campaigns = await db.campaign.findMany({
    where: clientId ? { clientId } : {},
    include: { client: true, template: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const campaign = await db.campaign.create({
    data: {
      name: body.name,
      platform: body.platform,
      status: body.status ?? "draft",
      budget: body.budget ? Number(body.budget) : null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      variables: JSON.stringify(body.variables ?? {}),
      clientId: body.clientId,
      templateId: body.templateId ?? null,
    },
    include: { client: true, template: true },
  });
  return NextResponse.json(campaign, { status: 201 });
}
