import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Cart.css";

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [availablePoints, setAvailablePoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const response = await axios.get("/api/cart", { headers });

                console.log("✅ 장바구니 데이터:", response.data);
                const itemsWithCoupons = await Promise.all(
                    response.data.cartItems.map(async (item) => {
                        const coupons = await fetchApplicableCoupons(item.id);
                        return { ...item, availableCoupons: coupons };
                    })
                );
                
                setCartItems(itemsWithCoupons);
                setAvailablePoints(response.data.availablePoints);
            } catch (error) {
                console.error("❌ 장바구니 데이터를 불러오는 중 오류 발생:", error);
                setError("장바구니 정보를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchCartItems();
    }, []);

    const fetchApplicableCoupons = async (cartItemId) => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(`/api/cart/${cartItemId}/coupons`, { headers });

            console.log(`🟢 상품 ${cartItemId} 적용 가능 쿠폰:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`❌ 상품 ${cartItemId} 쿠폰 조회 중 오류 발생:`, error);
            return [];
        }
    };

    const handleApplyCoupon = async (cartItemId, couponId) => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.post(
                `/api/cart/${cartItemId}/apply-coupon?couponId=${couponId}`,
                {},
                { headers }
            );

            console.log(`✅ 상품 ${cartItemId} 쿠폰 적용 성공:`, response.data);

            setCartItems((prevItems) =>
                prevItems.map((item) =>
                    item.id === cartItemId ? { ...item, appliedCoupon: response.data.appliedCoupon } : item
                )
            );
        } catch (error) {
            console.error(`❌ 상품 ${cartItemId} 쿠폰 적용 중 오류 발생:`, error);
        }
    };

    const handleRemoveCoupon = async (cartItemId) => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.delete(`/api/cart/${cartItemId}/remove-coupon`, { headers });

            console.log(`✅ 상품 ${cartItemId} 쿠폰 제거 성공`);

            setCartItems((prevItems) =>
                prevItems.map((item) =>
                    item.id === cartItemId ? { ...item, appliedCoupon: null } : item
                )
            );
        } catch (error) {
            console.error(`❌ 상품 ${cartItemId} 쿠폰 제거 중 오류 발생:`, error);
        }
    };

    const handleCheckout = () => {
        navigate("/checkout", { state: { cartItems, availablePoints } });
    };

    if (loading) return <p className="loading">로딩 중...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!cartItems.length) return <p className="empty-cart">장바구니가 비어 있습니다.</p>;

    return (
        <div className="cart-page">
            <h1>장바구니</h1>
            <div className="cart-items">
                {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                        <img src={item.productImageUrl} alt={item.productName} className="cart-item-image" />
                        <div className="cart-item-details">
                            <h2>{item.productName}</h2>
                            <p>색상: {item.selectedColor} / 사이즈: {item.selectedSize}</p>
                            <p className="price">{item.productPrice.toLocaleString()} 원</p>

                            {item.appliedCoupon && (
                                <>
                                    <p className="discounted-price">
                                        적용된 쿠폰: {item.appliedCoupon.name} (-{item.appliedCoupon.discount}%)
                                    </p>
                                    <button className="remove-item" onClick={() => handleRemoveCoupon(item.id)}>
                                        쿠폰 제거
                                    </button>
                                </>
                            )}

                            <div className="coupon-selector">
                                <label>쿠폰 선택:</label>
                                <select
                                    onChange={(e) => handleApplyCoupon(item.id, e.target.value)}
                                    defaultValue=""
                                >
                                    <option value="" disabled>
                                        적용 가능한 쿠폰 선택
                                    </option>
                                    {item.availableCoupons &&
                                        item.availableCoupons.map((coupon) => (
                                            <option key={coupon.id} value={coupon.id}>
                                                {coupon.name} (-{coupon.discount}%)
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <button className="remove-item" onClick={() => handleRemoveItem(item.id)}>
                                삭제
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="cart-summary">
                <h2>결제 요약</h2>
                <p>사용 가능한 포인트: {availablePoints.toLocaleString()} P</p>
                <button className="checkout-button" onClick={handleCheckout}>
                    결제하기
                </button>
            </div>
        </div>
    );
};

export default Cart;
