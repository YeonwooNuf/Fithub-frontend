import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./PromotionBanner.css";

const PromotionBanner = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // 프로모션 데이터 - 실제로는 API에서 가져올 수 있음
  const promotions = [
    {
      id: 1,
      title: "여름 세일 최대 50% 할인",
      description: "시원한 여름을 위한 특별 프로모션",
      image: "/promotion-summer.jpg",
      link: "/event/summer-sale",
      color: "#4a90e2"
    },
    {
      id: 2,
      title: "신규 회원 15% 할인",
      description: "지금 가입하고 첫 구매 혜택을 받으세요",
      image: "/promotion-new.jpg",
      link: "/register",
      color: "#50c878"
    },
    {
      id: 3,
      title: "무료 배송 이벤트",
      description: "10만원 이상 구매 시 무료 배송",
      image: "/promotion-shipping.jpg",
      link: "/event/free-shipping",
      color: "#f5a623"
    }
  ];

  // 자동 슬라이드 기능
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => 
        (current + 1) % promotions.length
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [promotions.length]);

  // 인디케이터 클릭 핸들러
  const handleIndicatorClick = (index) => {
    setActiveIndex(index);
  };

  // 이전 슬라이드 버튼 핸들러
  const handlePrevClick = () => {
    setActiveIndex((current) => 
      (current - 1 + promotions.length) % promotions.length
    );
  };

  // 다음 슬라이드 버튼 핸들러
  const handleNextClick = () => {
    setActiveIndex((current) => 
      (current + 1) % promotions.length
    );
  };

  return (
    <section className="promotion-banner">
      <div className="promotion-slider">
        {promotions.map((promo, index) => (
          <div 
            key={promo.id}
            className={`promotion-slide ${index === activeIndex ? 'active' : ''}`}
            style={{ 
              backgroundImage: `url(${promo.image})`,
              backgroundColor: promo.color
            }}
          >
            <div className="promotion-content">
              <h2 className="promotion-title">{promo.title}</h2>
              <p className="promotion-description">{promo.description}</p>
              <Link to={promo.link} className="promotion-button">
                자세히 보기
              </Link>
            </div>
          </div>
        ))}
        
        {/* 좌우 화살표 */}
        <button className="promotion-arrow prev" onClick={handlePrevClick}>
          ❮
        </button>
        <button className="promotion-arrow next" onClick={handleNextClick}>
          ❯
        </button>
        
        {/* 인디케이터 */}
        <div className="promotion-indicators">
          {promotions.map((_, index) => (
            <button 
              key={index}
              className={`indicator ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleIndicatorClick(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromotionBanner; 