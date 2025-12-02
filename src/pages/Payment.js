import React, { useEffect, useState, useContext } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"; // Import PayPal Components
import Context from "../context";
import SummaryApi from "../common"; // Đã cập nhật endpoint paypalCreateOrder & paypalCaptureOrder
import displayINRCurrency from "../helpers/displayCurrency";
import Swal from "sweetalert2";

// ⚠️ CẤU HÌNH PAYPAL
// Thay thế giá trị của "client-id" bằng biến môi trường (ví dụ: process.env.REACT_APP_PAYPAL_CLIENT_ID)
const initialOptions = {
  "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID || "sb", // Sử dụng "sb" cho Sandbox nếu không có
  currency: "USD", // Phải khớp với tiền tệ trong Order API
  intent: "capture",
};

const Payment = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // State quản lý địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");

  const context = useContext(Context);
  const user = useSelector((state) => state?.user?.user);
  const userId = user?._id;
  const navigate = useNavigate();
  const location = useLocation();

  // --- LOGIC FETCH DỮ LIỆU VÀ ĐỊA CHỈ (GIỮ NGUYÊN) ---
  useEffect(() => {
    if (user?.name) setFormData((prev) => ({ ...prev, name: user.name }));
    setLoading(true);
    fetchCartItems();

    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then(setProvinces)
      .finally(() => setLoading(false));
  }, [user?.name]);

  const fetchCartItems = async () => {
    /* ... */
  };
  useEffect(() => {
    /* Fetch Districts ... */
  }, [province]);
  useEffect(() => {
    /* Fetch Wards ... */
  }, [district]);
  const handleInputChange = (e) => {
    /* ... */
  };
  const validatePhone = (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);

  // Tính toán tổng tiền
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCostVND = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.productId.sellingPrice,
    0
  );
  const safeTotalCost = Math.round(totalCostVND);

  // ⚠️ CHUYỂN ĐỔI TIỀN TỆ: Tỷ giá giả định 1 USD = 25000 VND
  const EXCHANGE_RATE = 25000;
  const totalCostUSD = safeTotalCost / EXCHANGE_RATE;
  const totalCostUSDString = totalCostUSD.toFixed(2); // PayPal yêu cầu chuỗi 2 chữ số thập phân

  // Lấy tên địa chỉ đầy đủ
  const getFullAddress = () => {
    const wardObj = wards.find((w) => String(w.code) === String(ward));
    const districtObj = districts.find(
      (d) => String(d.code) === String(district)
    );
    const provinceObj = provinces.find(
      (p) => String(p.code) === String(province)
    );
    return `${wardObj?.name}, ${districtObj?.name}, ${provinceObj?.name}`;
  };

  // --- HÀM XỬ LÝ CHUNG CHO COD ---
  const handleCODPayment = async (paymentData) => {
    try {
      Swal.fire({
        title: "Đang xử lý đơn hàng...",
        text: "Vui lòng chờ...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await fetch(SummaryApi.processPayment.url, {
        method: SummaryApi.processPayment.method,
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(paymentData),
      });
      const result = await res.json();
      if (!result.success) throw new Error("Không thể lưu đơn hàng.");

      // Xóa giỏ hàng
      await fetch(SummaryApi.deleteCart.url, {
        method: SummaryApi.deleteCart.method,
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      Swal.close();
      await Swal.fire("🎉 Thành công!", "Đặt hàng COD thành công!", "success");
      setCartItems([]);
      context.setCartProductCount(0);
      navigate("/");
    } catch (err) {
      console.error(err);
      Swal.close();
      Swal.fire("⚠️ Lỗi hệ thống", "Vui lòng thử lại sau.", "error");
    }
  };

  // --- HÀM XÁC NHẬN VÀ CHUYỂN TIỀN (CHỈ DÙNG CHO COD SUBMIT) ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // 1. Kiểm tra điều kiện cần
    if (!userId)
      return Swal.fire(
        "⚠️ Thông báo",
        "Vui lòng đăng nhập để thanh toán.",
        "warning"
      );
    if (!province || !district || !ward)
      return Swal.fire(
        "⚠️ Thiếu thông tin",
        "Vui lòng chọn đầy đủ địa chỉ.",
        "warning"
      );
    if (!validatePhone(formData.phone))
      return Swal.fire(
        "📞 Lỗi số điện thoại",
        "Số điện thoại không hợp lệ.",
        "error"
      );

    const fullAddress = getFullAddress();

    // 2. Xác nhận thông tin
    const { isConfirmed } = await Swal.fire({
      title: "Xác nhận thanh toán COD",
      html: `<div style="text-align:left; font-size:15px;"><p><b>Tổng tiền:</b> ${displayINRCurrency(
        safeTotalCost
      )}</p><p><b>Phương thức:</b> Thanh toán khi nhận hàng (COD)</p><p><b>Địa chỉ:</b> ${fullAddress}</p></div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "✅ Xác nhận",
      cancelButtonText: "❌ Hủy",
      reverseButtons: true,
    });

    if (!isConfirmed) return;

    // 3. Chuẩn bị Data
    const formattedItems = cartItems.map((item) => ({
      productId: item.productId._id,
      name: item.productId.productName,
      price: item.productId.sellingPrice,
      quantity: item.quantity,
    }));

    const paymentData = {
      ...formData,
      address: fullAddress,
      items: formattedItems,
      userId,
      paymentMethod: "cod",
      totalCost: safeTotalCost,
    };

    // 4. Gọi API COD
    await handleCODPayment(paymentData);
  };

  // -------------------------------------------------------------
  // --- KHỐI JSX CHÍNH ---
  // -------------------------------------------------------------

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4">
        <button
          onClick={() => navigate("/cart")}
          className="absolute top-5 left-6 flex items-center gap-2 bg-white border border-gray-300 hover:border-red-500 text-gray-700 hover:text-red-600 font-medium rounded-full px-5 py-2 shadow-sm hover:shadow-md transition"
        >
          ← Quay lại
        </button>

        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-12">
          💳 Thanh Toán Đơn Hàng
        </h1>

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
          {/* Tóm tắt đơn hàng (Giữ nguyên) */}
          <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100 h-fit sticky top-4">
            <h2 className="text-2xl font-semibold text-red-600 mb-5 border-b pb-3">
              Tóm Tắt Đơn Hàng
            </h2>
            {/* ... (phần render cart items) ... */}
            {cartItems.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                Giỏ hàng trống.
              </div>
            ) : (
              <>
                {cartItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center border-b py-3 hover:bg-gray-50 transition"
                  >
                    {/* ... item details ... */}
                    <div className="flex items-center gap-3">
                      <img
                        src={item.productId.productImage?.[0]}
                        alt={item.productId.productName}
                        className="w-16 h-16 object-contain rounded-md border"
                      />
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {item.productId?.productName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          SL: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-red-600 font-semibold">
                      {displayINRCurrency(
                        item.productId?.sellingPrice * item.quantity
                      )}
                    </span>
                  </div>
                ))}
                <div className="mt-5 flex justify-between font-semibold text-gray-800">
                  <span>Tổng SL:</span>
                  <span>{totalQuantity}</span>
                </div>
                <div className="mt-2 flex justify-between text-xl font-bold text-red-600">
                  <span>Tổng tiền (VND):</span>
                  <span>{displayINRCurrency(safeTotalCost)}</span>
                </div>
                <div className="mt-1 text-right text-sm text-gray-500">
                  (Tương đương: **{totalCostUSDString} USD** để thanh toán
                  PayPal)
                </div>
              </>
            )}
          </div>

          {/* Form thông tin và thanh toán */}
          <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-2xl font-semibold mb-5 text-gray-800">
              Thông Tin Người Nhận & Phương Thức
            </h2>
            {/* ⚠️ CHỈ DÙNG SUBMIT CHO THANH TOÁN COD */}
            <form
              onSubmit={
                paymentMethod === "cod"
                  ? handleFormSubmit
                  : (e) => e.preventDefault()
              }
              className="space-y-5"
            >
              {/* Họ và tên, Số điện thoại (Giữ nguyên) */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="VD: 0901234567"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 transition"
                  required
                />
              </div>

              {/* Vùng chọn Địa chỉ (Giữ nguyên) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Tỉnh / TP</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  disabled={!province}
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Quận / Huyện</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  disabled={!district}
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Phường / Xã</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phương thức thanh toán (Cập nhật) */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Phương thức thanh toán
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="accent-red-500"
                    />
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="accent-red-500"
                    />
                    <span>Thanh toán online (PayPal)</span>
                  </label>
                </div>
              </div>

              {/* --- KHỐI THANH TOÁN ONLINE (PAYPAL BUTTONS) --- */}
              {paymentMethod === "online" && cartItems.length > 0 ? (
                <div className="mt-6 pt-4 border-t border-indigo-200">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                    <span className="text-indigo-600 mr-2">🚀</span> Xác Nhận
                    Thanh Toán PayPal
                  </h3>
                  <PayPalButtons
                    style={{
                      layout: "vertical",
                      color: "blue",
                      shape: "pill",
                      label: "pay",
                    }}
                    disabled={
                      !province ||
                      !district ||
                      !ward ||
                      !validatePhone(formData.phone)
                    }
                    // 1. CREATE ORDER: Gọi Backend API để tạo Order
                    createOrder={async (data, actions) => {
                      // Kiểm tra lại các điều kiện cần trước khi gọi API
                      if (!userId) {
                        Swal.fire("Lỗi", "Vui lòng đăng nhập.", "error");
                        return;
                      }
                      if (!province || !district || !ward) {
                        Swal.fire(
                          "Lỗi",
                          "Vui lòng chọn đầy đủ địa chỉ.",
                          "error"
                        );
                        return;
                      }

                      const orderPayload = {
                        totalCost: totalCostUSD, // Gửi số tiền USD đã tính
                        // Gửi các thông tin cần thiết khác cho Backend
                        items: cartItems.map((item) => ({
                          productId: item.productId._id,
                          quantity: item.quantity,
                        })),
                        userId,
                        ...formData,
                        address: getFullAddress(),
                      };

                      const res = await fetch(
                        SummaryApi.paypalCreateOrder.url,
                        {
                          method: SummaryApi.paypalCreateOrder.method,
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(orderPayload),
                        }
                      );

                      const result = await res.json();

                      if (!result.success) {
                        Swal.fire("Lỗi", result.message, "error");
                        return;
                      }
                      return result.orderID; // Trả về PayPal Order ID
                    }}
                    // 2. ON APPROVE: Gọi Backend API để Capture giao dịch
                    onApprove={async (data, actions) => {
                      Swal.fire({
                        title: "Đang chốt giao dịch...",
                        text: "Vui lòng chờ. KHÔNG đóng cửa sổ này.",
                        allowOutsideClick: false,
                        didOpen: () => Swal.showLoading(),
                      });

                      const res = await fetch(
                        SummaryApi.paypalCaptureOrder.url,
                        {
                          method: SummaryApi.paypalCaptureOrder.method,
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ orderID: data.orderID }),
                        }
                      );

                      const result = await res.json();
                      Swal.close();

                      if (result.success) {
                        await Swal.fire(
                          "🎉 Thành công!",
                          "Thanh toán PayPal hoàn tất!",
                          "success"
                        );
                        setCartItems([]);
                        context.setCartProductCount(0);
                        navigate("/");
                      } else {
                        Swal.fire("❌ Thất bại", result.message, "error");
                      }
                    }}
                    onError={(err) => {
                      console.error("Lỗi PayPal Checkout:", err);
                      Swal.fire("⚠️ Lỗi", "Giao dịch PayPal gặp lỗi.", "error");
                    }}
                  />
                  {(!province ||
                    !district ||
                    !ward ||
                    !validatePhone(formData.phone)) && (
                    <p className="text-sm text-red-500 mt-2">
                      Vui lòng điền đầy đủ thông tin địa chỉ và số điện thoại để
                      kích hoạt nút thanh toán.
                    </p>
                  )}
                </div>
              ) : (
                // --- KHỐI THANH TOÁN COD (Nút Submit Form) ---
                <button
                  type="submit"
                  disabled={cartItems.length === 0 || paymentMethod !== "cod"}
                  className={`w-full mt-6 font-bold py-3 rounded-lg shadow-md transition duration-200 ${
                    cartItems.length === 0 || paymentMethod !== "cod"
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-lg"
                  }`}
                >
                  ✅ Xác Nhận Thanh Toán COD
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default Payment;
