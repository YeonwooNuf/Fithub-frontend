import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../mypage/MyPage.css";

function MyPage() {
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const [points, setPoints] = useState(null);
  const [couponCount, setCouponCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(userInfo.profileImageUrl);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userInfo.userId) return;
        const token = localStorage.getItem("token");

        setLoading(true);

        const [pointsRes, couponsRes, profileRes] = await Promise.all([
          fetch(`/api/points/balance`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/coupons/count`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/users/mypage`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (pointsRes.ok) {
          const pointsData = await pointsRes.json();
          setPoints(pointsData.totalPoints || 0);
        }

        if (couponsRes.ok) {
          const couponsData = await couponsRes.json();
          setCouponCount(couponsData.count || 0);
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfileImage(`${profileData.profileImageUrl}`);
        }
      } catch (err) {
        console.error("데이터를 불러오는 중 오류 발생:", err);
      } finally {
        setLoading(false);
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
        />
        <h1 className="nickname">{userInfo.nickname || "사용자"}</h1>
      </div>

      <div className="mypage-boxes">
        <div className="mypage-box" onClick={() => navigate("/points")}> 
          <h2>적립금</h2>
          {loading ? <p>로딩 중...</p> : <p>{(points ?? 0).toLocaleString()} 원</p>}
        </div>
        <div className="mypage-box" onClick={() => navigate("/coupons")}> 
          <h2>쿠폰</h2>
          {loading ? <p>로딩 중...</p> : <p>{(couponCount ?? 0).toLocaleString()} 장</p>}
        </div>
      </div>

      <ul className="mypage-list">
        <li onClick={() => navigate("/address")}> 
          <span>주소 설정</span>
          <span className="arrow">&gt;</span>
        </li>
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
