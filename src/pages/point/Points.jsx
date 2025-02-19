import React, { useEffect, useState } from "react";
import "./Points.css";

function Points() {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const token = localStorage.getItem("token");

        // 보유 적립금 조회
        const balanceRes = await fetch("/api/points/balance", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!balanceRes.ok) throw new Error("적립금 정보를 불러올 수 없습니다.");
        const balanceData = await balanceRes.json();
        setPoints(balanceData);

        // 적립 내역 조회 (페이징 적용 가능)
        const historyRes = await fetch("/api/points?page=0&size=10", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!historyRes.ok) throw new Error("적립 내역을 불러올 수 없습니다.");
        const historyData = await historyRes.json();
        setHistory(historyData.content || []);
      } catch (err) {
        console.error("Error fetching points:", err);
        setError("적립금 정보를 불러오는 데 실패했습니다.");
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
        <>
          <p className="points-value">{points.toLocaleString()}원</p>
          <h2>적립금 내역</h2>
          <table className="points-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>금액</th>
                <th>사유</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((point) => (
                  <tr key={point.id}>
                    <td>{new Date(point.createdAt).toLocaleDateString()}</td>
                    <td>{point.amount.toLocaleString()}원</td>
                    <td>{point.reason}</td>
                    <td className={`status-${point.status.toLowerCase()}`}>{point.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">적립 내역이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default Points;
