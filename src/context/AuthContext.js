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

  // ✅ localStorage에서 토큰을 가져오는 함수 (null 방지)
  const getToken = () => {
    const token = localStorage.getItem("token");
    return token && token !== "null" && token !== "undefined" ? token : null;
  };

  // ✅ 로그인 유지 처리
  useEffect(() => {
    const token = getToken();
  
    if (!token) {
      setIsLoggedIn(false);
      setUserInfo({});
      return;
    }
  
    fetch("/api/users/mypage", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("🟢 [AuthContext] 받은 데이터: ", data);
        if (data.success) {
          setIsLoggedIn(true);
          setUserInfo({
            userId: data.userId || "",
            username: data.username || "",
            nickname: data.nickname || "사용자",
            profileImageUrl: data.profileImageUrl || "/default-profile.png",
            points: data.totalPoints || 0,
            coupons: data.unusedCoupons || 0,
            role: data.role || "USER", // ✅ role 추가 (기본값 USER)
          });
        } else {
          logout();
        }
      })
      .catch((err) => {
        logout();
      });
  }, [isLoggedIn, getToken()]); // ✅ 로그인 상태 변화 감지 시 재실행

  // ✅ 로그인 함수 (서버에서 유저 정보 다시 불러옴)
  const login = (token, role) => {
    console.log("🟢 [AuthContext] 로그인 성공 - 토큰 저장:", token, "역할:", role);
    localStorage.setItem("token", token);
    localStorage.setItem("role", role); // ✅ role도 저장
  
    setIsLoggedIn(true);
    setUserInfo({
      userId: "",
      username: "",
      nickname: "",
      profileImageUrl: "",
      points: 0,
      coupons: 0,
      role: role || "USER", // ✅ role 추가
    });
  
    console.log("🟡 [AuthContext] 로그인 후 userInfo.role:", userInfo.role);
  };

  // ✅ 로그아웃 함수
  const logout = () => {
    console.warn("🔴 [AuthContext] 로그아웃 처리");
    setIsLoggedIn(false);
    setUserInfo({
      userId: "",
      username: "",
      nickname: "",
      profileImageUrl: "",
      points: 0,
      coupons: 0,
    });

    localStorage.removeItem("token");
    sessionStorage.removeItem("reloaded"); // ✅ 새로고침 방지용 sessionStorage 초기화
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
