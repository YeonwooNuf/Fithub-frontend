import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CommunityWrite.css";

const CommunityWrite = () => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [productId, setProductId] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // 상품 리스트 불러오기
    axios.get("/api/products")
      .then(res => setProducts(res.data.products))
      .catch(err => console.error("상품 목록 조회 실패", err));
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return alert("내용을 작성해주세요.");

    const formData = new FormData();
    formData.append("content", content);
    if (productId) formData.append("productId", productId);
    images.forEach((img) => formData.append("images", img));

    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/community/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      alert("게시글이 등록되었습니다.");
      window.location.href = "/community";
    } catch (err) {
      console.error("게시글 등록 실패", err);
      alert("업로드 실패");
    }
  };

  return (
    <div className="write-page">
      <h2>📷 패션 스냅 공유</h2>
      <textarea
        placeholder="내용을 입력하세요 (#해시태그 사용 가능)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <label className="upload-btn">
        + 이미지 추가
        <input type="file" multiple accept="image/*" onChange={handleImageChange} hidden />
      </label>

      <div className="preview">
        {images.map((file, idx) => (
          <img key={idx} src={URL.createObjectURL(file)} alt="preview" />
        ))}
      </div>

      <select onChange={(e) => setProductId(e.target.value)} defaultValue="">
        <option value="" disabled>🔗 연결할 상품 선택 (선택)</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <button onClick={handleSubmit}>게시하기</button>
    </div>
  );
};

export default CommunityWrite;
