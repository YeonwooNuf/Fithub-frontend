import React, { createContext, useState } from "react";

// AuthContext 생성
export const AuthContext = createContext();

// AuthProvider 컴포넌트
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [nickname, setNickname] = useState(""); // 로그인된 사용자 닉네임

  const login = (userNickname) => {
    setIsLoggedIn(true);
    setNickname(userNickname);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setNickname("");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, nickname, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
