// frontend/src/pages/VerifyOtp.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SummaryApi from "../common";

const VerifyOtp = () => {
  const loc = useLocation();
  const navigate = useNavigate();
  const email = loc.state?.email || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.error("OTP 6 chữ số");
    setLoading(true);
    try {
      const res = await fetch(SummaryApi.verifyOtp.url, {
        method: SummaryApi.verifyOtp.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        toast.success(data.message);
        navigate("/set-password", { state: { email } });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      toast.error("Lỗi server khi xác thực OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Xác thực OTP</h2>
        <p className="text-sm mb-4 text-gray-600">
          Mã đã gửi tới: <b>{email}</b>
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            placeholder="Nhập OTP 6 chữ số"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            maxLength={6}
            required
            className="w-full p-3 border rounded"
          />
          <button
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white rounded"
          >
            {loading ? "Đang xác minh..." : "Xác nhận OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
