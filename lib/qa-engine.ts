import { db } from "@/lib/db";

export type AutoCheckKey =
  | "url_reachable"
  | "budget_positive"
  | "audience_size"
  | "utm_params";

interface AutoCheckResult {
  status: "pass" | "fail" | "warning";
  message: string;
}

async function runAutoCheck(
  key: AutoCheckKey,
  campaignVariables: Record<string, unknown>
): Promise<AutoCheckResult> {
  switch (key) {
    case "url_reachable": {
      const url = campaignVariables.landing_url as string;
      if (!url) return { status: "warning", message: "No landing URL specified" };
      try {
        const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
        if (res.ok) return { status: "pass", message: `URL reachable (${res.status})` };
        return { status: "fail", message: `URL returned ${res.status}` };
      } catch {
        return { status: "fail", message: "URL unreachable" };
      }
    }
    case "budget_positive": {
      const budget = Number(campaignVariables.budget ?? 0);
      if (budget > 0) return { status: "pass", message: `Budget set to $${budget}` };
      return { status: "fail", message: "Budget must be greater than $0" };
    }
    case "audience_size": {
      const size = Number(campaignVariables.audience_size ?? 0);
      if (size >= 1000) return { status: "pass", message: `Audience size: ${size.toLocaleString()}` };
      if (size > 0) return { status: "warning", message: `Audience small: ${size} (recommend 1000+)` };
      return { status: "warning", message: "Audience size not specified" };
    }
    case "utm_params": {
      const url = campaignVariables.landing_url as string;
      if (!url) return { status: "warning", message: "No URL to check UTM params" };
      if (url.includes("utm_source") && url.includes("utm_medium")) {
        return { status: "pass", message: "UTM params present" };
      }
      return { status: "warning", message: "UTM tracking params missing from URL" };
    }
    default:
      return { status: "warning", message: "Unknown check" };
  }
}

export async function runQAChecklist(
  campaignId: string,
  templateId: string
): Promise<{ runId: string; status: string }> {
  const campaign = await db.campaign.findUniqueOrThrow({
    where: { id: campaignId },
  });

  const template = await db.qAChecklistTemplate.findUniqueOrThrow({
    where: { id: templateId },
    include: { items: { orderBy: { order: "asc" } } },
  });

  const run = await db.qARun.create({
    data: { campaignId, templateId, status: "running" },
  });

  const variables = JSON.parse(campaign.variables || "{}") as Record<string, unknown>;
  if (campaign.budget) variables.budget = campaign.budget;

  let overallPassed = true;

  for (const item of template.items) {
    let result: AutoCheckResult;

    if (item.checkType === "auto" && item.autoCheckKey) {
      result = await runAutoCheck(item.autoCheckKey as AutoCheckKey, variables);
    } else {
      result = { status: "pending" as "pass", message: "Awaiting manual review" };
    }

    if (result.status === "fail") overallPassed = false;

    await db.qARunResult.create({
      data: {
        runId: run.id,
        itemTitle: item.title,
        checkType: item.checkType,
        status: result.status,
        message: result.message,
      },
    });
  }

  const finalStatus = overallPassed ? "passed" : "failed";
  await db.qARun.update({
    where: { id: run.id },
    data: { status: finalStatus, completedAt: new Date() },
  });

  return { runId: run.id, status: finalStatus };
}
