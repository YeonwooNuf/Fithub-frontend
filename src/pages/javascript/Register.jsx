import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Register.css"; // 수정된 경로

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

  const handleSubmit = (e) => {
  e.preventDefault();
  if (formData.password !== formData.confirmPassword) {
    setError("아이디 및 비밀번호가 일치하지 않습니다.");
    return;
  }

  fetch("/api/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  })
    .then((res) => {
      if (!res.ok) {
        // 서버 응답이 실패 상태일 경우 에러 처리
        throw new Error("회원가입에 실패하였습니다.");
      }
      return res.json();
    })
    .then((data) => {
      console.log("Server Response:", data); // 응답 데이터 확인
      if (data.success) {
        alert(data.message);
        navigate("/login"); // 로그인 화면으로 이동
      } else {
        setError(data.message);
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      setError("오류가 발생하였습니다. 잠시 후 다시 시도해주세요.");
    });
};

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Confirm Password:
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Nickname:
          <input
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Birthdate:
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Phone:
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Gender:
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <button type="submit">Register</button>
        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      </form>
    </div>
  );
}

export default Register;
