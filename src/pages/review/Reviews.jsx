import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Review() {
  const [review, setReview] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("리뷰가 제출되었습니다!");
    navigate("/orders");
  };

  return (
    <div>
      <h1>리뷰 작성</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="리뷰를 작성해주세요"
          rows="5"
          style={{ width: "100%", marginBottom: "20px" }}
        />
        <button type="submit">제출</button>
      </form>
    </div>
  );
}

export default Review;
