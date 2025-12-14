import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">Devopsify</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/product" className="text-sm text-foreground/70 hover:text-foreground transition">
              Product
            </Link>
            <Link to="/pricing" className="text-sm text-foreground/70 hover:text-foreground transition">
              Pricing
            </Link>
            <Link to="/roadmap" className="text-sm text-foreground/70 hover:text-foreground transition">
              Roadmap
            </Link>
            <Link to="/faq" className="text-sm text-foreground/70 hover:text-foreground transition">
              FAQ
            </Link>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => {
                const form = document.getElementById("waitlist-form");
                form?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-sm text-primary hover:text-primary/80 transition font-medium"
            >
              See a sample report
            </button>
            <Button
              onClick={() => {
                const form = document.getElementById("waitlist-form");
                form?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Join Waitlist
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md text-foreground hover:bg-accent/10 transition"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border/40 bg-background">
            <nav className="container max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
              <Link
                to="/product"
                className="text-sm text-foreground/70 hover:text-foreground transition py-2"
                onClick={() => setIsOpen(false)}
              >
                Product
              </Link>
              <Link
                to="/pricing"
                className="text-sm text-foreground/70 hover:text-foreground transition py-2"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/roadmap"
                className="text-sm text-foreground/70 hover:text-foreground transition py-2"
                onClick={() => setIsOpen(false)}
              >
                Roadmap
              </Link>
              <Link
                to="/faq"
                className="text-sm text-foreground/70 hover:text-foreground transition py-2"
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    const form = document.getElementById("waitlist-form");
                    form?.scrollIntoView({ behavior: "smooth" });
                    setIsOpen(false);
                  }}
                  className="text-sm text-primary hover:text-primary/80 transition font-medium text-left"
                >
                  See a sample report
                </button>
                <Button
                  onClick={() => {
                    const form = document.getElementById("waitlist-form");
                    form?.scrollIntoView({ behavior: "smooth" });
                    setIsOpen(false);
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Join Waitlist
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
