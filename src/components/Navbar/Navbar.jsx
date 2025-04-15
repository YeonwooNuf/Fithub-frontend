import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const { isLoggedIn, userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.clear(); // ✅ 전체 초기화 (token, userInfo 등)
    navigate("/");
  };

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
        <li><Link to="/community">Community</Link></li>
        <li><Link to="#">About</Link></li>

        {/* ✅ 관리자 메뉴 */}
        {isLoggedIn && userInfo.role === "ADMIN" && (
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
