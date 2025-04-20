import React, { useEffect, useState } from "react";
import "./ScrollRevealImage.css";

const ScrollRevealImage = () => {
  const [clipHeight, setClipHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const delay = 400;
      const maxScroll = 1000;

      const offset = scrollY - delay;
      const progress = Math.max(0, Math.min(offset / maxScroll, 1));
      setClipHeight(progress * 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="scroll-wrapper">
      <div className="sticky-image">
        <img
          src="/reveal1.png"
          alt="Color"
          className="base-image1"
          style={{ clipPath: `inset(${clipHeight}% 0 0 0)` }}
        />
        <img
          src="/reveal2.png"
          alt="Sketch"
          className="overlay-image1"
          style={{ clipPath: `inset(0 0 ${100 - clipHeight}% 0)` }}
        />
        <img
          src="/brush1.jpg"
          alt="Color"
          className="base-image2"
          style={{ clipPath: `inset(0 0 ${clipHeight}% 0)` }}
        />
        <img
          src="/brush2.png"
          alt="Sketch"
          className="overlay-image2"
          style={{ clipPath: `inset(0 0 0 ${100 - clipHeight}%)` }}
        />
      </div>
      <div className="description-wrapper1">
        <h1 className="description1">
        당신의 취향이 트렌드가 되는 곳, <br /> FitHub
        </h1>
      </div>

      <div className="description-wrapper2">
        <h1 className="description2">
          AI와 함께 나만의 전시회를 만들고 <br /> 풍부해진 감상을 즐기세요
        </h1>
      </div>
    </div>
  );
};

export default ScrollRevealImage;
