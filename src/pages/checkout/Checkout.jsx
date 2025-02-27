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
        window.location.href = "/login";  // 로그인 페이지로 이동
        return {};
    }

    return { Authorization: `Bearer ${token}` };
};


const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems = [], appliedCoupons = {}, totalPrice = 0 } = location.state || {};

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [availablePoints, setAvailablePoints] = useState(0);
    const [usedPoints, setUsedPoints] = useState(0);
    const [finalPrice, setFinalPrice] = useState(totalPrice);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [selectedCoupons, setSelectedCoupons] = useState(appliedCoupons);

    useEffect(() => {
        fetchDefaultAddress();
        fetchAvailablePoints();
        fetchUserCoupons();
    }, []);

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

    const fetchAvailablePoints = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers.Authorization) {
                navigate("/login");
                return;
            }
            const response = await axios.get("/api/points", { headers });
            setAvailablePoints(response.data.amount || 0);
        } catch (error) {
            console.error("❌ 포인트 정보를 불러오는 중 오류 발생:", error);
        }
    };

    const fetchUserCoupons = async () => {
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

    const getApplicableCoupons = (cartItem) => {
        return availableCoupons.filter(
            (coupon) =>
                coupon.target === "ALL_PRODUCTS" ||
                (coupon.target === "CATEGORY" && coupon.targetValue === cartItem.category) ||
                (coupon.target === "BRAND" && coupon.targetValue === cartItem.brandName)
        );
    };

    const handleApplyCoupon = (cartItemId, selectedCouponId) => {
        setSelectedCoupons((prevCoupons) => {
            const updatedCoupons = { ...prevCoupons };
            if (selectedCouponId === "") {
                delete updatedCoupons[cartItemId];
            } else {
                const selectedCoupon = availableCoupons.find((coupon) => coupon.id === Number(selectedCouponId));
                updatedCoupons[cartItemId] = selectedCoupon;
            }
            updateFinalPrice(cartItems, updatedCoupons, usedPoints);
            return updatedCoupons;
        });
    };

    const handleUsePoints = (event) => {
        let inputPoints = parseInt(event.target.value, 10) || 0;
        const maxPoints = Math.min(availablePoints, totalPrice * 0.1);
        if (inputPoints > maxPoints) {
            inputPoints = maxPoints;
        }
        setUsedPoints(inputPoints);
        updateFinalPrice(cartItems, selectedCoupons, inputPoints);
    };

    const updateFinalPrice = (items, coupons, pointsUsed) => {
        let total = 0;
        items.forEach((item) => {
            const discount = coupons[item.id] ? (item.price * coupons[item.id].discount) / 100 : 0;
            total += (item.price - discount) * item.quantity;
        });
        total -= pointsUsed;
        setFinalPrice(Math.max(total, 0));
    };

    return (
        <div className="checkout-page">
            <h1>결제하기</h1>

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

            <div className="card cart-items-card">
                <h2>주문 상품</h2>
                {cartItems.map((item) => {
                    const discount = selectedCoupons[item.id] ? (item.price * selectedCoupons[item.id].discount) / 100 : 0;
                    const finalItemPrice = item.price - discount;
                    return (
                        <div key={item.id} className="cart-item">
                            <img src={item.productImage} alt={item.productName} className="cart-item-image" />
                            <h3>{item.productName}</h3>
                            <p>색상: {item.color} | 사이즈: {item.size} | 수량: {item.quantity}</p>
                            <p className="price"><span className="discounted-price">{finalItemPrice.toLocaleString()} 원</span></p>
                        </div>
                    );
                })}
            </div>

            <button className="btn btn-primary checkout-button">결제하기</button>

            {isAddressModalOpen && <AddressModal onClose={() => setIsAddressModalOpen(false)} onSelectAddress={setSelectedAddress} />}
        </div>
    );
};

export default Checkout;
