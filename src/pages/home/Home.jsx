import HeroSection from "../../components/HeroSection/HeroSection";
import ExhibitionMasonry from "../../components/ExhibitionMasonry/ExhibitionMasonry";
import ScrollRevealImage from "../../components/ScrollRevealImage/ScrollRevealImage";
import WeeklyPopularArtworks from "../../components/WeeklyPopularClothes/WeeklyPopularClothes";
import "./Home.css";

const Home = () => {
  return (
    <div>
      <HeroSection />
      <ScrollRevealImage />
      <ExhibitionMasonry />
      <WeeklyPopularArtworks />
    </div>
  );
};
export default Home;
