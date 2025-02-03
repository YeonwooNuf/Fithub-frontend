import React, { useEffect, useState } from "react";
import "./Points.css";

function Points() {
  const [points, setPoints] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/points/history", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        console.log("✅ 적립금 응답 데이터:", data); // 🔥 응답 확인

        // data.points가 배열인지 체크
        if (Array.isArray(data.points)) {
          setPoints(data.points.reduce((acc, point) => acc + point.amount, 0));
        } else {
          console.error("❌ data.points가 배열이 아닙니다:", data.points);
          setPoints(0); // 기본값 설정
        }
      } catch (err) {
        console.error("Error fetching points:", err);
        setError("Failed to load points.");
      }
    };

    fetchPoints();
  }, []);

  return (
    <div className="points-container">
      <h1>나의 적립금</h1>
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <p className="points-value">{points.toLocaleString()}원</p>
      )}
    </div>
  );
}

export default Points;
