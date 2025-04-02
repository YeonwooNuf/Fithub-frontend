import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OrderComplete = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { paymentId, usedPoints, usedCoupons, totalAmount, finalAmount, cartItems } = location.state || {};

    // ✅ 클라이언트 결제 완료 시간 저장용 state
    const [paymentDate, setPaymentDate] = useState("");

    useEffect(() => {
        // 컴포넌트 마운트 시 현재 시간 저장
        setPaymentDate(new Date().toISOString());
    }, []);

    // ✅ 주문 정보가 없는 경우 처리
    if (!paymentId) {
        return (
            <div style={{ padding: "20px" }}>
                <h2>❌ 주문 정보를 찾을 수 없습니다.</h2>
                <button onClick={() => navigate("/")} style={styles.button}>
                    홈으로 이동
                </button>
            </div>
        );
    }

    // const handleUseCoupon = async () => {
    //     try {
    //         const headers = getAuthHeaders();
    //         if (!headers.Authorization) {
    //             navigate("/login");
    //             return;
    //         }
    //         const response = await axios.get("/api/coupon/use", {headers});
    //     } catch (error) {
    //         console.error("쿠폰이 사용처리되지 않았습니다.", error);
    //     }
    // }

    // const handleUsePoints = async () => {
    //     try {
    //         const headers = getAuthHeaders();
    //         if (!headers.Authorization) {
    //             navigate("/login");
    //             return;
    //         }
    //         const response = await axios.get("/api/points/use", {headers});
    //     } catch (error) {
    //         console.error("적립금이 사용처리되지 않았습니다.", error);
    //     }
    // }

    return (
        <div style={{ padding: "20px" }}>
            <h1>✅ 결제가 완료되었습니다!</h1>
            <p><strong>주문 번호:</strong> {paymentId}</p>
            {/*<p><strong>결제 상태:</strong> {paymentStatus || "결제 완료"}</p>*/}
            <p><strong>할인 전 금액:</strong> {totalAmount} 원</p>
            <p><strong>총 결제 금액:</strong> {finalAmount} 원</p>
            <p><strong>사용한 포인트:</strong> {usedPoints} P</p>
            <p><strong>결제 일자:</strong> {new Date(paymentDate).toLocaleString()}</p>

            {/* ✅ 사용한 쿠폰 정보 표시 */}
            {usedCoupons && usedCoupons.length > 0 && (
                <div>
                    <h3>🎟 사용한 쿠폰</h3>
                    <ul>
                        {usedCoupons.map((coupon, index) => (
                            <li key={index}>
                                <p><strong>{coupon.name}</strong> - 할인 {coupon.discountAmount} 원</p>
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
                        <p>{item.productName} - {item.price} 원</p>
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
