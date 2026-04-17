import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const templates = await db.campaignTemplate.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const template = await db.campaignTemplate.create({
    data: {
      name: body.name,
      description: body.description ?? null,
      platform: body.platform,
      category: body.category ?? null,
      variables: JSON.stringify(body.variables ?? []),
      content: JSON.stringify(body.content ?? {}),
      tags: JSON.stringify(body.tags ?? []),
    },
  });
  return NextResponse.json(template, { status: 201 });
}
