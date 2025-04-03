import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// ✅ 토큰 인증 헤더
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const OrderComplete = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // ✅ location.state에서 값 추출 + 기본값 설정
    const {
        paymentId = "",
        usedPoints = 0,
        usedCoupons = [],
        totalAmount = 0,
        finalAmount = 0,
        cartItems = [],
        selectedAddress = null
    } = location.state || {};

    const [paymentDate, setPaymentDate] = useState("");
    const [userInfo, setUserInfo] = useState(null); // ✅ 사용자 정보 상태

    // 🔹 사용자 정보 불러오기
    const fetchUserInfo = async () => {
        try {
            const headers = getAuthHeaders();
            const response = await axios.get("/api/users/mypage", { headers });
            setUserInfo(response.data);
        } catch (error) {
            console.error("❌ 사용자 정보 불러오기 실패:", error);
        }
    };

    useEffect(() => {
        setPaymentDate(new Date().toISOString());
        fetchUserInfo();

        // ✅ 디버깅용 콘솔 로그
        console.log("🧾 OrderComplete에 전달된 location.state:", location.state);
        console.log("🔹 paymentId:", paymentId);
        console.log("🔹 usedPoints:", usedPoints);
        console.log("🔹 usedCoupons:", usedCoupons);
        console.log("🔹 totalAmount:", totalAmount);
        console.log("🔹 finalAmount:", finalAmount);
        console.log("🔹 cartItems:", cartItems);
        console.log("📦 배송지 정보:", selectedAddress);
    }, []);



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

    return (
        <div style={{ padding: "20px" }}>
            <h1>✅ 결제가 완료되었습니다!</h1>
            <p><strong>주문 번호:</strong> {paymentId}</p>
            <p><strong>할인 전 금액:</strong> {totalAmount.toLocaleString()} 원</p>
            <p><strong>총 결제 금액:</strong> {finalAmount.toLocaleString()} 원</p>
            <p><strong>사용한 포인트:</strong> {usedPoints.toLocaleString()} P</p>
            <p><strong>결제 일자:</strong> {new Date(paymentDate).toLocaleString()}</p>

            {/* ✅ 사용한 쿠폰 정보 표시 */}
            {usedCoupons.length > 0 && (
                <div>
                    <h3>🎟 사용한 쿠폰</h3>
                    <ul>
                        {usedCoupons.map((coupon, index) => (
                            <li key={index}>
                                <p><strong>{coupon.name}</strong> - {coupon.discount}% 할인 쿠폰</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ✅ 배송지 및 사용자 정보 표시 */}
            <div style={{ marginTop: "20px" }}>
                <h3>📦 배송지 정보</h3>
                {selectedAddress && (
                    <>
                        <p><strong>{selectedAddress.roadAddress}</strong></p>
                        <p>{selectedAddress.detailAddress}</p>
                    </>
                )}
                {userInfo && (
                    <>
                        <p>주문자명 : {userInfo.nickname}</p>
                    </>
                )}
            </div>


            {/* ✅ 주문 상품 목록 표시 */}
            <h3>🛍 주문 상품</h3>
            <ul>
                {cartItems.map((item, index) => (
                    <li key={index}>
                        <p>{item.productName} - {item.price.toLocaleString()} 원</p>
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
