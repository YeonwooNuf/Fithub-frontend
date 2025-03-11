import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Cart.css";
import AddressModal from "../address/AddressModal";  // ✅ 모달 컴포넌트 import
import { v4 as uuidv4 } from 'uuid';

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

    useEffect(() => {
        console.log("🖥 appliedCoupons 상태 변경 감지:", appliedCoupons);

        setAvailableCoupons(prevCoupons => {
            let updatedCoupons = new Set([...prevCoupons]);

            // 기존 쿠폰을 다시 추가해야 하는 경우 감지
            Object.values(appliedCoupons).forEach(coupon => {
                if (!updatedCoupons.has(coupon)) {
                    updatedCoupons.add(coupon);
                }
            });

            console.log("📢 availableCoupons 업데이트됨:", Array.from(updatedCoupons));
            return Array.from(updatedCoupons);
        });

        // ✅ 강제 렌더링을 트리거하여 UI에서 즉시 반영되도록 함
        setTimeout(() => setForceRender(prev => prev + 1), 0);
    }, [appliedCoupons]); // ✅ appliedCoupons가 변경될 때 실행

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
        updateQuantityInDB(cartItemId, newQuantity);
    };

    /** ✅ 수량 감소 (최소 1 이하로 감소하지 않도록 제한) */
    const decreaseQuantity = (cartItemId, currentQuantity) => {
        if (currentQuantity <= 1) return;
        const newQuantity = currentQuantity - 1;
        updateQuantityInDB(cartItemId, newQuantity);
    };

    /** ✅ 쿠폰 적용/해제 및 변경 */
    const [forceRender, setForceRender] = useState(0); // ✅ UI 강제 리렌더링을 위한 상태 추가

    const handleApplyCoupon = (cartItemId, selectedCouponId) => {
        console.log("🟢 쿠폰 변경 시작 | cartItemId:", cartItemId, "| 선택된 쿠폰 ID:", selectedCouponId);
    
        setCartItems(prevItems => {
            return prevItems.flatMap(item => {
                if (item.id === cartItemId) {  // ✅ 현재 선택한 상품(cartItemId)인지 확인
                    const previousCoupon = appliedCoupons[item.id]; // ✅ 기존에 적용된 쿠폰 가져오기
                    console.log("🔵 기존 쿠폰:", previousCoupon);
    
                    /** 
                     * ✅ 1️⃣ 선택 없음 (쿠폰 해제)
                     * - 사용자가 '선택 없음'을 선택한 경우 실행
                     * - 즉, 기존에 적용된 쿠폰을 제거해야 하는 상황
                     **/
                    if (!selectedCouponId) {  
                        console.log("⚪ 쿠폰 해제됨. 기존 쿠폰 다시 추가 예정:", previousCoupon);
    
                        // ✅ 현재 상품에서 적용된 쿠폰을 제거 (appliedCoupons에서 삭제)
                        setAppliedCoupons(prev => {
                            const updated = { ...prev };
                            delete updated[item.id];
                            return updated;
                        });
    
                        // ✅ 기존 쿠폰을 availableCoupons에 다시 추가
                        if (previousCoupon) {
                            setAvailableCoupons(prevCoupons => {
                                let updatedCoupons = new Set([...prevCoupons, previousCoupon]);
                                console.log("📢 기존 쿠폰 availableCoupons에 추가됨:", Array.from(updatedCoupons));
                                return Array.from(updatedCoupons);
                            });
                        }
    
                        setForceRender(prev => prev + 1); // ✅ UI 강제 리렌더링
    
                        // ✅ 비동기적으로 availableCoupons 업데이트 확인
                        setTimeout(() => {
                            console.log("📌 쿠폰 해제 후 availableCoupons 최신 상태:", availableCoupons);
                        }, 500);
    
                        // ✅ 쿠폰 해제 시, 기존 상품들을 다시 병합 (같은 상품이면 합쳐짐)
                        let updatedItems = mergeCartItems(prevItems.map(i =>
                            i.id === cartItemId ? { ...i, quantity: i.quantity } : i
                        ));
                        console.log("🔍 병합 후:", updatedItems);
    
                        updateTotalPrice(updatedItems);
                        return updatedItems;
                    } 
                    
                    /** 
                     * ✅ 2️⃣ 새로운 쿠폰 적용
                     * - 사용자가 다른 쿠폰을 선택했을 때 실행
                     * - 기존 쿠폰을 제거하고, 새로운 쿠폰을 적용해야 하는 상황
                     **/
                    else {  
                        const selectedCoupon = availableCoupons.find(coupon => coupon.id === Number(selectedCouponId));
                        if (!selectedCoupon) return [item]; // ❌ 쿠폰이 존재하지 않으면 아무 변경 없이 반환
    
                        console.log("🆕 새로운 쿠폰 적용:", selectedCoupon);
    
                        /** 
                         * ✅ 2-1️⃣ 수량이 2개 이상인 경우 (상품 분할 필요)
                         * - 하나의 상품에 여러 개의 수량이 있을 때, 일부 상품만 쿠폰을 적용해야 하는 경우
                         * - 기존 상품에서 수량을 1개 줄이고, 새로운 상품을 생성하여 쿠폰을 적용
                         **/
                        if (item.quantity > 1) {  
                            console.log("✂️ 기존 상품을 나누고 새로운 상품 생성");
    
                            // ✅ 기존 상품을 복사하여 새 상품 생성 (수량 1로 설정)
                            const newItem = {
                                ...item,
                                id: uuidv4(),
                                quantity: 1,
                            };
    
                            // ✅ 새로운 상품에 선택한 쿠폰 적용
                            setAppliedCoupons(prev => ({
                                ...prev,
                                [newItem.id]: selectedCoupon,
                            }));
    
                            // ✅ 기존 쿠폰을 다시 availableCoupons에 추가
                            if (previousCoupon) {
                                setAvailableCoupons(prevCoupons => {
                                    let updatedCoupons = new Set([...prevCoupons, previousCoupon]);
                                    console.log("📢 기존 쿠폰 availableCoupons에 추가됨:", Array.from(updatedCoupons));
                                    return Array.from(updatedCoupons);
                                });
                            }
    
                            setForceRender(prev => prev + 1); // ✅ UI 강제 리렌더링
    
                            // ✅ 비동기적으로 availableCoupons 업데이트 확인
                            setTimeout(() => {
                                console.log("📌 쿠폰 변경 후 availableCoupons 최신 상태:", availableCoupons);
                            }, 500);
    
                            // ✅ 기존 상품에서 수량을 1 줄이고, 새로운 상품을 추가하여 상태 업데이트
                            const updatedItem = { ...item, quantity: item.quantity - 1 };
                            updateTotalPrice([...prevItems, newItem]);
                            return [updatedItem, newItem];  // 🔄 기존 상품과 새 상품을 함께 반환
                        } 
                        
                        /** 
                         * ✅ 2-2️⃣ 수량이 1개인 경우 (상품 분할 불필요)
                         * - 상품이 1개밖에 없기 때문에 단순히 쿠폰을 변경하면 됨
                         **/
                        else {  
                            // ✅ 기존 상품에 선택한 쿠폰 적용
                            setAppliedCoupons(prev => ({
                                ...prev,
                                [cartItemId]: selectedCoupon,
                            }));
    
                            // ✅ 기존 쿠폰을 다시 availableCoupons에 추가
                            if (previousCoupon) {
                                setAvailableCoupons(prevCoupons => {
                                    let updatedCoupons = new Set([...prevCoupons, previousCoupon]);
                                    console.log("📢 기존 쿠폰 availableCoupons에 추가됨:", Array.from(updatedCoupons));
                                    return Array.from(updatedCoupons);
                                });
                            }
    
                            setForceRender(prev => prev + 1); // ✅ UI 강제 리렌더링
    
                            // ✅ 비동기적으로 availableCoupons 업데이트 확인
                            setTimeout(() => {
                                console.log("📌 쿠폰 변경 후 availableCoupons 최신 상태:", availableCoupons);
                            }, 500);
    
                            updateTotalPrice(prevItems);
                            return [item];  // 🔄 기존 상품을 그대로 반환 (수량 변화 없음)
                        }
                    }
                }
                return [item];  // 🔄 선택한 상품이 아닌 경우 그대로 유지
            });
        });
    };

    /** ✅ 리스트 렌더링 시점에 로그 추가 */
    console.log("📌 장바구니 렌더링 | appliedCoupons:", appliedCoupons);
    console.log("📌 장바구니 렌더링 | availableCoupons:", availableCoupons);

    /** ✅ 동일한 상품을 다시 합치는 함수 */
    const mergeCartItems = (items) => {
        let mergedItems = [];
        let newCoupons = {};

        items.forEach((item) => {
            console.log("🔍 현재 병합 확인: ", item.productId, " - 쿠폰 적용 여부:", appliedCoupons[item.id] ? "✅ 적용됨" : "❌ 미적용");

            const existingItem = mergedItems.find(
                merged =>
                    merged.productId === item.productId &&
                    merged.size === item.size &&
                    merged.color === item.color &&
                    (!appliedCoupons[item.id] && !appliedCoupons[merged.id]) // ✅ 쿠폰이 적용되지 않은 상품끼리만 병합
            );

            if (existingItem) {
                console.log("🔄 병합되는 상품:", existingItem.productId, "기존 수량:", existingItem.quantity, "새로운 수량:", item.quantity);
                existingItem.quantity += item.quantity;
            } else {
                mergedItems.push({ ...item });
            }

            if (appliedCoupons[item.id]) {
                newCoupons[item.id] = appliedCoupons[item.id];
            }
        });

        console.log("📌 병합 완료 후 결과:", mergedItems);

        setAppliedCoupons(newCoupons);
        setCartItems([...mergedItems]);
        updateTotalPrice(mergedItems);

        return mergedItems;
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

    /** ✅ 체크박스 선택 시 실행 */
    const handleSelectItem = (itemId) => {
        setSelectedItems((prevSelected) => {
            let updatedSelection;
            if (prevSelected.includes(itemId)) {
                updatedSelection = prevSelected.filter(id => id !== itemId);
            } else {
                updatedSelection = [...prevSelected, itemId];
            }
            updateTotalPrice(updatedSelection); // ✅ 선택된 상품 가격만 반영
            return updatedSelection;
        });
    };

    /** ✅ 선택된 상품 기준으로 총 가격 계산 */
    const updateTotalPrice = (updatedCartItems) => {
        let total = 0;
        updatedCartItems.forEach((item) => {
            const discount = appliedCoupons[item.id] ? (item.price * appliedCoupons[item.id].discount) / 100 : 0;
            total += (item.price - discount) * item.quantity;
        });

        total -= usedPoints;
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

    /** ✅ 구매하기 (선택된 상품만 전달) */
    const handleCheckout = () => {
        const itemsToPurchase = cartItems.filter(item => selectedItems.includes(item.id));
        if (itemsToPurchase.length === 0) {
            alert("구매할 상품을 선택해주세요.");
            return;
        }

        navigate("/checkout", {
            state: { cartItems: itemsToPurchase, availablePoints, usedPoints, totalPrice }
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
                const finalPrice = appliedCoupons[item.id] ? item.price - discount : item.price;

                return (
                    <div key={item.id} className="cart-item">
                        <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                        />
                        <button className="delete-button" onClick={() => deleteCartItem(item.id)}>
                            삭제
                        </button>

                        <img src={item.productImage} alt={item.productName} className="cart-item-image" />
                        <div className="cart-item-details">
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
                            {appliedCoupons[item.id] ? (
                                <p className="price">
                                    <span className="original-price">{item.price.toLocaleString()} 원</span>
                                    <span className="discounted-price">{finalPrice.toLocaleString()} 원</span>
                                </p>
                            ) : (
                                <p className="price">{item.price.toLocaleString()} 원</p>
                            )}

                            {appliedCoupons[item.id] && (
                                <p className="applied-coupon">
                                    적용된 쿠폰: {appliedCoupons[item.id].name} (-{appliedCoupons[item.id].discount}%)
                                </p>
                            )}

                            <div className="coupon-selector">
                                <label>쿠폰 선택:</label>
                                <select
                                    key={availableCoupons.length + forceRender} // ✅ 강제 리렌더링
                                    onChange={(e) => handleApplyCoupon(item.id, e.target.value)}
                                    value={appliedCoupons[item.id]?.id || ""}
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
