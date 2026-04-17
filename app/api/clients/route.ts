import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const clients = await db.client.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const client = await db.client.create({
    data: {
      name: body.name,
      email: body.email,
      company: body.company,
      industry: body.industry ?? null,
      status: body.status ?? "active",
    },
  });
  return NextResponse.json(client, { status: 201 });
}
