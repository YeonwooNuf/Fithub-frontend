import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { Link } from "react-router-dom";

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
      <div className="logo">
        <Link to="/" className="logo-link">
          <img src="/logo.png" alt="FitHub Logo" className="logo-img" />
        </Link>
      </div>

      <ul className="nav-links">
        <li><Link to="/shop">Shop</Link></li>
        <li><Link to="/event">Event</Link></li>
        <li><Link to="#">Community</Link></li>
        <li><Link to="#">About</Link></li>
        {/* 관리자 전용 탭 */}
        {isLoggedIn && nickname === "관리자" && (
          <li><Link to="/admin">Admin Page</Link></li>
        )}
      </ul>
      <div className="nav-icons">
        {isLoggedIn ? (
          <>
            <span>안녕하세요, {userInfo.nickname || "사용자"} 님</span>
            <Link to="/cart">Cart</Link>
            <Link to="/mypage">MyPage</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
