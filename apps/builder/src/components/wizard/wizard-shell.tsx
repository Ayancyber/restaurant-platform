"use client";

import Link from "next/link";
import { useWizardStore, TOTAL_STEPS } from "@/lib/store/wizard-store";
import { STEPS } from "@/lib/store/steps";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Sparkles, Home } from "lucide-react";

export function WizardShell({ children }: { children: React.ReactNode }) {
  const { currentStep, nextStep, prevStep, setStep } = useWizardStore();

  const progress = (currentStep / TOTAL_STEPS) * 100;
  const currentStepDef = STEPS[currentStep - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Top bar */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold">Restaurant Builder</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </Button>

            <span className="text-xs sm:text-sm text-muted-foreground">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-1">
              {STEPS.map((step) => {
                const isActive = step.number === currentStep;
                const isCompleted = step.number < currentStep;
                const Icon = step.icon;

                return (
                  <button
                    key={step.key}
                    onClick={() => setStep(step.number)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                          ? "text-foreground hover:bg-muted"
                          : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-medium",
                        isActive
                          ? "bg-primary-foreground text-primary"
                          : isCompleted
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.number}
                    </div>
                    <span className="truncate">{step.shortTitle}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0">
            {/* Step header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {currentStepDef && <currentStepDef.icon className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Step {currentStep} of {TOTAL_STEPS}
                  </p>
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold">
                    {currentStepDef?.title}
                  </h1>
                </div>
              </div>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {currentStepDef?.description}
              </p>
            </div>

            {/* Step content */}
            <div className="mb-10">{children}</div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {currentStep} / {TOTAL_STEPS}
                </span>
                {currentStep < TOTAL_STEPS ? (
                  <Button onClick={nextStep} className="gap-2">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button disabled className="gap-2">
                    <Check className="h-4 w-4" />
                    Finish
                  </Button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
