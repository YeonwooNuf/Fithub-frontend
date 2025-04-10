import React, { useState, useEffect, useRef } from "react";
import "./WeeklyPopularClothes.css";

const artworks = ["/artwork1.jpg", "/artwork2.jpg", "/artwork3.jpg"];

const WeeklyPopularArtworks = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inView, setInView] = useState(false); // ⭐ 스크롤 감지용
  const sectionRef = useRef(null);
  const timeoutRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % artworks.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + artworks.length) % artworks.length);
  };

  // IntersectionObserver로 left-section이 화면에 보이는지 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  // 자동 슬라이드
  useEffect(() => {
    timeoutRef.current = setInterval(nextSlide, 5000);
    return () => clearInterval(timeoutRef.current);
  }, []);

  return (
    <div className="weekly-container" ref={sectionRef}>
      {" "}
      {/* ref 연결 */}
      <div className={`left-section ${inView ? "active" : ""}`}>
        <h2 className={`weekly-title ${inView ? "text-show" : ""}`}>
          Weekly Popular Clothes
        </h2>
        <p className={`weekly-subtitle ${inView ? "text-show" : ""}`}>
          Discover what everyone's loving
        </p>
      </div>
      <div className="right-section">
        <div className="artwork-wrapper">
          <img src="/frame.png" alt="frame" className="frame-image" />
          <a href={`/artwork/${currentIndex}`}>
            <img
              src={artworks[currentIndex]}
              alt="artwork"
              className="art-inside"
            />
          </a>
        </div>
        <div className="arrow-a left" onClick={prevSlide}>
          ❮
        </div>
        <div className="arrow-a right" onClick={nextSlide}>
          ❯
        </div>
      </div>
    </div>
  );
};

export default WeeklyPopularArtworks;
