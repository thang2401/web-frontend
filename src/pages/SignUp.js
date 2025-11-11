import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import SummaryApi from "../common";

const SignUp = () => {
  const [step, setStep] = useState(1); // Bước 1: Gửi OTP, Bước 2: Hoàn tất
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setUserData({ ...userData, [e.target.name]: e.target.value });

  // --- Gửi OTP ---
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!userData.email) return toast.error("Vui lòng nhập Email");
    setLoading(true);
    try {
      const res = await fetch(SummaryApi.sendOtpToSignUp.url, {
        method: SummaryApi.sendOtpToSignUp.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        toast.success(data.message);
        setUserId(data.userId);
        setStep(2); // Chuyển sang bước nhập OTP + info
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      setLoading(false);
      toast.error("Lỗi server khi gửi OTP");
    }
  };

  // --- Hoàn tất đăng ký ---
  const handleFinalSignUp = async (e) => {
    e.preventDefault();
    if (userData.password !== userData.confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp");
    }
    if (otp.length !== 6) {
      return toast.error("Mã OTP phải có 6 chữ số");
    }
    setLoading(true);
    try {
      const res = await fetch(SummaryApi.finalSignUp.url, {
        method: SummaryApi.finalSignUp.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, otp, userId }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        toast.success("Đăng ký thành công! Chuyển hướng...");
        navigate("/"); // hoặc /login
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      setLoading(false);
      toast.error("Lỗi server, vui lòng thử lại");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-pink-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Đăng Ký Tài Khoản
        </h2>

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                placeholder="Nhập email của bạn"
                required
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !userData.email}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 transition-all shadow-md"
            >
              {loading ? "Đang gửi OTP..." : "Gửi OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleFinalSignUp} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Họ và tên
              </label>
              <input
                name="name"
                value={userData.name}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                required
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="relative">
              <label className="block text-gray-700 font-medium mb-1">
                Mật khẩu
              </label>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={userData.password}
                onChange={handleChange}
                placeholder="Ít nhất 12 ký tự, gồm HOA, thường, số, ký tự đặc biệt"
                required
                className="w-full p-3 border rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="relative">
              <label className="block text-gray-700 font-medium mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={userData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                required
                className="w-full p-3 border rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Mã OTP
              </label>
              <input
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã OTP 6 chữ số"
                required
                className="w-full p-3 border rounded-xl text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 disabled:bg-gray-400 transition-all shadow-md"
            >
              {loading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
            </button>
          </form>
        )}

        <p className="text-center text-gray-600 mt-5 text-sm">
          Đã có tài khoản?{" "}
          <span
            className="text-indigo-600 font-medium hover:underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Đăng nhập ngay
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
