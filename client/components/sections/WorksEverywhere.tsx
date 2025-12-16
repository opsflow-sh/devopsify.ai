import { Badge } from "@/components/ui/badge";
import { Github, Globe, Cloud, Zap } from "lucide-react";

export default function WorksEverywhere() {
  const platforms = [
    {
      name: "Replit",
      icon: "🐍",
      description: "Replit Projects, Deployments, agents",
      category: "Vibe Coding",
    },
    {
      name: "Lovable",
      icon: "💕",
      description: "Full-stack apps with AI generation",
      category: "Vibe Coding",
    },
    {
      name: "Vercel",
      icon: "▲",
      description: "Next.js, frontend, full-stack",
      category: "Popular Platforms",
    },
    {
      name: "Netlify",
      icon: "◆",
      description: "Static sites, functions, edge compute",
      category: "Popular Platforms",
    },
    {
      name: "Builder.io",
      icon: "⚙️",
      description: "Visual and programmatic builds",
      category: "Popular Platforms",
    },
    {
      name: "GitHub",
      icon: "⚫",
      description: "Any GitHub repo, any language",
      category: "Version Control",
    },
    {
      name: "Railway",
      icon: "🚂",
      description: "Containerized apps, databases",
      category: "Deployment",
    },
    {
      name: "Fly.io",
      icon: "🪁",
      description: "Global edge infrastructure",
      category: "Deployment",
    },
  ];

  const categories = ["Vibe Coding", "Popular Platforms", "Version Control", "Deployment"];

  return (
    <section className="bg-primary/5 py-20 md:py-28">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col gap-12">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Works everywhere
            </h2>
            <p className="text-lg text-foreground/70">
              No matter where you built your app or where you plan to deploy it, Devopsify speaks your language.
            </p>
          </div>

          {/* Platforms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.map((platform, index) => (
              <div
                key={index}
                className="bg-background rounded-lg p-6 border border-border/60 hover:border-primary/40 transition flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{platform.icon}</span>
                  <Badge variant="outline" className="text-xs">
                    {platform.category}
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground">{platform.name}</h3>
                <p className="text-sm text-foreground/70">{platform.description}</p>
              </div>
            ))}
          </div>

          {/* Callout */}
          <div className="max-w-2xl mx-auto bg-background rounded-xl p-8 border border-primary/20">
            <p className="text-center text-foreground leading-relaxed">
              Don't see your platform? Devopsify works with <strong>any app repository</strong> — just export your code or point us to your GitHub repo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
