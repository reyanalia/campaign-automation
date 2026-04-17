import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const workflows = await db.workflowTemplate.findMany({
    include: { steps: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(workflows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const workflow = await db.workflowTemplate.create({
    data: {
      name: body.name,
      description: body.description ?? null,
      trigger: body.trigger ?? "manual",
      steps: body.steps
        ? {
            create: body.steps.map(
              (s: { title: string; stepType: string; platform?: string; config?: object; order?: number }, i: number) => ({
                title: s.title,
                stepType: s.stepType,
                platform: s.platform ?? null,
                config: JSON.stringify(s.config ?? {}),
                order: s.order ?? i,
              })
            ),
          }
        : undefined,
    },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(workflow, { status: 201 });
}
