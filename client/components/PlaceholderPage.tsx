import { useLocation } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: string;
}

export default function PlaceholderPage({
  title,
  description,
  icon,
}: PlaceholderPageProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
      <div className="container max-w-7xl mx-auto px-4 text-center py-20">
        <div className="text-6xl mb-6">{icon}</div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-8">
          {description}
        </p>
        <div className="space-y-4">
          <p className="text-foreground/60">
            This page is coming soon. To help us prioritize, let us know what
            you'd like to see here:
          </p>
          <a
            href="mailto:hello@devopsify.ai"
            className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition"
          >
            Send feedback
          </a>
          <div className="pt-4">
            <p className="text-sm text-foreground/60 mb-2">
              In the meantime, check out the{" "}
              <a
                href="/"
                className="text-primary hover:underline font-semibold"
              >
                home page
              </a>{" "}
              for the full feature overview.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
