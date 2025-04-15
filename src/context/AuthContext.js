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
    role: "", // ✅ localStorage 사용 제거
  });

  const getToken = () => {
    const token = localStorage.getItem("token");
    return token && token !== "null" && token !== "undefined" ? token : null;
  };

  useEffect(() => {
    const token = getToken();
    const storedUserInfo = localStorage.getItem("userInfo");

    if (!token) {
      setIsLoggedIn(false);
      setUserInfo({});
      return;
    }

    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
      setIsLoggedIn(true);
    }

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

  const login = async (token) => {
    localStorage.setItem("token", token);

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
        setUserInfo(userData);
        setIsLoggedIn(true);
      } else {
        console.error("❌ [AuthContext] 로그인 후 유저 데이터 불러오기 실패:", data.message);
      }
    } catch (err) {
      console.error("❌ [AuthContext] 로그인 후 유저 데이터 가져오는 중 오류 발생:", err);
    }
  };

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
    localStorage.removeItem("userInfo"); // ✅ 사용자 정보도 제거
    sessionStorage.removeItem("reloaded");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
