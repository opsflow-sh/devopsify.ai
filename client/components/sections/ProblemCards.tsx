export default function ProblemCards() {
  const problems = [
    {
      icon: "⚡",
      question: "What breaks if traffic spikes?",
      description: "Understand your app's scaling limits and breaking points before they happen in production.",
    },
    {
      icon: "🔐",
      question: "Where do secrets go?",
      description: "Secure management of environment variables, credentials, and sensitive configuration data.",
    },
    {
      icon: "🚀",
      question: "How do I deploy outside Replit safely?",
      description: "Clear deployment paths with best practices, templates, and opinionated guidance.",
    },
  ];

  return (
    <section className="container max-w-7xl mx-auto px-4 py-20 md:py-28">
      <div className="flex flex-col gap-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Replit helps you build. Production requires different questions.
          </h2>
          <p className="text-lg text-foreground/70">
            Devopsify gives you a clear plan, generates the missing pieces, and explains every decision.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-background rounded-xl p-8 border border-border/60 hover:border-primary/40 transition flex flex-col gap-4"
            >
              <div className="text-4xl">{problem.icon}</div>
              <h3 className="text-xl font-semibold text-foreground">
                {problem.question}
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
