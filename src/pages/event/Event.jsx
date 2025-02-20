import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext"; // ✅ AuthContext에서 사용자 정보 가져오기
import { getAuthToken } from "./auth"; // ✅ JWT 토큰 가져오기

const Event = () => {
  const { userInfo } = useContext(AuthContext); // ✅ 사용자 정보 가져오기
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const token = getAuthToken(); // ✅ JWT 토큰 가져오기

  // 📌 이벤트 목록 불러오기
  useEffect(() => {
    axios.get("/api/events", {
      headers: { Authorization: `Bearer ${token}` }, // ✅ JWT 포함
    })
    .then(res => setEvents(res.data))
    .catch(err => console.error(err));
  }, [token]);

  // 📌 특정 이벤트 상세 조회
  const handleEventClick = (eventId) => {
    axios.get(`/api/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` }, // ✅ JWT 포함
    })
    .then(res => setSelectedEvent(res.data))
    .catch(err => console.error(err));
  };

  // 📌 적립금 이벤트 참여 요청 (JWT 인증 기반)
  const handleClaimReward = (eventId) => {
    axios.post(`/api/events/${eventId}/claim`, {}, {
      headers: { Authorization: `Bearer ${token}` }, // ✅ JWT 포함 (userId 제거)
    })
    .then(() => alert("적립금이 지급되었습니다!"))
    .catch(err => alert("이미 참여한 이벤트입니다."));
  };

  return (
    <div>
      <h1>이벤트 목록</h1>
      <ul>
        {events.map(event => (
          <li key={event.id} onClick={() => handleEventClick(event.id)}>
            <strong>{event.title}</strong> - {event.eventType}
          </li>
        ))}
      </ul>

      {/* 선택한 이벤트 상세 정보 */}
      {selectedEvent && (
        <div>
          <h2>{selectedEvent.title}</h2>
          <p>{selectedEvent.mainContent}</p>
          <p>{selectedEvent.additionalContent}</p>
          <img src={selectedEvent.imageUrl} alt={selectedEvent.title} width="300" />
          {selectedEvent.eventType === "COUPON" && (
            <p>쿠폰 코드: <strong>{selectedEvent.couponCode}</strong></p>
          )}
          {selectedEvent.eventType === "POINT" && (
            <button onClick={() => handleClaimReward(selectedEvent.id)}>적립금 받기</button>
          )}
        </div>
      )}
    </div>
  );
};

export default Event;
