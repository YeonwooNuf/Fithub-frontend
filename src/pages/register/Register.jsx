import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../register/Register.css"; // 수정된 경로

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
    setFormData({ ...formData, [name]: value }); // name 속성 값으로 상태 업데이트
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("회원가입에 실패하였습니다.");
        }
        return res.json();
      })
      .then((data) => {
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
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <label>
          아이디 :
          <input
            type="text"
            name="username" // name 속성 값 수정
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          비밀번호 :
          <input
            type="password"
            name="password" // name 속성 값 수정
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          비밀번호 확인 :
          <input
            type="password"
            name="confirmPassword" // name 속성 값 수정
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          닉네임 :
          <input
            type="text"
            name="nickname" // name 속성 값 수정
            value={formData.nickname}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          생년월일 :
          <input
            type="date"
            name="birthdate" // name 속성 값 수정
            value={formData.birthdate}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          전화번호 :
          <input
            type="text"
            name="phone" // name 속성 값 수정
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          성별 :
          <select
            name="gender" // name 속성 값 수정
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
