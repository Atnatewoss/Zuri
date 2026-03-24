import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import WelcomeSection from "@/components/WelcomeSection";
import FeaturedResorts from "@/components/FeaturedResorts";
import Experiences from "@/components/Experiences";
import GalleryPreview from "@/components/GalleryPreview";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSlider />
      <WelcomeSection />
      <FeaturedResorts />
      <Experiences />
      <GalleryPreview />
      <Footer />
    </div>
  );
};

export default Index;
