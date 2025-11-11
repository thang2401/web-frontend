// frontend/src/pages/AllUsers.js
import React, { useEffect, useState } from "react";
import SummaryApi from "../common";
import { toast } from "react-toastify";
import moment from "moment";
import { MdModeEdit, MdDelete } from "react-icons/md";
import ChangeUserRole from "../components/ChangeUserRole";

const AllUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openUpdateRole, setOpenUpdateRole] = useState(false);
  const [updateUserDetails, setUpdateUserDetails] = useState({
    email: "",
    name: "",
    role: "",
    _id: "",
  });

  // Fetch tất cả user
  const fetchAllUsers = async () => {
    try {
      const res = await fetch(SummaryApi.allUser.url, {
        method: SummaryApi.allUser.method,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setAllUsers(data.data || []);
      } else {
        toast.error(data.message || "Không lấy được dữ liệu người dùng");
      }
    } catch (err) {
      toast.error("Lỗi server khi lấy danh sách người dùng");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Xóa user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;

    try {
      const res = await fetch(`${SummaryApi.deleteUser.url}/${userId}`, {
        method: SummaryApi.deleteUser.method,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa người dùng!");
        fetchAllUsers();
      } else {
        toast.error(data.message || "Xóa thất bại");
      }
    } catch (err) {
      toast.error("Lỗi server khi xóa người dùng");
      console.error(err);
    }
  };

  // Filter search an toàn
  const filteredUsers = allUsers.filter(
    (user) =>
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-4">Danh sách người dùng</h1>

      {/* Tìm kiếm */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Bảng người dùng */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="p-2 border">STT</th>
              <th className="p-2 border">Tên</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Vai trò</th>
              <th className="p-2 border">Ngày tạo</th>
              <th className="p-2 border">Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr
                  key={user._id || index}
                  className="even:bg-gray-100 hover:bg-gray-200"
                >
                  <td className="p-2 border text-center">{index + 1}</td>
                  <td className="p-2 border">{user.name || "-"}</td>
                  <td className="p-2 border">{user.email || "-"}</td>
                  <td className="p-2 border text-center">
                    {user.role || "GENERAL"}
                  </td>
                  <td className="p-2 border text-center">
                    {user.createdAt
                      ? moment(user.createdAt).format("DD/MM/YYYY")
                      : "-"}
                  </td>
                  <td className="p-2 border flex justify-center gap-2">
                    <button
                      className="bg-green-100 p-2 rounded-full hover:bg-green-500 hover:text-white transition"
                      onClick={() => {
                        setUpdateUserDetails(user);
                        setOpenUpdateRole(true);
                      }}
                      title="Chỉnh sửa vai trò"
                    >
                      <MdModeEdit size={20} />
                    </button>
                    <button
                      className="bg-red-100 p-2 rounded-full hover:bg-red-600 hover:text-white transition"
                      onClick={() => handleDeleteUser(user._id)}
                      title="Xóa người dùng"
                    >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  Không có người dùng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal chỉnh vai trò */}
      {openUpdateRole && (
        <ChangeUserRole
          onClose={() => setOpenUpdateRole(false)}
          name={updateUserDetails.name}
          email={updateUserDetails.email}
          role={updateUserDetails.role}
          userId={updateUserDetails._id}
          callFunc={fetchAllUsers}
        />
      )}
    </div>
  );
};

export default AllUsers;
