import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "../mypage/MyPage.css";

function MyPage() {
  const { userInfo } = useContext(AuthContext); // 사용자 정보 가져오기
  const navigate = useNavigate();

  const [points, setPoints] = useState(0);
  const [couponCount, setCouponCount] = useState(0);

  // 적립금 및 쿠폰 개수 가져오기
  useEffect(() => {
    const fetchUserPointsAndCoupons = async () => {
      try {
        if (!userInfo.username) return;

        // 적립금 가져오기
        const pointsResponse = await fetch(`/api/points?username=${userInfo.username}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!pointsResponse.ok) {
          throw new Error(`Failed to fetch points: ${pointsResponse.status}`);
        }
        const pointsData = await pointsResponse.json();
        setPoints(pointsData.points || 0);

        // 쿠폰 개수 가져오기
        const couponsResponse = await fetch(`/api/coupons?username=${userInfo.username}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!couponsResponse.ok) {
          throw new Error(`Failed to fetch coupons: ${couponsResponse.status}`);
        }
        const couponsData = await couponsResponse.json();
        setCouponCount(couponsData.count || 0);

      } catch (err) {
        console.error(err);
        setPoints(0); // 에러 발생 시 기본값 설정
        setCouponCount(0); // 에러 발생 시 기본값 설정
      }
    };

    fetchUserPointsAndCoupons();
  }, [userInfo.username]);

  return (
    <div className="mypage-container">
      <h1>마이페이지</h1>
      <div className="mypage-profile">
        <img
          src={userInfo.profileImage || "/default-profile.png"}
          alt="프로필"
          className="profile-image"
        />
        <p className="nickname">{userInfo.nickname || "사용자"}</p>
      </div>

      <div className="mypage-boxes">
        <div className="mypage-box" onClick={() => navigate("/points")}>
          <h2>적립금</h2>
          <p>{points.toLocaleString()}원</p>
        </div>
        <div className="mypage-box" onClick={() => navigate("/coupons")}>
          <h2>쿠폰</h2>
          <p>{couponCount.toLocaleString()}장</p>
        </div>
      </div>

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
