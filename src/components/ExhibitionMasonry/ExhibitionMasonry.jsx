import React, { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ExhibitionMasonry.css";

const breakpointColumnsObj = {
  default: 3,
  1100: 2,
  700: 1,
};

const ExhibitionMasonry = () => {
  const [products, setProducts] = useState([]);
  const [heights, setHeights] = useState([]);

  useEffect(() => {
    axios
      .get("/api/products/latest")
      .then((res) => {
        const data = res.data.slice(0, 5); // ✅ 상위 5개만
        setProducts(data);

        // ✅ 이미지 높이 랜덤 지정 (예: 260~360px 사이)
        const randomHeights = data.map(() => Math.floor(Math.random() * 300) + 370);
        setHeights(randomHeights);
      })
      .catch((err) => console.error("❌ 신상품 불러오기 실패", err));
  }, []);

  return (
    <section className="exhibition-masonry">
      <h2 className="masonry-title">신상품 추천</h2>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-column"
      >
        {products.map((product, idx) => (
          <Link
            to={`/products/${product.id}`}
            className="masonry-item"
            key={product.id}
          >
            <div className="image-box">
              <img
                src={product.images[0]}
                alt={product.name}
                style={{
                  height: `${heights[idx]}px`, // ✅ 랜덤 높이
                  width: "auto",               // ✅ 가로는 비율 유지
                  display: "block",
                  objectFit: "contain",        // ✅ 이미지 비율 보존
                  borderRadius: "8px"
                }}
              />
              <div className="image-overlay">
                <p>{product.name}</p>
                <p>{product.price.toLocaleString()} 원</p>
              </div>
            </div>
          </Link>
        ))}
      </Masonry>
    </section>
  );
};

export default ExhibitionMasonry;
