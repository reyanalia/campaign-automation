import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runQAChecklist } from "@/lib/qa-engine";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const runs = await db.qARun.findMany({
    where: { campaignId: id },
    include: { results: true, template: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(runs);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { templateId } = body;
  if (!templateId) return NextResponse.json({ error: "templateId required" }, { status: 400 });
  const result = await runQAChecklist(id, templateId);
  return NextResponse.json(result, { status: 201 });
}
