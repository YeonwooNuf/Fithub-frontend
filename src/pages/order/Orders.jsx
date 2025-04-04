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
            Authorization: `Bearer ${token}`
          }
        });
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error("❌ 주문 내역을 불러오는 데 실패했습니다:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="orders-container">
      <h1 className="orders-title">📦 주문 내역</h1>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-info">
              <p className="order-item">{order.item}</p>
              <p className="order-date">주문일자: {order.orderDate}</p>
            </div>

            <div className="order-meta">
              <p className="order-price">{order.price.toLocaleString()} 원</p>
              {!order.reviewWritten ? (
                <button
                  onClick={() => navigate(`/review/${order.id}`)}
                  className="review-button"
                >
                  ✍️ 리뷰 작성
                </button>
              ) : (
                <span className="review-done">리뷰 작성 완료</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
