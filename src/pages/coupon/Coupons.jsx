import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Coupons.css";

function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [message, setMessage] = useState("");

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

  const handleRegisterCoupon = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "/api/coupons/register",
        { couponCode },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setMessage("쿠폰이 성공적으로 등록되었습니다.");
        setCoupons((prevCoupons) => [...prevCoupons, response.data.coupon]); // 새 쿠폰 추가
      } else {
        setMessage(response.data.message || "쿠폰 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("쿠폰 등록 중 오류 발생:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message); // ✅ 서버의 오류 메시지 표시 (예: 이미 등록된 쿠폰입니다.)
      } else {
        setMessage("쿠폰 등록에 실패했습니다.");
      }
    }
  };

  return (
    <div className="coupons-container">
      <h1>나의 쿠폰</h1>

      <form onSubmit={handleRegisterCoupon} className="coupon-register-form">
        <input
          type="text"
          placeholder="쿠폰 코드를 입력하세요"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          required
        />
        <button type="submit">쿠폰 등록하기</button>
      </form>
      {message && <p className="message">{message}</p>}

      {error ? (
        <p className="error">{error}</p>
      ) : coupons.length > 0 ? (
        <ul className="coupons-list">
          {coupons.map((coupon, index) => (
            <li key={index} className="coupon-item">
              <p>{coupon.name}</p>
              <p>할인율: {coupon.discount}%</p>
              <p>최대 할인 금액: {coupon.maxDiscountAmount.toLocaleString()}원</p>
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
