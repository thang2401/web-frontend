import React, { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import SummaryApi from "../common";
import { useSelector } from "react-redux";
const ChangePassword = () => {
  const user = useSelector((state) => state?.user?.user);
  const userId = user?._id;
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error("Bạn phải đăng nhập trước khi đổi mật khẩu");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp");
      return;
    }

    try {
      const res = await fetch(SummaryApi.changePassword.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || "Đổi mật khẩu thành công!");
        setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        window.location.href = "/";
      } else {
        toast.error(data.message || "Đổi mật khẩu thất bại!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể kết nối tới server!");
    }
  };

  return (
    <section className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-green-100">
      {/* 🔙 Nút quay lại */}
      <button
        type="button"
        onClick={() => (window.location.href = "/")}
        className="absolute top-4 left-4 bg-white/70 backdrop-blur-md text-gray-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-transform hover:scale-105 shadow-sm"
      >
        ← Quay lại
      </button>

      {/* 📦 Form đổi mật khẩu */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-8 w-full max-w-md border border-gray-100"
      >
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-green-600 bg-clip-text text-transparent mb-6">
          Đổi mật khẩu
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mật khẩu cũ */}
          <div className="relative">
            <input
              type={show.old ? "text" : "password"}
              name="oldPassword"
              placeholder="Mật khẩu hiện tại"
              value={form.oldPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg pr-10 focus:ring-2 focus:ring-indigo-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShow((p) => ({ ...p, old: !p.old }))}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {show.old ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Mật khẩu mới */}
          <div className="relative">
            <input
              type={show.new ? "text" : "password"}
              name="newPassword"
              placeholder="Mật khẩu mới"
              value={form.newPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg pr-10 focus:ring-2 focus:ring-green-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShow((p) => ({ ...p, new: !p.new }))}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {show.new ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="relative">
            <input
              type={show.confirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu mới"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-lg pr-10 focus:ring-2 focus:ring-green-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShow((p) => ({ ...p, confirm: !p.confirm }))}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {show.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Nút submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-green-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 hover:scale-105 transition-transform shadow-md"
          >
            Cập nhật mật khẩu
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export default ChangePassword;
