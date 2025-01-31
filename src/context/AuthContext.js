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
  });

  // ✅ localStorage에서 토큰을 가져오는 함수 (null 방지)
  const getToken = () => {
    const token = localStorage.getItem("token");
    return token && token !== "null" && token !== "undefined" ? token : null;
  };

  // ✅ 로그인 유지 처리
  useEffect(() => {
    const token = getToken();
    console.log("🟡 [AuthContext] 실행 - 저장된 토큰:", token);

    if (!token) {
      console.warn("🔴 [AuthContext] 토큰이 없어서 자동 로그인 불가");
      setIsLoggedIn(false);
      setUserInfo({}); // 로그인 정보 초기화
      return;
    }

    // ✅ sessionStorage에 `reloaded` 키가 없으면 새로고침 (단, 한 번만 실행)
    if (!sessionStorage.getItem("reloaded")) {
      sessionStorage.setItem("reloaded", "true");
      window.location.reload();
      return; // 새로고침 이후 실행 방지
    }

    // ✅ 서버에서 유저 정보 가져오기
    fetch("/api/users/mypage", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("🟡 [AuthContext] 응답 상태 코드: ", res.status);
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
          });
        } else {
          console.warn("⚠ [AuthContext] 토큰 검증 실패 - 로그아웃 처리");
          logout();
        }
      })
      .catch((err) => {
        console.error("❌ [AuthContext] 토큰 검증 중 에러 발생:", err);
        logout();
      });
  }, [isLoggedIn, getToken()]); // ✅ 로그인 상태 변화 감지 시 재실행

  // ✅ 로그인 함수 (서버에서 유저 정보 다시 불러옴)
  const login = (token) => {
    console.log("🟢 [AuthContext] 로그인 성공 - 토큰 저장:", token);
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
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
