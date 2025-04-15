import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "../login/Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      console.log("🟢 [Login] 로그인 응답 데이터:", data);
      if (response.ok && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        login(data.token, data.role, data.username, data.nickname);
        navigate("/");
      } else {
        setError(data.message || "로그인에 실패하였습니다.");
      }
    } catch (err) {
      setError("서버 연결에 문제가 발생하였습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  // ✅ 카카오 로그인 처리
  const handleKakaoLogin = () => {
    const KAKAO_REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;
    const REDIRECT_URI = "http://localhost:8080/api/oauth/kakao/callback";
  
    const kakaoAuthUrl =
      `https://kauth.kakao.com/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${KAKAO_REST_API_KEY}` +
      `&redirect_uri=${REDIRECT_URI}` +
      `&prompt=login`; // ✅ 무조건 로그인 창 띄우기
  
    window.location.href = kakaoAuthUrl;
  };
  
  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <label>
          아이디 :
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          비밀번호 :
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">로그인</button>
        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      </form>

      {/* ✅ 카카오 로그인 버튼 */}
      <div className="kakao-login-btn">
        <img
          src="/kakao_login_medium_wide.png"
          alt="카카오 로그인"
          onClick={handleKakaoLogin}
        />
      </div>
    </div>
  );
}

export default Login;
