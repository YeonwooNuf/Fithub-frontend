import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({
    userId: "",
    username: "",
    nickname: "",
    profileImageUrl: "",
    points: 0,
    coupons: 0,
    role: "",
  });

  const getToken = () => {
    const token = localStorage.getItem("token");
    return token && token !== "null" && token !== "undefined" ? token : null;
  };

  // ✅ 최초 실행: localStorage에서 복구
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const stored = localStorage.getItem("userInfo");
    if (stored) {
      setUserInfo(JSON.parse(stored));
      setIsLoggedIn(true);
    } else {
      fetchUserData(token);
    }
  }, []);

  // ✅ 공통 사용자 정보 fetch 함수
  const fetchUserData = async (token) => {
    try {
      const res = await fetch("/api/users/mypage", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        const userData = {
          userId: data.userId,
          username: data.username,
          nickname: data.nickname,
          profileImageUrl: data.profileImageUrl,
          points: data.totalPoints,
          coupons: data.unusedCoupons,
          role: data.role,
        };
        localStorage.setItem("userInfo", JSON.stringify(userData));
        setUserInfo(userData);
        setIsLoggedIn(true);
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  // ✅ 로그인 시 호출
  const login = async (token) => {
    localStorage.setItem("token", token);
    await fetchUserData(token);
  };

  // ✅ 로그아웃 시 초기화
  const logout = () => {
    setIsLoggedIn(false);
    setUserInfo({
      userId: "",
      username: "",
      nickname: "",
      profileImageUrl: "",
      points: 0,
      coupons: 0,
      role: "",
    });
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    sessionStorage.removeItem("reloaded");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
