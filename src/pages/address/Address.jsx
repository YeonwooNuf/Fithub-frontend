import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Address.css";

// ✅ JWT 토큰을 가져와 인증 헤더를 생성하는 함수
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const Address = () => {
    const [addresses, setAddresses] = useState([]); // 저장된 주소 목록
    const [defaultAddressId, setDefaultAddressId] = useState(null); // 기본 배송지 ID
    const [editAddress, setEditAddress] = useState(null); // 수정 중인 주소
    const [editedAddressText, setEditedAddressText] = useState(""); // 수정할 주소 내용
    const navigate = useNavigate(); // ✅ 로그인 페이지 이동용

    // ✅ 새 주소 정보 상태 (객체 형태로 관리)
    const [newAddressData, setNewAddressData] = useState({
        postCode: "",
        roadAddress: "",
        jibunAddress: "",
        detailAddress: "",
        reference: ""
    });

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    alert("로그인이 필요합니다.");
                    navigate("/login");
                    return;
                }

                const response = await axios.get("/api/users/addresses", { headers: getAuthHeaders() });
                setAddresses(response.data);

                const defaultAddr = response.data.find(addr => addr.isDefault);
                if (defaultAddr) {
                    setDefaultAddressId(defaultAddr.id);
                }
            } catch (error) {
                console.error("❌ 주소 정보를 불러오는 중 오류 발생:", error);
                if (error.response && error.response.status === 401) {
                    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                    localStorage.removeItem("token");
                    navigate("/login");
                }
            }
        };

        fetchAddresses();
    }, [navigate]);

    // ✅ 카카오 주소 검색 API 활용
    const handleSearchAddress = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                setNewAddressData({
                    ...newAddressData,
                    postCode: data.zonecode,
                    roadAddress: data.roadAddress,
                    jibunAddress: data.jibunAddress,
                    reference: data.buildingName || ""
                });
            }
        }).open();
    };

    // ✅ 새 주소 추가 핸들러
    const handleAddAddress = async () => {
        const { postCode, roadAddress, jibunAddress, detailAddress } = newAddressData;

        if (!postCode || !roadAddress || !jibunAddress || !detailAddress) {
            alert("모든 주소 정보를 입력해주세요.");
            return;
        }

        try {
            const response = await axios.post("/api/users/addresses", newAddressData, { headers: getAuthHeaders() });
            setAddresses([...addresses, response.data]);
            setNewAddressData({ postCode: "", roadAddress: "", jibunAddress: "", detailAddress: "", reference: "" });
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
            setAddresses(addresses.filter(addr => addr.id !== id));
        } catch (error) {
            console.error("❌ 주소 삭제 중 오류 발생:", error);
        }
    };

    return (
        <div className="address-container">
            <h2>주소 관리</h2>

            {/* ✅ 새 주소 입력 폼 */}
            <div className="add-address">
                <button onClick={handleSearchAddress}>주소 검색</button>
                <input type="text" placeholder="우편번호" value={newAddressData.postCode} readOnly />
                <input type="text" placeholder="도로명 주소" value={newAddressData.roadAddress} readOnly />
                <input type="text" placeholder="지번 주소" value={newAddressData.jibunAddress} readOnly />
                <input type="text" placeholder="상세 주소" value={newAddressData.detailAddress} 
                    onChange={(e) => setNewAddressData({ ...newAddressData, detailAddress: e.target.value })} />
                <input type="text" placeholder="참고 항목" value={newAddressData.reference} readOnly />
                <button onClick={handleAddAddress}>추가</button>
            </div>

            {/* ✅ 주소 목록 표시 */}
            <ul className="address-list">
                {addresses.map((addr) => (
                    <li key={addr.id} className="address-item">
                        <div>
                            <strong>{addr.roadAddress} ({addr.jibunAddress})</strong>
                            <p>우편번호: {addr.postCode}</p>
                            <p>상세주소: {addr.detailAddress}</p>
                            {addr.reference && <p>참고항목: {addr.reference}</p>}
                        </div>

                        {defaultAddressId === addr.id ? (
                            <span className="default-badge">기본 배송지</span>
                        ) : (
                            <button onClick={() => handleSetDefault(addr.id)}>기본 설정</button>
                        )}

                        <button onClick={() => handleDeleteAddress(addr.id)} className="delete-btn">삭제</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Address;
