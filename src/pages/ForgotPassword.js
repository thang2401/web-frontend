import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import SummaryApi from "../common";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    let countdown;
    if (timer > 0) {
      countdown = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(countdown);
  }, [timer]);

  // 📨 Gửi OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const res = await fetch(SummaryApi.forgotPassword.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(data.message);
      setStep(2);
      setTimer(300); // 5 phút
    } else {
      toast.error(data.message);
    }
  };

  // ⌨️ Nhập từng ký tự OTP
  const handleChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 4) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // ✅ Xác thực OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    const res = await fetch(SummaryApi.verifyOTP.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: otpValue }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Xác thực OTP thành công");
      localStorage.setItem("resetEmail", email);
      window.location.href = "/reset-password";
    } else {
      toast.error(data.message);
    }
  };

  return (
    <section className="relative flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-green-100">
      {/* 🔙 Nút quay lại */}
      <button
        type="button"
        onClick={() =>
          step === 1 ? (window.location.href = "/login") : setStep(1)
        }
        className="absolute top-4 left-4 bg-white/70 backdrop-blur-md text-gray-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-transform hover:scale-105 shadow-sm"
      >
        ← Quay lại
      </button>

      {/* 🧩 Form */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-8 w-full max-w-md border border-gray-100"
      >
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-green-600 bg-clip-text text-transparent mb-6">
          Quên mật khẩu
        </h2>

        {step === 1 ? (
          // --- Bước 1: Nhập Email ---
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="text-gray-700 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Nhập email đã đăng ký"
                className="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-green-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 hover:scale-105 transition-transform shadow-md"
            >
              Gửi mã OTP
            </button>
          </form>
        ) : (
          // --- Bước 2: Nhập OTP ---
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <p className="text-center text-gray-600">
              Mã OTP đã được gửi đến <b>{email}</b>
            </p>

            <div className="flex justify-center gap-3">
              {otp.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={value}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 text-center text-xl border rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 outline-none"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-indigo-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 hover:scale-105 transition-transform shadow-md"
            >
              Xác nhận OTP
            </button>

            <div className="text-center mt-2">
              {timer > 0 ? (
                <span className="text-gray-500">
                  OTP hết hạn sau <b>{timer}s</b>
                </span>
              ) : (
                <button
                  onClick={handleSendOTP}
                  type="button"
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Gửi lại OTP
                </button>
              )}
            </div>
          </form>
        )}
      </motion.div>
    </section>
  );
};

export default ForgotPassword;
