import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CommunityPostCard from "../../components/CommunityPostCard/CommunityPostCard";
import "./Community.css";

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);  // ✅ 사용자 ID 상태 추가
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/community/posts")
      .then(res => {
        setPosts(res.data);
        console.log("🔥 전체 게시글:", res.data);
      })
      .catch(err => console.error("커뮤니티 게시글 불러오기 실패", err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.userId); // ✅ JWT에서 userId 추출
    }
  }, []);

  // ✅ 삭제 후 리스트 갱신 함수
  const handleDelete = (deletedId) => {
    setPosts(prev => prev.filter(p => p.id !== deletedId));
  };

  return (
    <div className="community-page">
      <div className="community-header">
        <h2 className="community-title">패션 스냅 커뮤니티</h2>
      </div>
      <div className="post-list">
        {posts.map((post) => (
          <CommunityPostCard
            key={post.id}
            post={post}
            currentUserId={userId}       // ✅ 전달
            onDelete={handleDelete}      // ✅ 전달
          />
        ))}
      </div>
      <button className="floating-write-button" onClick={() => navigate("/community/write")}>
        <span className="plus-icon">＋</span>
      </button>
    </div>
  );
};

export default Community;
