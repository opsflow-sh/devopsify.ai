import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AccordionFAQ from "@/components/sections/AccordionFAQ";

export default function FAQ() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-foreground/70">
              Everything you need to know about Devopsify
            </p>
          </div>
        </div>
        <AccordionFAQ />
      </main>
      <Footer />
    </div>
  );
}
