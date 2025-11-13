import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
  return (
    <section className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg"
      >
        <h1 className="text-3xl font-bold text-red-600 mb-6 text-center">
          Điều khoản & Chính sách bảo mật
        </h1>

        <p className="mb-4 text-gray-700">
          Chào mừng bạn đến với ứng dụng của chúng tôi. Việc sử dụng ứng dụng
          này đồng nghĩa với việc bạn đồng ý tuân thủ các điều khoản và chính
          sách bảo mật dưới đây.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
          1. Thu thập thông tin
        </h2>
        <p className="text-gray-700 mb-4">
          Chúng tôi chỉ thu thập những thông tin cần thiết khi bạn đăng ký tài
          khoản, bao gồm:
        </p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Họ và tên</li>
          <li>Địa chỉ email</li>
          <li>Ảnh đại diện (nếu có)</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
          2. Sử dụng thông tin
        </h2>
        <p className="text-gray-700 mb-4">Thông tin của bạn được sử dụng để:</p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Quản lý tài khoản và đăng nhập</li>
          <li>Cải thiện trải nghiệm người dùng</li>
          <li>Gửi thông báo quan trọng về ứng dụng</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
          3. Bảo mật thông tin
        </h2>
        <p className="text-gray-700 mb-4">
          Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn bằng các biện pháp
          bảo mật tiêu chuẩn, bao gồm mã hóa dữ liệu và hạn chế quyền truy cập.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
          4. Chia sẻ thông tin
        </h2>
        <p className="text-gray-700 mb-4">
          Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn
          với bên thứ ba, trừ khi pháp luật yêu cầu.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
          5. Quyền của bạn
        </h2>
        <p className="text-gray-700 mb-4">Bạn có quyền:</p>
        <ul className="list-disc list-inside mb-4 text-gray-700">
          <li>Xem và chỉnh sửa thông tin cá nhân</li>
          <li>Yêu cầu xóa tài khoản</li>
          <li>Từ chối nhận thông báo hoặc email quảng cáo</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-800">
          6. Thay đổi chính sách
        </h2>
        <p className="text-gray-700 mb-4">
          Chúng tôi có thể cập nhật điều khoản và chính sách bảo mật. Mọi thay
          đổi sẽ được thông báo qua ứng dụng và có hiệu lực ngay khi đăng tải.
        </p>

        <p className="text-gray-700 mt-6">
          Nếu bạn có câu hỏi hoặc khiếu nại liên quan đến chính sách bảo mật,
          vui lòng liên hệ với chúng tôi qua email hỗ trợ.
        </p>

        <div className="text-center mt-8">
          <Link
            to="/sign-up"
            className="text-red-600 font-semibold hover:underline"
          >
            Quay lại Đăng ký
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default PrivacyPolicy;
