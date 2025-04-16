import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MyPageEdit.css";

const MyPageEdit = () => {
  const [form, setForm] = useState({
    nickname: "",
    phone: "",
    gender: "",
    birthdate: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("/api/users/mypage", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm({
          nickname: res.data.nickname,
          phone: res.data.phone,
          gender: res.data.gender || "",
          birthdate: res.data.birthdate || "",
        });
      } catch (err) {
        console.error("유저 정보 가져오기 실패", err);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.put("/api/users/mypage/edit", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("회원정보가 수정되었습니다.");
    } catch (err) {
      console.error("수정 실패", err);
      alert("수정 중 오류 발생");
    }
  };

  return (
    <div className="mypage-wrapper">
      <form className="mypage-card" onSubmit={handleSubmit}>
        <h2>회원 정보 수정</h2>

        <label>닉네임</label>
        <input name="nickname" value={form.nickname} onChange={handleChange} />

        <label>전화번호</label>
        <input name="phone" value={form.phone} onChange={handleChange} />

        <label>성별</label>
        <select name="gender" value={form.gender} onChange={handleChange}>
          <option value="">선택안함</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
        </select>

        <label>생년월일</label>
        <input
          type="date"
          name="birthdate"
          value={form.birthdate}
          onChange={handleChange}
        />

        <button type="submit">저장하기</button>
      </form>
    </div>
  );
};

export default MyPageEdit;
