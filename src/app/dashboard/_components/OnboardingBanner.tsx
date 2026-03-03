"use client";

/**
 * OnboardingBanner — dismissable welcome banner for new users.
 * Shown once; dismissed state is persisted in localStorage.
 */
import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "onboarding_banner_dismissed";

export function OnboardingBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem(DISMISSED_KEY);
  });

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative flex items-start gap-4 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 dark:bg-primary/10"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">
          Welcome to your dashboard! 🎉
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Get started by completing the onboarding steps below, exploring your
          metrics, or heading to{" "}
          <a
            href="/dashboard/settings"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Settings
          </a>{" "}
          to update your profile.
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={handleDismiss}
        aria-label="Dismiss welcome banner"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
