import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PlaceholderPage from "@/components/PlaceholderPage";

export default function Roadmap() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <PlaceholderPage
          icon="🗺️"
          title="Roadmap"
          description="See what's coming next in Devopsify. Our detailed roadmap shows features we're building, timelines, and how your feedback shapes our priorities."
        />
      </main>
      <Footer />
    </div>
  );
}
