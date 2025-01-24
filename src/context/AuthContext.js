import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부
  const [userInfo, setUserInfo] = useState({
    username: "",
    nickname: "",
    profileImageUrl: "",
    points: 0,
    coupons: 0,
  }); // 기본값 추가

  // 애플리케이션 초기화 시 토큰 유효성 확인 및 사용자 정보 로드
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("보낸 토큰: ", token); // 토큰 값 확인
    console.log("Authorization Token:", localStorage.getItem("token"));
  
    if (token) {
      fetch("/api/users/mypage", {
        headers: {
          Authorization: `Bearer ${token}`, // 토큰을 헤더에 포함
          "Content-Type": "application/json", // Content-Type 설정
        },
      })
        .then((res) => {
          console.log("응답 상태: ", res.status); // 응답 상태 코드 확인
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.success) {
            console.log("받은 데이터: ", data); // 받은 데이터 확인
            setIsLoggedIn(true);
            setUserInfo({
              username: data.username || "",
              nickname: data.nickname || "",
              profileImageUrl: data.profileImageUrl || "",
              points: data.points || 0,
              coupons: data.coupons || 0,
            });
          } else {
            console.warn("Token validation failed on the server.");
            setIsLoggedIn(false);
            setUserInfo({});
            localStorage.removeItem("token");
          }
        })
        .catch((err) => {
          console.error("Error during fetch:", err); // 에러 로그 확인
          setIsLoggedIn(false);
          setUserInfo({});
          localStorage.removeItem("token");
        });
    }
  }, []);  

  // 로그인 시 상태 업데이트 및 토큰 저장
  const login = (userData) => {
    console.log("로그인 성공: ", userData); // 디버깅용
    setIsLoggedIn(true);
    setUserInfo({
      username: userData.username || "",
      nickname: userData.nickname || "",
      profileImageUrl: userData.profileImageUrl || "",
      points: userData.points || 0,
      coupons: userData.coupons || 0,
    });
  };

  // 로그아웃 시 상태 초기화 및 토큰 제거
  const logout = () => {
    setIsLoggedIn(false);
    setUserInfo({
      username: "",
      nickname: "",
      profileImageUrl: "",
      points: 0,
      coupons: 0,
    }); // 기본값으로 초기화
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
