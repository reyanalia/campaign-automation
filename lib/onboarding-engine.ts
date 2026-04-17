import { db } from "@/lib/db";
import { executeWorkflow } from "@/lib/workflow-engine";

export async function advanceOnboarding(clientOnboardingId: string): Promise<void> {
  const onboarding = await db.clientOnboarding.findUniqueOrThrow({
    where: { id: clientOnboardingId },
    include: {
      sequence: { include: { steps: { orderBy: { order: "asc" } } } },
    },
  });

  if (onboarding.status === "completed") return;

  const steps = onboarding.sequence.steps;
  const progress = JSON.parse(onboarding.progress || "{}") as Record<string, string>;
  let nextStep = onboarding.currentStep;

  for (let i = onboarding.currentStep; i < steps.length; i++) {
    const step = steps[i];
    if (progress[step.id] === "completed") {
      nextStep = i + 1;
      continue;
    }

    if (step.stepType === "automated" && step.workflowId) {
      try {
        await executeWorkflow(step.workflowId);
        progress[step.id] = "completed";
        nextStep = i + 1;
      } catch {
        progress[step.id] = "blocked";
        await db.clientOnboarding.update({
          where: { id: clientOnboardingId },
          data: { progress: JSON.stringify(progress), status: "blocked", currentStep: i },
        });
        return;
      }
    } else {
      // Manual step — mark in_progress and stop
      if (!progress[step.id]) progress[step.id] = "in_progress";
      await db.clientOnboarding.update({
        where: { id: clientOnboardingId },
        data: { progress: JSON.stringify(progress), currentStep: i },
      });
      return;
    }
  }

  const allDone = nextStep >= steps.length;
  await db.clientOnboarding.update({
    where: { id: clientOnboardingId },
    data: {
      progress: JSON.stringify(progress),
      currentStep: nextStep,
      status: allDone ? "completed" : "in_progress",
      completedAt: allDone ? new Date() : null,
    },
  });
}

export async function completeManualStep(
  clientOnboardingId: string,
  stepId: string
): Promise<void> {
  const onboarding = await db.clientOnboarding.findUniqueOrThrow({
    where: { id: clientOnboardingId },
  });
  const progress = JSON.parse(onboarding.progress || "{}") as Record<string, string>;
  progress[stepId] = "completed";
  await db.clientOnboarding.update({
    where: { id: clientOnboardingId },
    data: { progress: JSON.stringify(progress) },
  });
  await advanceOnboarding(clientOnboardingId);
}
