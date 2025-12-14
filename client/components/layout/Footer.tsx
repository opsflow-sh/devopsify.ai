import { Link } from "react-router-dom";
import { Twitter } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">D</span>
              </div>
              <span className="font-bold text-lg text-foreground">Devopsify</span>
            </div>
            <p className="text-sm text-foreground/60">
              Helping builders ship responsibly.
            </p>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Product</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/product" className="text-sm text-foreground/60 hover:text-foreground transition">
                Features
              </Link>
              <Link to="/pricing" className="text-sm text-foreground/60 hover:text-foreground transition">
                Pricing
              </Link>
              <Link to="/roadmap" className="text-sm text-foreground/60 hover:text-foreground transition">
                Roadmap
              </Link>
            </nav>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Company</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/faq" className="text-sm text-foreground/60 hover:text-foreground transition">
                FAQ
              </Link>
              <Link to="/privacy" className="text-sm text-foreground/60 hover:text-foreground transition">
                Privacy
              </Link>
              <a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">
                Terms (Coming Soon)
              </a>
            </nav>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Connect</h4>
            <nav className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/60 hover:text-foreground transition"
              >
                <Twitter size={20} />
              </a>
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/40 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-foreground/60">
              © {currentYear} Devopsify. All rights reserved.
            </p>
            <p className="text-sm text-foreground/60">
              Devopsify helps builders ship responsibly.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
