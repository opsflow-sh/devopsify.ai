import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function PricingCards() {
  const tiers = [
    {
      name: "Free",
      description: "Get started with Devopsify",
      price: "Free",
      features: [
        "1 project scan",
        "Readiness score + top risks",
        "Sample output preview",
      ],
      cta: "Try Free",
      highlighted: false,
    },
    {
      name: "Pro",
      description: "For serious builders",
      price: "$39",
      period: "/month",
      features: [
        "Full readiness report",
        "Artifact generation",
        "Failure simulation",
        "Export bundle",
        "Email support",
      ],
      cta: "Coming Soon",
      highlighted: true,
    },
    {
      name: "Builder+",
      description: "For teams",
      price: "$99",
      period: "/month",
      features: [
        "Multiple projects",
        "Team standards templates",
        "Re-audit on changes",
        "Advanced analytics",
        "Priority support",
        "API access",
      ],
      cta: "Coming Soon",
      highlighted: false,
    },
  ];

  return (
    <section className="container max-w-7xl mx-auto px-4 py-20 md:py-28">
      <div className="flex flex-col gap-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pricing <span className="text-primary">(Coming Soon)</span>
          </h2>
          <p className="text-lg text-foreground/70">
            Simple, transparent pricing with no surprises
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`rounded-xl border transition flex flex-col ${
                tier.highlighted
                  ? "border-primary/40 bg-primary/5 shadow-lg scale-105 md:scale-100"
                  : "border-border/60 bg-background"
              }`}
            >
              {/* Header */}
              <div className="p-6 border-b border-border/40">
                {tier.highlighted && (
                  <Badge className="mb-3 bg-primary text-primary-foreground border-0">
                    Most Popular
                  </Badge>
                )}
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {tier.name}
                </h3>
                <p className="text-sm text-foreground/60 mb-4">
                  {tier.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-foreground/60">{tier.period}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="p-6 flex-1 flex flex-col gap-4">
                <ul className="space-y-3 flex-1">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex gap-3 items-start">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span className="text-sm text-foreground/80">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  disabled={tier.cta === "Coming Soon"}
                  className={`w-full ${
                    tier.highlighted
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "border border-border/60 text-foreground hover:bg-primary/5"
                  }`}
                  variant={tier.highlighted ? "default" : "outline"}
                >
                  {tier.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm text-foreground/60 italic">
            Final pricing may change; waitlist members get founder pricing.
          </p>
        </div>
      </div>
    </section>
  );
}
