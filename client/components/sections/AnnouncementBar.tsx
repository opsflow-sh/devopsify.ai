export default function AnnouncementBar() {
  return (
    <div className="w-full bg-primary/5 border-b border-primary/20">
      <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-2 flex-wrap">
        <span className="text-sm text-foreground/80">
          🚀 Coming Soon: Devopsify for all vibe coders
        </span>
        <button
          onClick={() => {
            const form = document.getElementById("waitlist-form");
            form?.scrollIntoView({ behavior: "smooth" });
          }}
          className="text-sm text-primary hover:text-primary/80 transition font-semibold underline"
        >
          Join the waitlist →
        </button>
      </div>
    </div>
  );
}
