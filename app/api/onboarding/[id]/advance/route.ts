import { NextRequest, NextResponse } from "next/server";
import { advanceOnboarding, completeManualStep } from "@/lib/onboarding-engine";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body.stepId) {
    await completeManualStep(id, body.stepId);
  } else {
    await advanceOnboarding(id);
  }
  return NextResponse.json({ ok: true });
}
