import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CommunityWrite.css";

const CommunityWrite = () => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios.get("/api/products")
      .then(res => setProducts(res.data.products))
      .catch(err => console.error("상품 목록 조회 실패", err));
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);  // 기존 이미지에 추가
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = async () => {

    if (!content.trim()) return alert("내용을 작성해주세요.");

    const formData = new FormData();
    formData.append("content", content);
    selectedProducts.forEach((id) => {
      formData.append("productIds", id); // ✅ 서버에서 List<Long>로 받기 위해 productIds로
    });
    images.forEach((img) => formData.append("images", img));

    for (let pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }

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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div key={idx} className="preview-item">
            <img src={URL.createObjectURL(file)} alt="preview" />
            <button
              type="button"
              className="remove-btn"
              onClick={() => handleRemoveImage(idx)}
            >
              ✖
            </button>
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="🔍 상품명으로 검색"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="product-list">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className={`product-item ${selectedProducts.includes(p.id) ? "selected" : ""}`}
            onClick={() => toggleProduct(p.id)}
          >
            <img src={p.images[0]} alt={p.name} />
            <div>{p.name}</div>
          </div>
        ))}
      </div>

      <button className="post-button" onClick={handleSubmit}>게시하기</button>
    </div>
  );
};

export default CommunityWrite;
