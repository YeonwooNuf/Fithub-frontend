import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../mypage/MyPage.css";

function MyPage() {
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const [points, setPoints] = useState(0);
  const [couponCount, setCouponCount] = useState(0);
  const [profileImage, setProfileImage] = useState(userInfo.profileImage || "/default-profile.jpg");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userInfo.userId) return;
        const token = localStorage.getItem("token");

        // ✅ 프로필 이미지 요청 (기존 값 없을 때만 요청)
        if (!userInfo.profileImage) {
          const profileRes = await fetch(`/api/users/${userInfo.userId}/profile-image`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setProfileImage(profileData.profileImageUrl || "/default-profile.jpg");
          }
        }

        // ✅ 적립금 요청
        const pointsRes = await fetch(`/api/points/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (pointsRes.ok) {
          const pointsData = await pointsRes.json();
          setPoints(pointsData.totalPoints || 0);
        }

        // ✅ 쿠폰 개수 요청
        const couponsRes = await fetch(`/api/coupons`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (couponsRes.ok) {
          const couponsData = await couponsRes.json();
          setCouponCount(couponsData.count || 0);
        }
      } catch (err) {
        console.error("데이터를 불러오는 중 오류 발생:", err);
      }
    };

    fetchUserData();
  }, [userInfo.userId]);

  return (
    <div className="mypage-container">
      <h1>마이페이지</h1>
      <div className="mypage-profile">
        <img
          src={profileImage}
          alt="프로필"
          className="profile-image"
          onError={() => setProfileImage("/default-profile.jpg")} // 오류 발생 시 기본 이미지
        />
        <h1 className="nickname">{userInfo.nickname || "사용자"}</h1>
      </div>

      <div className="mypage-boxes">
        <div className="mypage-box" onClick={() => navigate("/points")}>
          <h2>적립금</h2>
          <p>{points.toLocaleString()} 원</p>
        </div>
        <div className="mypage-box" onClick={() => navigate("/coupons")}>
          <h2>쿠폰</h2>
          <p>{couponCount.toLocaleString()} 장</p>
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
