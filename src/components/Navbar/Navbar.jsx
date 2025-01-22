import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { isLoggedIn, nickname, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="logo">Musinsa</div>
      <ul className="nav-links">
        <li><a href="/">Shop</a></li>
        <li><a href="#">Review</a></li>
        <li><a href="#">Community</a></li>
        <li><a href="#">About</a></li>
      </ul>
      <div className="nav-icons">
        {isLoggedIn ? (
          <>
            <span>안녕하세요, {nickname} 님</span>
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
