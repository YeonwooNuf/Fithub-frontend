import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./OrderComplete.css"; // ✅ CSS 파일 추가

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const saveOrderToDB = async () => {
    try {
        const headers = getAuthHeaders();

        const requestData = {
            paymentId,
            totalAmount,
            finalAmount,
            usedPoints,
            addressId: selectedAddress?.id,
            usedCouponIds: usedCoupons.map(c => c.id), // ✅ UserCoupon ID 리스트
            items: cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            }))
        };

        await axios.post("/api/orders", requestData, { headers });
        console.log("✅ 주문이 DB에 저장되었습니다.");
    } catch (err) {
        console.error("❌ 주문 저장 실패:", err);
    }
};


const OrderComplete = () => {
    const location = useLocation();
    const navigate = useNavigate();

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
    const [userInfo, setUserInfo] = useState(null);

    const fetchUserInfo = async () => {
        try {
            const headers = getAuthHeaders();
            const response = await axios.get("/api/users/mypage", { headers });
            setUserInfo(response.data);
        } catch (error) {
            console.error("❌ 사용자 정보 불러오기 실패:", error);
        }
    };

    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (isSaved || !paymentId) return;
    
        setPaymentDate(new Date().toISOString());
        fetchUserInfo();
    
        const saveOrderToDB = async () => {
            try {
                const headers = getAuthHeaders();
    
                const requestData = {
                    paymentId,
                    totalAmount,
                    finalAmount,
                    usedPoints,
                    addressId: selectedAddress?.id,
                    usedCouponIds: usedCoupons.map(c => c.id),
                    items: cartItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                };
    
                await axios.post("/api/orders", requestData, { headers });
                console.log("✅ 주문이 DB에 저장되었습니다.");
                setIsSaved(true); // ✅ 한 번만 저장되도록 설정
            } catch (err) {
                console.error("❌ 주문 저장 실패:", err);
            }
        };
    
        saveOrderToDB();
    }, [paymentId]);
    

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

    if (!paymentId) {
        return (
            <div className="order-wrapper">
                <h2 className="error-title">❌ 주문 정보를 찾을 수 없습니다.</h2>
                <button onClick={() => navigate("/")} className="btn">홈으로 이동</button>
            </div>
        );
    }

    return (
        <div className="order-page">
            <div className="order-card">
                <h1 className="order-title">✅ 결제가 완료되었습니다!</h1>

                <div className="order-info">
                    <p><strong>주문 번호:</strong> {paymentId}</p>
                    <p><strong>할인 전 금액:</strong> {totalAmount.toLocaleString()} 원</p>
                    <p><strong>총 결제 금액:</strong> {finalAmount.toLocaleString()} 원</p>
                    <p><strong>사용한 포인트:</strong> {usedPoints.toLocaleString()} P</p>
                    <p><strong>결제 일자:</strong> {new Date(paymentDate).toLocaleString()}</p>
                </div>

                {usedCoupons.length > 0 && (
                    <div className="order-section">
                        <h3>🎟 사용한 쿠폰</h3>
                        <ul className="coupon-list">
                            {usedCoupons.map((coupon, index) => (
                                <li key={index} className="list-item">
                                    <strong>{coupon.name}</strong> - {coupon.discount}% 할인 쿠폰
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="order-section">
                    <h3>📦 배송지 정보</h3>
                    {selectedAddress && (
                        <>
                            <p><strong>{selectedAddress.roadAddress}</strong></p>
                            <p>{selectedAddress.detailAddress}</p>
                        </>
                    )}
                    {userInfo && <p>주문자명 : <strong>{userInfo.nickname}</strong></p>}
                </div>

                <div className="order-section">
                    <h3>🛍 주문 상품</h3>
                    <ul className="product-list">
                        {cartItems.map((item, index) => (
                            <li key={index} className="list-item">
                                {item.productName} - {item.price.toLocaleString()} 원
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="button-group">
                    <button onClick={() => navigate("/mypage/orders")} className="btn">📄 주문 내역으로 이동</button>
                    <button onClick={() => navigate("/")} className="btn">🏠 홈으로 이동</button>
                </div>
            </div>
        </div>
    );
};

export default OrderComplete;
