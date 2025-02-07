import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddCoupon.css";

function AddCoupon() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    discount: 0,
    maxDiscountAmount: 0,
    expiryDate: "",
    description: "",
    target: "ALL_PRODUCTS",
    targetValue: "",
    distributionType: "AUTO",
    couponCode: "",
  });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const token = localStorage.getItem("token");

  // ✅ 브랜드 및 카테고리 목록 불러오기
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get("/api/admin/brands", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBrands(response.data);
      } catch (error) {
        console.error("브랜드 목록 불러오기 실패:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/admin/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data);
      } catch (error) {
        console.error("카테고리 목록 불러오기 실패:", error);
      }
    };

    fetchBrands();
    fetchCategories();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const couponData = { ...form, userId: null }; // 또는 특정 userId
    try {
      await axios.post("/api/admin/coupons/create", couponData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("쿠폰이 성공적으로 추가되었습니다.");
      navigate("/admin/coupons");
    } catch (error) {
      console.error("쿠폰 추가 중 오류 발생:", error);
      alert("쿠폰 추가에 실패했습니다.");
    }
  };

  return (
    <div className="admin-coupon">
      <button className="back-btn" onClick={() => navigate("/admin/coupons")}>⬅ 쿠폰 목록으로 돌아가기</button>
      <h1>쿠폰 추가하기</h1>

      <form onSubmit={handleSubmit} className="coupon-form">
        <label>
          쿠폰명:
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          할인율(%):
          <input type="number" name="discount" value={form.discount} onChange={handleChange} required />
        </label>

        <label>
          최대 할인 금액:
          <input type="number" name="maxDiscountAmount" value={form.maxDiscountAmount} onChange={handleChange} required />
        </label>

        <label>
          만료일:
          <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} required />
        </label>

        <label>
          설명:
          <textarea name="description" value={form.description} onChange={handleChange} required />
        </label>

        <label>
          적용 대상:
          <select name="target" value={form.target} onChange={handleChange}>
            <option value="ALL_PRODUCTS">전체 상품</option>
            <option value="BRAND">특정 브랜드</option>
            <option value="CATEGORY">특정 카테고리</option>
          </select>
        </label>

        {/* ✅ 브랜드 목록 드롭다운 */}
        {form.target === "BRAND" && (
          <label>
            브랜드 선택:
            <select name="targetValue" value={form.targetValue} onChange={handleChange} required>
              <option value="">브랜드 선택</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* ✅ 카테고리 목록 드롭다운 */}
        {form.target === "CATEGORY" && (
          <label>
            카테고리 선택:
            <select name="targetValue" value={form.targetValue} onChange={handleChange} required>
              <option value="">카테고리 선택</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          지급 방식:
          <select name="distributionType" value={form.distributionType} onChange={handleChange}>
            <option value="AUTO">자동 지급</option>
            <option value="MANUAL">수동 등록</option>
          </select>
        </label>

        {form.distributionType === "MANUAL" && (
          <label>
            수동 등록 쿠폰 코드:
            <input
              type="text"
              name="couponCode"
              value={form.couponCode}
              onChange={(e) =>
                // 쿠폰 코드 입력 시 자동 대문자 변환
                setForm({ ...form, couponCode: e.target.value.toUpperCase() })
              }
              required
            />
          </label>
        )}
        <button type="submit" className="add-btn">쿠폰 추가하기</button>
      </form>
    </div>
  );
}

export default AddCoupon;
