import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await db.campaign.findUnique({
    where: { id },
    include: {
      client: true,
      template: true,
      qaRuns: { include: { results: true }, orderBy: { createdAt: "desc" }, take: 5 },
      executions: { include: { stepResults: true }, orderBy: { startedAt: "desc" }, take: 5 },
    },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(campaign);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const campaign = await db.campaign.update({
    where: { id },
    data: {
      ...body,
      budget: body.budget != null ? Number(body.budget) : undefined,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      variables: body.variables ? JSON.stringify(body.variables) : undefined,
    },
  });
  return NextResponse.json(campaign);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.campaign.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
