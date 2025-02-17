import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Address.css";

// ✅ JWT 토큰을 가져와 인증 헤더를 생성하는 함수
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const Address = () => {
    const [addresses, setAddresses] = useState([]); // 저장된 주소 목록
    const [newAddressData, setNewAddressData] = useState({
        zonecode: "",
        roadAddress: "",
        jibunAddress: "",
        detailAddress: "",
        reference: "",
    });
    const [editAddress, setEditAddress] = useState(null); // 수정 중인 주소
    const [editedAddressData, setEditedAddressData] = useState({}); // 수정할 주소 데이터
    const [defaultAddressId, setDefaultAddressId] = useState(null); // 기본 배송지 ID

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await axios.get("/api/users/addresses", { headers: getAuthHeaders() });
                setAddresses(response.data);

                const defaultAddr = response.data.find(addr => addr.isDefault);
                if (defaultAddr) {
                    setDefaultAddressId(defaultAddr.id);
                }
            } catch (error) {
                console.error("❌ 주소 정보를 불러오는 중 오류 발생:", error);
            }
        };

        fetchAddresses();
    }, []);

    // ✅ 카카오 주소 API 호출
    const handleSearchAddress = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                let extraRoadAddr = ""; // 참고 항목

                if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
                    extraRoadAddr += data.bname;
                }

                if (data.buildingName !== "" && data.apartment === "Y") {
                    extraRoadAddr += (extraRoadAddr !== "" ? ", " + data.buildingName : data.buildingName);
                }

                if (extraRoadAddr !== "") {
                    extraRoadAddr = "(" + extraRoadAddr + ")";
                }

                setNewAddressData({
                    ...newAddressData,
                    zonecode: data.zonecode, // ✅ `Postcode` → `zonecode` 필드 사용
                    roadAddress: data.roadAddress,
                    jibunAddress: data.jibunAddress || "",
                    reference: extraRoadAddr,
                });
            }
        }).open();
    };

    // ✅ 새 주소 추가 핸들러
    const handleAddAddress = async () => {
        if (!newAddressData.zonecode.trim() || !newAddressData.roadAddress.trim() || !newAddressData.detailAddress.trim()) {
            alert("주소를 입력해주세요.");
            return;
        }

        try {
            const response = await axios.post("/api/users/addresses", newAddressData, { headers: getAuthHeaders() });
            setAddresses([...addresses, response.data]); // UI 업데이트
            setNewAddressData({ zonecode: "", roadAddress: "", jibunAddress: "", detailAddress: "", reference: "" });
        } catch (error) {
            console.error("❌ 주소 추가 중 오류 발생:", error);
        }
    };

    // ✅ 기본 배송지 설정 핸들러
    const handleSetDefault = async (id) => {
        try {
            await axios.put(`/api/users/addresses/${id}/set-default`, {}, { headers: getAuthHeaders() });
            setDefaultAddressId(id);
        } catch (error) {
            console.error("❌ 기본 배송지 설정 중 오류 발생:", error);
        }
    };

    // ✅ 주소 삭제 핸들러
    const handleDeleteAddress = async (id) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        try {
            await axios.delete(`/api/users/addresses/${id}`, { headers: getAuthHeaders() });
            setAddresses(addresses.filter(addr => addr.id !== id)); // UI에서 삭제
        } catch (error) {
            console.error("❌ 주소 삭제 중 오류 발생:", error);
        }
    };

    // ✅ 주소 수정 모드 활성화
    const enableEditMode = (address) => {
        setEditAddress(address.id);
        setEditedAddressData({ ...address });
    };

    // ✅ 주소 수정 저장
    const handleUpdateAddress = async (id) => {
        try {
            const response = await axios.put(`/api/users/addresses/${id}`, editedAddressData, { headers: getAuthHeaders() });
            setAddresses(addresses.map(addr => addr.id === id ? response.data : addr)); // UI 업데이트
            setEditAddress(null); // 수정 모드 종료
        } catch (error) {
            console.error("❌ 주소 수정 중 오류 발생:", error);
        }
    };

    return (
        <div className="address-container">
            <h2>주소 관리</h2>

            {/* ✅ 새 주소 추가 */}
            <div className="add-address">
                <button onClick={handleSearchAddress}>주소 검색</button>
                <input type="text" placeholder="우편번호" value={newAddressData.zonecode} readOnly />
                <input type="text" placeholder="도로명 주소" value={newAddressData.roadAddress} readOnly />
                <input type="text" placeholder="지번 주소" value={newAddressData.jibunAddress} readOnly />
                <input type="text" placeholder="상세 주소" value={newAddressData.detailAddress} onChange={(e) => setNewAddressData({ ...newAddressData, detailAddress: e.target.value })} />
                <input type="text" placeholder="참고 항목" value={newAddressData.reference} readOnly />
                <button onClick={handleAddAddress}>추가</button>
            </div>

            {/* ✅ 주소 목록 표시 */}
            <ul className="address-list">
                {addresses.map((addr) => (
                    <li key={addr.id} className="address-item">
                        {editAddress === addr.id ? (
                            <>
                                <input type="text" value={editedAddressData.detailAddress} onChange={(e) => setEditedAddressData({ ...editedAddressData, detailAddress: e.target.value })} />
                                <button onClick={() => handleUpdateAddress(addr.id)}>저장</button>
                            </>
                        ) : (
                            <>
                                <span>{addr.zonecode} | {addr.roadAddress} ({addr.detailAddress})</span>
                                {defaultAddressId === addr.id ? (
                                    <span className="default-badge">기본 배송지</span>
                                ) : (
                                    <button onClick={() => handleSetDefault(addr.id)}>기본 설정</button>
                                )}
                                <button onClick={() => enableEditMode(addr)}>수정</button>
                                <button onClick={() => handleDeleteAddress(addr.id)} className="delete-btn">삭제</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Address;
