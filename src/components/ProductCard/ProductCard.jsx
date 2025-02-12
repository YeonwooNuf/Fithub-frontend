import React from "react";
import "./ProductCard.css"; // ✅ CSS 파일 import

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.title} className="product-image" /> {/* ✅ 클래스 추가 */}
      <div className="product-info">
        <h3>{product.title}</h3>
        <p>{product.description}</p>
        <p className="price">{product.price} 원</p>
      </div>
    </div>
  );
}

export default ProductCard;
