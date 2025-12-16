import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { LaunchVerdict } from "@shared/types";

export default function WatchDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get("analysisId");

  const [verdict, setVerdict] = useState<LaunchVerdict | null>(null);
  const [lastChecked, setLastChecked] = useState<string>("");
  const [isRechecking, setIsRechecking] = useState(false);
  const [isPaid, setIsPaid] = useState(false); // TODO: Get from subscription status
  const [watchOpen, setWatchOpen] = useState(false);

  useEffect(() => {
    if (!analysisId) return;

    fetch(`/api/analyze/${analysisId}`)
      .then((res) => res.json())
      .then((data) => {
        setVerdict(data.verdict);
        // Format last checked time
        if (data.analysis?.updated_at) {
          const date = new Date(data.analysis.updated_at);
          const now = new Date();
          const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
          setLastChecked(diffHours < 1 ? "Just now" : `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`);
        }
      });
  }, [analysisId]);

  const handleRecheck = async () => {
    if (!analysisId) return;
    setIsRechecking(true);

    try {
      const response = await fetch(`/api/analyze/${analysisId}/recheck`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.verdict) {
        setVerdict(data.verdict);
        setLastChecked("Just now");
      }
    } catch (error) {
      console.error("Recheck failed:", error);
    } finally {
      setIsRechecking(false);
    }
  };

  const statusConfig = verdict ? {
    safe: { emoji: "🟢", label: "All good right now", color: "text-green-600" },
    watch: { emoji: "🟡", label: "Some changes to watch", color: "text-yellow-600" },
    fix: { emoji: "🔴", label: "Action needed", color: "text-red-600" },
  }[verdict.status] : { emoji: "⏳", label: "Loading...", color: "text-muted-foreground" };

  return (
    <AppShell showNav>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-8">Your App Health</h1>

        {/* Status Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{statusConfig.emoji}</span>
                <div>
                  <h2 className={`text-xl font-semibold ${statusConfig.color}`}>
                    {statusConfig.label}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Last checked: {lastChecked || "Never"}
                  </p>
                </div>
              </div>
              {verdict && (
                <div className="text-right">
                  <div className="text-3xl font-bold">{verdict.confidence_score}</div>
                  <div className="text-sm text-muted-foreground">Confidence</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* What We're Watching */}
        <Collapsible open={watchOpen} onOpenChange={setWatchOpen}>
          <Card className="mb-6">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">What we're watching</CardTitle>
                  <CardDescription>Areas we monitor for changes</CardDescription>
                </div>
                <span className="text-muted-foreground">{watchOpen ? "−" : "+"}</span>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span>Usage patterns</span>
                  <span className="text-green-500">Normal</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span>Cost indicators</span>
                  <span className="text-green-500">Stable</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span>Risk factors</span>
                  <span className="text-green-500">{verdict?.risks.length || 0} active</span>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleRecheck}
            disabled={isRechecking || !analysisId}
            className="w-full"
          >
            {isRechecking ? "Checking..." : "Run a re-check now"}
          </Button>

          {!isPaid && (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <h3 className="font-medium mb-2">Want automatic monitoring?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Enable Watch Mode and we'll check your app automatically and alert you to changes.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/upgrade?analysisId=${analysisId}`)}
                >
                  Enable Watch Mode
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
