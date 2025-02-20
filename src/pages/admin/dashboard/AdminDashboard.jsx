import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

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
          <span>쿠폰 관리</span>
          <span className="arrow">&gt;</span>
        </li>
        <li onClick={() => navigate("/admin/points")}>
          <span>포인트 관리</span>
          <span className="arrow">&gt;</span>
        </li>
        <li onClick={() => navigate("/admin/event")}>
          <span>이벤트 관리</span>
          <span className="arrow">&gt;</span>
        </li>
        <li onClick={() => navigate("/admin/brands")}>
          <span>판매 브랜드</span>
          <span className="arrow">&gt;</span>
        </li>
      </ul>
    </div>
  );
}

export default AdminDashboard;
