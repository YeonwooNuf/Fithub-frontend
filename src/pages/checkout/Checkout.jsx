import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AddressModal from "../address/AddressModal";
import "./Checkout.css";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("🚨 인증 토큰 없음! 로그인 페이지로 이동");
        alert("로그인이 필요합니다.");
        window.location.href = "/login"; // 로그인 페이지로 이동
        return {};
    }

    return { Authorization: `Bearer ${token}` };
};

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems = [], totalPrice = 0 } = location.state || {};

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [finalPrice, setFinalPrice] = useState(totalPrice);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [selectedCoupons, setSelectedCoupons] = useState({});
    const [availablePoints, setAvailablePoints] = useState(0);
    const [usedPoints, setUsedPoints] = useState(0); // ✅ 추가: 포인트 사용량 상태

    useEffect(() => {
        fetchDefaultAddress();
        console.log("useEffect 🚀 useEffect 실행됨");
        fetchUserPoints();
        fetchAvailableCoupons();
    }, []);

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
        const appliedCouponId = selectedCoupons[cartItem.id]?.id;

        // ✅ 현재 상품에 적용된 쿠폰 가져오기
        const appliedCoupon = appliedCouponId
            ? availableCoupons.find(coupon => coupon.id === appliedCouponId)
            : null;

        let applicableCoupons = availableCoupons.filter(
            coupon =>
                (coupon.target === "ALL_PRODUCTS" ||
                    (coupon.target === "CATEGORY" && coupon.targetValue === cartItem.category) ||
                    (coupon.target === "BRAND" && coupon.targetValue === cartItem.brandName)) &&
                (!Object.values(selectedCoupons).some(applied => applied.id === coupon.id) || // ✅ 이미 다른 상품에 적용된 쿠폰은 제거
                    (appliedCoupon && appliedCoupon.id === coupon.id))
        );

        // ✅ 적용된 쿠폰이 이미 목록에 없다면 추가
        if (appliedCoupon && !applicableCoupons.some(coupon => coupon.id === appliedCoupon.id)) {
            applicableCoupons = [appliedCoupon, ...applicableCoupons];
        }

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
                    updatedCoupons[cartItemId] = selectedCoupon;
                }
            }

            updateFinalPrice(cartItems, updatedCoupons, usedPoints);
            return updatedCoupons;
        });
    };

    /** ✅ 최종 가격 업데이트 */
    const updateFinalPrice = (items, coupons, pointsUsed) => {
        let total = 0;
        items.forEach(item => {
            const discount = coupons[item.id] ? (item.price * coupons[item.id].discount) / 100 : 0;
            total += (item.price - discount) * item.quantity;
        });
        total -= pointsUsed; // ✅ 사용된 포인트 반영
        setFinalPrice(Math.max(total, 0));
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
                            <img src={item.productImage} alt={item.productName} className="cart-item-image" />
                            <h3>{item.productName}</h3>
                            <p>색상: {item.color} | 사이즈: {item.size} | 수량: {item.quantity}</p>

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
                                    value={selectedCoupons[item.id]?.id || ""}
                                    onChange={(e) => handleApplyCoupon(item.id, e.target.value)}
                                >
                                    <option value="">쿠폰 선택 없음</option>
                                    {getApplicableCoupons(item)
                                        .filter(coupon => !isCouponUsed(coupon.id, item.id)) // ✅ 중복 사용된 쿠폰 필터링
                                        .map(coupon => (
                                            <option key={coupon.id} value={coupon.id}>
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
                <p>총 상품 금액: {finalPrice.toLocaleString()} 원</p>
                <p>사용 가능한 포인트: {availablePoints.toLocaleString()} P</p>
                <label>사용할 포인트:</label>
                <input
                    type="number"
                    value={usedPoints}
                    onChange={handleUsePoints}
                    min="0"
                    max={Math.min(availablePoints || 0, finalPrice * 0.1)}
                />
                <button className="payment-button">결제하기</button>
            </div>

            {isAddressModalOpen && <AddressModal onClose={() => setIsAddressModalOpen(false)} onSelectAddress={setSelectedAddress} />}
        </div>
    );
};

export default Checkout;
