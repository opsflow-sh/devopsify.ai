import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { ProgressIndicator } from "@/components/app/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Connect() {
  const navigate = useNavigate();
  const [githubUrl, setGithubUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Auth header will be added via context in production
        },
        body: JSON.stringify({ github_url: githubUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      navigate(`/app/analyzing?analysisId=${data.analysisId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell activeStep={1}>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <ProgressIndicator currentStep={1} />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Connect your app</CardTitle>
            <CardDescription>
              We'll analyze your code to see if it's safe to share
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  GitHub Repository URL
                </label>
                <Input
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>✓</span> Read-only access — we never change your code
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span> No cloud access required
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span> Takes about 30 seconds
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Connecting..." : "Analyze my app"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
