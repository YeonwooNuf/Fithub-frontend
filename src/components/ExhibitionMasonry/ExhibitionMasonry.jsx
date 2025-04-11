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

  useEffect(() => {
    axios.get("/api/products/latest")
      .then(res => setProducts(res.data))
      .catch(err => console.error("❌ 신상품 불러오기 실패", err));
  }, []);

  return (
    <section className="exhibition-masonry">
      <h2 className="masonry-title">신상품 추천</h2>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-column"
      >
        {products.map(product => (
          <Link
            to={`/products/${product.id}`}
            className="masonry-item"
            key={product.id}
          >
            <div className="image-box">
              <img src={product.images[0]} alt={product.name} />
              <div className="image-overlay">
                <p>{product.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </Masonry>
    </section>
  );
};

export default ExhibitionMasonry;
