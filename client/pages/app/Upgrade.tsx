import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    id: "watch_mode",
    name: "Watch Mode",
    price: 19,
    description: "Peace of mind as you grow",
    features: [
      "Continuous monitoring",
      "Calm alerts when things change",
      "Confidence score tracking",
      "Re-analyze anytime"
    ],
    popular: true,
  },
  {
    id: "growth_guard",
    name: "Growth Guard",
    price: 49,
    description: "Ready for your first 1,000 users",
    features: [
      "Everything in Watch Mode",
      "Growth simulations",
      "Cost forecasting",
      "Next upgrade guidance",
      "Priority support"
    ],
    popular: false,
  }
];

export default function Upgrade() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get("analysisId");

  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, analysisId }),
      });
      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">
            Want us to keep watching this app?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Focus on building. We'll watch for changes and let you know before anything becomes a problem.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🔔</div>
            <h3 className="font-medium mb-1">Calm Alerts</h3>
            <p className="text-sm text-muted-foreground">
              Get notified about changes before they become problems
            </p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-medium mb-1">Track Confidence</h3>
            <p className="text-sm text-muted-foreground">
              See how your app's health changes over time
            </p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🛡️</div>
            <h3 className="font-medium mb-1">Stay Ready</h3>
            <p className="text-sm text-muted-foreground">
              Know exactly what to do when it's time to upgrade
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={plan.popular ? "border-primary shadow-lg" : ""}
            >
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-center text-sm py-1">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={loading !== null}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {loading === plan.id ? "Loading..." : `Start ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/app/watch${analysisId ? `?analysisId=${analysisId}` : ""}`)}
          >
            Maybe later
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
