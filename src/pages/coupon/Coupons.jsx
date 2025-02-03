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
              <p>Discount: {coupon.discount}%</p>
              <p>Expires: {coupon.expiryDate}</p>
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
