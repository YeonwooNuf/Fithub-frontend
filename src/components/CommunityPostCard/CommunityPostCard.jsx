import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import axios from "axios";
import "./CommunityPostCard.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CommunityPostCard = ({ post, currentUserId, onDelete }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/community/posts/${post.id}/likes/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLiked(res.data);
      } catch (err) {
        console.error("좋아요 여부 확인 실패", err);
      }
    };
    fetchLikeStatus();
  }, [post.id]);

  const handleLikeToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`/api/community/posts/${post.id}/like`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch (err) {
      console.error("좋아요 토글 실패", err);
    }
  };

  const NextArrow = ({ onClick, currentSlide, slideCount }) => {
    if (currentSlide >= slideCount - 1) return null;
    return (
      <div className="custom-arrow next" onClick={onClick}>
        <svg width="24" height="24" stroke="white" strokeWidth="2" fill="none">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    );
  };

  const PrevArrow = ({ onClick, currentSlide }) => {
    if (currentSlide === 0) return null;
    return (
      <div className="custom-arrow prev" onClick={onClick}>
        <svg width="24" height="24" stroke="white" strokeWidth="2" fill="none">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </div>
    );
  };

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <NextArrow />, 
    prevArrow: <PrevArrow />, 
  };

  const handleDelete = async () => {
    if (window.confirm("정말 이 게시글을 삭제하시겠습니까?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/api/community/posts/${post.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("삭제되었습니다.");
        onDelete(post.id);
      } catch (err) {
        console.error("삭제 실패", err);
        alert("삭제에 실패했습니다.");
      }
    }
  };

  return (
    <div className="post-container">
      <div className="post-header">
        <img src={post.profileImageUrl} alt="프로필" className="profile-img" />
        <div className="nickname">{post.nickname}</div>
        {currentUserId === post.userId && (
          <button className="delete-btn" onClick={handleDelete}>
            🗑 삭제
          </button>
        )}
      </div>

      {post.imageUrls.length > 0 && (
        <div className="post-image-slider">
          <Slider {...sliderSettings}>
            {post.imageUrls.map((url) => (
              <div key={url} className="slider-wrapper">
                <img src={url} alt="snap" className="community-slider-image" />
              </div>
            ))}
          </Slider>
        </div>
      )}

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
                <div className="post-product-brand">{product.brandName}</div>
                <div className="post-product-name">{product.name}</div>
                <div className="post-product-price">
                  {product.price.toLocaleString()}원
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="post-content">
        {post.content.split(" ").map((word, i) =>
          word.startsWith("#") ? (
            <span key={i} className="tag">{word} </span>
          ) : (
            <span key={i}>{word} </span>
          )
        )}
      </div>

      <div className="post-footer">
        <div className="reaction-buttons">
          <span className="like-icon" onClick={handleLikeToggle}>
            {liked ? "❤️" : "🤍"}
          </span>
          <span className="comment-icon">
            💬
          </span>
        </div>
        <div className="like-count-text">좋아요 {likeCount}개</div>
      </div>
    </div>
  );
};

export default CommunityPostCard;
