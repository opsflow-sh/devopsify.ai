import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnnouncementBar from "@/components/sections/AnnouncementBar";
import HeroSplit from "@/components/sections/HeroSplit";
import WorksEverywhere from "@/components/sections/WorksEverywhere";
import SocialProof from "@/components/sections/SocialProof";
import ProblemCards from "@/components/sections/ProblemCards";
import StepsTimeline from "@/components/sections/StepsTimeline";
import FeatureGrid from "@/components/sections/FeatureGrid";
import TabsWithMockScreens from "@/components/sections/TabsWithMockScreens";
import TwoColumnBenefits from "@/components/sections/TwoColumnBenefits";
import RoadmapColumns from "@/components/sections/RoadmapColumns";
import PricingCards from "@/components/sections/PricingCards";
import WaitlistFormCard from "@/components/sections/WaitlistFormCard";
import AccordionFAQ from "@/components/sections/AccordionFAQ";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <AnnouncementBar />
      <main className="flex-1">
        <HeroSplit />
        <WorksEverywhere />
        <SocialProof />
        <ProblemCards />
        <StepsTimeline />
        <FeatureGrid />
        <TabsWithMockScreens />
        <TwoColumnBenefits />
        <RoadmapColumns />
        <PricingCards />
        <WaitlistFormCard />
        <AccordionFAQ />
      </main>
      <Footer />
    </div>
  );
}
