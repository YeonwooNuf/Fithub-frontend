import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const { isLoggedIn, userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    localStorage.clear(); // ✅ 전체 초기화 (token, userInfo 등)
    navigate("/");
  };

  const categories = [
    { name: "상의", path: "/shop/category/top" },
    { name: "하의", path: "/shop/category/bottom" },
    { name: "아우터", path: "/shop/category/outer" },
    { name: "악세서리", path: "/shop/category/accessory" },
  ];

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" className="logo-link">
          <img src="/logo.png" alt="FitHub Logo" className="logo-img" />
        </Link>
      </div>

      <ul className="nav-links">
      {/* ✅ Shop + 드롭다운 */}
        <li
          className="dropdown"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <Link to="/shop">Shop</Link>
          {showDropdown && (
            <ul className="dropdown-menu">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link to={cat.path}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          )}
        </li>
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
