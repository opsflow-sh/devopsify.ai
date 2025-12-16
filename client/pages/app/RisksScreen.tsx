import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { ProgressIndicator } from "@/components/app/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LaunchVerdict, RiskScenario } from "@shared/types";

const severityColors = {
  high: "border-l-red-500",
  medium: "border-l-yellow-500",
  low: "border-l-green-500",
};

export default function RisksScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get("analysisId");

  const [risks, setRisks] = useState<RiskScenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!analysisId) {
      navigate("/app/connect");
      return;
    }

    fetch(`/api/analyze/${analysisId}`)
      .then((res) => res.json())
      .then((data) => {
        setRisks(data.verdict?.risks || []);
        setLoading(false);
      })
      .catch(() => navigate("/app/connect"));
  }, [analysisId, navigate]);

  if (loading) {
    return (
      <AppShell activeStep={4}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeStep={4}>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <ProgressIndicator currentStep={4} />

        <div className="mt-12">
          <h1 className="text-2xl font-semibold text-center mb-2">
            What could go wrong?
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            These are things to keep an eye on as you grow
          </p>

          {risks.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <div className="text-4xl mb-4">✨</div>
                <p className="text-lg">Looking good! No major risks detected.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {risks.slice(0, 3).map((risk, index) => (
                <Card
                  key={index}
                  className={`border-l-4 ${severityColors[risk.severity]}`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{risk.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">
                      {risk.plain_explanation}
                    </p>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">
                        <span className="font-medium">What you'll notice: </span>
                        {risk.user_symptom}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Reassurance */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              💡 None of these are urgent right now. We'll let you know if anything changes.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Button
              size="lg"
              onClick={() => navigate(`/app/report/platform?analysisId=${analysisId}`)}
            >
              Am I in the right place? →
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
