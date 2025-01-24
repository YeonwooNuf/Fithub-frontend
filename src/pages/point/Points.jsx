import React, { useEffect, useState } from "react";
import "./Points.css";


function Points() {
  const [points, setPoints] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/points", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch points: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setPoints(data.points || 0);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load points.");
      });
  }, []);

  return (
    <div className="points-container">
      <h1>나의 적립금</h1>
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <p className="points-value">{points.toLocaleString()} points</p>
      )}
    </div>
  );
}

export default Points;
