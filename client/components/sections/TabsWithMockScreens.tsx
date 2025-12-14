import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function TabsWithMockScreens() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      label: "Readiness Report",
      icon: "📊",
      benefits: [
        "Score from 0-100 based on production readiness",
        "Actionable insights for each risk area",
        "Prioritized recommendations by impact",
      ],
      mockContent: (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold">
              72
            </div>
            <div>
              <p className="text-sm text-foreground/60">Production Readiness</p>
              <p className="font-semibold text-foreground">Good foundation, minor improvements needed</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { category: "Security", score: 65 },
              { category: "Scaling", score: 78 },
              { category: "Reliability", score: 82 },
              { category: "Data handling", score: 71 },
              { category: "Cost efficiency", score: 68 },
            ].map((item) => (
              <div key={item.category} className="flex items-center justify-between text-sm">
                <span className="text-foreground/70">{item.category}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                  <span className="text-foreground font-medium w-10">{item.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: "Risk Heatmap",
      icon: "🔥",
      benefits: [
        "Visual breakdown of all risk categories",
        "Color-coded severity indicators",
        "Quick identification of high-impact issues",
      ],
      mockContent: (
        <div className="space-y-6">
          <p className="text-sm text-foreground/70">Risk Assessment by Category</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Security", level: "High", color: "bg-red-100 text-red-900" },
              { name: "Scaling", level: "Medium", color: "bg-yellow-100 text-yellow-900" },
              { name: "Reliability", level: "Low", color: "bg-green-100 text-green-900" },
              { name: "Data Loss", level: "Medium", color: "bg-yellow-100 text-yellow-900" },
              { name: "Cost", level: "Low", color: "bg-green-100 text-green-900" },
              { name: "Ops", level: "High", color: "bg-red-100 text-red-900" },
            ].map((item) => (
              <div key={item.name} className={`p-4 rounded-lg ${item.color}`}>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs opacity-80">{item.level}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: "Generated Artifacts",
      icon: "📦",
      benefits: [
        "Production-ready Docker configuration",
        "Comprehensive runbooks and documentation",
        "Environment setup templates",
      ],
      mockContent: (
        <div className="space-y-4">
          <p className="text-sm text-foreground/70">Generated files ready for deployment</p>
          {[
            { name: "Dockerfile", size: "1.2 KB", generated: true },
            { name: ".env.example", size: "0.8 KB", generated: true },
            { name: "RUNBOOK.md", size: "3.4 KB", generated: true },
            { name: "PRODUCTION.md", size: "4.1 KB", generated: true },
            { name: "docker-compose.yml", size: "2.1 KB", generated: true },
            { name: "health-check.sh", size: "1.5 KB", generated: true },
          ].map((file) => (
            <div key={file.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-border/60">
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{file.name}</p>
                  <p className="text-xs text-foreground/60">{file.size}</p>
                </div>
              </div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/30">
                Ready
              </Badge>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "Deploy Plan",
      icon: "🚀",
      comingSoon: true,
      benefits: [
        "Platform recommendations (Fly, Cloud Run, Railway)",
        "Cost estimates for different options",
        "Step-by-step deployment guides",
      ],
      mockContent: (
        <div className="space-y-4 opacity-60">
          <div className="p-4 bg-slate-50 rounded-lg border border-border/60">
            <p className="text-sm font-semibold text-foreground mb-2">Recommended: Fly.io</p>
            <p className="text-xs text-foreground/70">Estimated cost: $7/month • Auto-scaling included</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-border/60">
            <p className="text-sm font-semibold text-foreground mb-2">Alternative: Cloud Run</p>
            <p className="text-xs text-foreground/70">Estimated cost: $15/month • More configuration needed</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-border/60">
            <p className="text-sm font-semibold text-foreground mb-2">Alternative: Railway</p>
            <p className="text-xs text-foreground/70">Estimated cost: $10/month • Great for beginners</p>
          </div>
        </div>
      ),
    },
  ];

  const currentTab = tabs[activeTab];

  return (
    <section id="demo-section" className="container max-w-7xl mx-auto px-4 py-20 md:py-28">
      <div className="flex flex-col gap-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            See it in action
          </h2>
          <p className="text-lg text-foreground/70">
            A detailed walkthrough of the Devopsify experience
          </p>
        </div>

        {/* Tabs and Content */}
        <div className="max-w-4xl mx-auto w-full">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-border/60 pb-4">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  activeTab === index
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-primary/5"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.comingSoon && (
                  <Badge className="text-xs bg-primary/20 text-primary border-0">
                    Soon
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Benefits */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-foreground">Key highlights</h3>
              <ul className="space-y-3">
                {currentTab.benefits.map((benefit, index) => (
                  <li key={index} className="flex gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/70">{benefit}</span>
                  </li>
                ))}
              </ul>
              {currentTab.comingSoon && (
                <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary font-medium">
                    Coming in early access phase
                  </p>
                </div>
              )}
            </div>

            {/* Mock Screenshot */}
            <div className="bg-background rounded-lg border border-border/60 p-6">
              {currentTab.mockContent}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
