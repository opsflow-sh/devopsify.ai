import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PlaceholderPage from "@/components/PlaceholderPage";

export default function Product() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <PlaceholderPage
          icon="🎯"
          title="Product Features"
          description="Dive deep into Devopsify's comprehensive feature set and capabilities. Detailed documentation on each tool and how they work together."
        />
      </main>
      <Footer />
    </div>
  );
}
