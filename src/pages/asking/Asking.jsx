import React, { useState, useEffect } from "react";
import "../asking/Asking.css";

function Asking() {
  const [askings, setAskings] = useState([]); // 문의 내역
  const [newAsking, setNewAsking] = useState({ title: "", content: "" }); // 새 문의
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // 문의 내역 가져오기
  useEffect(() => {
    fetch("/api/askings", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // 토큰 포함
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("문의 내역을 불러오지 못했습니다.");
        return res.json();
      })
      .then((data) => {
        setAskings(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 새 문의 제출
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("/api/askings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(newAsking),
    })
      .then((res) => {
        if (!res.ok) throw new Error("문의 등록에 실패했습니다.");
        return res.text();
      })
      .then((message) => {
        alert(message);
        setAskings([...askings, { ...newAsking }]);
        setNewAsking({ title: "", content: "" }); // 입력 필드 초기화
      })
      .catch((err) => setError(err.message));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="asking-container">
      <h1>1:1 문의 내역</h1>
      <ul className="asking-list">
        {askings.map((asking, index) => (
          <li key={index} className="asking-item">
            <h2>{asking.title}</h2>
            <p>{asking.content}</p>
          </li>
        ))}
      </ul>
      <h2>새로운 문의 작성</h2>
      <form onSubmit={handleSubmit} className="asking-form">
        <label>
          제목:
          <input
            type="text"
            value={newAsking.title}
            onChange={(e) => setNewAsking({ ...newAsking, title: e.target.value })}
            required
          />
        </label>
        <label>
          내용:
          <textarea
            value={newAsking.content}
            onChange={(e) => setNewAsking({ ...newAsking, content: e.target.value })}
            required
          ></textarea>
        </label>
        <button type="submit">문의하기</button>
      </form>
    </div>
  );
}

export default Asking;
