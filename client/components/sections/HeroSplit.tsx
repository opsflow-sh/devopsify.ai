import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function HeroSplit() {
  const [audience, setAudience] = useState<"vibe-coder" | "founder">("vibe-coder");

  const messages = {
    "vibe-coder": {
      headline: "You built that cool app.",
      subheadline: "Is it ready for the real world?",
      copy: "Before you share it with the world, know what could go wrong. Get a clear picture of your app's readiness and what to watch out for.",
    },
    founder: {
      headline: "From side project to real business.",
      subheadline: "You've got paying users now.",
      copy: "Your setup works—but will it scale? Get clarity on what to do next, without needing a DevOps degree.",
    },
  };

  const current = messages[audience];

  return (
    <section className="container max-w-7xl mx-auto px-4 py-20 md:py-32">
      {/* Audience Toggle (Subtle) */}
      <div className="flex justify-center gap-2 mb-12">
        <button
          onClick={() => setAudience("vibe-coder")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            audience === "vibe-coder"
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          Vibe Coder
        </button>
        <button
          onClick={() => setAudience("founder")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            audience === "founder"
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          Solo Founder
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
        {/* Left: Text Content */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-primary mb-2">
                {current.subheadline}
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                {current.headline}
              </h1>
            </div>
            <p className="text-lg md:text-xl text-foreground/70 leading-relaxed">
              {current.copy}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => {
                const form = document.getElementById("waitlist-form");
                form?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-6 text-base font-semibold"
            >
              Check readiness
            </Button>
            <button
              onClick={() => {
                document
                  .getElementById("demo-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-6 text-base font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition"
            >
              View sample readiness report
            </button>
          </div>

          {/* Microcopy */}
          <p className="text-sm text-foreground/60 leading-relaxed">
            Works with any vibe-coded app. GitHub, Vercel, Replit, Lovable, Builder.io, Netlify + more. No cloud credentials required.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-2 pt-4">
            <Badge variant="outline" className="text-xs">
              Replit-first
            </Badge>
            <Badge variant="outline" className="text-xs">
              Explainable
            </Badge>
            <Badge variant="outline" className="text-xs">
              Opinionated defaults
            </Badge>
            <Badge variant="outline" className="text-xs">
              No Kubernetes required
            </Badge>
            <Badge className="text-xs bg-primary/10 text-primary border-primary/30">
              Coming Soon
            </Badge>
          </div>
        </div>

        {/* Right: Visual Mock */}
        <div className="flex flex-col gap-4">
          {/* Readiness Score Mock */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">
                Readiness Score
              </h3>
              <span className="text-xs text-primary font-semibold">72/100</span>
            </div>
            <div className="w-full h-2 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full w-[72%] bg-primary rounded-full"></div>
            </div>
            <p className="text-xs text-foreground/60 mt-3">
              Your app is production-ready with minor improvements
            </p>
          </div>

          {/* Risk Heatmap Mock */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-6 border border-border/60">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Risk Heatmap
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Security", level: "high", color: "bg-red-400" },
                { label: "Scaling", level: "medium", color: "bg-yellow-400" },
                { label: "Reliability", level: "low", color: "bg-green-400" },
                { label: "Data", level: "medium", color: "bg-yellow-400" },
                { label: "Cost", level: "low", color: "bg-green-400" },
                { label: "Ops", level: "high", color: "bg-red-400" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-10 h-10 rounded ${item.color} opacity-80`}
                  ></div>
                  <p className="text-xs text-foreground/60 text-center">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Artifacts Mock */}
          <div className="bg-slate-900/95 text-slate-50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-sm font-semibold mb-4 text-slate-200">
              Generated Artifacts
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="text-slate-400">📄 Dockerfile</div>
              <div className="text-slate-400">📋 RUNBOOK.md</div>
              <div className="text-slate-400">🚀 PRODUCTION.md</div>
              <div className="text-slate-400">🔐 .env.example</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
