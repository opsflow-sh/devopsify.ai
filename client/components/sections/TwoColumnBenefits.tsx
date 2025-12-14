import { Check } from "lucide-react";

export default function TwoColumnBenefits() {
  const benefits = [
    "No cloud account required to start",
    "No Kubernetes, no Terraform, no ceremony",
    "Export-friendly: GitHub / ZIP workflow",
    "Opinionated defaults that prevent common mistakes",
    "Explains tradeoffs like a real DevOps engineer",
  ];

  return (
    <section className="bg-primary/5 py-20 md:py-28">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Heading and Benefits */}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Designed for Replit builders who want production outcomes.
              </h2>
              <p className="text-lg text-foreground/70">
                We built Devopsify specifically for how you work—no corporate ceremonies, no overkill.
              </p>
            </div>

            {/* Benefits List */}
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/80 leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Callout Card */}
          <div className="flex flex-col gap-6">
            <div className="bg-background rounded-2xl p-8 md:p-10 border border-border/60">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                A graduation layer for Replit.
              </h3>
              <p className="text-foreground/70 leading-relaxed mb-6">
                Devopsify bridges the gap between "it runs" and "it's operable". That's where builders churn—and where platforms win.
              </p>
              <p className="text-sm text-foreground/60 italic">
                By making production accessible, we help more builders succeed. Fewer abandoned projects. More shipped products.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
