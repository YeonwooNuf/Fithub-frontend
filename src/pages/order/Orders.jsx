import React from "react";
import { useNavigate } from "react-router-dom";

function Orders() {
  const navigate = useNavigate();

  const orders = [
    { id: 1, item: "로고 플레인 티셔츠", price: 12000, reviewWritten: false },
    { id: 2, item: "사이드 슬러 라인 티셔츠", price: 39000, reviewWritten: true },
  ];

  return (
    <div>
      <h1>주문 내역</h1>
      <ul>
        {orders.map((order) => (
          <li key={order.id} style={{ marginBottom: "20px" }}>
            <p>
              {order.item} - {order.price.toLocaleString()} 원
            </p>
            {!order.reviewWritten && (
              <button onClick={() => navigate(`/review/${order.id}`)}>
                리뷰 작성
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Orders;
