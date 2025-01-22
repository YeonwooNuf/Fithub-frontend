import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부
  const [userInfo, setUserInfo] = useState({}); // 사용자 정보 저장

  // 애플리케이션 초기화 시 토큰 유효성 확인 및 사용자 정보 로드
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` }, // 토큰을 헤더에 포함
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsLoggedIn(true);
            setUserInfo(data); // 사용자 정보 저장
          } else {
            // 토큰이 유효하지 않을 경우
            setIsLoggedIn(false);
            setUserInfo({});
            localStorage.removeItem("token");
          }
        })
        .catch(() => {
          // 오류 발생 시 초기화
          setIsLoggedIn(false);
          setUserInfo({});
          localStorage.removeItem("token");
        });
    }
  }, []);

  // 로그인 시 상태 업데이트 및 토큰 저장
  const login = (userData) => {
    setIsLoggedIn(true);
    setUserInfo(userData);
  };

  // 로그아웃 시 상태 초기화 및 토큰 제거
  const logout = () => {
    setIsLoggedIn(false);
    setUserInfo({});
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
