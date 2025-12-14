import { Badge } from "@/components/ui/badge";

export default function StepsTimeline() {
  const steps = [
    {
      number: 1,
      title: "Import your Replit app",
      description: "GitHub URL or ZIP export",
      icon: "📦",
    },
    {
      number: 2,
      title: "Build App Intelligence Graph",
      description: "Framework, deps, state, secrets",
      icon: "🧠",
      comingSoon: false,
    },
    {
      number: 3,
      title: "Get Production Readiness Score",
      description: "Risk Heatmap & detailed report",
      icon: "📊",
      comingSoon: false,
    },
    {
      number: 4,
      title: "Generate production artifacts",
      description: "Dockerfile, env template, runbooks",
      icon: "🛠️",
      comingSoon: true,
    },
    {
      number: 5,
      title: "Pick a deployment path",
      description: "Fly / Cloud Run / Railway with cost estimates",
      icon: "🚀",
      comingSoon: true,
    },
  ];

  return (
    <section className="container max-w-7xl mx-auto px-4 py-20 md:py-28">
      <div className="flex flex-col gap-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How Devopsify works
          </h2>
          <p className="text-lg text-foreground/70">
            Five simple steps from Replit to production-ready
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute left-[2.5rem] top-32 h-16 w-0.5 bg-gradient-to-b from-primary/40 to-primary/10"></div>
              )}

              {/* Step Card */}
              <div className="flex gap-6 mb-8">
                {/* Step Circle */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {step.number}. {step.title}
                      </h3>
                      <p className="text-foreground/70">{step.description}</p>
                    </div>
                    {step.comingSoon && (
                      <Badge className="text-xs bg-primary/10 text-primary border-primary/30 whitespace-nowrap">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
