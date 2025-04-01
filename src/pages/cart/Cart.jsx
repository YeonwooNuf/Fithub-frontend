import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Cart.css";
import AddressModal from "../address/AddressModal";  // ✅ 모달 컴포넌트 import

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [availablePoints, setAvailablePoints] = useState(0);
    const [usedPoints, setUsedPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [appliedCoupons, setAppliedCoupons] = useState({})
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false); // ✅ 모달 상태
    const [updatingQuantity, setUpdatingQuantity] = useState(false); // ✅ 수량 변경 중 상태

    useEffect(() => {
        fetchCartItems();
        fetchDefaultAddress();
    }, []);

    // ✅ 최신 cartItems 상태를 반영하도록 useEffect 추가
    useEffect(() => {
        updateTotalPrice(selectedItems, appliedCoupons, cartItems);
    }, [cartItems, selectedItems, appliedCoupons]);



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

    /** ✅ 장바구니 상품 삭제 */
    const deleteCartItem = async (cartItemId) => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.delete(`/api/cart/remove/${cartItemId}`, { headers });

            // ✅ 삭제 후 장바구니 목록 다시 불러오기
            fetchCartItems();
        } catch (error) {
            console.error("❌ 장바구니 아이템 삭제 실패:", error);
            alert("상품 삭제에 실패했습니다.");
        }
    };

    /** ✅ 수량 업데이트 API 호출 */
    const updateQuantityInDB = async (cartItemId, newQuantity) => {
        try {
            setUpdatingQuantity(true); // ✅ 중복 요청 방지
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.put(`/api/cart/${cartItemId}/quantity`, { quantity: newQuantity }, { headers });

            // ✅ 수량 변경 후 장바구니 정보 다시 가져오기
            fetchCartItems();
        } catch (error) {
            console.error("❌ 수량 변경 실패:", error);
            alert("수량 변경에 실패했습니다.");
        } finally {
            setUpdatingQuantity(false);
        }
    };

    /** ✅ 수량 증가 */
    const increaseQuantity = (cartItemId, currentQuantity) => {
        const newQuantity = currentQuantity + 1;

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === cartItemId
                    ? {
                        ...item,
                        quantity: newQuantity,
                        finalPrice: (item.price - (appliedCoupons[item.id]?.discount || 0) / 100) * newQuantity
                    }
                    : item
            )
        );

        updateQuantityInDB(cartItemId, newQuantity);
    };

    /** ✅ 수량 감소 */
    const decreaseQuantity = (cartItemId, currentQuantity) => {
        if (currentQuantity <= 1) return;
        const newQuantity = currentQuantity - 1;

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === cartItemId
                    ? {
                        ...item,
                        quantity: newQuantity,
                        finalPrice: (item.price - (appliedCoupons[item.id]?.discount || 0) / 100) * newQuantity
                    }
                    : item
            )
        );

        updateQuantityInDB(cartItemId, newQuantity);
    };

    /** ✅ 쿠폰 적용/해제 및 변경 */
    const handleApplyCoupon = (cartItemId, selectedCouponId) => {
        console.log("🟢 쿠폰 변경 시작 | cartItemId:", cartItemId, "| 선택된 쿠폰 ID:", selectedCouponId);

        setAppliedCoupons(prevCoupons => {
            let updatedCoupons = { ...prevCoupons };

            if (!selectedCouponId) {
                // ✅ 선택된 쿠폰이 없을 경우, 기존 쿠폰 해제
                delete updatedCoupons[cartItemId];
            } else {
                // ✅ 선택한 쿠폰 적용
                const selectedCoupon = availableCoupons.find(coupon => coupon.id === Number(selectedCouponId));
                if (!selectedCoupon) return prevCoupons;

                console.log("🆕 새로운 쿠폰 적용:", selectedCoupon);
                updatedCoupons[cartItemId] = selectedCoupon;
            }

            // ✅ 선택된 상품 기준으로 총 가격 업데이트 (쿠폰 반영)
            updateTotalPrice(selectedItems, updatedCoupons);

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

    /** ✅ 체크박스 선택 시 즉시 총 가격 업데이트 */
    const handleSelectItem = (itemId) => {
        setSelectedItems((prevSelected) => {
            let updatedSelection;
            if (prevSelected.includes(itemId)) {
                updatedSelection = prevSelected.filter(id => id !== itemId);
            } else {
                updatedSelection = [...prevSelected, itemId];
            }

            // ✅ 선택된 상품 기준으로 즉시 총 가격 업데이트
            updateTotalPrice(updatedSelection);

            return updatedSelection;
        });
    };

    /** ✅ 선택된 상품 기준으로 총 가격 계산 */
    const updateTotalPrice = (updatedSelectedItems = selectedItems, updatedCoupons = appliedCoupons) => {
        let total = 0;

        cartItems.forEach((item) => {
            if (updatedSelectedItems.includes(item.id)) { // ✅ 선택된 상품만 가격 계산
                const appliedCoupon = updatedCoupons[item.id]; // ✅ 적용된 쿠폰 가져오기
                const discount = appliedCoupon ? (item.price * appliedCoupon.discount) / 100 : 0;
                total += (item.price - discount) * item.quantity;
            }
        });

        setTotalPrice(Math.max(total, 0));
    };

    /** ✅ 특정 상품에 적용 가능한 쿠폰 필터링 */
    const getApplicableCoupons = (cartItem) => {
        const appliedCouponId = appliedCoupons[cartItem.id]?.id;

        // ✅ 현재 상품에 적용된 쿠폰 가져오기
        const appliedCoupon = appliedCouponId
            ? availableCoupons.find(coupon => coupon.id === appliedCouponId)
            : null;

        let applicableCoupons = availableCoupons.filter(
            coupon =>
                (coupon.target === "ALL_PRODUCTS" ||
                    (coupon.target === "CATEGORY" && coupon.targetValue === cartItem.category) ||
                    (coupon.target === "BRAND" && coupon.targetValue === cartItem.brandName)) &&
                (!Object.values(appliedCoupons).some(applied => applied.id === coupon.id) ||
                    (appliedCoupon && appliedCoupon.id === coupon.id))
        );

        // ✅ 적용된 쿠폰이 이미 목록에 없다면 추가
        if (appliedCoupon && !applicableCoupons.some(coupon => coupon.id === appliedCoupon.id)) {
            applicableCoupons = [appliedCoupon, ...applicableCoupons];
        }

        return applicableCoupons;
    };


    /** ✅ 기본 배송지 가져오기 */
    const fetchDefaultAddress = async () => {
        try {
            const token = localStorage.getItem("token"); // 🔥 JWT 토큰 가져오기
            if (!token) {
                console.warn("❌ 토큰 없음: 로그인 필요");
                return;
            }

            const headers = { Authorization: `Bearer ${token}` }; // ✅ Authorization 헤더 추가
            const response = await axios.get("/api/users/addresses", { headers });

            const defaultAddr = response.data.find(addr => addr.default);
            if (defaultAddr) {
                setSelectedAddress(defaultAddr);
            }
        } catch (error) {
            console.error("❌ 배송지 불러오기 오류:", error);
            if (error.response?.status === 401) {
                alert("로그인이 필요합니다. 다시 로그인해주세요.");
            }
        }
    };

    /** ✅ 구매하기 (선택된 상품, 쿠폰 적용 정보 및 최종 가격 전달) */
    const handleCheckout = () => {
        const itemsToPurchase = cartItems
            .filter(item => selectedItems.includes(item.id)) // ✅ 선택된 상품만 필터링
            .map(item => {
                const appliedCoupon = appliedCoupons[item.id]; // ✅ 해당 상품에 적용된 쿠폰 정보
                const discount = appliedCoupon ? (item.price * appliedCoupon.discount) / 100 : 0;
                const finalPrice = (item.price - discount) * item.quantity; // ✅ 개수 반영된 최종 가격 계산

                return {
                    ...item,
                    appliedCoupon,  // ✅ 해당 상품에 적용된 쿠폰 정보 포함
                    availableCoupons: item.availableCoupons || [], // ✅ 적용 가능한 쿠폰 목록 포함
                    finalPrice, // ✅ 최종 가격 포함
                };
            });

        if (itemsToPurchase.length === 0) {
            alert("구매할 상품을 선택해주세요.");
            return;
        }

        // ✅ `/checkout` 페이지로 이동하면서 구매할 상품 데이터 전달
        navigate("/checkout", {
            state: {
                cartItems: itemsToPurchase,
                totalPrice,
                appliedCoupons
            }
        });
    };

    if (loading) return <p className="loading">로딩 중...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!cartItems.length) return <p className="empty-cart">장바구니가 비어 있습니다.</p>;

    return (
        <div className="cart-page">
            <h1>장바구니</h1>

            {/* ✅ 배송지 정보 */}
            <div className="card delivery-card">
                <h2>배송지</h2>
                {selectedAddress ? (
                    <div className="selected-address">
                        <p>배송 주소 : <strong>{selectedAddress.roadAddress}</strong></p>
                        <p>상세 주소 : {selectedAddress.detailAddress}</p>
                        <button className="btn btn-light" onClick={() => setIsAddressModalOpen(true)}>배송지 변경</button>
                    </div>
                ) : (
                    <button className="btn btn-primary" onClick={() => setIsAddressModalOpen(true)}>배송지 선택</button>
                )}
            </div>

            {cartItems.map((item) => {
                const discount = appliedCoupons[item.id] ? (item.price * appliedCoupons[item.id].discount) / 100 : 0;
                const finalPrice = (item.price - discount) * item.quantity; // ✅ 수량 반영된 최종 가격 계산

                return (
                    <div key={item.id} className="cart-item">
                        <div className="selection">
                        <button className="delete-button" onClick={() => deleteCartItem(item.id)}>
                            삭제
                        </button>
                        <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                        />
                        </div>

                        <img src={item.productImage} alt={item.productName} className="cart-item-image" />
                        <div className="cart-item-details">
                            <div className="cart-item-info">
                            <h2>{item.productName}</h2>
                            <div className="product-info">
                                <p>색상: {item.color} / 사이즈: {item.size}</p>
                                <div className="quantity-controls">
                                    <button onClick={() => decreaseQuantity(item.id, item.quantity)} disabled={item.quantity <= 1}>−</button>
                                    <p>수량 :</p>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => increaseQuantity(item.id, item.quantity)}>+</button>
                                </div>
                            </div>
                            </div>



<div className="coupon-section">
                            {appliedCoupons[item.id] && (
                                <p className="applied-coupon">
                                    적용된 쿠폰: {appliedCoupons[item.id].name} (-{appliedCoupons[item.id].discount}%)
                                </p>
                            )}

                            <div className="coupon-selector">
                                <label>쿠폰 선택:</label>
                                <select
                                    onChange={(e) => handleApplyCoupon(item.id, e.target.value)}
                                    value={appliedCoupons[item.id]?.id || ""}
                                >
                                    <option value="">선택 없음</option>
                                    {getApplicableCoupons(item).map((coupon) => (
                                        <option key={`${item.id}-${coupon.id}`} value={coupon.id}>
                                            {coupon.name} (-{coupon.discount}%)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* ✅ 가격 표시 로직 수정 */}
                            <div className="price-container">
                                {appliedCoupons[item.id] ? (
                                    <>
                                        <span className="original-price">
                                            {(item.price * item.quantity).toLocaleString()} 원
                                        </span>
                                        <span className="discounted-price">
                                            {finalPrice.toLocaleString()} 원
                                        </span>
                                    </>
                                ) : (
                                    <span>{(item.price * item.quantity).toLocaleString()} 원</span>
                                )}
                            </div>
                            </div>
                        </div>
                    </div>
                );
            })}

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
                    구매하기
                </button>
            </div>
            {/* ✅ 주소 선택 모달 */}
            {isAddressModalOpen && <AddressModal
                onClose={() => setIsAddressModalOpen(false)}
                onSelectAddress={setSelectedAddress}
            />}
        </div>
    );
};

export default Cart;
