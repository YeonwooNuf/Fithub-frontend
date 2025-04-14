import React, { useEffect, useState } from "react";
import axios from "axios";
import "./NewArrival.css";
import { Link } from "react-router-dom";

const fixedPositions = [
  { top: "11%", left: "7%" },
  { top: "18%", left: "40%" },
  { top: "11%", left: "71%" },
  { top: "53%", left: "20%" },
  { top: "53%", left: "59%" },
];

const BUBBLE_SIZE = 320;

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
      <h2 className="bubble-title">New Arrival</h2>
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
                <div className="arrival-product-info-popout">
                  <p className="arrival-product-name">{product.name}</p>
                  <p className="arrival-product-price">
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
