import HeroSection from "../../components/HeroSection/HeroSection";
import ExhibitionMasonry from "../../components/ExhibitionMasonry/ExhibitionMasonry";
import ScrollRevealImage from "../../components/ScrollRevealImage/ScrollRevealImage";
import WeeklyPopularArtworks from "../../components/WeeklyPopularClothes/WeeklyPopularClothes";
import CategoryShowcase from "../../components/CategoryShowcase/CategoryShowcase";
import PromotionBanner from "../../components/PromotionBanner/PromotionBanner";
import NewArrival from "../../components/NewArrival/NewArrival";
import OngoingEvent from "../../components/OngoingEvent/OngoingEvent";
import "./Home.css";

const Home = () => {
  return (
    <div>
      <HeroSection />
      {/* <CategoryShowcase /> */}
      {/* <OngoingEvent /> */}
      <ScrollRevealImage />
      {/* <PromotionBanner /> */}
      {/* <ExhibitionMasonry /> */}
      <NewArrival />
      <WeeklyPopularArtworks />
    </div>
  );
};
export default Home;
