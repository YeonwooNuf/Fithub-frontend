import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext"; // ✅ AuthContext 사용
import "./AdminEvent.css"; // ✅ CSS 파일 적용

const AdminEventPage = () => {
  const { userInfo } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    mainContent: "",
    additionalContent: "",
    imageUrl: "",
    eventType: "COUPON",
    couponCode: "",
    rewardPoint: 0,
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

  // 📌 입력 값 변경 핸들러
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📌 이벤트 등록 또는 수정
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedEvent) {
      axios
        .put(`/api/admin/events/${selectedEvent.id}`, form, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(() => {
          alert("이벤트 수정 성공!");
          window.location.reload();
        })
        .catch((err) => console.error(err));
    } else {
      axios
        .post("/api/admin/events", form, {
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
        <select name="eventType" value={form.eventType} onChange={handleChange}>
          <option value="COUPON">쿠폰 지급</option>
          <option value="POINT">적립금 지급</option>
        </select>
        {form.eventType === "COUPON" && (
          <input type="text" name="couponCode" placeholder="쿠폰 코드" value={form.couponCode} onChange={handleChange} />
        )}
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

export default AdminEventPage;
