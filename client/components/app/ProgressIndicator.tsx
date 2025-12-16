import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type FTUEStep = 1 | 2 | 3 | 4 | 5 | 6;

interface ProgressIndicatorProps {
  currentStep: FTUEStep;
  labels?: string[];
}

const DEFAULT_LABELS = [
  "Connect",
  "Analyzing",
  "Verdict",
  "Risks",
  "Platform",
  "Next Steps"
];

/**
 * ProgressIndicator - Shows FTUE progress through 6 steps
 *
 * Visual progression indicator with:
 * - Numbered circles for each step
 * - Lines connecting steps
 * - Current step highlighted
 * - Completed steps show checkmark
 * - Future steps shown in muted state
 *
 * @example
 * <ProgressIndicator currentStep={3} />
 * <ProgressIndicator currentStep={1} labels={["Custom", "Labels", ...]} />
 */
export function ProgressIndicator({
  currentStep,
  labels = DEFAULT_LABELS
}: ProgressIndicatorProps) {
  const steps = [1, 2, 3, 4, 5, 6] as const;

  return (
    <div className="w-full py-6">
      {/* Desktop: Horizontal layout */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            const isUpcoming = step > currentStep;

            return (
              <React.Fragment key={step}>
                {/* Step Circle */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all",
                      {
                        // Completed step
                        "border-primary bg-primary text-primary-foreground": isCompleted,
                        // Current step
                        "border-primary bg-background text-primary ring-4 ring-primary/20": isCurrent,
                        // Upcoming step
                        "border-border bg-muted text-muted-foreground": isUpcoming,
                      }
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium text-center max-w-[80px]",
                      {
                        "text-foreground": isCurrent,
                        "text-muted-foreground": !isCurrent,
                      }
                    )}
                  >
                    {labels[index]}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 transition-all",
                      {
                        "bg-primary": step < currentStep,
                        "bg-border": step >= currentStep,
                      }
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile: Compact horizontal layout */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4">
          {steps.map((step, index) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            const isUpcoming = step > currentStep;

            return (
              <React.Fragment key={step}>
                {/* Step Circle - smaller on mobile */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 font-semibold text-xs transition-all",
                      {
                        "border-primary bg-primary text-primary-foreground": isCompleted,
                        "border-primary bg-background text-primary ring-2 ring-primary/20": isCurrent,
                        "border-border bg-muted text-muted-foreground": isUpcoming,
                      }
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step
                    )}
                  </div>
                  {/* Only show label for current step on mobile */}
                  {isCurrent && (
                    <span className="text-xs font-medium text-foreground text-center whitespace-nowrap">
                      {labels[index]}
                    </span>
                  )}
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-1 transition-all",
                      {
                        "bg-primary": step < currentStep,
                        "bg-border": step >= currentStep,
                      }
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
