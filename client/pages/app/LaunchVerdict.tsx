import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { ProgressIndicator } from "@/components/app/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { LaunchVerdict } from "@shared/types";

const statusConfig = {
  safe: { emoji: "🟢", label: "Safe to share", color: "text-green-600" },
  watch: { emoji: "🟡", label: "Mostly safe", color: "text-yellow-600" },
  fix: { emoji: "🔴", label: "Not yet", color: "text-red-600" },
};

export default function LaunchVerdictScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get("analysisId");

  const [verdict, setVerdict] = useState<LaunchVerdict | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!analysisId) {
      navigate("/app/connect");
      return;
    }

    fetch(`/api/analyze/${analysisId}`)
      .then((res) => res.json())
      .then((data) => {
        setVerdict(data.verdict);
        setLoading(false);
      })
      .catch(() => {
        navigate("/app/connect");
      });
  }, [analysisId, navigate]);

  if (loading || !verdict) {
    return (
      <AppShell activeStep={3}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </AppShell>
    );
  }

  const status = statusConfig[verdict.status];

  return (
    <AppShell activeStep={3}>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <ProgressIndicator currentStep={3} />

        <div className="mt-12 text-center">
          <h1 className="text-2xl font-semibold mb-2">Is your app safe to share?</h1>

          <Card className="mt-8">
            <CardContent className="pt-8 pb-8">
              {/* Status Badge */}
              <div className={`text-6xl mb-4`}>{status.emoji}</div>
              <h2 className={`text-3xl font-bold ${status.color}`}>
                {status.label}
              </h2>

              {/* Confidence Score */}
              <div className="mt-8 mb-8">
                <div className="text-5xl font-bold">
                  {verdict.confidence_score}
                  <span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Launch Confidence
                </p>

                {/* Visual Bar */}
                <div className="w-full bg-muted rounded-full h-3 mt-4 max-w-xs mx-auto">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      verdict.confidence_score >= 80 ? "bg-green-500" :
                      verdict.confidence_score >= 50 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${verdict.confidence_score}%` }}
                  />
                </div>
              </div>

              {/* One-line Summary */}
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                {verdict.one_line_summary}
              </p>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="mt-8"
            onClick={() => navigate(`/app/report/risks?analysisId=${analysisId}`)}
          >
            See what to watch for →
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
