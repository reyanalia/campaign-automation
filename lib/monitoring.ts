import { db } from "@/lib/db";
import { getGoogleAdsCampaignMetrics } from "@/lib/platforms/google-ads";
import { getMetaCampaignMetrics } from "@/lib/platforms/meta";
import { getMailchimpCampaignMetrics } from "@/lib/platforms/mailchimp";
import { sendTelegramAlert } from "@/lib/telegram";

async function getMetricValue(
  platform: string,
  metric: string,
  campaignId: string
): Promise<number> {
  if (platform === "google_ads") {
    const m = await getGoogleAdsCampaignMetrics(campaignId);
    return (m as unknown as Record<string, number>)[metric] ?? 0;
  }
  if (platform === "meta") {
    const m = await getMetaCampaignMetrics(campaignId);
    return (m as unknown as Record<string, number>)[metric] ?? 0;
  }
  if (platform === "email") {
    const m = await getMailchimpCampaignMetrics(campaignId);
    const key = metric === "ctr" ? "clickRate" : metric === "open_rate" ? "openRate" : metric;
    return (m as unknown as Record<string, number>)[key] ?? 0;
  }
  return 0;
}

function evaluateThreshold(
  actualValue: number,
  operator: string,
  threshold: number
): boolean {
  switch (operator) {
    case "lt": return actualValue < threshold;
    case "gt": return actualValue > threshold;
    case "lte": return actualValue <= threshold;
    case "gte": return actualValue >= threshold;
    default: return false;
  }
}

export async function runMonitoringCycle(): Promise<void> {
  const rules = await db.alertRule.findMany({
    where: { enabled: true },
    include: { client: { include: { campaigns: { where: { status: "active" } } } } },
  });

  for (const rule of rules) {
    const campaigns = rule.client.campaigns.filter(
      (c) => rule.platform === "all" || c.platform === rule.platform
    );

    for (const campaign of campaigns) {
      const actualValue = await getMetricValue(rule.platform, rule.metric, campaign.id);
      const breached = evaluateThreshold(actualValue, rule.operator, rule.threshold);

      if (breached) {
        const operatorLabel: Record<string, string> = {
          lt: "<", gt: ">", lte: "≤", gte: "≥",
        };
        const message =
          `*${rule.name}* breached for *${rule.client.name}*\n` +
          `Campaign: ${campaign.name}\n` +
          `${rule.metric.toUpperCase()}: ${actualValue} ${operatorLabel[rule.operator]} ${rule.threshold}`;

        await db.alertEvent.create({
          data: {
            ruleId: rule.id,
            metric: rule.metric,
            actualValue,
            threshold: rule.threshold,
            message,
          },
        });

        await sendTelegramAlert(message);
      }
    }
  }
}

let monitoringInterval: ReturnType<typeof setInterval> | null = null;

export function startMonitoring(intervalMs = 15 * 60 * 1000): void {
  if (monitoringInterval) return;
  monitoringInterval = setInterval(() => {
    runMonitoringCycle().catch(console.error);
  }, intervalMs);
}

export function stopMonitoring(): void {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
}
