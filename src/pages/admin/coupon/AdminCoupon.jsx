import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminCoupon.css";

function AdminCoupon() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/api/admin/coupons/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(response.data);
    } catch (error) {
      console.error("쿠폰 목록을 가져오는 중 오류 발생:", error);
      setError("쿠폰 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const searchCoupon = async () => {
    if (!searchQuery.trim()) {
      fetchCoupons();
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`/api/admin/coupons/search?keyword=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(response.data);
    } catch (error) {
      console.error("쿠폰 검색 중 오류 발생:", error);
      setError("쿠폰 검색에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (couponId) => {
    if (window.confirm("정말로 삭제하시겠습니까?")) {
      try {
        await axios.delete(`/api/admin/coupons/${couponId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("쿠폰이 삭제되었습니다.");
        fetchCoupons();
      } catch (error) {
        console.error("쿠폰 삭제 중 오류 발생:", error);
        alert("쿠폰 삭제에 실패했습니다.");
      }
    }
  };

  return (
    <div className="admin-coupon">
      <button className="back-btn" onClick={() => navigate("/admin")}>⬅ 관리자 대시보드</button>
      <h1>쿠폰 관리</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="쿠폰명 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={searchCoupon}>검색</button>
        <button className="add-btn" onClick={() => navigate("/admin/coupons/add")}>쿠폰 추가하기</button>
      </div>

      {loading ? (
        <p>로딩 중...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : coupons.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>쿠폰명</th>
              <th>할인율(%)</th>
              <th>최대 할인 금액</th>
              <th>만료일</th>
              <th>설명</th>
              <th>수정/삭제</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td>{coupon.name}</td>
                <td>{coupon.discount}%</td>
                <td>{coupon.maxDiscountAmount.toLocaleString()}원</td>
                <td>{coupon.expiryDate}</td>
                <td>{coupon.description}</td>
                <td>
                  <button className="update-btn" onClick={() => navigate(`/admin/coupons/update/${coupon.id}`)}>수정</button>
                  <button className="delete-btn" onClick={() => handleDelete(coupon.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-data">쿠폰이 없습니다.</p>
      )}
    </div>
  );
}

export default AdminCoupon;
