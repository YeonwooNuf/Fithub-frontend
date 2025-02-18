import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const { isLoggedIn, userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("role") || "USER");
  const [nickname, setNickname] = useState(localStorage.getItem("nickname")
)

  useEffect(() => {
    console.log("🟡 [Navbar] 현재 로그인 상태:", isLoggedIn);
    console.log("🟡 [Navbar] 현재 userInfo 상태:", userInfo);
    console.log("🟡 [Navbar] localStorage에서 가져온 사용자 권한:", localStorage.getItem("role"));

    if (userInfo.role) {
      setRole(userInfo.role);
    }
    if (userInfo.nickname) {
      setNickname(userInfo.nickname)
    }
  }, [userInfo]);

  const handleLogout = () => {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <div className="logo">Musinsa</div>
      <ul className="nav-links">
        <li><a href="/">Shop</a></li>
        <li><a href="/">Review</a></li>
        <li><a href="#">Community</a></li>
        <li><a href="#">About</a></li>
        {/* ✅ 관리자 전용 탭 */}
        {isLoggedIn && nickname === "관리자" && (
          <li><a href="/admin">Admin Page</a></li>
        )}
      </ul>
      <div className="nav-icons">
        {isLoggedIn ? (
          <>
            <span>안녕하세요, {userInfo.nickname || "사용자"} 님</span>
            <a href="/cart">Cart</a>
            <a href="/mypage">MyPage</a>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
