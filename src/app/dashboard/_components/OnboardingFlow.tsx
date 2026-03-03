"use client";

import { useState } from "react";
import { Check, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type StepStatus = "complete" | "current" | "upcoming";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
}

const STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: "Create your account",
    description: "Set up your profile and secure your access.",
  },
  {
    id: 2,
    title: "Connect a data source",
    description: "Link your CRM, database, or analytics platform.",
  },
  {
    id: 3,
    title: "Invite your team",
    description: "Bring your teammates on board to collaborate.",
  },
  {
    id: 4,
    title: "Launch your first report",
    description: "Publish insights and share them with stakeholders.",
  },
];

function getStepStatus(stepId: number, currentStep: number): StepStatus {
  if (stepId < currentStep) return "complete";
  if (stepId === currentStep) return "current";
  return "upcoming";
}

interface StepIndicatorProps {
  status: StepStatus;
  stepNumber: number;
}

function StepIndicator({ status, stepNumber }: StepIndicatorProps) {
  if (status === "complete") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="h-4 w-4" aria-hidden="true" />
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
        <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-background">
      <Circle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    </span>
  );
}

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const progressPercent = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);
  const isFirst = currentStep === 1;
  const isLast = currentStep === STEPS.length;
  const isComplete = currentStep > STEPS.length;

  if (isComplete) {
    return (
      <section aria-label="Onboarding complete">
        <Card className="border-primary/30 bg-primary/5 dark:bg-primary/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-4 w-4" />
              </span>
              <CardTitle className="text-lg">Onboarding Complete 🎉</CardTitle>
            </div>
            <CardDescription>
              You&apos;re all set. Explore your dashboard to get the most out of the platform.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <section aria-label="Onboarding flow">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Get Started</CardTitle>
          <CardDescription>
            Complete these steps to unlock the full power of your dashboard.
          </CardDescription>

          {/* Progress bar */}
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep} of {STEPS.length}</span>
              <span>{progressPercent}% complete</span>
            </div>
            <Progress value={progressPercent} className="h-2" aria-label="Onboarding progress" />
          </div>
        </CardHeader>

        <CardContent>
          <ol className="space-y-4" aria-label="Onboarding steps">
            {STEPS.map((step) => {
              const status = getStepStatus(step.id, currentStep);
              return (
                <li
                  key={step.id}
                  className={cn(
                    "flex items-start gap-4 rounded-lg p-3 transition-colors",
                    status === "current" && "bg-muted/50 dark:bg-muted/20",
                    status === "complete" && "opacity-60",
                  )}
                  aria-current={status === "current" ? "step" : undefined}
                >
                  <StepIndicator status={status} stepNumber={step.id} />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium leading-tight",
                        status === "upcoming" && "text-muted-foreground",
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>

        <CardFooter className="flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isFirst}
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
          >
            Back
          </Button>
          <Button
            size="sm"
            onClick={() => setCurrentStep((s) => s + 1)}
          >
            {isLast ? "Complete Setup" : "Next Step"}
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
