import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="container max-w-7xl mx-auto px-4 text-center py-20">
          <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
          <p className="text-2xl text-foreground/70 mb-4">Page not found</p>
          <p className="text-foreground/60 mb-8">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition"
          >
            Return to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
