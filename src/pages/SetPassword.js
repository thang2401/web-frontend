// frontend/src/pages/SetPassword.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SummaryApi from "../common";

const SetPassword = () => {
  const loc = useLocation();
  const navigate = useNavigate();
  const email = loc.state?.email || "";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const strongRe =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&()[\]{}^#<>]).{12,}$/;

  const handleSet = async (e) => {
    e.preventDefault();
    if (!name) return toast.error("Nhập họ tên");
    if (password !== confirm)
      return toast.error("Mật khẩu xác nhận không khớp");
    if (!strongRe.test(password))
      return toast.error(
        "Mật khẩu phải ≥12 ký tự, có hoa, thường, số và ký tự đặc biệt"
      );

    setLoading(true);
    try {
      const res = await fetch(SummaryApi.setPassword.url, {
        method: SummaryApi.setPassword.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else toast.error(data.message);
    } catch (err) {
      setLoading(false);
      console.error(err);
      toast.error("Lỗi server khi đặt mật khẩu");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-pink-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Đặt mật khẩu</h2>
        <p className="text-sm text-gray-600 mb-4">
          Email: <b>{email}</b>
        </p>
        <form onSubmit={handleSet} className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Họ và tên"
            required
            className="w-full p-3 border rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            required
            className="w-full p-3 border rounded"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Xác nhận mật khẩu"
            required
            className="w-full p-3 border rounded"
          />
          <button
            disabled={loading}
            className="w-full p-3 bg-pink-600 text-white rounded"
          >
            {loading ? "Đang gửi..." : "Hoàn tất"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPassword;
