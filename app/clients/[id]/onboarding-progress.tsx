"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Clock, AlertCircle } from "lucide-react";

type Step = { id: string; title: string; description: string | null; stepType: string; order: number };
type Sequence = { name: string; steps: Step[] };
type Onboarding = {
  id: string;
  status: string;
  currentStep: number;
  progress: string;
  sequence: Sequence;
};

const STATUS_ICONS = {
  completed: CheckCircle,
  in_progress: Clock,
  blocked: AlertCircle,
  default: Circle,
};

export function OnboardingProgress({ onboarding }: { onboarding: Onboarding }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const progress = JSON.parse(onboarding.progress || "{}") as Record<string, string>;

  async function completeStep(stepId: string) {
    setLoading(stepId);
    await fetch(`/api/onboarding/${onboarding.id}/advance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{onboarding.sequence.name}</CardTitle>
          <Badge
            className={
              onboarding.status === "completed"
                ? "bg-green-100 text-green-700"
                : onboarding.status === "blocked"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }
          >
            {onboarding.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-50">
          {onboarding.sequence.steps.map((step) => {
            const stepStatus = progress[step.id] ?? "not_started";
            const Icon =
              stepStatus === "completed"
                ? STATUS_ICONS.completed
                : stepStatus === "in_progress"
                ? STATUS_ICONS.in_progress
                : stepStatus === "blocked"
                ? STATUS_ICONS.blocked
                : STATUS_ICONS.default;

            return (
              <div key={step.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <Icon
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      stepStatus === "completed"
                        ? "text-green-500"
                        : stepStatus === "in_progress"
                        ? "text-blue-500"
                        : stepStatus === "blocked"
                        ? "text-red-500"
                        : "text-gray-300"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{step.title}</p>
                    {step.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                    )}
                  </div>
                  {stepStatus === "in_progress" && step.stepType === "manual" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeStep(step.id)}
                      disabled={loading === step.id}
                    >
                      {loading === step.id ? "..." : "Done"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
