import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PlaceholderPage from "@/components/PlaceholderPage";

export default function Docs() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <PlaceholderPage
          icon="📚"
          title="Documentation (Coming Soon)"
          description="Complete guides, API documentation, and tutorials for getting the most out of Devopsify. Available when we launch the beta."
        />
      </main>
      <Footer />
    </div>
  );
}
