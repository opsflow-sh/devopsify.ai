import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container max-w-3xl mx-auto px-4 prose prose-sm max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Privacy Policy
          </h1>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Introduction
            </h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              At Devopsify ("we," "us," or "our"), we are committed to
              protecting your privacy. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you
              visit our website and use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Information We Collect
            </h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              We collect information you provide directly to us, such as:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70 mb-4">
              <li>Email address</li>
              <li>Name and contact information</li>
              <li>Application metadata (framework, dependencies, etc.)</li>
              <li>GitHub repository information (if provided)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              How We Use Your Information
            </h2>
            <p className="text-foreground/70 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/70 mb-4">
              <li>Provide and improve our services</li>
              <li>Send product updates and communications</li>
              <li>Analyze your application for production readiness</li>
              <li>Respond to your inquiries</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Data Security
            </h2>
            <p className="text-foreground/70 leading-relaxed">
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Contact Us
            </h2>
            <p className="text-foreground/70 leading-relaxed">
              If you have questions about this Privacy Policy or our privacy
              practices, please contact us at{" "}
              <a
                href="mailto:privacy@devopsify.ai"
                className="text-primary hover:underline"
              >
                privacy@devopsify.ai
              </a>
            </p>
          </section>

          <section className="mb-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-foreground/70">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
