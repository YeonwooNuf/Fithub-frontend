import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminProduct.css";

function AdminProduct() {
  const [products, setProducts] = useState([]); // ✅ 초기값을 빈 배열로 설정
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ 상품 목록 불러오기
  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("상품 목록을 불러올 수 없습니다.");

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 특정 상품 검색
  const searchProduct = async () => {
    if (!searchQuery.trim()) {
      fetchProducts();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/products/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("상품을 찾을 수 없습니다.");

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 상품 삭제 기능
  const deleteProduct = async (productId) => {
    if (!window.confirm("정말로 이 상품을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("상품을 삭제할 수 없습니다.");

      alert("상품이 삭제되었습니다.");
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="admin-product-container">
      <button className="back-btn" onClick={() => navigate("/admin")}>⬅ 관리자 대시보드</button>
      <h1 className="title">상품 관리</h1>

      {/* 검색 및 추가 버튼 */}
      <div className="search-box">
        <input
          type="text"
          placeholder="상품명 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          />
        <button onClick={searchProduct}>검색</button>
        <button className="add-btn" onClick={() => navigate("/admin/products/add")}>상품 추가</button>
      </div>

      {loading ? (
        <p>로딩 중...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : products.length > 0 ? (
        <table className="product-table">
          <thead>
            <tr>
              <th>상품명</th>
              <th>가격</th>
              <th>브랜드</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.price.toLocaleString()}원</td>
                <td>{product.brand.name}</td>
                <td>
                  <button className="edit-btn" onClick={() => navigate(`/admin/products/edit/${product.id}`)}>수정</button>
                  <button className="delete-btn" onClick={() => deleteProduct(product.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-data">상품이 없습니다.</p>
      )}
    </div>
  );
}

export default AdminProduct;
