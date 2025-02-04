import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminBrand.css";

function AdminBrand() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState("");
  const [subName, setSubName] = useState(""); // 🔥 추가된 필드 (서브 브랜드명)
  const [logoFile, setLogoFile] = useState(null);
  const [editBrandId, setEditBrandId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ✅ 브랜드 목록 불러오기
  const fetchBrands = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/brands", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("브랜드 목록을 불러올 수 없습니다.");

      const data = await response.json();
      setBrands(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 브랜드 추가 또는 수정
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("subName", subName); // 🔥 추가된 필드 (서브 브랜드명)
      if (logoFile) formData.append("logo", logoFile);

      const method = editBrandId ? "PUT" : "POST";
      const url = editBrandId ? `/api/admin/brands/${editBrandId}` : "/api/admin/brands";

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("브랜드를 저장할 수 없습니다.");

      setName("");
      setSubName(""); // 🔥 초기화
      setLogoFile(null);
      setEditBrandId(null);
      fetchBrands();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 브랜드 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/brands/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("브랜드를 삭제할 수 없습니다.");

      fetchBrands();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return (
    <div className="admin-brand-container">
      <button className="back-btn" onClick={() => navigate("/admin")}>
        ⬅ 관리자 대시보드
      </button>
      <h1>브랜드 관리</h1>

      <form className="brand-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          placeholder="브랜드명"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="브랜드명(서브)"
          value={subName}
          onChange={(e) => setSubName(e.target.value)}
          required
        />
        <input
          type="file"
          onChange={(e) => setLogoFile(e.target.files[0])}
          required={!editBrandId}
        />
        <button type="submit">{editBrandId ? "브랜드 수정" : "브랜드 추가"}</button>
      </form>

      {loading && <p>로딩 중...</p>}
      {error && <p className="error">{error}</p>}

      <table className="brand-table">
        <thead>
          <tr>
            <th>로고</th>
            <th>브랜드명</th>
            <th>브랜드명(서브)</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.id}>
              <td>
                <img src={brand.logoUrl} alt={brand.name} className="brand-logo" />
              </td>
              <td>{brand.name}</td>
              <td>{brand.subName}</td>
              <td>
                <button className="delete-btn" onClick={() => handleDelete(brand.id)}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminBrand;
