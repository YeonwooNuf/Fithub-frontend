import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Cart.css";

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [availablePoints, setAvailablePoints] = useState(0);
    const [usedPoints, setUsedPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [appliedCoupons, setAppliedCoupons] = useState({});

    useEffect(() => {
        fetchCartItems();
    }, []);

    /** ✅ 장바구니 목록 조회 */
    const fetchCartItems = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get("/api/cart", { headers });

            console.log("✅ 장바구니 데이터:", response.data);

            setCartItems(response.data.cartItems);
            setAvailableCoupons(response.data.availableCoupons);
            setAvailablePoints(response.data.availablePoints?.amount || 0);
            updateTotalPrice(response.data.cartItems);
        } catch (error) {
            console.error("❌ 장바구니 데이터를 불러오는 중 오류 발생:", error);
            setError("장바구니 정보를 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    /** ✅ 쿠폰 적용 */
    const handleApplyCoupon = (cartItemId, selectedCouponId) => {
        setAppliedCoupons((prevCoupons) => {
            const updatedCoupons = { ...prevCoupons };

            if (selectedCouponId === "") {
                delete updatedCoupons[cartItemId]; // ✅ "선택 없음" 선택 시 쿠폰 제거
            } else {
                const selectedCoupon = availableCoupons.find((coupon) => coupon.id === Number(selectedCouponId));
                updatedCoupons[cartItemId] = selectedCoupon;
            }

            updateTotalPrice(cartItems, updatedCoupons); // ✅ 쿠폰 적용 시 총 가격 즉시 반영
            return updatedCoupons;
        });
    };

    /** ✅ 포인트 적용 */
    const handleUsePoints = (event) => {
        let inputPoints = parseInt(event.target.value, 10) || 0;
        const maxPoints = Math.min(availablePoints, totalPrice * 0.1);

        if (inputPoints > maxPoints) {
            inputPoints = maxPoints;
        }

        setUsedPoints(inputPoints);
        updateTotalPrice(cartItems, appliedCoupons, inputPoints);
    };

    /** ✅ 장바구니 총 가격 계산 */
    const updateTotalPrice = (items, coupons = appliedCoupons, pointsUsed = usedPoints) => {
        let total = 0;

        items.forEach((item) => {
            const discount = coupons[item.id] ? (item.price * coupons[item.id].discount) / 100 : 0;
            total += (item.price - discount) * item.quantity;
        });

        total -= pointsUsed;
        setTotalPrice(Math.max(total, 0));
    };

    /** ✅ 적용 가능한 쿠폰 필터링 */
    const getApplicableCoupons = (cartItem) => {
        return availableCoupons.filter(
            (coupon) =>
                (coupon.target === "ALL_PRODUCTS" ||
                    (coupon.target === "CATEGORY" && coupon.targetValue === cartItem.category) ||
                    (coupon.target === "BRAND" && coupon.targetValue === cartItem.brandName)) &&
                !Object.values(appliedCoupons).some((appliedCoupon) => appliedCoupon.id === coupon.id && appliedCoupon !== appliedCoupons[cartItem.id])
        );
    };

    /** ✅ 결제하기 */
    const handleCheckout = () => {
        navigate("/checkout", { state: { cartItems, availablePoints, usedPoints, totalPrice } });
    };

    if (loading) return <p className="loading">로딩 중...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!cartItems.length) return <p className="empty-cart">장바구니가 비어 있습니다.</p>;

    return (
        <div className="cart-page">
            <h1>장바구니</h1>
            <div className="cart-items">
                {cartItems.map((item) => {
                    const discount = appliedCoupons[item.id] ? (item.price * appliedCoupons[item.id].discount) / 100 : 0;
                    const finalPrice = appliedCoupons[item.id] ? item.price - discount : item.price;

                    return (
                        <div key={item.id} className="cart-item">
                            <img src={item.productImage} alt={item.productName} className="cart-item-image" />
                            <div className="cart-item-details">
                                <h2>{item.productName}</h2>
                                <p>색상: {item.color} / 사이즈: {item.size} / 수량: {item.quantity}</p>

                                {/* ✅ 기존 가격 (빗금) & 할인 가격 (빨간색) */}
                                {appliedCoupons[item.id] ? (
                                    <p>
                                        <span className="original-price">{item.price.toLocaleString()} 원</span>{" "}
                                        <span className="discounted-price">{finalPrice.toLocaleString()} 원</span>
                                    </p>
                                ) : (
                                    <p className="price">{item.price.toLocaleString()} 원</p>
                                )}

                                {/* ✅ 적용된 쿠폰 표시 */}
                                {appliedCoupons[item.id] && (
                                    <p className="applied-coupon">
                                        적용된 쿠폰: {appliedCoupons[item.id].name} (-{appliedCoupons[item.id].discount}%)
                                    </p>
                                )}

                                {/* ✅ 쿠폰 선택 */}
                                <div className="coupon-selector">
                                    <label>쿠폰 선택:</label>
                                    <select
                                        onChange={(e) => handleApplyCoupon(item.id, e.target.value)}
                                        value={appliedCoupons[item.id]?.id || ""} // ✅ 적용된 쿠폰 유지
                                    >
                                        <option value="">선택 없음</option>
                                        {getApplicableCoupons(item).map((coupon) => (
                                            <option key={coupon.id} value={coupon.id}>
                                                {coupon.name} (-{coupon.discount}%)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="cart-summary">
                <h2>결제 요약</h2>
                <p>총 상품 금액: {totalPrice?.toLocaleString()} 원</p>
                <p>사용 가능한 포인트: {availablePoints.toLocaleString()} P</p>
                <label>사용할 포인트:</label>
                <input
                    type="number"
                    value={usedPoints}
                    onChange={handleUsePoints}
                    min="0"
                    max={Math.min(availablePoints || 0, totalPrice * 0.1)}
                />
                <button className="checkout-button" onClick={handleCheckout}>
                    결제하기
                </button>
            </div>
        </div>
    );
};

export default Cart;
