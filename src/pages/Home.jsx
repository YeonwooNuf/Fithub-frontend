import React from "react";
import ProductCard from "../components/ProductCard";
import "../App.css";

function Home() {
  const products = [
    {
      id: 1,
      title: "Unsplash 로고 플레인 티셔츠",
      description: "깔끔한 디자인",
      price: "12,000",
      imageUrl: "https://via.placeholder.com/250x200"
    },
    {
      id: 2,
      title: "사이드 슬러 라인 레터링 티셔츠",
      description: "편안한 핏",
      price: "39,000",
      imageUrl: "https://via.placeholder.com/250x200"
    },
    {
      id: 3,
      title: "컬러 레터링 티셔츠",
      description: "다양한 색상",
      price: "40,000",
      imageUrl: "https://via.placeholder.com/250x200"
    },
    {
      id: 4,
      title: "웨이브 라인 패턴 티셔츠",
      description: "독특한 디자인",
      price: "19,900",
      imageUrl: "https://via.placeholder.com/250x200"
    }
  ];

  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default Home;
