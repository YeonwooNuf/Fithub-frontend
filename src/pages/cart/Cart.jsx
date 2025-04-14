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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);              // ✅ 최종 결제 금액 (할인 적용 후)
    const [totalOriginalPrice, setTotalOriginalPrice] = useState(0);  // ✅ 할인 전 금액 (정가 기준)
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

    // ✅ 중복 사용된 쿠폰인지 확인
    const isCouponUsed = (userCouponId, cartItemId) => {
        return Object.entries(appliedCoupons).some(
            ([itemId, coupon]) =>
                itemId !== String(cartItemId) && coupon.userCouponId === userCouponId
        );
    };

    /** ✅ 쿠폰 적용/해제 및 변경 */
    const handleApplyCoupon = (cartItemId, selectedCouponId) => {
        console.log("🟢 쿠폰 변경 시작 | cartItemId:", cartItemId, "| 선택된 쿠폰 ID:", selectedCouponId);

        const cartItem = cartItems.find(i => i.id === cartItemId);  // ✅ 이 줄 추가

        setAppliedCoupons(prevCoupons => {
            const updatedCoupons = { ...prevCoupons };

            if (!selectedCouponId) {
                delete updatedCoupons[cartItemId];
            } else {
                const selectedCoupon = availableCoupons.find(
                    c => c.userCouponId === Number(selectedCouponId)
                );

                if (!selectedCoupon) {
                    console.warn("🚨 일치하는 쿠폰을 찾을 수 없습니다:", selectedCouponId);
                    return prevCoupons;
                }

                updatedCoupons[cartItemId] = {
                    id: selectedCoupon.couponId,
                    userCouponId: selectedCoupon.userCouponId,
                    name: selectedCoupon.name,
                    discount: selectedCoupon.discount,
                };
            }

            // ✅ 수정: cartItem이 있을 때만 로그 찍기
            if (cartItem) {
                console.log("👉 적용 가능한 쿠폰:", getApplicableCoupons(cartItem));
            }

            console.log("🧾 전체 쿠폰:", availableCoupons);
            console.log("🛒 적용된 쿠폰들:", appliedCoupons);

            updateTotalPrice(selectedItems, updatedCoupons);
            return updatedCoupons;
        });
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
        let originalTotal = 0;
        let discountedTotal = 0;

        cartItems.forEach((item) => {
            if (updatedSelectedItems.includes(item.id)) {
                const itemTotal = item.price * item.quantity;
                originalTotal += itemTotal;

                const appliedCoupon = updatedCoupons[item.id];
                const discount = appliedCoupon ? (item.price * appliedCoupon.discount) / 100 : 0;
                const discountedItemPrice = (item.price - discount) * item.quantity;

                discountedTotal += discountedItemPrice;
            }
        });

        setTotalOriginalPrice(originalTotal);             // ✅ 정가 총합 저장
        setTotalPrice(Math.max(discountedTotal, 0));      // ✅ 최종 결제 금액
    };

    /** ✅ 특정 상품에 적용 가능한 쿠폰 필터링 */
    const getApplicableCoupons = (cartItem) => {
        const appliedCouponId = appliedCoupons[cartItem.id]?.userCouponId;

        return availableCoupons.filter((coupon) => {
            const isMatchedTarget =
                coupon.target === "ALL_PRODUCTS" ||
                (coupon.target === "CATEGORY" && coupon.targetValue === cartItem.category) ||
                (coupon.target === "BRAND" && coupon.targetValue === cartItem.brandName);

            const isAlreadyUsed = isCouponUsed(coupon.userCouponId, cartItem.id);
            const isAppliedToCurrent = coupon.userCouponId === appliedCouponId;

            return isMatchedTarget && (!isAlreadyUsed || isAppliedToCurrent);
        });
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
                totalOriginalPrice,
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
                                <div className="cart-product-info">
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
                                    {/* ✅ 쿠폰 셀렉트 박스 렌더 직전 로그 찍기 */}
                                    {console.log("💡 쿠폰 리스트 (item id:", item.id, "):", getApplicableCoupons(item))}
                                    <select
                                        onChange={(e) => handleApplyCoupon(item.id, e.target.value)}
                                        value={appliedCoupons[item.id]?.userCouponId || ""}
                                    >
                                        <option value="">선택 없음</option>
                                        {getApplicableCoupons(item)
                                            .filter(coupon => {
                                                const appliedId = appliedCoupons[item.id]?.userCouponId;
                                                return (
                                                    (coupon.userCouponId !== undefined) && // 🔐 필수: userCouponId 없는 쿠폰은 제외
                                                    (!isCouponUsed(coupon.userCouponId, item.id) ||
                                                        coupon.userCouponId === appliedId)
                                                );
                                            })
                                            .map((coupon) => (
                                                <option
                                                    key={`${item.id}-${coupon.userCouponId}`}
                                                    value={coupon.userCouponId}
                                                >
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
                <p>총 상품 가격: {totalOriginalPrice?.toLocaleString()} 원</p>
                <p>할인 적용 금액: {totalPrice?.toLocaleString()} 원</p>
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
