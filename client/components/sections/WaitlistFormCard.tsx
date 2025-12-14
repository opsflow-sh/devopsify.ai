import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2 } from "lucide-react";

export default function WaitlistFormCard() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [appType, setAppType] = useState("");
  const [builtOnReplit, setBuiltOnReplit] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          appType,
          builtOnReplit,
          githubUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to join waitlist");
      }

      setSubmitted(true);
      setEmail("");
      setAppType("");
      setBuiltOnReplit("");
      setGithubUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section
        id="waitlist-form"
        className="container max-w-7xl mx-auto px-4 py-20 md:py-28"
      >
        <div className="max-w-2xl mx-auto">
          <div className="bg-background rounded-2xl border border-border/60 p-8 md:p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-3">
              You're in! 🎉
            </h2>
            <p className="text-lg text-foreground/70 mb-6">
              We'll notify you when beta opens. Keep an eye on your inbox!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  document
                    .getElementById("demo-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                  setSubmitted(false);
                }}
                className="px-6 py-3 text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition font-semibold"
              >
                Want a sample readiness report?
              </button>
              <Button
                onClick={() => setSubmitted(false)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 font-semibold"
              >
                View other options
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="waitlist-form" className="bg-primary/5 py-20 md:py-28">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-background rounded-2xl border border-border/60 p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
                Coming Soon
              </Badge>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Get early access to Devopsify
              </h2>
              <p className="text-lg text-foreground/70">
                Private Beta – Join the waitlist and we'll notify you first
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Email <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition bg-background"
                  />
                </div>
              </div>

              {/* App Type */}
              <div>
                <label
                  htmlFor="appType"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  What are you building?
                </label>
                <select
                  id="appType"
                  value={appType}
                  onChange={(e) => setAppType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition bg-background text-foreground"
                >
                  <option value="">Select an option</option>
                  <option value="api">API</option>
                  <option value="saas">SaaS</option>
                  <option value="ai-app">AI app</option>
                  <option value="internal-tool">Internal tool</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Built on Replit */}
              <div>
                <label
                  htmlFor="replit"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Built on Replit?
                </label>
                <select
                  id="replit"
                  value={builtOnReplit}
                  onChange={(e) => setBuiltOnReplit(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition bg-background text-foreground"
                >
                  <option value="">Select an option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="planning">Planning to</option>
                </select>
              </div>

              {/* GitHub URL (Optional) */}
              <div>
                <label
                  htmlFor="github"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  GitHub repo link (optional)
                </label>
                <input
                  id="github"
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full px-4 py-3 rounded-lg border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition bg-background text-foreground placeholder:text-foreground/40"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-100/50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Joining..." : "Join the waitlist"}
              </Button>

              {/* Compliance Note */}
              <p className="text-xs text-foreground/60 text-center">
                We'll only email product updates.{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  Unsubscribe anytime
                </a>
                .
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
