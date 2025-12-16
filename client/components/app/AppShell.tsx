import React from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  showNav?: boolean;
  activeStep?: number;
}

/**
 * AppShell - Layout wrapper for authenticated app pages
 *
 * Provides a minimal, clean layout with:
 * - Simple header with DevOpsify logo
 * - Main content area
 * - Optional navigation (disabled by default for FTUE)
 *
 * @example
 * <AppShell showNav={false} activeStep={1}>
 *   <YourPageContent />
 * </AppShell>
 */
export function AppShell({
  children,
  showNav = false,
  activeStep
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
              DO
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">
              DevOpsify
            </span>
          </div>

          {/* Optional Navigation - hidden during FTUE */}
          {showNav && (
            <nav className="ml-auto flex items-center gap-6">
              <a
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </a>
              <a
                href="/repositories"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Repositories
              </a>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
