import React from "react";
import Slider from "react-slick";
import axios from "axios";
import "./CommunityPostCard.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CommunityPostCard = ({ post, currentUserId, onDelete }) => {
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  console.log("🧪 이미지 URL 리스트:", post.imageUrls);

  const handleDelete = async () => {
    if (window.confirm("정말 이 게시글을 삭제하시겠습니까?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/api/community/posts/${post.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("삭제되었습니다.");
        onDelete(post.id); // 부모에서 리스트 갱신
      } catch (err) {
        console.error("삭제 실패", err);
        alert("삭제에 실패했습니다.");
      }
    }
  };

  return (
    <div className="post-container">
      {/* 작성자 정보 */}
      <div className="post-header">
        <img
          src={post.profileImageUrl}
          alt="프로필"
          className="profile-img"
        />
        <div className="nickname">{post.nickname}</div>
        {/* ✅ 본인이 작성한 글일 경우 삭제 버튼 표시 */}
        {currentUserId === post.userId && (
          <button className="delete-btn" onClick={handleDelete}>
            🗑 삭제
          </button>
        )}
      </div>

      {/* 이미지 슬라이더 */}
      {post.imageUrls.length > 0 && (
        <div className="post-image-slider">
          <Slider {...sliderSettings}>
          {post.imageUrls.map((url) => (
  <div key={url}>
    <img src={url} alt="snap" className="slider-image" />
  </div>
))}
          </Slider>
        </div>
      )}

      {/* 연결된 상품 정보 */}
      {post.products?.length > 0 && (
        <div className="linked-products">
          {post.products.map((product, index) => (
            <div className="post-product-card" key={index}>
              <img
                src={product.images[0]}
                alt={product.name}
                className="product-thumb"
              />
              <div className="product-text">
                <div className="product-brand">{product.brandName}</div>
                <div className="product-name">{product.name}</div>
                <div className="product-price">
                  {product.price.toLocaleString()}원
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 게시글 본문 */}
      <div className="post-content">
        {post.content.split(" ").map((word, i) =>
          word.startsWith("#") ? (
            <span key={i} className="tag">{word} </span>
          ) : (
            <span key={i}>{word} </span>
          )
        )}
      </div>

      {/* 좋아요 & 댓글 */}
      <div className="post-footer">
        ❤️ 좋아요 {post.likeCount || 0}개
        <div className="comment">댓글을 남겨주세요</div>
      </div>
    </div>
  );
};

export default CommunityPostCard;
