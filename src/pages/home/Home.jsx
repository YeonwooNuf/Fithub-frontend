import HeroSection from "../../components/HeroSection/HeroSection";
import ExhibitionMasonry from "../../components/ExhibitionMasonry/ExhibitionMasonry";
import ScrollRevealImage from "../../components/ScrollRevealImage/ScrollRevealImage";
import WeeklyPopularArtworks from "../../components/WeeklyPopularClothes/WeeklyPopularClothes";
import "./Home.css";
import NewArrival from "../../components/NewArrival/NewArrival";

const Home = () => {
  return (
    <div>
      <HeroSection />
      <ScrollRevealImage />
      <ExhibitionMasonry />
      <NewArrival />
      <WeeklyPopularArtworks />
    </div>
  );
};
export default Home;
