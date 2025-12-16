import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { ProgressIndicator } from "@/components/app/ProgressIndicator";

const steps = [
  "Understanding how your app works",
  "Checking what could go wrong",
  "Making sure you're in the right place",
];

export default function Analyzing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get("analysisId");

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");

  // Animate through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Poll for completion
  useEffect(() => {
    if (!analysisId) {
      navigate("/app/connect");
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/analyze/${analysisId}`);
        const data = await response.json();

        if (data.status === "completed") {
          clearInterval(pollInterval);
          navigate(`/app/report/launch?analysisId=${analysisId}`);
        } else if (data.status === "failed") {
          clearInterval(pollInterval);
          setError("Analysis failed. Please try again.");
        }
      } catch (err) {
        // Keep polling on network errors
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [analysisId, navigate]);

  return (
    <AppShell activeStep={2}>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <ProgressIndicator currentStep={2} />

        <div className="mt-12 text-center">
          <h1 className="text-2xl font-semibold mb-8">Quick check in progress</h1>

          <div className="space-y-4 mb-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  index === currentStep
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    index === currentStep
                      ? "bg-primary text-primary-foreground animate-pulse"
                      : "bg-muted"
                  }`}
                >
                  {index + 1}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>

          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <p className="text-muted-foreground">
              This usually takes about 30 seconds. We're checking everything to make sure you're ready.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
