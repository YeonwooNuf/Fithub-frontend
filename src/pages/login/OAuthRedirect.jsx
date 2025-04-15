import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const OAuthRedirect = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      login(token); // ✅ 토큰 저장 + 유저 정보 반영
      navigate("/");
    } else {
      alert("카카오 로그인 실패");
      navigate("/login");
    }
  }, []);

  return <div>카카오 로그인 중입니다...</div>;
};

export default OAuthRedirect;
