import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { ProgressIndicator } from "@/components/app/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlatformRecommendation } from "@shared/types";

export default function PlatformFit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get("analysisId");

  const [platform, setPlatform] = useState<PlatformRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!analysisId) {
      navigate("/app/connect");
      return;
    }

    fetch(`/api/analyze/${analysisId}`)
      .then((res) => res.json())
      .then((data) => {
        setPlatform(data.verdict?.platform_recommendation || null);
        setLoading(false);
      })
      .catch(() => navigate("/app/connect"));
  }, [analysisId, navigate]);

  if (loading || !platform) {
    return (
      <AppShell activeStep={5}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeStep={5}>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <ProgressIndicator currentStep={5} />

        <div className="mt-12">
          <h1 className="text-2xl font-semibold text-center mb-2">
            Is this the right setup for you?
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Based on how your app works right now
          </p>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  {platform.recommended_badge}
                </span>
              </div>
              <CardTitle className="text-2xl">{platform.platform_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Why Bullets */}
              <div>
                <h3 className="font-medium mb-2">Why this works for you:</h3>
                <ul className="space-y-2">
                  {platform.why_bullets.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-muted-foreground">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* When it Changes */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-medium mb-1">When this might change:</h3>
                <p className="text-sm text-muted-foreground">
                  {platform.when_it_changes}
                </p>
              </div>

              {/* Confidence Note */}
              <p className="text-sm text-muted-foreground italic">
                💡 {platform.confidence_note}
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Button
              size="lg"
              onClick={() => navigate(`/app/report/next?analysisId=${analysisId}`)}
            >
              What should I do next? →
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
