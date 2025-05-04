import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

function ProductCard({ product, onLikeToggle }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      {/* 좋아요 버튼 */}
      <div className="like-container">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLikeToggle();
          }}
          className={`like-button ${product.likedByCurrentUser ? "liked" : ""}`}
        >
          {product.likedByCurrentUser ? "❤️" : "🤍"}
        </button>
        <span className="like-count">{product.likeCount || 0}</span>
      </div>

      {/* 상품 이미지 */}
      <img
        src={product.images?.[0] || "/default-image.jpg"}
        alt={product.name}
        className="product-image"
      />

      {/* 상품 정보 */}
      <div className="card-product-info">
        <h3>{product.name || "상품명 없음"}</h3>
        <p>{product.brandName || "브랜드 없음"}</p>
        <p className="card-price">
          {product.price?.toLocaleString() || "0"} 원
        </p>
      </div>
    </div>
  );
}

export default ProductCard;
