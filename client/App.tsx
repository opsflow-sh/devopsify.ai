import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Marketing site pages
import Index from "./pages/Index";
import Product from "./pages/Product";
import Pricing from "./pages/Pricing";
import Roadmap from "./pages/Roadmap";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Docs from "./pages/Docs";
import NotFound from "./pages/NotFound";

// App pages (TODO: Create these files)
// FTUE
// import AppConnect from "./pages/app/Connect";
// import AppAnalyzing from "./pages/app/Analyzing";
// import LaunchVerdict from "./pages/app/LaunchVerdict";
// import RisksScreen from "./pages/app/RisksScreen";
// import PlatformFit from "./pages/app/PlatformFit";
// import NextStep from "./pages/app/NextStep";

// Dashboard & Upgrade
// import Upgrade from "./pages/app/Upgrade";
// import WatchDashboard from "./pages/app/WatchDashboard";
// import AlertsCenter from "./pages/app/AlertsCenter";

// Stage 2 & 3
// import GrowthReadiness from "./pages/app/GrowthReadiness";
// import ProductionMaturity from "./pages/app/ProductionMaturity";
// import VibeSpec from "./pages/app/VibeSpec";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Marketing site */}
            <Route path="/" element={<Index />} />
            <Route path="/product" element={<Product />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/docs" element={<Docs />} />

            {/* App routes - FTUE (TODO: Uncomment and implement)
            <Route path="/app/connect" element={<AppConnect />} />
            <Route path="/app/analyzing" element={<AppAnalyzing />} />
            <Route path="/app/report/launch" element={<LaunchVerdict />} />
            <Route path="/app/report/risks" element={<RisksScreen />} />
            <Route path="/app/report/platform" element={<PlatformFit />} />
            <Route path="/app/report/next" element={<NextStep />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/app/watch" element={<WatchDashboard />} />
            <Route path="/app/alerts" element={<AlertsCenter />} />
            <Route path="/app/growth-readiness" element={<GrowthReadiness />} />
            <Route path="/app/production" element={<ProductionMaturity />} />
            <Route path="/app/spec" element={<VibeSpec />} />
            */}

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
