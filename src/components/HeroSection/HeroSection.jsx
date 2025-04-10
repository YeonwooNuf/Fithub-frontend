import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./HeroSection.css";

const HeroSection = () => {
    const [atTop, setAtTop] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            setAtTop(window.scrollY < 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section
            className={`hero ${!atTop ? "blur-active" : ""}`}
            style={{
                backgroundImage: `url(${process.env.PUBLIC_URL}/background.png)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                minHeight: "100vh",
            }}
        >
            <div className="hero__overlay"></div>

            <div className="hero__content-wrapper">
                {!atTop ? (
                    <div className="hero__logo-container">
                        <img src="/logo.png" alt="Artism Logo" className="hero__logo" />
                    </div>
                ) : (
                    <div className="hero__content">
                        <div className="hero__title">
                            <h1 >Your Own Style Repository </h1>
                            <h1>FitHub</h1>
                        </div>
                        <p className="hero__subtitle">당신만의 스타일 저장소</p>
                        <Link to="/shop">
                            <button className="hero__button">SHOP NOW</button>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default HeroSection;