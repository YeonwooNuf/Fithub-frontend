import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminUser.css";

function AdminUser() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // ✅ 사용자 목록 조회 (페이지네이션)
  const fetchUsers = async (page = 0) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/users?page=${page}&size=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("사용자 목록을 불러올 수 없습니다.");

      const data = await response.json();
      setUsers(data.users);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 특정 사용자 검색 (username 또는 nickname)
  const searchUser = async () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/users/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("사용자를 찾을 수 없습니다.");

      const data = await response.json();
      setUsers([data.user]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 사용자 삭제 기능
  const deleteUser = async (userId) => {
    if (!window.confirm("정말로 이 사용자를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("사용자를 삭제할 수 없습니다.");

      alert("사용자가 삭제되었습니다.");
      fetchUsers(currentPage);
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="admin-container">
      <button className="back-btn" onClick={() => navigate("/admin")}>⬅ 관리자 대시보드</button>
      <h1>사용자 관리</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="닉네임 또는 유저네임 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={searchUser}>검색</button>
      </div>

      {loading && <p>로딩 중...</p>}
      {error && <p className="error">{error}</p>}

      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>닉네임</th>
            <th>생년월일</th>
            <th>전화번호</th>
            <th>성별</th>
            <th>권한</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userId}>
              <td>{user.username}</td>
              <td>{user.nickname}</td>
              <td>{user.birthdate || "-"}</td>
              <td>{user.phone || "-"}</td>
              <td>{user.gender || "-"}</td>
              <td>{user.role}</td>
              <td>
                <button className="delete-btn" onClick={() => deleteUser(user.userId)}>
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={currentPage === 0} onClick={() => fetchUsers(currentPage - 1)}>
          이전
        </button>
        <span>
          {currentPage + 1} / {totalPages}
        </span>
        <button disabled={currentPage + 1 >= totalPages} onClick={() => fetchUsers(currentPage + 1)}>
          다음
        </button>
      </div>
    </div>
  );
}

export default AdminUser;
