import React, { useState } from "react";
import loginIcons from "../assest/signin.gif";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import imageTobase64 from "../helpers/imageTobase64";
import SummaryApi from "../common";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false); // ✅ state checkbox
  const [data, setData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
    profilePic: "",
  });

  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((preve) => ({ ...preve, [name]: value }));
  };

  const handleUploadPic = async (e) => {
    const file = e.target.files[0];
    const imagePic = await imageTobase64(file);
    setData((preve) => ({ ...preve, profilePic: imagePic }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.error("Vui lòng đồng ý điều khoản bảo mật trước khi đăng ký!");
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error("Vui lòng xem lại mật khẩu");
      return;
    }

    const dataResponse = await fetch(SummaryApi.signUP.url, {
      method: SummaryApi.signUP.method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });

    const dataApi = await dataResponse.json();
    if (dataApi.success) {
      toast.success(dataApi.message);
      navigate("/login");
    } else {
      toast.error(dataApi.message || "Đăng ký thất bại");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-100 via-red-100 to-yellow-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="backdrop-blur-lg bg-white/70 border border-white/40 shadow-2xl rounded-2xl p-8 w-full max-w-md"
      >
        <h1 className="text-center text-3xl font-extrabold text-red-600 mb-6 drop-shadow">
          Đăng ký tài khoản
        </h1>

        <div className="flex justify-center mb-6 relative group">
          <motion.img
            src={data.profilePic || loginIcons}
            alt="Profile"
            className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl"
            whileHover={{ rotate: 3 }}
          />
          <label className="absolute bottom-0 bg-black/60 text-white text-xs px-3 py-1 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition">
            Thay ảnh
            <input type="file" onChange={handleUploadPic} className="hidden" />
          </label>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Họ và tên */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Họ và tên:
            </label>
            <input
              type="text"
              name="name"
              placeholder="Nhập tên của bạn..."
              value={data.name}
              onChange={handleOnChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg bg-white/80 outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email:
            </label>
            <input
              type="email"
              name="email"
              placeholder="Nhập email của bạn..."
              value={data.email}
              onChange={handleOnChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg bg-white/80 outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Mật khẩu:
            </label>
            <div className="flex items-center bg-white/80 border border-gray-300 p-2 rounded-lg focus-within:ring-2 focus-within:ring-red-400">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nhập mật khẩu..."
                value={data.password}
                onChange={handleOnChange}
                required
                className="flex-1 bg-transparent outline-none"
              />
              <span
                className="cursor-pointer text-xl text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Xác nhận mật khẩu:
            </label>
            <div className="flex items-center bg-white/80 border border-gray-300 p-2 rounded-lg focus-within:ring-2 focus-within:ring-red-400">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu..."
                value={data.confirmPassword}
                onChange={handleOnChange}
                required
                className="flex-1 bg-transparent outline-none"
              />
              <span
                className="cursor-pointer text-xl text-gray-500"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Checkbox điều khoản */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 accent-red-500"
            />
            <label htmlFor="agreeTerms" className="text-sm text-gray-700">
              Tôi đồng ý với{" "}
              <Link
                to="/privacy-policy"
                className="text-red-600 hover:underline"
              >
                điều khoản bảo mật
              </Link>
            </label>
          </div>

          {/* Button đăng ký */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            type="submit"
            disabled={!agreeTerms} // ✅ disabled khi chưa check
            className={`${
              agreeTerms
                ? "bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-2xl"
                : "bg-gray-300 cursor-not-allowed"
            } text-white font-semibold py-2.5 rounded-full w-full shadow-lg transition-all`}
          >
            Đăng ký
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-700">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-red-600 hover:underline font-semibold"
          >
            Đăng nhập
          </Link>
        </p>
      </motion.div>
    </section>
  );
};

export default SignUp;
