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
        console.log("🟢 [Login] 저장할 토큰:", data.token);

        localStorage.setItem("token", data.token);
        console.log("🟢 [Login] localStorage에 저장된 토큰:", localStorage.getItem("token"));

        login(data.token); // ✅ 토큰만 전달해서 AuthContext에서 유저 정보 갱신

        // ✅ 상태 업데이트 후 navigate 실행 (setTimeout 사용)
        setTimeout(() => {
          navigate("/");
        }, 0);
      } else {
        setError(data.message || "로그인에 실패하였습니다.");
      }
    } catch (err) {
      setError("서버 연결에 문제가 발생하였습니다. 잠시 후 다시 시도해주세요.");
      console.error("❌ [Login] 로그인 중 에러 발생:", err);
    }
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
    </div>
  );
}

export default Login;
