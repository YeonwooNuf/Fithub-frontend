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
    role: localStorage.getItem("role") || "USER", // ✅ localStorage에서 role 가져오기
  });

  // ✅ localStorage에서 토큰 가져오기
  const getToken = () => {
    const token = localStorage.getItem("token");
    return token && token !== "null" && token !== "undefined" ? token : null;
  };

  // ✅ 로그인 유지 처리 (중복 호출 방지)
  useEffect(() => {
    const token = getToken();
    const storedUserInfo = localStorage.getItem("userInfo");
  
    if (!token) {
      setIsLoggedIn(false);
      setUserInfo({});
      return;
    }
  
    // ✅ localStorage에 저장된 유저 정보가 있으면 우선 사용
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
      setIsLoggedIn(true);
    }
  
    // ✅ userInfo가 없으면 API 호출하여 최신 데이터 가져오기
    if (!storedUserInfo || !JSON.parse(storedUserInfo).username) {
      fetch("/api/users/mypage", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("🟢 [AuthContext] 받은 데이터: ", data);
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
        })
        .catch(() => {
          logout();
        });
    }
  }, []);

  // ✅ 로그인 함수 (응답 데이터 즉시 반영)
  const login = async (token, role, username, nickname) => {
    console.log("🟢 [AuthContext] 로그인 성공 - 토큰 저장:", token, "역할:", role, "사용자명:", username);
  
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
  
    // ✅ 로그인 후 API를 호출하여 최신 userInfo 즉시 반영
    try {
      const response = await fetch("/api/users/mypage", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
      console.log("🟢 [AuthContext] 로그인 후 즉시 가져온 유저 정보:", data);
  
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
        setIsLoggedIn(true);
        setUserInfo(userData);
      } else {
        console.error("❌ [AuthContext] 로그인 후 유저 데이터 불러오기 실패:", data.message);
      }
    } catch (err) {
      console.error("❌ [AuthContext] 로그인 후 유저 데이터 가져오는 중 오류 발생:", err);
    }
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
      role: "",
    });

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.removeItem("reloaded");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
