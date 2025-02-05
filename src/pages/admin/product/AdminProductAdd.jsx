import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminProductAdd.css";

function AdminProductAdd() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [brandId, setBrandId] = useState("");
  const [brands, setBrands] = useState([]);
  const [category, setCategory] = useState("");
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ✅ 브랜드 목록 가져오기
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/admin/brands", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("브랜드 목록을 불러올 수 없습니다.");

        const data = await response.json();
        setBrands(data);
      } catch (err) {
        console.error("API 오류:", err);
        setError(err.message);
      }
    };

    fetchBrands();
  }, []);

  // ✅ 사이즈 추가 핸들러
  const handleAddSize = () => {
    const newSize = prompt("추가할 사이즈를 입력하세요 (예: S, M, L, 260 등)");
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize]);
    }
  };

  // ✅ 색상 추가 핸들러
  const handleAddColor = () => {
    const newColor = prompt("추가할 색상을 입력하세요 (예: 블랙, 화이트)");
    if (newColor && !colors.includes(newColor)) {
      setColors([...colors, newColor]);
    }
  };

  // ✅ 사이즈 삭제
  const handleRemoveSize = (index) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  // ✅ 색상 삭제
  const handleRemoveColor = (index) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  // ✅ 여러 개의 이미지 업로드 핸들러
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert("최대 5개의 이미지만 업로드할 수 있습니다.");
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  // ✅ 개별 이미지 삭제
  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ 상품 추가 핸들러 (JSON 형식으로 sizes, colors 전송)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("brandId", brandId);
      formData.append("category", category);

      // ✅ JSON.stringify를 사용해 JSON 형식으로 변환하여 전송
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("colors", JSON.stringify(colors));

      // ✅ 여러 개의 이미지 추가
      images.forEach((img) => formData.append("images", img.file));

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("상품을 추가할 수 없습니다.");

      alert("상품이 성공적으로 추가되었습니다.");
      navigate("/admin/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-product-container">
      <button className="back-btn" onClick={() => navigate("/admin/products")}>
        ⬅ 상품 목록으로 돌아가기
      </button>
      <h1>상품 추가</h1>

      <form className="product-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          placeholder="상품명"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="가격"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <textarea
          placeholder="상품 설명"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* ✅ 브랜드 선택 드롭다운 */}
        <select value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
          <option value="">브랜드 선택</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name} ({brand.subName})
            </option>
          ))}
        </select>

        {/* ✅ 카테고리 선택 */}
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">카테고리 선택</option>
          <option value="TOP">상의</option>
          <option value="BOTTOM">하의</option>
          <option value="SHOES">신발</option>
          <option value="ACCESSORY">악세서리</option>
        </select>

        {/* ✅ 사이즈 추가 및 리스트 */}
        <div className="size-container">
          <button type="button" onClick={handleAddSize}>사이즈 추가</button>
          <ul>
            {sizes.map((size, index) => (
              <li key={index}>
                {size} <button onClick={() => handleRemoveSize(index)}>❌</button>
              </li>
            ))}
          </ul>
        </div>

        {/* ✅ 색상 추가 및 리스트 */}
        <div className="color-container">
          <button type="button" onClick={handleAddColor}>색상 추가</button>
          <ul>
            {colors.map((color, index) => (
              <li key={index}>
                {color} <button onClick={() => handleRemoveColor(index)}>❌</button>
              </li>
            ))}
          </ul>
        </div>

        {/* ✅ 여러 개의 이미지 업로드 */}
        <input type="file" multiple onChange={handleImageChange} />

        {/* ✅ 업로드된 이미지 미리보기 */}
        <div className="image-preview-container">
          {images.map((img, index) => (
            <div key={index} className="image-card">
              <img src={img.preview} alt={`상품 이미지 ${index + 1}`} className="image-preview" />
              <button type="button" onClick={() => handleRemoveImage(index)}>삭제</button>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "등록 중..." : "상품 추가"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default AdminProductAdd;
