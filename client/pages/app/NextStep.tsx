import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { ProgressIndicator } from "@/components/app/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NextBestStepRecommendation } from "@shared/types";

const modeConfig = {
  do_nothing: { emoji: "🎉", color: "bg-green-50 border-green-200" },
  watch_one_thing: { emoji: "👀", color: "bg-yellow-50 border-yellow-200" },
  small_upgrade: { emoji: "🔧", color: "bg-blue-50 border-blue-200" },
};

export default function NextStep() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get("analysisId");

  const [nextStep, setNextStep] = useState<NextBestStepRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!analysisId) {
      navigate("/app/connect");
      return;
    }

    fetch(`/api/analyze/${analysisId}`)
      .then((res) => res.json())
      .then((data) => {
        setNextStep(data.verdict?.next_best_step || null);
        setLoading(false);
      })
      .catch(() => navigate("/app/connect"));
  }, [analysisId, navigate]);

  if (loading || !nextStep) {
    return (
      <AppShell activeStep={6}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppShell>
    );
  }

  const config = modeConfig[nextStep.mode];

  return (
    <AppShell activeStep={6}>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <ProgressIndicator currentStep={6} />

        <div className="mt-12">
          <h1 className="text-2xl font-semibold text-center mb-8">
            What should you do next?
          </h1>

          <Card className={`border-2 ${config.color}`}>
            <CardHeader className="text-center">
              <div className="text-5xl mb-4">{config.emoji}</div>
              <CardTitle className="text-2xl">{nextStep.headline}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-muted-foreground mb-6">
                {nextStep.explanation}
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    if (nextStep.upgrade_required) {
                      navigate(`/upgrade?analysisId=${analysisId}`);
                    } else {
                      navigate(`/app/watch?analysisId=${analysisId}`);
                    }
                  }}
                >
                  {nextStep.cta_text}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate(`/app/watch?analysisId=${analysisId}`)}
                >
                  Maybe later
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary Box */}
          <div className="mt-8 bg-muted/50 rounded-lg p-6 text-center">
            <h3 className="font-medium mb-2">Your analysis is saved</h3>
            <p className="text-sm text-muted-foreground">
              You can come back anytime to check on your app's health.
              {!nextStep.upgrade_required && " We'll keep watching and let you know if anything changes."}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
