import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css"; // 스타일 파일 import

function ProductCard({ product, onLikeToggle }) {
  const navigate = useNavigate();

  // ✅ 상품 클릭 시 상세 페이지로 이동
  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      {/* ✅ 좋아요 버튼을 이미지 내부 우측 상단에 배치 */}
      <div className="like-container">
        <button
          onClick={(e) => {
            e.stopPropagation(); // ✅ 좋아요 클릭 시 상세페이지 이동 방지
            onLikeToggle();
          }}
          className={`like-button ${product.likedByCurrentUser ? "liked" : ""}`}
        >
          {product.likedByCurrentUser ? "❤️" : "🤍"}
        </button>
        <span className="like-count">{product.likeCount || 0}</span>
      </div>

      {/* ✅ 상품 이미지 */}
      <img src={product.imageUrl} alt={product.title} className="product-image" />

      {/* ✅ 상품 정보 */}
      <div className="card-product-info">
        <h3>{product.title}</h3>
        <p>{product.description}</p>
        <p className="price">{product.price.toLocaleString()} 원</p>
      </div>
    </div>
  );
}

export default ProductCard;
