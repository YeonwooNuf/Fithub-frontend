import React, { useEffect, useState } from "react";
import "./Coupons.css";

function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/coupons", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch coupons: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setCoupons(data.coupons || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load coupons.");
      });
  }, []);

  const getTargetDescription = (coupon) => {
    if (coupon.target === "ALL_PRODUCTS") return "전체 상품";
    if (coupon.target === "BRAND") return `브랜드: ${coupon.targetValue}`;
    if (coupon.target === "CATEGORY") return `카테고리: ${coupon.targetValue}`;
    return "적용 대상 정보 없음";
  };

  return (
    <div className="coupons-container">
      <h1>나의 쿠폰</h1>
      {error ? (
        <p className="error">{error}</p>
      ) : coupons.length > 0 ? (
        <ul className="coupons-list">
          {coupons.map((coupon, index) => (
            <li key={index} className="coupon-item">
              <p>{coupon.name}</p>
              <p>할인율: {coupon.discount}%</p>
              <p>최대 할인 금액: {coupon.maxDiscountAmount.toLocaleString()}원</p> {/* ✅ 최대 할인 금액 표시 */}
              <p>만료일: {coupon.expiryDate}</p>
              <p>적용 대상: {getTargetDescription(coupon)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>사용 가능한 쿠폰이 없습니다.</p>
      )}
    </div>
  );
}

export default Coupons;
