import React, { useContext, useState, useEffect, useRef } from "react"; // <-- Đã thêm useEffect, useRef
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaKey } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import SummaryApi from "../common";
import Context from "../context";
import ROLE from "../common/role";
import loginIcons from "../assest/signin.gif";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
    twoFactorToken: "",
  });
  const [requires2FA, setRequires2FA] = useState(false);
  
  // 1. Khai báo Ref cho trường 2FA
  const tokenRef = useRef(null); 

  const navigate = useNavigate();
  const user = useSelector((state) => state?.user?.user);
  const { fetchUserDetails, fetchUserAddToCart } = useContext(Context);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };
  
  // 2. useEffect để tự động focus vào trường 2FA
  useEffect(() => {
    if (requires2FA && tokenRef.current) {
      tokenRef.current.focus();
    }
  }, [requires2FA]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email: data.email,
      password: data.password,
    };

    if (requires2FA) {
      payload.twoFactorToken = data.twoFactorToken;
    }

    try {
      const response = await fetch(SummaryApi.signIn.url, {
        method: SummaryApi.signIn.method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.success) {
        // --- 1. ĐĂNG NHẬP THÀNH CÔNG ---
        toast.success(result.message);
        await fetchUserDetails();
        await fetchUserAddToCart();

        if (result?.user?.role === ROLE.ADMIN) {
          navigate("/admin-panel");
        } else {
          navigate("/");
        }
      } else if (result.error && result.requires2FA) {
        // --- 2. YÊU CẦU MÃ 2FA ---
        toast.warn(result.message);
        setRequires2FA(true); 
        
        // 3. Bổ sung: Xóa mật khẩu khỏi state khi chuyển sang bước 2FA (Tăng bảo mật)
        setData((prev) => ({ ...prev, password: "" })); 
        
      } else {
        // --- 3. LỖI KHÁC ---
        toast.error(result.message);
        if (requires2FA) {
          // Nếu mã 2FA sai, xóa mã cũ đi để người dùng nhập lại
          setData((prev) => ({ ...prev, twoFactorToken: "" }));
        }
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ!");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-red-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-8"
      >
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <img
            src={loginIcons}
            alt="Login Icon"
            className="w-24 h-24 rounded-full mx-auto shadow-lg border border-red-200"
          />
          <h1 className="text-3xl font-bold text-red-600 mt-4">
            {requires2FA ? "Xác thực 2FA" : "Đăng nhập"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {requires2FA
              ? "Nhập mã xác thực 6 số"
              : "Chào mừng bạn quay lại với chúng tôi ❤️"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email & Password (Bị làm mờ và vô hiệu hóa khi 2FA được yêu cầu) */}
          <div className={requires2FA ? "opacity-50 pointer-events-none" : ""}>
            
            {/* Email */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Nhập email của bạn..."
                value={data.email}
                onChange={handleOnChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm"
                disabled={requires2FA}
              />
            </div>

            {/* Password */}
            <div className="mt-4">
              <label className="block mb-1 font-medium text-gray-700">Mật khẩu</label>
              <div className="flex items-center px-4 py-2 border rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-red-400">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu..."
                  // Giữ value là data.password (hiện đã được xóa sau khi yêu cầu 2FA)
                  value={data.password} 
                  onChange={handleOnChange}
                  required
                  className="w-full outline-none bg-transparent"
                  disabled={requires2FA}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-gray-600 text-xl ml-2 focus:outline-none"
                  disabled={requires2FA}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="text-right mt-1">
              <Link
                to="/forgot-password"
                className="text-sm text-red-500 hover:underline hover:text-red-600"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          {/* TRƯỜNG NHẬP MÃ 2FA (Chỉ hiển thị khi requires2FA là true) */}
          {requires2FA && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="pt-4 border-t border-red-200"
            >
              <label className="flex items-center mb-1 font-medium text-gray-700">
                <FaKey className="mr-2 text-red-500" /> Mã Xác thực (TOTP)
              </label>
              <input
                type="text"
                name="twoFactorToken"
                placeholder="Nhập mã 6 số từ ứng dụng..."
                value={data.twoFactorToken}
                onChange={handleOnChange}
                maxLength={6}
                required
                className="w-full px-4 py-3 border-2 border-red-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 shadow-md text-center text-lg tracking-widest"
                ref={tokenRef} {/* <-- Áp dụng Ref để tự động focus */}
              />
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            {requires2FA ? "Xác minh & Đăng nhập" : "Đăng nhập"}
          </motion.button>
        </form>

        {/* Signup link */}
        <p className="text-center text-sm mt-6 text-gray-700">
          Bạn chưa có tài khoản?{" "}
          <Link
            to="/sign-up"
            className="text-red-600 hover:text-red-700 hover:underline font-medium"
          >
            Đăng ký ngay
          </Link>
        </p>
      </motion.div>
    </section>
  );
};

export default Login;