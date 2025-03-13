import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as PortOne from "@portone/browser-sdk/v2";

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems, finalPrice, usedPoints } = location.state || {
        cartItems: [],
        finalPrice: 0,
        usedPoints: 0
    };

    useEffect(() => {
        console.log("🚀 Payment 페이지 state 값:", location.state);
    }, []);

    // merchantData 에서 한글 제거
    const encodeToBase64 = (data) => {
        return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    };

    const decodeFromBase64 = (encodedData) => {
        return JSON.parse(decodeURIComponent(escape(atob(encodedData))));
    };

    const [paymentMethod, setPaymentMethod] = useState("CARD"); // 기본 결제 수단은 카드

    useEffect(() => {
        if (!cartItems.length) {
            alert("결제할 상품이 없습니다.");
            navigate("/checkout");
        }
    }, [cartItems, navigate]);

    function randomId() {
        return [...crypto.getRandomValues(new Uint32Array(2))]
            .map(word => word.toString(16).padStart(8, "0"))
            .join("");
    }

    const handlePayment = async () => {
        const paymentId = randomId();
        
        const customDataEncoded = encodeToBase64({
            cartItems: cartItems.map(item => ({
                id: item.id,
                name: item.productName, // ✅ 한글 포함
                color: item.color, // ✅ 한글 포함 가능
                size: item.size,
                price: item.price
            }))
        });


        const payment = await PortOne.requestPayment({
            storeId: "store-648c3fc7-1da1-467a-87bb-3b235f5c9879",
            channelKey: "channel-key-f3019356-750d-42dd-b2ba-9c857896bd38",
            paymentId,
            orderName: `총 ${cartItems.length}개 상품`,
            totalAmount: finalPrice, // ✅ 사용한 포인트를 반영한 최종 결제 금액
            currency: "KRW",
            customer: {
                fullName: "asd1234",
                phoneNumber: "010-0000-1234",
                email: "test@portone.io",
            },
            payMethod: "CARD", // 선택한 결제 수단 사용
            customData: customDataEncoded 
        });

        if (payment.code !== undefined) {
            alert(`결제 실패: ${payment.message}`);
            return;
        }

        // 결제 성공 후 백엔드에 결제 완료 요청
        const completeResponse = await fetch("/api/payment/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId, usedPoints })
        });

        if (completeResponse.ok) {
            alert("결제가 성공적으로 완료되었습니다.");
            navigate("/order/complete"); // 결제 완료 페이지로 이동
        } else {
            alert("결제 검증 실패");
        }
    };

    return (
        <div className="payment">
            <h2>결제하기</h2>
            <h3>총 결제 금액: {finalPrice.toLocaleString()}원</h3>

            <label>결제 수단 선택:</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="card">카드 결제</option>
                <option value="naverpay">네이버페이</option>
                <option value="kakaopay">카카오페이</option>
            </select>

            <button onClick={handlePayment}>결제 진행</button>
        </div>
    );
};

export default Payment;
