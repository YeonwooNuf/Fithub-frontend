import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ useNavigate 추가
import "./ProductCard.css"; // 스타일 파일 import

function ProductCard({ product, onLikeToggle }) {
  const navigate = useNavigate(); // ✅ useNavigate 훅 사용

  // ✅ 상품 클릭 시 상세 페이지로 이동
  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card" onClick={handleCardClick}> {/* ✅ 클릭 이벤트 추가 */}
      <img
        src={product.imageUrl}
        alt={product.title}
        className="product-image"
      />
      <div className="product-info">
        <h3>{product.title}</h3>
        <p>{product.description}</p>
        <p className="price">{product.price} 원</p>

        {/* ✅ 좋아요 버튼 클릭 시 상세 페이지 이동 방지 */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // ✅ 좋아요 클릭 시 페이지 이동 방지
            onLikeToggle();
          }}
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
