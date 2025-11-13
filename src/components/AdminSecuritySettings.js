import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import Context from "../context"; // Giả định context chứa token hoặc fetcher
import { useSelector } from "react-redux";

// ------------------------------------------
// 1. Định nghĩa các hàm API
// ------------------------------------------

// Hàm gọi API Setup (Tạo QR Code)
const fetchSetup2FA = async (token) => {
  return fetch("https://api.domanhhung.id.vn/api/2fa/setup", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json());
};

// Hàm gọi API Verify (Kích hoạt 2FA)
const fetchVerify2FA = async (token, twoFactorToken) => {
  return fetch("https://api.domanhhung.id.vn/api/2fa/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ token: twoFactorToken }),
  }).then((res) => res.json());
};

const AdminSecuritySettings = () => {
  // Lấy token và thông tin user (Admin)
  // Giả định token được lưu trong Redux state hoặc Context
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user.user);
  const { fetchUserDetails } = useContext(Context);

  const [qrData, setQrData] = useState(null); // Lưu {qrCodeImage, secret}
  const [isSetupStarted, setIsSetupStarted] = useState(false); // Bắt đầu quá trình setup
  const [verificationCode, setVerificationCode] = useState(""); // Mã 6 số Admin nhập

  // ------------------------------------------
  // 2. Logic Xử lý sự kiện
  // ------------------------------------------

  // --- BƯỚC A: Bắt đầu Setup ---
  const handleStartSetup = async () => {
    if (user.isTwoFaEnabled) {
      toast.info("2FA đã được kích hoạt.");
      return;
    }

    const result = await fetchSetup2FA(token);

    if (result.success) {
      setQrData(result);
      setIsSetupStarted(true);
    } else {
      toast.error(result.message);
    }
  };

  // --- BƯỚC B: Gửi mã Xác minh ---
  const handleVerifyActivation = async (e) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Mã xác thực phải là 6 chữ số.");
      return;
    }

    const result = await fetchVerify2FA(token, verificationCode);

    if (result.success) {
      toast.success("2FA đã được kích hoạt thành công!");
      setIsSetupStarted(false);
      setQrData(null);
      setVerificationCode("");
      await fetchUserDetails(); // Cập nhật trạng thái isTwoFaEnabled trong Redux
    } else {
      // Nếu lỗi, secret key tạm thời bị xóa. Bắt đầu lại.
      toast.error(result.message);
      setIsSetupStarted(false);
      setQrData(null);
    }
  };

  // ------------------------------------------
  // 3. UI/JSX
  // ------------------------------------------
  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🔐 Cài đặt Bảo mật 2FA</h2>

      {user?.isTwoFaEnabled ? (
        <div className="text-green-600 font-semibold">
          ✅ 2FA đang hoạt động!
          {/* Ở đây có thể thêm nút "Tắt 2FA" */}
        </div>
      ) : (
        <>
          <p className="text-red-500 mb-4">
            2FA chưa được kích hoạt. Bảo vệ tài khoản Admin của bạn!
          </p>

          {!isSetupStarted && (
            <button
              onClick={handleStartSetup}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Bắt đầu Thiết lập 2FA
            </button>
          )}

          {qrData && (
            <div className="mt-6 border p-4 rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-3">Bước 1: Quét Mã QR</h3>
              <img
                src={qrData.qrCodeImage}
                alt="2FA QR Code"
                className="w-32 h-32 mx-auto mb-4"
              />

              <h3 className="font-semibold mb-3">Bước 2: Kích hoạt</h3>
              <form onSubmit={handleVerifyActivation}>
                <input
                  type="text"
                  placeholder="Nhập mã 6 số từ ứng dụng..."
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-red-500"
                  required
                />
                <button
                  type="submit"
                  className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded"
                >
                  Xác minh và Kích hoạt
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminSecuritySettings;
