import { Badge } from "@/components/ui/badge";

export default function RoadmapColumns() {
  const roadmap = [
    {
      phase: "Now",
      subtitle: "Private Beta – Coming Soon",
      icon: "🎯",
      items: [
        "App scan + intelligence graph",
        "Readiness score + report",
        "Artifact generation (Docker + docs)",
      ],
    },
    {
      phase: "Next",
      subtitle: "Early Access",
      icon: "🚀",
      items: [
        "Failure mode simulator",
        "Deploy plan generator (Fly/Cloud Run/Railway)",
        "Cost estimation engine",
      ],
    },
    {
      phase: "Soon",
      subtitle: "Future Releases",
      icon: "🌟",
      items: [
        "CI/CD blueprint generator",
        "Team workspaces + standards",
        "Continuous re-audits on each release",
        "Monitoring setup automation",
      ],
    },
  ];

  return (
    <section className="container max-w-7xl mx-auto px-4 py-20 md:py-28">
      <div className="flex flex-col gap-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Roadmap
          </h2>
          <p className="text-lg text-foreground/70">
            From private beta to full production platform
          </p>
        </div>

        {/* Roadmap Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roadmap.map((column, index) => (
            <div
              key={index}
              className="bg-background rounded-xl border border-border/60 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-primary/10 border-b border-primary/20 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{column.icon}</span>
                  <h3 className="text-xl font-bold text-foreground">
                    {column.phase}
                  </h3>
                </div>
                <p className="text-sm text-foreground/70">{column.subtitle}</p>
              </div>

              {/* Items */}
              <div className="p-6 space-y-3">
                {column.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex gap-3 items-start pb-3 border-b border-border/40 last:border-b-0 last:pb-0"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
