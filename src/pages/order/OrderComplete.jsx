import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OrderComplete = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, cartItems, finalAmount, usedPoints, usedCoupons, paymentStatus } = location.state || {};

    // ✅ 주문 정보가 없는 경우 처리
    if (!orderId) {
        return (
            <div style={{ padding: "20px" }}>
                <h2>❌ 주문 정보를 찾을 수 없습니다.</h2>
                <button onClick={() => navigate("/")} style={styles.button}>
                    홈으로 이동
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>✅ 결제가 완료되었습니다!</h1>
            <p><strong>주문 번호:</strong> {orderId}</p>
            <p><strong>결제 상태:</strong> {paymentStatus || "결제 완료"}</p>
            <p><strong>총 결제 금액:</strong> {finalAmount.toLocaleString()} 원</p>
            <p><strong>사용한 포인트:</strong> {usedPoints.toLocaleString()} P</p>

            {/* ✅ 사용한 쿠폰 정보 표시 */}
            {usedCoupons && usedCoupons.length > 0 && (
                <div>
                    <h3>🎟 사용한 쿠폰</h3>
                    <ul>
                        {usedCoupons.map((coupon, index) => (
                            <li key={index}>
                                <p><strong>{coupon.couponName}</strong> - 할인 {coupon.discountAmount.toLocaleString()} 원</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ✅ 주문 상품 목록 표시 */}
            <h3>🛍 주문 상품</h3>
            <ul>
                {cartItems.map((item, index) => (
                    <li key={index}>
                        <p>{item.name} - {item.price.toLocaleString()} 원</p>
                    </li>
                ))}
            </ul>

            <div style={{ marginTop: "20px" }}>
                <button onClick={() => navigate("/mypage/orders")} style={styles.button}>
                    📄 주문 내역으로 이동
                </button>
                <button onClick={() => navigate("/")} style={styles.button}>
                    🏠 홈으로 이동
                </button>
            </div>
        </div>
    );
};

// ✅ 버튼 스타일
const styles = {
    button: {
        marginRight: "10px",
        padding: "10px",
        background: "#007bff",
        color: "white",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px"
    }
};

export default OrderComplete;
