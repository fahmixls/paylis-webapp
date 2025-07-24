import Footer from "~/components/derived/Footer";
import HeroSection from "~/pages/home/HeroSection";
import ProductSection from "~/pages/home/ProductSection";

export default function Home() {
  return (
    <div className="pattern-bg h-full w-full">
      <HeroSection />
      <ProductSection />
      <Footer />
    </div>
  );
}
