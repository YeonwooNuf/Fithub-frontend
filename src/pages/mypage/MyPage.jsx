import React from "react";
import { useNavigate } from "react-router-dom";
import "../mypage/MyPage.css";

function MyPage() {
  const navigate = useNavigate();

  const points = 2000; // 적립금 예시 데이터
  const couponCount = 3; // 쿠폰 개수 예시 데이터

  return (
    <div className="mypage-container">
      <h1>마이페이지</h1>

      {/* 적립금과 쿠폰 박스 */}
      <div className="mypage-boxes">
        <div
          className="mypage-box"
          onClick={() => navigate("/points")} // 적립금 상세 페이지로 이동
        >
          <h2>적립금</h2>
          <p>{points.toLocaleString()}원</p>
        </div>
        <div
          className="mypage-box"
          onClick={() => navigate("/coupons")} // 쿠폰 상세 페이지로 이동
        >
          <h2>쿠폰</h2>
          <p>{couponCount}장</p>
        </div>
      </div>

      {/* 세로 리스트 */}
      <ul className="mypage-list">
        <li onClick={() => navigate("/orders")}>
          <span>주문 내역</span>
          <span className="arrow">&gt;</span>
        </li>
        <li onClick={() => navigate("/reviews")}>
          <span>나의 후기</span>
          <span className="arrow">&gt;</span>
        </li>
        <li onClick={() => navigate("/asking")}>
          <span>1:1 문의 내역</span>
          <span className="arrow">&gt;</span>
        </li>
      </ul>
    </div>
  );
}

export default MyPage;
