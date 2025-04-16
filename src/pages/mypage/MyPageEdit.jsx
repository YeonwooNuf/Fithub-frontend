import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MyPageEdit.css";

const MyPageEdit = () => {
  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    nickname: "",
    phone: "",
    gender: "",
    birthdate: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isSocialUser, setIsSocialUser] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/users/mypage", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ 사용자 정보:", res.data);  // 👉 여기 추가

        setUser(res.data);
        setFormData({
          nickname: res.data.nickname || "",
          phone: res.data.phone || "",
          gender: res.data.gender || "",
          birthdate: res.data.birthdate || "",
        });
        setIsSocialUser(res.data.username?.startsWith("kakao_"));
        setProfilePreview(res.data.profileImageUrl);
      } catch (err) {
        console.error("회원정보 불러오기 실패", err);
      }
    };
    fetchUserInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isSocialUser && newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const token = localStorage.getItem("token");
    const form = new FormData();

    form.append("nickname", formData.nickname);
    form.append("phone", formData.phone);
    form.append("gender", formData.gender);
    form.append("birthdate", formData.birthdate);
    if (profileImage) form.append("profileImage", profileImage);
    if (newPassword && !isSocialUser) form.append("newPassword", newPassword);

    try {
      await axios.put("/api/users/mypage", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("회원정보가 수정되었습니다.");
    } catch (err) {
      alert("수정 중 오류 발생");
      console.error(err);
    }
  };

  return (
    <div className="user-profile-edit-container">
      <h2 className="user-profile-edit-title">회원정보 수정</h2>
      <form className="user-profile-edit-form" onSubmit={handleSubmit}>
        <div className="user-profile-edit-image-section">
          <img
            src={profilePreview || "/uploads/profile-images/default-profile.jpg"}
            alt="profile preview"
            className="user-profile-edit-image-preview"
          />
          {!isSocialUser && (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="user-profile-edit-image-input"
            />
          )}
        </div>

        <label className="user-profile-edit-label">
          닉네임
          <input
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            className="user-profile-edit-input"
          />
        </label>

        <label className="user-profile-edit-label">
          전화번호
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="user-profile-edit-input"
          />
        </label>

        <label className="user-profile-edit-label">
          성별
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="user-profile-edit-input"
          >
            <option value="">선택</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </label>

        <label className="user-profile-edit-label">
          생년월일
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            className="user-profile-edit-input"
          />
        </label>

        {!isSocialUser && (
          <>
            <label className="user-profile-edit-label">
              새 비밀번호
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="user-profile-edit-input"
              />
            </label>

            <label className="user-profile-edit-label">
              비밀번호 확인
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="user-profile-edit-input"
              />
            </label>
          </>
        )}

        <button type="submit" className="user-profile-edit-submit-btn">
          수정 완료
        </button>
      </form>
    </div>
  );
};

export default MyPageEdit;