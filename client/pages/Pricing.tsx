import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PlaceholderPage from "@/components/PlaceholderPage";

export default function Pricing() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <PlaceholderPage
          icon="💰"
          title="Pricing (Coming Soon)"
          description="We're finalizing pricing tiers to ensure we offer the best value. Join the waitlist to get notified of our launch and gain access to special founder pricing."
        />
      </main>
      <Footer />
    </div>
  );
}
