import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext"; 
import "./Event.css"; 

const Event = () => {
    const { userInfo } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [activeTab, setActiveTab] = useState("ongoing");

    useEffect(() => {
        axios.get("/api/events", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, 
        })
            .then(res => setEvents(res.data))
            .catch(err => console.error(err));
    }, []);

    // ✅ 적립금 지급 API 요청을 처리하는 함수 추가
    const handleClaimReward = (eventId) => {
        axios.post(`/api/events/${eventId}/claim`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(() => alert("✅ 적립금이 지급되었습니다!"))
        .catch(err => alert("⚠ 이미 참여한 이벤트입니다."));
    };

    // ✅ 쿠폰 코드 복사 기능 추가
    const handleCopyCoupon = (couponCode) => {
        navigator.clipboard.writeText(couponCode)
            .then(() => alert("📋 쿠폰 코드가 복사되었습니다!"))
            .catch(err => console.error("❌ 복사 실패 : ", err));
    };

    // 현재 진행 중인 이벤트와 종료된 이벤트 분리
    const now = new Date();
    const ongoingEvents = events.filter(event => new Date(event.endDate) >= now);
    const expiredEvents = events.filter(event => new Date(event.endDate) < now);

    // 특정 이벤트 상세 조회
    const handleEventClick = (eventId) => {
        axios.get(`/api/events/${eventId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
            .then(res => setSelectedEvent(res.data))
            .catch(err => console.error(err));
    };

    // 탭 변경 시 선택된 이벤트 초기화
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedEvent(null); // 선택된 이벤트 숨기기
    };

    return (
        <div className="event-container">
            <h1>📢 이벤트 목록</h1>

            {/* 탭 버튼 */}
            <div className="event-tabs">
                <button 
                    className={activeTab === "ongoing" ? "active" : ""}
                    onClick={() => handleTabChange("ongoing")}
                >
                    진행 중 이벤트
                </button>
                <button 
                    className={activeTab === "expired" ? "active" : ""}
                    onClick={() => handleTabChange("expired")}
                >
                    종료된 이벤트
                </button>
            </div>

            {/* 진행 중 이벤트 목록 */}
            {activeTab === "ongoing" && (
                <ul className="event-list">
                    {ongoingEvents.length > 0 ? (
                        ongoingEvents.map(event => (
                            <li key={event.id} onClick={() => handleEventClick(event.id)}>
                                <strong>{event.title}</strong> - {event.eventType}
                            </li>
                        ))
                    ) : (
                        <p className="no-event">📌 진행 중인 이벤트가 없습니다.</p>
                    )}
                </ul>
            )}

            {/* 종료된 이벤트 목록 */}
            {activeTab === "expired" && (
                <ul className="event-list">
                    {expiredEvents.length > 0 ? (
                        expiredEvents.map(event => (
                            <li key={event.id}>
                                <strong>{event.title}</strong> - {event.eventType}
                            </li>
                        ))
                    ) : (
                        <p className="no-event">📌 종료된 이벤트가 없습니다.</p>
                    )}
                </ul>
            )}

            {/* 선택한 이벤트 상세 정보 */}
            {selectedEvent && (
                <div className="event-details">
                    <h2>{selectedEvent.title}</h2>
                    <p>{selectedEvent.mainContent}</p>
                    <p>{selectedEvent.additionalContent}</p>
                    <p>⏳ 종료 날짜: {new Date(selectedEvent.endDate).toLocaleDateString()}</p>

                    {/* ✅ 이미지가 있을 경우에만 렌더링 */}
                    {selectedEvent.imageUrl && (
                        <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="event-image" />
                    )}

                    {/* ✅ 쿠폰 코드 표시 및 복사 버튼 */}
                    {selectedEvent.eventType === "COUPON" && (
                        <div className="coupon-container">
                            <p>🎟 쿠폰 코드: <strong>{selectedEvent.couponCode}</strong></p>
                            <button className="copy-button" onClick={() => handleCopyCoupon(selectedEvent.couponCode)}>📋 복사</button>
                        </div>
                    )}

                    {/* ✅ 적립금 지급 버튼 복구 */}
                    {selectedEvent.eventType === "POINT" && (
                        <button className="claim-button" onClick={() => handleClaimReward(selectedEvent.id)}>
                            💰 적립금 받기
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Event;
