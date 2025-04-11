import React, { useEffect, useState } from "react";
import axios from "axios";
import "./NewArrival.css";
import { Link } from "react-router-dom";

const fixedPositions = [
  { top: "10%", left: "6%" },
  { top: "17%", left: "39%" },
  { top: "10%", left: "70%" },
  { top: "52%", left: "19%" },
  { top: "52%", left: "58%" },
];

const BUBBLE_SIZE = 350;

const NewArrival = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("/api/products/latest")
      .then((res) => {
        const data = res.data.slice(0, 5);
        setProducts(data);
      })
      .catch((err) => console.error("❌ 신상품 불러오기 실패", err));
  }, []);

  return (
    <div className="bubble-container">
      <h2 className="bubble-title">최근 발매 상품</h2>
      {products.map((product, idx) => {
        const { top, left } = fixedPositions[idx];
        return (
          <div
            className="product-wrapper"
            key={product.id}
            style={{
              top,
              left,
              width: `${BUBBLE_SIZE}px`,
            }}
          >
            <div className="bubble-inner">
              <Link
                to={`/product/${product.id}`}
                className="bubble-item"
                key={product.id}
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
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NewArrival;
