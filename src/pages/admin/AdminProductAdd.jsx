import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminProduct.css";

function AdminProductAdd() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [description, setDescription] = useState("");
  const [brandId, setBrandId] = useState("");
  const [brands, setBrands] = useState([]);
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    // ✅ 브랜드 목록 가져오기
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/admin/brands", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("브랜드 목록을 불러올 수 없습니다.");
        const data = await response.json();
        setBrands(data.brands);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchBrands();
  }, []);

  // ✅ 상품 추가 기능
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !description || !brandId) {
      setError("모든 필수 정보를 입력하세요.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("sizes", sizes.join(","));
    formData.append("colors", colors.join(","));
    formData.append("description", description);
    formData.append("brandId", brandId);
    if (image) formData.append("image", image);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("상품을 추가할 수 없습니다.");

      alert("상품이 추가되었습니다.");
      navigate("/admin/products");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-product-container">
      <button className="back-btn" onClick={() => navigate("/admin/products")}>⬅ 상품 목록</button>
      <h1 className="title">상품 추가</h1>

      {error && <p className="error">{error}</p>}

      <form className="product-form" onSubmit={handleSubmit}>
        <label>상품명 *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>가격 *</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />

        <label>사이즈 (쉼표로 구분)</label>
        <input
          type="text"
          placeholder="S, M, L, XL"
          onChange={(e) => setSizes(e.target.value.split(",").map((s) => s.trim()))}
        />

        <label>색상 (쉼표로 구분)</label>
        <input
          type="text"
          placeholder="Red, Blue, Black"
          onChange={(e) => setColors(e.target.value.split(",").map((c) => c.trim()))}
        />

        <label>상품 설명 *</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />

        <label>브랜드 *</label>
        <select value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
          <option value="">브랜드 선택</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </select>

        <label>상품 이미지</label>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />

        <button type="submit" className="submit-btn">상품 추가</button>
      </form>
    </div>
  );
}

export default AdminProductAdd;
