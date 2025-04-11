import React from "react";
import "./CommunityPostCard.css";

const CommunityPostCard = ({ post }) => {
  return (
    <div className="post-container">
      {/* 작성자 정보 */}
      <div className="post-header">
        <img
          src={post.profileImageUrl}
          className="profile-img"
        />
        <div className="nickname">{post.nickname}</div>
      </div>

      {/* 대표 이미지 (첫 번째 이미지만 표시) */}
      {post.imageUrls.length > 0 && (
        <div className="post-image">
          <img src={post.imageUrls[0]} alt="snap" />
        </div>
      )}

      {/* 연결된 상품 정보 (선택) */}
      {post.product && (
        <div className="product-info">
          <img src={post.product.images[0]} className="product-thumb" />
          <div className="product-text">
            <div className="product-name">{post.product.name}</div>
            <div className="product-price">{post.product.price.toLocaleString()}원</div>
          </div>
        </div>
      )}

      {/* 게시글 내용 */}
      <div className="post-content">{post.content}</div>

      {/* 해시태그 (단순 파싱해서 표현) */}
      <div className="hashtags">
        {post.content
          .split(" ")
          .filter((word) => word.startsWith("#"))
          .map((tag, i) => (
            <span key={i} className="tag">{tag}</span>
          ))}
      </div>

      {/* 좋아요, 댓글 (임시) */}
      <div className="post-footer">
        ❤️ 좋아요 {post.likeCount || 0}개
        <div className="comment">댓글을 남겨주세요</div>
      </div>
    </div>
  );
};

export default CommunityPostCard;
