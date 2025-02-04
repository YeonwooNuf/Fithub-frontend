import React from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">
      <h1>관리자 대시보드</h1>
      <ul className="admin-list">
        <li onClick={() => navigate("/admin/users")}>
          <span>사용자 관리</span>
          <span className="arrow">&gt;</span>
        </li>
        <li onClick={() => navigate("/admin/products")}>
          <span>상품 관리</span>
          <span className="arrow">&gt;</span>
        </li>
        <li onClick={() => navigate("/admin/orders")}>
          <span>주문 관리</span>
          <span className="arrow">&gt;</span>
        </li>
        <li onClick={() => navigate("/admin/reviews")}>
          <span>리뷰 및 문의</span>
          <span className="arrow">&gt;</span>
        </li>
        <li onClick={() => navigate("/admin/coupons")}>
          <span>쿠폰 및 포인트</span>
          <span className="arrow">&gt;</span>
        </li>
        <li onClick={() => navigate("/admin/banners")}>
          <span>배너 및 광고</span>
          <span className="arrow">&gt;</span>
        </li>
      </ul>
    </div>
  );
}

export default AdminDashboard;
