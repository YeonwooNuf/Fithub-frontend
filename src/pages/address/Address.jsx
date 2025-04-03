import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Address.css";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const Address = () => {
    const [addresses, setAddresses] = useState([]);
    const [defaultAddressId, setDefaultAddressId] = useState(null);
    const [newAddressData, setNewAddressData] = useState({
        zonecode: "",
        roadAddress: "",
        jibunAddress: "",
        detailAddress: "",
        reference: "",
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    // ✅ 주소 목록 불러오기
    const fetchAddresses = async () => {
        try {
            const response = await axios.get("/api/users/addresses", { headers: getAuthHeaders() });

            console.log("📌 받아온 주소 목록:", response.data);

            setAddresses(response.data);
            const defaultAddr = response.data.find(addr => addr.default);
            setDefaultAddressId(defaultAddr ? defaultAddr.id : null);
        } catch (error) {
            console.error("❌ 주소 정보를 불러오는 중 오류 발생:", error);
        }
    };

    // ✅ 카카오 주소 검색 API
    const handleSearchAddress = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                let extraRoadAddr = "";

                if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
                    extraRoadAddr += data.bname;
                }

                if (data.buildingName !== "" && data.apartment === "Y") {
                    extraRoadAddr += (extraRoadAddr !== "" ? ", " + data.buildingName : data.buildingName);
                }

                if (extraRoadAddr !== "") {
                    extraRoadAddr = "(" + extraRoadAddr + ")";
                }

                setNewAddressData((prevData) => ({
                    ...prevData,
                    zonecode: data.zonecode,
                    roadAddress: data.roadAddress,
                    jibunAddress: data.jibunAddress || "",
                    reference: extraRoadAddr,
                }));
            }
        }).open();
    };

    // ✅ 주소 추가
    const handleAddAddress = async () => {
        if (!newAddressData.zonecode.trim() || !newAddressData.roadAddress.trim() || !newAddressData.detailAddress.trim()) {
            alert("주소를 입력해주세요.");
            return;
        }

        try {
            await axios.post("/api/users/addresses", newAddressData, { headers: getAuthHeaders() });
            fetchAddresses();
            setNewAddressData({
                zonecode: "",
                roadAddress: "",
                jibunAddress: "",
                detailAddress: "",
                reference: "",
            });
        } catch (error) {
            console.error("❌ 주소 추가 중 오류 발생:", error);
        }
    };

    // ✅ 기본 배송지 설정
    const handleSetDefault = async (id) => {
        try {
            await axios.put(`/api/users/addresses/${id}/set-default`, {}, { headers: getAuthHeaders() });
            fetchAddresses();
        } catch (error) {
            console.error("❌ 기본 배송지 설정 중 오류 발생:", error);
        }
    };

    // ✅ 주소 삭제
    const handleDeleteAddress = async (id) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        try {
            await axios.delete(`/api/users/addresses/${id}`, { headers: getAuthHeaders() });
            fetchAddresses();
        } catch (error) {
            console.error("❌ 주소 삭제 중 오류 발생:", error);
        }
    };

    return (
        <div className="address-container">
            <h2>주소 관리</h2>

            {/* ✅ 새 주소 추가 */}
            <div className="add-address">
                <button onClick={handleSearchAddress}>주소 검색</button>
                <input type="text" placeholder="우편번호" value={newAddressData.zonecode} readOnly />   {/* 검색 시 선택 값 대입 */}
                <input type="text" placeholder="도로명 주소" value={newAddressData.roadAddress} readOnly />
                <input type="text" placeholder="지번 주소" value={newAddressData.jibunAddress} readOnly />
                <input type="text" placeholder="상세 주소" value={newAddressData.detailAddress} onChange={(e) => setNewAddressData({ ...newAddressData, detailAddress: e.target.value })} />
                <input type="text" placeholder="참고 항목" value={newAddressData.reference} readOnly />
                <div className="add-button">
                    <button onClick={handleAddAddress}>추가</button>
                </div>
            </div>

            {/* ✅ 주소 목록 테이블 */}
            <table className="address-table">
                <thead>
                    <tr>
                        <th>기본 배송지</th>
                        <th>우편번호</th>
                        <th>주소</th>
                        <th>상세 주소</th>
                        <th>참고 항목</th>
                        <th>삭제</th>
                    </tr>
                </thead>
                <tbody>
                    {addresses.map((addr) => (
                        <tr key={addr.id}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={addr.id === defaultAddressId}
                                    onChange={() => handleSetDefault(addr.id)}
                                />
                            </td>
                            <td>{addr.zonecode}</td>
                            <td>{addr.roadAddress || addr.jibunAddress}</td>
                            <td>{addr.detailAddress}</td>
                            <td>{addr.reference}</td>
                            <td>
                                <button onClick={() => handleDeleteAddress(addr.id)} className="delete-btn">삭제</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Address;
