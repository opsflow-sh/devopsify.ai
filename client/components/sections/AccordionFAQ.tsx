import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AccordionFAQ() {
  const faqs = [
    {
      question: "Do I need cloud credentials?",
      answer:
        "No, not to start. Devopsify can analyze your app without any cloud access. When you're ready to deploy, we'll guide you through setting up credentials on your chosen platform.",
    },
    {
      question: "Does Devopsify deploy for me?",
      answer:
        "Not in beta. We generate deploy plans, artifacts (Dockerfiles, runbooks, environment templates), and guidance. You maintain control over your infrastructure and deployment process.",
    },
    {
      question: "Is this only for Replit?",
      answer:
        "Replit-first, but it works for any small app repository. If your app is in GitHub, GitLab, or as a ZIP export, Devopsify can analyze it.",
    },
    {
      question: "What stacks are supported?",
      answer:
        "FastAPI, Flask, Node.js, Express, Next.js, and more. We're continuously adding support for new frameworks. Check back soon for the full list.",
    },
    {
      question: "Will you store my code?",
      answer:
        "No. Your code is analyzed locally during the scan process. We don't store your source code long-term. Only your readiness report and metadata are saved to your account.",
    },
    {
      question: "When is the private beta opening?",
      answer:
        "We're finalizing the beta experience now. Join the waitlist to get notified the moment it launches. Early signups get founder pricing.",
    },
    {
      question: "Can I use Devopsify offline?",
      answer:
        "The initial analysis runs in our cloud service, but we're exploring offline capabilities for future releases. Early access members will get priority for offline features.",
    },
    {
      question: "What happens after I join the waitlist?",
      answer:
        "You'll receive an email when the private beta opens. We'll give you access to the full platform, a walkthrough, and direct support from our team.",
    },
  ];

  return (
    <section className="container max-w-7xl mx-auto px-4 py-20 md:py-28">
      <div className="flex flex-col gap-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-foreground/70">
            Everything you need to know about Devopsify
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto w-full">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/60">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary transition py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-foreground/70 leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Still have questions */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-foreground/70 mb-4">
            Can't find what you're looking for?
          </p>
          <a
            href="mailto:hello@devopsify.ai"
            className="text-primary hover:underline font-semibold"
          >
            Get in touch with our team →
          </a>
        </div>
      </div>
    </section>
  );
}
