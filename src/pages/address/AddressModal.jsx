import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AddressModal.css";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const AddressModal = ({ onClose, onSelectAddress }) => {
    const [addresses, setAddresses] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        fetchAddresses();
    }, []);

    /** ✅ 주소 목록 가져오기 (인증 추가) */
    const fetchAddresses = async () => {
        try {
            const response = await axios.get("/api/users/addresses", {
                headers: getAuthHeaders(), // ✅ Authorization 헤더 추가
            });

            setAddresses(response.data);
        } catch (error) {
            console.error("❌ 주소 불러오기 오류:", error);
            if (error.response?.status === 401) {
                alert("로그인이 필요합니다. 다시 로그인해주세요.");
                onClose(); // 모달 닫기
            }
        }
    };

    /** ✅ 주소 선택 후 반영 */
    const handleSelectAddress = () => {
        const selectedAddress = addresses.find((addr) => addr.id === selectedId);
        if (selectedAddress) {
            onSelectAddress(selectedAddress);
            onClose(); // 모달 닫기
        } else {
            alert("배송지를 선택해주세요.");
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>배송지 선택</h2>
                <ul className="address-list">
                    {addresses.map((addr) => (
                        <li
                            key={addr.id}
                            className={selectedId === addr.id ? "selected" : ""}
                            onClick={() => setSelectedId(addr.id)}
                        >
                            <p><strong>{addr.roadAddress}</strong></p>
                            <p>{addr.detailAddress}</p>
                        </li>
                    ))}
                </ul>

                <div className="modal-actions">
                    <button onClick={handleSelectAddress}>선택 완료</button>
                    <button onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
};

export default AddressModal;
