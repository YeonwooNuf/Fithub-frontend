import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Orders.css";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/orders/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data || []);
      } catch (error) {
        console.error("❌ 주문 내역을 불러오지 못했습니다:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="orders-container">
      <h1 className="orders-title">📦 주문 내역</h1>

      {orders.length === 0 ? (
        <p className="no-orders">주문 내역이 없습니다.</p>
      ) : (
        orders.map((order) => (
          <div key={order.orderId} className="order-card">
            {/* 주문 정보 헤더 */}
            <div className="order-meta">
              <div className="order-info-row">
                <div>주문번호: {order.paymentId}</div>
                <div>주문일자: {new Date(order.orderDate).toLocaleString()}</div>
              </div>
              <div className="order-summary-row">
                <div className="original-price">
                  정가: {order.totalAmount.toLocaleString()} 원
                </div>
                <div className="final-amount">
                  결제금액: {order.finalAmount.toLocaleString()} 원
                </div>
              </div>
            </div>

            {/* 상세보기 버튼 */}
            <div className="order-detail-button-wrap">
              <button
                className="order-detail-button"
                onClick={() => navigate(`/order/${order.orderId}`)}
              >
                상세보기
              </button>
            </div>

            {/* 구매 상품 리스트 */}
            <h4 className="purchase-title">🛍 구매 상품</h4>
            <ul className="order-items">
              {order.items.map((item, idx) => (
                <li key={idx} className="order-item">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="order-item-image"
                    onClick={() => navigate(`/product/${item.productId}`)}
                    style={{ cursor: "pointer" }}
                  />
                  <div className="order-item-info">
                    <p>
                      <strong>{item.productName}</strong> -{" "}
                      {item.price.toLocaleString()}원 × {item.quantity}개
                    </p>
                  </div>
                  {!item.reviewWritten ? (
                    <button
                      className="review-button"
                      onClick={() => navigate(`/review/${item.productId}`)}
                    >
                      리뷰 작성
                    </button>
                  ) : (
                    <span className="review-done">리뷰 작성 완료</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;
