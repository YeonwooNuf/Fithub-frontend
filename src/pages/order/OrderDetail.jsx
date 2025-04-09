import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./OrderComplete.css";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const headers = getAuthHeaders();
        const res = await axios.get(`/api/orders/${orderId}`, { headers });
        console.log("📦 주문 상세 응답 데이터 확인:", res.data);

        setOrder(res.data);
      } catch (err) {
        console.error("❌ 주문 정보 불러오기 실패:", err);
      }
    };

    const fetchUserInfo = async () => {
      try {
        const headers = getAuthHeaders();
        const res = await axios.get("/api/users/mypage", { headers });
        setUserInfo(res.data);
      } catch (err) {
        console.error("❌ 사용자 정보 불러오기 실패:", err);
      }
    };

    fetchOrder();
    fetchUserInfo();
  }, [orderId]);

  if (!order) {
    return <p>주문 정보를 불러오는 중입니다...</p>;
  }

  return (
    <div className="order-page">
      <div className="order-card">
        <h1 className="order-title">✅ 주문 상세 내역</h1>

        <div className="order-info">
          <p><strong>주문 번호:</strong> {order.paymentId}</p>
          <p><strong>할인 전 금액:</strong> {order.totalAmount.toLocaleString()} 원</p>
          <p><strong>총 결제 금액:</strong> {order.finalAmount.toLocaleString()} 원</p>
          <p><strong>사용한 포인트:</strong> {order.usedPoints.toLocaleString()} P</p>
          <p><strong>결제 일자:</strong> {new Date(order.orderDate).toLocaleString()}</p>
        </div>

        {order.usedCoupons.map((uc, index) => (
  <li key={index} className="list-item">
    <strong>{uc.name}</strong> - {uc.discount}% 할인 쿠폰

  </li>
))}


        <div className="order-section">
          <h3>📦 배송지 정보</h3>
          {order.address && (
            <>
              <p><strong>{order.address.roadAddress}</strong></p>
              <p>{order.address.detailAddress}</p>
            </>
          )}
          {userInfo && <p>주문자명 : <strong>{userInfo.nickname}</strong></p>}
        </div>

        <div className="order-section">
          <h3>🛍 주문 상품</h3>
          <ul className="product-list">
            {order.items.map((item, index) => (
              <li key={index} className="list-item">
                <img
                    src={item.productImage}
                    alt={item.productName}
                    className="order-item-image"
                    onClick={() => navigate(`/product/${item.productId}`)}
                    style={{ cursor: "pointer" }}
                  />
                {item.productName} - {item.price.toLocaleString()} 원 × {item.quantity}개
              </li>
            ))}
          </ul>
        </div>

        <div className="button-group">
          <button onClick={() => navigate("/orders")} className="btn">📄 주문 내역으로 이동</button>
          <button onClick={() => navigate("/")} className="btn">🏠 홈으로 이동</button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
