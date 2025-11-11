// frontend/src/pages/SignUp.js
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import SummaryApi from "../common";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Vui lòng nhập email");
    setLoading(true);
    try {
      const res = await fetch(SummaryApi.sendOtpToSignUp.url, {
        method: SummaryApi.sendOtpToSignUp.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        toast.success(data.message);
        // chuyển sang verify page, truyền email
        navigate("/verify-otp", { state: { email } });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      toast.error("Lỗi server khi gửi OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-pink-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Đăng ký</h2>
        <form onSubmit={handleSend} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full p-3 border rounded"
          />
          <button
            disabled={loading}
            className="w-full p-3 bg-indigo-600 text-white rounded"
          >
            {loading ? "Đang gửi..." : "Gửi mã OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
