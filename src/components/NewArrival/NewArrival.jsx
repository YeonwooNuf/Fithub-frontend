import React, { useEffect, useState } from "react";
import axios from "axios";
import "./NewArrival.css";

const fixedPositions = [
  { top: "10%", left: "5%", size: 350 },     // 1
  { top: "17%", left: "38%", size: 350 },     // 2
  { top: "10%", left: "70%", size: 350 },    // 3
  { top: "52%", left: "18%", size: 350 },    // 4
  { top: "52%", left: "56%", size: 350 },    // 5
];

const NewArrival = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("/api/products/latest")
      .then((res) => {
        const data = res.data.slice(0, 5); // ✅ 5개만
        setProducts(data);
      })
      .catch((err) => console.error("❌ 신상품 불러오기 실패", err));
  }, []);

  return (
    <div className="bubble-container">
      <h2 className="bubble-title">이 달의 추천 상품</h2>
      {products.map((product, idx) => {
        const { top, left, size } = fixedPositions[idx];
        return (
          <div
            className="product-wrapper"
            key={product.id}
            style={{
              top,
              left,
              width: `${size}px`,
              height: `${size}px`,
            }}
          >
            <div className="product-bubble">
              <img src={product.images[0]} alt={product.name} />
            </div>
            <div className="product-info-popout">
              <p className="product-name">{product.name}</p>
              <p className="product-price">
                {product.price.toLocaleString()} 원
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NewArrival;
