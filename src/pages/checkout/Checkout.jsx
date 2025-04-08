import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AddressModal from "../address/AddressModal";
import "./Checkout.css";
import * as PortOne from "@portone/browser-sdk/v2"; // 결제 APi

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("🚨 인증 토큰 없음! 로그인 페이지로 이동");
        alert("로그인이 필요합니다.");
        window.location.href = "/login"; // 로그인 페이지로 이동 navigate랑 다른가?
        return {};
    }

    return { Authorization: `Bearer ${token}` };
};

const Checkout = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems = [], totalPrice = 0, applicableCoupons = {} } = location.state || {};
    const appliedCoupons = location.state?.appliedCoupons || {};

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [finalPrice, setFinalPrice] = useState(totalPrice);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [selectedCoupons, setSelectedCoupons] = useState(appliedCoupons);
    const [availablePoints, setAvailablePoints] = useState(0);
    const [usedPoints, setUsedPoints] = useState(0); // ✅ 추가: 포인트 사용량 상태
    const [paymentMethod, setPaymentMethod] = useState("CARD"); // 기본 결제 수단은 카드

    const [originalTotalPrice, setOriginalTotalPrice] = useState(0); // 💸 할인 전 상품 정가 합계
    const [totalDiscountAmount, setTotalDiscountAmount] = useState(0); // 📉 총 할인 금액
    const [userId, setUserId] = useState(null);

    const fetchUserId = async () => {
        const headers = getAuthHeaders();
        try {
            const res = await axios.get("/api/users/mypage", { headers });
            if (res.data?.userId) {
                setUserId(res.data.userId);
            }
        } catch (error) {
            console.error("❌ 사용자 정보 가져오기 실패:", error);
        }
    };

    useEffect(() => {
        if (cartItems.length > 0) {
            updateFinalPrice(cartItems, selectedCoupons, usedPoints);
        }
    }, [cartItems, selectedCoupons, usedPoints]);

    // merchantData 에서 한글 제거
    const encodeToBase64 = (data) => {
        return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    };

    const decodeFromBase64 = (encodedData) => {
        return JSON.parse(decodeURIComponent(escape(atob(encodedData))));
    };

    useEffect(() => {
        fetchDefaultAddress();
        console.log("useEffect 🚀 useEffect 실행됨");
        fetchUserPoints();
        fetchAvailableCoupons();
        fetchUserId();
    }, []);

    useEffect(() => {
        if (!cartItems.length) {
            alert("결제할 상품이 없습니다.");
            navigate("/cart");
        }
    }, [cartItems, navigate]);

    function randomId() {
        return [...crypto.getRandomValues(new Uint32Array(2))]
            .map(word => word.toString(16).padStart(8, "0"))
            .join("");
    }

    /** ✅ 사용 가능 쿠폰 가져오기 */
    const fetchAvailableCoupons = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers.Authorization) {
                navigate("/login");
                return;
            }
            const response = await axios.get("/api/coupons", { headers });
            setAvailableCoupons(response.data.coupons || []);
        } catch (error) {
            console.error("❌ 쿠폰 정보를 불러오는 중 오류 발생:", error);
        }
    };

    /** ✅ 기본 배송지 가져오기 */
    const fetchDefaultAddress = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers.Authorization) {
                navigate("/login");
                return;
            }
            const response = await axios.get("/api/users/addresses", { headers });
            const defaultAddr = response.data.find(addr => addr.default);
            if (defaultAddr) {
                setSelectedAddress(defaultAddr);
            }
        } catch (error) {
            console.error("❌ 배송지 불러오기 오류:", error);
        }
    };

    /** ✅ 사용 가능한 포인트 가져오기 */
    const fetchUserPoints = async () => {
        try {
            const headers = getAuthHeaders();
            console.log("📡 포인트 조회 API 호출...");
            const response = await axios.get("/api/points", { headers });
            console.log("✅ 포인트 응답 데이터:", response.data);

            setAvailablePoints(response.data.content[0].amount || 0);
            console.log("🔵 availablePoints 업데이트됨:", response.data.amount || 0);
        } catch (error) {
            console.error("❌ 포인트 정보를 가져오는 중 오류 발생:", error);
        }
    };

    /** ✅ 특정 상품에 적용 가능한 쿠폰 필터링 (중복 적용 방지 추가) */
    const getApplicableCoupons = (cartItem) => {
        const appliedCouponId = selectedCoupons[cartItem.id]?.userCouponId;

        // 현재 상품에 적용된 쿠폰 객체 가져오기 (기존 코드에는 coupon.id로 비교해서 틀렸을 수 있음)
        const appliedCoupon = appliedCouponId
            ? availableCoupons.find(coupon => coupon.userCouponId === appliedCouponId)
            : null;

        let applicableCoupons = availableCoupons.filter(coupon =>
            (coupon.target === "ALL_PRODUCTS" ||
                (coupon.target === "CATEGORY" && coupon.targetValue === cartItem.category) ||
                (coupon.target === "BRAND" && coupon.targetValue === cartItem.brandName)) &&
            (
                !isCouponUsed(coupon.userCouponId, cartItem.id) || // 이미 다른 상품에서 사용되지 않았거나
                coupon.userCouponId === appliedCouponId             // 현재 이 상품에 적용된 쿠폰이면 허용
            )
        );

        // ✅ 선택된 쿠폰이 필터에서 누락된 경우, 리스트에 수동 추가
        if (appliedCoupon && !applicableCoupons.some(c => c.userCouponId === appliedCoupon.userCouponId)) {
            applicableCoupons.unshift(appliedCoupon); // 드롭다운 가장 위에 삽입
        }
        console.log("✅ 쿠폰 목록:", availableCoupons);

        return applicableCoupons;
    };

    /** ✅ 포인트 사용 */
    const handleUsePoints = (event) => {
        let inputPoints = parseInt(event.target.value, 10) || 0;
        const maxPoints = Math.min(availablePoints, finalPrice * 0.1);

        if (inputPoints > maxPoints) {
            inputPoints = maxPoints;
        }

        setUsedPoints(inputPoints); // ✅ 사용된 포인트 상태 업데이트
        updateFinalPrice(cartItems, selectedCoupons, inputPoints);
    };

    /** ✅ 이미 다른 상품에서 사용된 쿠폰인지 확인 */
    const isCouponUsed = (couponId, cartItemId) => {
        return Object.entries(selectedCoupons).some(([itemId, coupon]) =>
            itemId !== String(cartItemId) && coupon.id === couponId
        );
    };

    /** ✅ 쿠폰 적용/해제 및 변경 (중복 적용 방지 추가) */
    const handleApplyCoupon = (cartItemId, selectedCouponId) => {
        console.log("🟢 쿠폰 변경 시작 | cartItemId:", cartItemId, "| 선택된 쿠폰 ID:", selectedCouponId);

        setSelectedCoupons(prevCoupons => {
            let updatedCoupons = { ...prevCoupons };

            if (!selectedCouponId) {
                // ✅ 선택된 쿠폰이 없을 경우, 기존 쿠폰 해제
                delete updatedCoupons[cartItemId];
            } else {
                // ✅ 선택한 쿠폰이 이미 다른 상품에서 사용 중인지 체크
                if (isCouponUsed(Number(selectedCouponId), cartItemId)) {
                    alert("이 쿠폰은 이미 다른 상품에 적용되었습니다.");
                    return prevCoupons;
                }

                // ✅ 선택한 쿠폰 적용
                const cartItem = cartItems.find(item => item.id === cartItemId);
                const selectedCoupon = getApplicableCoupons(cartItem).find(coupon => coupon.id === Number(selectedCouponId));

                if (selectedCoupon) {
                    console.log("🆕 새로운 쿠폰 적용:", selectedCoupon);
                    updatedCoupons[cartItemId] = {
                        id: selectedCoupon.id,                    // Coupon의 ID
                        userCouponId: selectedCoupon.userCouponId, // ✅ 실제 사용할 ID
                        name: selectedCoupon.name,
                        discount: selectedCoupon.discount,
                    };
                }
            }

            updateFinalPrice(cartItems, updatedCoupons, usedPoints);
            return updatedCoupons;
        });
    };

    /** ✅ 최종 가격 업데이트 */
    const updateFinalPrice = (items, coupons, pointsUsed) => {
        let originalTotal = 0;
        let couponDiscountTotal = 0;

        items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            originalTotal += itemTotal;

            const coupon = coupons[item.id];
            if (coupon) {
                const discountPerItem = item.price * (coupon.discount / 100);
                couponDiscountTotal += discountPerItem * item.quantity;
            }
        });

        const totalDiscount = couponDiscountTotal + pointsUsed;
        const finalAmount = originalTotal - totalDiscount;

        // ✅ 상태 업데이트
        setOriginalTotalPrice(originalTotal);                 // 원가 총합
        setTotalDiscountAmount(totalDiscount);               // 쿠폰+포인트 할인
        setFinalPrice(Math.max(finalAmount, 0));             // 결제할 실제 금액
    };


    const handlePayment = async () => {
        const paymentId = randomId();

        // ✅ 원래 상품 가격의 총합을 정확히 계산
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const customDataEncoded = encodeToBase64({
            cartItems: cartItems.map(item => ({
                id: item.id,
                name: item.productName, // ✅ 한글 포함
                color: item.color, // ✅ 한글 포함 가능
                size: item.size,
                price: item.price
            })),
            usedCoupons: Object.values(selectedCoupons) // ✅ 선택된 쿠폰 데이터 전송
        });

        try {
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
                payMethod: paymentMethod.toUpperCase(), // ✅ 선택한 결제 수단 사용
                customData: customDataEncoded
            });

            // ✅ 결제 실패 처리
            if (payment.code !== undefined) {
                console.error(`🚨 PortOne 결제 실패: ${payment.message} (코드: ${payment.code})`);
                alert(`결제 실패: ${payment.message} (코드: ${payment.code})`);
                return;
            }

            // ✅ JWT 인증 헤더 추가
            const headers = getAuthHeaders();
            if (!headers.Authorization) {
                return;
            }

            const usedCouponIds = Object.values(selectedCoupons)
                .map(coupon => coupon?.userCouponId)  // ✅ 여기!
                .filter((id, index, self) => id && self.indexOf(id) === index);

            console.log("🔍 결제 직전 selectedCoupons 상태 확인:", selectedCoupons);
            console.log("✅ 전송할 usedCouponIds:", usedCouponIds);

            // ✅ JWT 인증 헤더 추가하여 요청 전송
            const completeResponse = await fetch("/api/payment/complete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...headers
                },
                body: JSON.stringify({
                    paymentId,
                    usedPoints,
                    usedCouponIds, // ✅ 필드명 정확하게!
                    totalAmount: originalTotalPrice,
                    finalAmount: finalPrice,
                    addressId: selectedAddress?.id, // 이 부분도 DTO에 맞춰 필요 시 추가
                    items: cartItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        color: item.color,
                        size: item.size
                    }))
                })
            });

            // ✅ 결제 검증 성공
            if (completeResponse.ok) {
                const responseData = await completeResponse.json();
                console.log("🧾 responseData 확인:", responseData);

                alert("✅ 결제가 성공적으로 완료되었습니다!");
                navigate("/order/complete", {
                    state: {
                        ...responseData, // 기존 응답 데이터
                        cartItems, // 🚀 명확하게 cartItems 추가
                        selectedAddress,
                        selectedCoupons
                    }
                });
            }

            // ✅ 결제 검증 실패 시 응답 메시지를 확인하여 상세 로그 출력
            else {
                const errorData = await completeResponse.json();
                console.error("❌ 결제 검증 실패: ", errorData);

                let errorMessage = "결제 검증 실패: 서버 응답 오류";
                if (errorData.message) {
                    errorMessage += `\n🛠 오류 메시지: ${errorData.message}`;
                }
                if (errorData.reason) {
                    errorMessage += `\n📌 실패 원인: ${errorData.reason}`;
                }

                alert(errorMessage);
            }
        } catch (error) {
            console.error("🚨 네트워크 또는 서버 오류 발생:", error);
            alert(`⚠️ 결제 처리 중 문제가 발생했습니다.\n에러 메시지: ${error.message || "알 수 없는 오류"}`);
        }
    };

    return (
        <div className="checkout-page">
            <h2>주문 상품</h2>
            <div className="card cart-items-card">
                {cartItems.map((item) => {
                    const appliedCoupon = selectedCoupons[item.id];
                    const discount = appliedCoupon ? (item.price * appliedCoupon.discount) / 100 : 0;
                    const finalItemPrice = (item.price - discount) * item.quantity;

                    return (
                        <div key={item.id} className="cart-item">
                            <div className="item-info">
                                <img src={item.productImage} alt={item.productName} className="cart-item-image" />
                                <div className="item-text">
                                    <h3>{item.productName}</h3>
                                    <p>색상: {item.color} | 사이즈: {item.size} | 수량: {item.quantity}</p>
                                </div>
                            </div>

                            <p className="price">
                                {discount > 0 ? (
                                    <>
                                        <span className="original-price">{(item.price * item.quantity).toLocaleString()} 원</span>
                                        <span className="discounted-price">{finalItemPrice.toLocaleString()} 원</span>
                                    </>
                                ) : (
                                    <span className="final-price">{(item.price * item.quantity).toLocaleString()} 원</span>
                                )}
                            </p>

                            <div className="coupon-selector">
                                <label>쿠폰 선택:</label>
                                <select
                                    value={selectedCoupons[item.id]?.userCouponId || ""}
                                    onChange={(e) => handleApplyCoupon(item.id, e.target.value)}

                                >
                                    <option value="">쿠폰 선택 없음</option>
                                    {getApplicableCoupons(item)
                                        .filter(coupon => !isCouponUsed(coupon.userCouponId, item.id))  // ✅ 수정됨!
                                        .map(coupon => (
                                            <option key={`${item.id}-${coupon.userCouponId}`} value={coupon.userCouponId}>
                                                {coupon.name} (-{coupon.discount}%)
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="card delivery-card">
                <h2>배송지</h2>
                {selectedAddress ? (
                    <div className="selected-address">
                        <p><strong>{selectedAddress.roadAddress}</strong></p>
                        <p>{selectedAddress.detailAddress}</p>
                        <button className="btn btn-light" onClick={() => setIsAddressModalOpen(true)}>배송지 변경</button>
                    </div>
                ) : (
                    <button className="btn btn-primary" onClick={() => setIsAddressModalOpen(true)}>배송지 선택</button>
                )}
            </div>

            <div className="checkout-summary">
                <h2>결제 요약</h2>
                <p>총 정가: {originalTotalPrice.toLocaleString()} 원</p>
                <p>총 할인 금액: -{totalDiscountAmount.toLocaleString()} 원</p>
                <p>최종 결제 금액: <strong>{finalPrice.toLocaleString()} 원</strong></p>
                <p>사용 가능한 포인트: {availablePoints.toLocaleString()} P</p>
                <label>사용할 포인트:</label>
                <input
                    type="number"
                    value={usedPoints}
                    onChange={handleUsePoints}
                    min="0"
                    max={Math.min(availablePoints || 0, finalPrice * 0.1)}
                />
                <button className="payment-button" onClick={handlePayment}>결제하기</button>
                <script></script>
            </div>

            {isAddressModalOpen && <AddressModal onClose={() => setIsAddressModalOpen(false)} onSelectAddress={setSelectedAddress} />}
        </div>
    );
};

export default Checkout;
