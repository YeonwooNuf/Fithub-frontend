import React from "react";
import "./ProductCard.css"; // 스타일 파일 import

function ProductCard({ product, onLikeToggle }) {
  return (
    <div className="product-card">
      <img
        src={product.imageUrl}
        alt={product.title}
        className="product-image"
      />
      <div className="product-info">
        <h3>{product.title}</h3>
        <p>{product.description}</p>
        <p className="price">{product.price} 원</p>

        {/* ✅ 좋아요 버튼 수정 */}
        <button
          onClick={onLikeToggle}
          className={`like-button ${product.likedByCurrentUser ? "liked" : ""}`}
        >
          {product.likedByCurrentUser ? "❤️" : "🤍"}{" "}
          <span className="like-count">{product.likeCount || 0}</span>
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
