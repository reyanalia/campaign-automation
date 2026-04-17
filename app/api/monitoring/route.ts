import { NextResponse } from "next/server";
import { runMonitoringCycle } from "@/lib/monitoring";

export async function POST() {
  await runMonitoringCycle();
  return NextResponse.json({ ok: true, ran: new Date().toISOString() });
}
