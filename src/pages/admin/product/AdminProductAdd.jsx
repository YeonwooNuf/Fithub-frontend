import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminProductAdd.css";

function AdminProductAdd() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [brandId, setBrandId] = useState("");
  const [brands, setBrands] = useState([]);
  const [category, setCategory] = useState(""); // ✅ 카테고리 추가
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

  // ✅ 파일 업로드 미리보기
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ✅ 사이즈 추가
  const handleAddSize = () => {
    const newSize = prompt("추가할 사이즈를 입력하세요:");
    if (newSize) setSizes([...sizes, newSize]);
  };

  // ✅ 색상 추가
  const handleAddColor = () => {
    const newColor = prompt("추가할 색상을 입력하세요:");
    if (newColor) setColors([...colors, newColor]);
  };

  // ✅ 상품 추가 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);
      if (imageFile) formData.append("image", imageFile);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("colors", JSON.stringify(colors));
      formData.append("brandId", brandId);
      formData.append("category", category); // ✅ 카테고리 추가

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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

        {/* ✅ 이미지 미리보기 */}
        {imagePreview && <img src={imagePreview} alt="미리보기" className="image-preview" />}
        <input type="file" onChange={handleImageChange} required />

        {/* ✅ 브랜드 선택 드롭다운 */}
        <select value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
          <option value="">브랜드 선택</option>
          {brands.length > 0 ? (
            brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name} ({brand.subName})
              </option>
            ))
          ) : (
            <option disabled>브랜드 없음</option>
          )}
        </select>

        {/* ✅ 카테고리 선택 */}
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">카테고리 선택</option>
          <option value="TOP">상의</option>
          <option value="BOTTOM">하의</option>
          <option value="SHOES">신발</option>
          <option value="ACCESSORY">악세서리</option>
        </select>

        {/* ✅ 사이즈 추가 버튼 */}
        <button type="button" onClick={handleAddSize}>사이즈 추가</button>
        <p>{sizes.join(", ")}</p>

        {/* ✅ 색상 추가 버튼 */}
        <button type="button" onClick={handleAddColor}>색상 추가</button>
        <p>{colors.join(", ")}</p>

        <button type="submit" disabled={loading}>
          {loading ? "등록 중..." : "상품 추가"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default AdminProductAdd;
