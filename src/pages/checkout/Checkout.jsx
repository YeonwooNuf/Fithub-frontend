import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Checkout.css";

function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();

    // 상품 정보 (단일 상품 구매 or 장바구니 구매)
    const singleProduct = location.state?.product;
    const cartItems = location.state?.cartItems || [];
    const isCartPurchase = cartItems.length > 0;
    const products = isCartPurchase ? cartItems : [singleProduct];

    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [points, setPoints] = useState(0);
    const [usePoints, setUsePoints] = useState(0);
    const [finalAmount, setFinalAmount] = useState(0);

    // ✅ 사용자의 쿠폰 & 포인트 정보 불러오기
    useEffect(() => {
        if (!products || products.length === 0) {
            navigate("/cart");
            return;
        }

        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");

                // ✅ 쿠폰 조회
                const couponRes = await fetch("/api/coupons", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const couponData = await couponRes.json();
                console.log("✅ 쿠폰 API 응답:", couponData);

                // ✅ `coupons`가 배열인지 확인 후 설정
                if (couponData.success && Array.isArray(couponData.coupons)) {
                    setAvailableCoupons(couponData.coupons);
                } else {
                    setAvailableCoupons([]);
                }

                // ✅ 포인트 조회
                const pointRes = await fetch("/api/points/balance", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const pointBalance = await pointRes.json();
                setPoints(typeof pointBalance === "number" ? pointBalance : 0);
            } catch (err) {
                console.error("❌ 데이터 로딩 오류:", err);
                setAvailableCoupons([]);
                setPoints(0);
            }
        };

        fetchUserData();
    }, []);

    // ✅ 최종 결제 금액 계산 (할인율 적용 + 최대 할인 금액 고려)
    useEffect(() => {
        const totalProductPrice = products.reduce((acc, item) => acc + item.price, 0);
        let discountAmount = 0;

        if (selectedCoupon) {
            const calculatedDiscount = (totalProductPrice * selectedCoupon.discount) / 100;
            discountAmount = Math.min(calculatedDiscount, selectedCoupon.maxDiscountAmount);
        }

        let newFinalAmount = totalProductPrice - discountAmount - usePoints;
        setFinalAmount(newFinalAmount > 0 ? newFinalAmount : 0);
    }, [selectedCoupon, usePoints, products]);

    return (
        <div className="checkout-container">
            <h1>주문 결제</h1>

            {/* ✅ 상품 목록 */}
            <div className="product-list">
                {products.map((item, index) => (
                    <div className="product-info" key={index}>
                        <img src={item.imageUrl} alt={item.name} />
                        <div>
                            <h2>{item.name}</h2>
                            <p>{item.price.toLocaleString()}원</p>
                            <p>사이즈: {item.selectedSize}</p>
                            <p>색상: {item.selectedColor}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ✅ 쿠폰 선택 */}
            <div className="payment-options">
                <h3>쿠폰 선택</h3>
                <select
                    onChange={(e) => {
                        const value = e.target.value;
                        setSelectedCoupon(value ? JSON.parse(value) : null); // 빈 값일 경우 null 설정
                    }}
                >
                    <option value="">쿠폰 선택 안함</option>
                    {Array.isArray(availableCoupons) && availableCoupons.length > 0 ? (
                        availableCoupons.map((coupon) => (
                            <option key={coupon.id} value={JSON.stringify(coupon)}>
                                {coupon.name} (-최대 {coupon.maxDiscountAmount.toLocaleString()}원 할인)
                            </option>
                        ))
                    ) : (
                        <option value="">사용 가능한 쿠폰이 없습니다.</option>
                    )}
                </select>

                {/* ✅ 포인트 사용 */}
                <h3>포인트 사용</h3>
                <input
                    type="number"
                    value={usePoints}
                    onChange={(e) => {
                        let value = Math.min(Number(e.target.value), points);
                        value = Math.max(value, 0);
                        setUsePoints(value);
                    }}
                />
                <p>보유 포인트: {points.toLocaleString()}원</p>
            </div>

            {/* ✅ 최종 결제 금액 */}
            <div className="final-amount">
                <h3>최종 결제 금액: {finalAmount.toLocaleString()}원</h3>
            </div>

            {/* ✅ 결제하기 버튼 (추후 구현) */}
            <button className="payment-button" onClick={() => alert("결제 기능 구현 예정!")}>
                결제하기
            </button>
        </div>
    );
}

export default Checkout;
