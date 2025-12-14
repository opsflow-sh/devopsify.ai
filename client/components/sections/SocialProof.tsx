export default function SocialProof() {
  return (
    <section className="bg-primary/5 py-16 md:py-20">
      <div className="container max-w-7xl mx-auto px-4 flex flex-col gap-8 md:gap-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-lg text-primary font-semibold mb-2">
            Designed for builders shipping from Replit
          </p>
          <p className="text-foreground/70">
            Private beta opens soon. Early access perks for first 200 signups.
          </p>
        </div>

        {/* Quote */}
        <div className="max-w-3xl mx-auto bg-background rounded-2xl p-8 md:p-12 border border-border/60 text-center">
          <p className="text-lg md:text-xl leading-relaxed text-foreground mb-6">
            "This is the graduation layer Replit builders wish they had."
          </p>
          <p className="text-sm text-foreground/60">
            Early beta user (anonymous)
          </p>
        </div>
      </div>
    </section>
  );
}
