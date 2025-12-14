import { Badge } from "@/components/ui/badge";
import {
  Zap,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  FileCode,
  BookOpen,
  GitBranch,
  MessageCircle,
  CheckCircle2,
  Cpu,
  Shield,
  Layers,
} from "lucide-react";

export default function FeatureGrid() {
  const features = [
    {
      icon: Cpu,
      title: "App Intelligence Graph",
      description:
        "Understands your stack, entrypoints, state and dependencies.",
      comingSoon: false,
    },
    {
      icon: BarChart3,
      title: "Production Readiness Score (0–100)",
      description: "Clear benchmark to ship responsibly.",
      comingSoon: false,
    },
    {
      icon: AlertTriangle,
      title: "Risk Heatmap",
      description: "Security, scaling, reliability, data and cost risks.",
      comingSoon: false,
    },
    {
      icon: Zap,
      title: "Failure Mode Simulator",
      description: "Predict what fails first under spikes and timeouts.",
      comingSoon: false,
    },
    {
      icon: FileCode,
      title: "Artifact Generator",
      description: "Dockerfile, .env.example, PROD docs, runbooks.",
      comingSoon: false,
    },
    {
      icon: Lightbulb,
      title: "Explainable Recommendations",
      description: "No DevOps jargon; plain-English decisions.",
      comingSoon: false,
    },
    {
      icon: GitBranch,
      title: "Deploy Path Generator",
      description: "Pick the simplest safe platform for your app.",
      comingSoon: true,
    },
    {
      icon: MessageCircle,
      title: "Ops Advisor Chat (context-aware)",
      description: "Ask 'why' and get answers grounded in your repo.",
      comingSoon: true,
    },
    {
      icon: CheckCircle2,
      title: "Best-Practice Templates",
      description: "Health checks, logging structure, error handling guidance.",
      comingSoon: false,
    },
    {
      icon: Shield,
      title: "Replit-first UX",
      description: "Made for how Replit projects are structured and shared.",
      comingSoon: false,
    },
    {
      icon: Layers,
      title: "Multi-Framework Support",
      description: "FastAPI, Flask, Node, Express, Next.js, and more.",
      comingSoon: false,
    },
    {
      icon: Zap,
      title: "Zero Setup Required",
      description: "No cloud credentials or complex configuration needed.",
      comingSoon: false,
    },
  ];

  return (
    <section className="bg-primary/2.5 py-20 md:py-28">
      <div className="container max-w-7xl mx-auto px-4 flex flex-col gap-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to graduate your app from prototype to operable
            service
          </h2>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-background rounded-lg p-6 border border-border/60 hover:border-primary/40 transition flex flex-col gap-3 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <Icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  {feature.comingSoon && (
                    <Badge className="text-xs bg-primary/10 text-primary border-primary/30">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
