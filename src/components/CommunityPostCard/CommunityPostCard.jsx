import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import axios from "axios";
import "./CommunityPostCard.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Heart, MessageCircle } from "lucide-react";

const CommunityPostCard = ({ post, currentUserId, onDelete }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [myProfileUrl, setMyProfileUrl] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

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

    const fetchComments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/community/comments/${post.id}`, {
          headers: { Authorization: `Bearer ${token}` } // ✅ 인증 추가
        });
        console.log("💬 댓글 목록:", res.data);
        setComments(res.data);
      } catch (err) {
        console.error("댓글 조회 실패", err);
      }
    };

    const getMyProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get("/api/users/mypage/profile-image", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyProfileUrl(res.data.profileImageUrl);
      } catch (err) {
        console.error("내 프로필 이미지 조회 실패", err);
      }
    };

    fetchLikeStatus();
    fetchComments();
    getMyProfile();
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

  const toggleComments = () => {
    setShowComments(prev => !prev);
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `/api/community/comments/${post.id}`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(prev => [...prev, res.data]);
      setNewComment("");
    } catch (err) {
      console.error("댓글 작성 실패", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/community/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error("댓글 삭제 실패", err);
    }
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyContent.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `/api/community/comments/${post.id}?parentId=${parentId}`,
        { content: replyContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(prev => [...prev, res.data]);
      setReplyContent("");
      setReplyTo(null); // 입력창 닫기
    } catch (err) {
      console.error("답글 작성 실패", err);
    }
  };

  const renderContentWithTags = (text) => {
    const regex = /#[^\s#]+/g; // #으로 시작해서 공백 또는 #이 아닌 문자들
    const parts = [];
    let lastIndex = 0;

    text.replace(regex, (match, offset) => {
      // 일반 텍스트 부분 추가
      if (offset > lastIndex) {
        parts.push(text.slice(lastIndex, offset));
      }

      // 해시태그 부분
      parts.push(<span className="tag" key={offset}>{match}</span>);

      lastIndex = offset + match.length;
    });

    // 마지막 일반 텍스트
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
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

  const latestComment = comments.length > 0 ? comments[comments.length - 1] : null;

  return (
    <div className="post-container">
      <div className="post-header">
        <img src={post.profileImageUrl} alt="프로필" className="post-profile-img" />
        <div className="post-nickname">{post.nickname}</div>
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
              <img src={product.images[0]} alt={product.name} className="product-thumb" />
              <div className="product-text">
                <div className="post-product-brand">{product.brandName}</div>
                <div className="post-product-name">{product.name}</div>
                <div className="post-product-price">{product.price.toLocaleString()}원</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="post-content">
        {renderContentWithTags(post.content)}
      </div>

      <div className="post-footer">
        <div className="reaction-buttons">
          <span className="like-icon" onClick={handleLikeToggle} style={{ fontSize: "24px" }}>
            <Heart color={liked ? "red" : "black"} fill={liked ? "red" : "none"} />
          </span>
          <span
            className="comment-icon"
            onClick={toggleComments}
            style={{ fontSize: "24px", marginLeft: "8px", cursor: "pointer" }}
          >
            <MessageCircle color="black" fill="none" />
          </span>
        </div>
        <div className="like-count-text" style={{ marginLeft: "6px" }}>좋아요 {likeCount}개</div>

        {!showComments && latestComment ? (
          <div className="latest-comment">
            <img src={latestComment.profileImageUrl} alt="댓글 프로필" className="comment-profile" />
            <span className="comment-nickname">{latestComment.nickname}</span>
            <span className="comment-content">{latestComment.content}</span>
          </div>
        ) : null}

        {!showComments && !latestComment && (
          <div className="no-comment">첫 댓글을 작성해주세요.</div>
        )}

        {!showComments && comments.length > 0 && (
          <div className="view-comments" onClick={toggleComments}>
            댓글 {comments.length}개 보기
          </div>
        )}

        {showComments && (
          <div className="comment-section">
            {comments.map(c => (
              <div key={c.id} className="comment-item">
                {/* 왼쪽: 프사 + 닉네임 + 내용 */}
                <div className="comment-left">
                  <img src={c.profileImageUrl} alt="댓글 프로필" className="comment-profile" />
                  <div className="comment-body">
                    <span className="comment-nickname">{c.nickname}</span>
                    <span className="comment-content">{c.content}</span>
                  </div>
                </div>

                {/* 오른쪽: 삭제/답글 */}
                <div className="comment-actions">
                  {c.userId === currentUserId && (
                    <button className="comment-delete" onClick={() => handleDeleteComment(c.id)}>삭제</button>
                  )}
                  <button className="comment-reply" onClick={() => setReplyTo(c.id)}>답글</button>
                </div>

                {/* ✅ 대댓글 입력창 (선택된 댓글 id와 같을 때만 보여짐) */}
                {replyTo === c.id && (
                  <div className="reply-form">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="답글을 입력하세요..."
                      className="reply-input"
                    />
                    <button onClick={() => handleReplySubmit(c.id)} className="reply-submit-btn">작성</button>
                  </div>
                )}
              </div>
            ))}

            <div className="comment-form">
              {myProfileUrl && (
                <img src={myProfileUrl} alt="내 프로필" className="comment-profile" />
              )}
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="comment-input"
              />
              <button onClick={handleCommentSubmit} className="comment-submit-btn">작성</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPostCard;
