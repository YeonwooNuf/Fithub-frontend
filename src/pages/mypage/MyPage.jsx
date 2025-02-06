import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../mypage/MyPage.css";

function MyPage() {
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const [points, setPoints] = useState(null);          // ✅ null로 초기화
  const [couponCount, setCouponCount] = useState(null);
  const [loading, setLoading] = useState(true);        // ✅ 로딩 상태 추가
  const [profileImage, setProfileImage] = useState(userInfo.profileImage || "/default-profile.jpg");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userInfo.userId) return;
        const token = localStorage.getItem("token");

        setLoading(true); // ✅ 로딩 시작

        const pointsRequest = fetch(`/api/points/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const couponCountRequest = fetch(`/api/coupons/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const [pointsRes, couponsRes] = await Promise.all([pointsRequest, couponCountRequest]);

        if (pointsRes.ok) {
          const pointsData = await pointsRes.json();
          setPoints(pointsData.totalPoints || 0);
        }

        if (couponsRes.ok) {
          const couponsData = await couponsRes.json();
          setCouponCount(couponsData.count || 0);
        }
      } catch (err) {
        console.error("데이터를 불러오는 중 오류 발생:", err);
      } finally {
        setLoading(false); // ✅ 로딩 완료
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
          onError={() => setProfileImage("/default-profile.jpg")}
        />
        <h1 className="nickname">{userInfo.nickname || "사용자"}</h1>
      </div>

      <div className="mypage-boxes">
        <div className="mypage-box" onClick={() => navigate("/points")}>
          <h2>적립금</h2>
          {loading ? <p>로딩 중...</p> : <p>{points.toLocaleString()} 원</p>}  {/* ✅ 로딩 표시 */}
        </div>
        <div className="mypage-box" onClick={() => navigate("/coupons")}>
          <h2>쿠폰</h2>
          {loading ? <p>로딩 중...</p> : <p>{couponCount.toLocaleString()} 장</p>}  {/* ✅ 로딩 표시 */}
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
