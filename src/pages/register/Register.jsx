import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../register/Register.css"; // CSS 파일 경로

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    birthdate: "",
    phone: "",
    gender: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          nickname: formData.nickname,
          birthdate: formData.birthdate,
          phone: formData.phone,
          gender: formData.gender,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message || "회원가입이 성공적으로 완료되었습니다.");
        navigate("/login");
      } else {
        setError(data.message || "회원가입에 실패하였습니다.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("서버와 연결하는 중 문제가 발생하였습니다.");
    }
  };

  return (
    <div className="register-container">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <label>
          아이디 :
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          비밀번호 :
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          비밀번호 확인 :
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          닉네임 :
          <input
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          생년월일 :
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          전화번호 :
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          성별 :
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">성별을 선택해주세요</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </label>
        <button type="submit">회원가입</button>
        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      </form>
    </div>
  );
}

export default Register;
