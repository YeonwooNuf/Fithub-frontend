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

        console.log("📦 주문 응답:", response.data);
        setOrders(response.data || []); // ✅ 수정됨
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
            <div className="order-header">
              <p className="order-id">주문번호: {order.orderId}</p>
              <p className="order-date">
                주문일자: {new Date(order.orderDate).toLocaleString()}
              </p>
              
              <p className="original-price">
                정가: {order.totalAmount.toLocaleString()} 원
              </p>
              <p className="order-price">
                결제금액: <strong>{order.finalAmount.toLocaleString()} 원</strong>
              </p>

              <p className="used-points">
                사용한 포인트: {order.usedPoints} P
              </p>
            </div>


            <ul className="order-items">
              {order.items.map((item, idx) => (
                <li key={idx} className="order-item">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="item-thumbnail"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  />
                  <div className="item-info">
                    <p className="product-name">{item.productName}</p>
                    <p>{item.price.toLocaleString()}원 × {item.quantity}개</p>
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
