import React, { createContext, useState, useEffect } from "react";

// AuthContext 생성
export const AuthContext = createContext();

// AuthProvider 컴포넌트
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    // 애플리케이션 초기화 시 localStorage에서 상태 복원
    const storedNickname = localStorage.getItem("nickname");
    if (storedNickname) {
      setIsLoggedIn(true);
      setNickname(storedNickname);
    }
  }, []);

  const login = (userNickname) => {
    setIsLoggedIn(true);
    setNickname(userNickname);
    localStorage.setItem("nickname", userNickname); // 상태 저장
  };

  const logout = () => {
    setIsLoggedIn(false);
    setNickname("");
    localStorage.removeItem("nickname"); // 상태 제거
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, nickname, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
