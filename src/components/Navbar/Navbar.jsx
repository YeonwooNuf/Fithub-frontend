import React, { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { isLoggedIn, userInfo, logout } = useContext(AuthContext);

  useEffect(() => {
    console.log("🟡 [Navbar] 현재 userInfo 상태 : ", userInfo);
    console.log("🟡 [Navbar] 현재 사용자 권한 : ",userInfo.role);
  }, [isLoggedIn, userInfo]);

  return (
    <nav className="navbar">
      <div className="logo">Musinsa</div>
      <ul className="nav-links">
        <li><a href="/">Shop</a></li>
        <li><a href="/">Review</a></li>
        <li><a href="#">Community</a></li>
        <li><a href="#">About</a></li>
        {/* 관리자 전용 탭 (userInfo.role이 ADMIN일 때만 표시) */}
        {isLoggedIn && userInfo?.role === "ADMIN" && (
          <li><a href="/admin">Admin Page</a></li>
        )}
      </ul>
      <div className="nav-icons">
        {isLoggedIn ? (
          <>
            <span>안녕하세요, {userInfo.nickname || "사용자"} 님</span>
            <a href="/cart">Cart</a>
            <a href="/mypage">MyPage</a>
            <button onClick={logout}>Logout</button>
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
