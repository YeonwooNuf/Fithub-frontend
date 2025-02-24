import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import "./AdminEvent.css";

const AdminEvent = () => {
  const { userInfo } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [manualCoupons, setManualCoupons] = useState([]);
  const [form, setForm] = useState({
    title: "",
    mainContent: "",
    additionalContent: "",
    imageUrl: "",
    eventType: "COUPON",
    couponCode: "",
    rewardPoint: 0,
    endDate: "" // ✅ 종료 날짜만 입력받음
  });
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 📌 이벤트 목록 불러오기
  useEffect(() => {
    axios
      .get("/api/admin/events", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setEvents(res.data))
      .catch((err) => console.error(err));
  }, []);

  // 📌 수동 지급 쿠폰 목록 불러오기
  useEffect(() => {
    axios
      .get("/api/admin/coupons/manual", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setManualCoupons(res.data))
      .catch((err) => console.error("수동 지급 쿠폰 로딩 실패:", err));
  }, []);

  // 📌 입력 값 변경 핸들러
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📌 이벤트 등록 또는 수정
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const eventData = {
      ...form,
      startDate: undefined, // ✅ 시작 날짜를 프론트엔드에서 보내지 않음
    };

    if (selectedEvent) {
      axios
        .put(`/api/admin/events/${selectedEvent.id}`, eventData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(() => {
          alert("이벤트 수정 성공!");
          window.location.reload();
        })
        .catch((err) => console.error(err));
    } else {
      axios
        .post("/api/admin/events", eventData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(() => {
          alert("이벤트 등록 성공!");
          window.location.reload();
        })
        .catch((err) => console.error(err));
    }
  };

  // 📌 이벤트 삭제
  const handleDelete = (eventId) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      axios
        .delete(`/api/admin/events/${eventId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(() => {
          alert("이벤트 삭제 성공!");
          setEvents(events.filter((event) => event.id !== eventId));
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <div className="admin-container">
      <h1>🛠 관리자 이벤트 관리</h1>

      {/* 이벤트 등록 / 수정 폼 */}
      <form className="admin-form" onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="이벤트 제목" value={form.title} onChange={handleChange} required />
        <textarea name="mainContent" placeholder="본 내용" value={form.mainContent} onChange={handleChange} required />
        <textarea name="additionalContent" placeholder="부가 내용" value={form.additionalContent} onChange={handleChange} />
        <input type="text" name="imageUrl" placeholder="이미지 URL" value={form.imageUrl} onChange={handleChange} />

        {/* 📌 종료일만 입력받음 */}
        <label>이벤트 종료일:</label>
        <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />

        {/* 이벤트 유형 선택 */}
        <select name="eventType" value={form.eventType} onChange={handleChange}>
          <option value="COUPON">쿠폰 지급</option>
          <option value="POINT">적립금 지급</option>
        </select>

        {/* 📌 쿠폰 지급 이벤트일 경우, 수동 쿠폰 목록을 선택 */}
        {form.eventType === "COUPON" && (
          <select name="couponCode" value={form.couponCode} onChange={handleChange} required>
            <option value="">쿠폰을 선택하세요</option>
            {manualCoupons.map((coupon) => (
              <option key={coupon.id} value={coupon.couponCode}>
                {coupon.name} ({coupon.couponCode})
              </option>
            ))}
          </select>
        )}

        {/* 📌 적립금 지급 이벤트일 경우, 적립금 입력 */}
        {form.eventType === "POINT" && (
          <input type="number" name="rewardPoint" placeholder="적립금 (숫자 입력)" value={form.rewardPoint} onChange={handleChange} />
        )}

        <button type="submit">{selectedEvent ? "이벤트 수정" : "이벤트 등록"}</button>
      </form>

      {/* 이벤트 목록 */}
      <h2>📜 이벤트 목록</h2>
      <ul className="event-list">
        {events.map((event) => (
          <li key={event.id}>
            <strong>{event.title}</strong> - {event.eventType}
            <button className="edit-button" onClick={() => setSelectedEvent(event)}>✏️ 수정</button>
            <button className="delete-button" onClick={() => handleDelete(event.id)}>🗑 삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminEvent;
