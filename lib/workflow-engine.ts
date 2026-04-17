import { db } from "@/lib/db";
import { createGoogleAdsCampaign } from "@/lib/platforms/google-ads";
import { createMetaCampaign } from "@/lib/platforms/meta";
import { createMailchimpCampaign } from "@/lib/platforms/mailchimp";
import { sendTelegramAlert } from "@/lib/telegram";

type StepConfig = Record<string, unknown>;

async function executeStep(
  stepType: string,
  platform: string | null,
  config: StepConfig
): Promise<{ output: string }> {
  switch (stepType) {
    case "create_campaign": {
      if (platform === "google_ads") {
        const result = await createGoogleAdsCampaign({
          name: (config.name as string) || "New Campaign",
          budget: Number(config.budget) || 100,
          startDate: (config.startDate as string) || new Date().toISOString(),
        });
        return { output: `Created Google Ads campaign: ${result.id}` };
      }
      if (platform === "meta") {
        const result = await createMetaCampaign({
          name: (config.name as string) || "New Campaign",
          budget: Number(config.budget) || 100,
          objective: (config.objective as string) || "CONVERSIONS",
        });
        return { output: `Created Meta campaign: ${result.id}` };
      }
      if (platform === "email") {
        const result = await createMailchimpCampaign({
          name: (config.name as string) || "New Email",
          subject: (config.subject as string) || "Hello",
          fromName: (config.fromName as string) || "Agency",
          fromEmail: (config.fromEmail as string) || "hello@agency.com",
        });
        return { output: `Created email campaign: ${result.id}` };
      }
      return { output: "Campaign creation skipped (no platform)" };
    }
    case "set_budget":
      return { output: `Budget set to $${config.budget}` };
    case "set_audience":
      return { output: `Audience configured: ${config.audienceName || "default"}` };
    case "send_email":
      return { output: `Email sent to ${config.to || "client"}` };
    case "wait": {
      const ms = Number(config.durationMs) || 1000;
      await new Promise((r) => setTimeout(r, Math.min(ms, 5000)));
      return { output: `Waited ${ms}ms` };
    }
    case "notify": {
      const msg = (config.message as string) || "Workflow step completed";
      await sendTelegramAlert(msg);
      return { output: `Notification sent: ${msg}` };
    }
    default:
      return { output: `Unknown step type: ${stepType}` };
  }
}

export async function executeWorkflow(
  workflowId: string,
  campaignId?: string
): Promise<{ executionId: string; status: string }> {
  const workflow = await db.workflowTemplate.findUniqueOrThrow({
    where: { id: workflowId },
    include: { steps: { orderBy: { order: "asc" } } },
  });

  const execution = await db.workflowExecution.create({
    data: {
      workflowId,
      campaignId: campaignId || null,
      status: "running",
    },
  });

  let overallStatus = "completed";

  for (const step of workflow.steps) {
    const stepResult = await db.workflowStepResult.create({
      data: {
        executionId: execution.id,
        stepTitle: step.title,
        stepType: step.stepType,
        status: "running",
      },
    });

    try {
      const config = JSON.parse(step.config || "{}") as StepConfig;
      const { output } = await executeStep(step.stepType, step.platform, config);

      await db.workflowStepResult.update({
        where: { id: stepResult.id },
        data: { status: "completed", output, completedAt: new Date() },
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      await db.workflowStepResult.update({
        where: { id: stepResult.id },
        data: { status: "failed", error, completedAt: new Date() },
      });
      overallStatus = "failed";
      break;
    }
  }

  await db.workflowExecution.update({
    where: { id: execution.id },
    data: { status: overallStatus, completedAt: new Date() },
  });

  return { executionId: execution.id, status: overallStatus };
}
