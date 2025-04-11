import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CommunityPostCard from "../../components/CommunityPostCard/CommunityPostCard";
import "./Community.css";

const Community = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/community/posts")
      .then(res => setPosts(res.data))
      .catch(err => console.error("커뮤니티 게시글 불러오기 실패", err));
  }, []);

  return (
    <div className="community-page">
      <div className="community-header">
        <h2 className="title">👗 패션 스냅 커뮤니티</h2>
        <button className="write-button" onClick={() => navigate("/community/write")}>
          ✍️ 작성하기
        </button>
      </div>

      <div className="post-list">
        {posts.map(post => (
          <CommunityPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Community;
