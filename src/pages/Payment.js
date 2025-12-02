import React, { useEffect, useState, useContext } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
// 1. IMPORT PAYPAL BUTTONS
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Context from "../context";
import SummaryApi from "../common"; // Bao gồm paypalCreateOrder, paypalCaptureOrder, processPayment, deleteCart
import displayINRCurrency from "../helpers/displayCurrency";
import Swal from "sweetalert2";

// ⚠️ CẤU HÌNH PAYPAL: Thay thế bằng Client ID của bạn (ví dụ: trong biến môi trường)
const initialOptions = {
  "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID || "sb", // "sb" là Sandbox
  currency: "USD", // PHẢI DÙNG USD
  intent: "capture",
};

// Tỷ giá giả định 1 USD = 25000 VND (Sử dụng tỷ giá thực tế trong Production)
const EXCHANGE_RATE = 25000;

const Payment = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod"); // State quản lý địa chỉ

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
  const location = useLocation(); // --- LOGIC FETCH DỮ LIỆU VÀ ĐỊA CHỈ ---

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
    const res = await fetch(SummaryApi.addToCartProductView.url, {
      method: SummaryApi.addToCartProductView.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
    });
    const result = await res.json();
    if (result.success) {
      const validCartItems = result.data
        ? result.data.filter((item) => item.productId)
        : [];
      setCartItems(validCartItems);
    }
  }; // Logic Fetch Districts (Quận/Huyện)

  useEffect(() => {
    if (province) {
      fetch(`https://provinces.open-api.vn/api/p/${province}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setDistricts(data.districts || []);
          setWards([]);
          setDistrict("");
          setWard("");
        });
    } else {
      setDistricts([]);
      setWards([]);
      setDistrict("");
      setWard("");
    }
  }, [province]); // Logic Fetch Wards (Phường/Xã)

  useEffect(() => {
    if (district) {
      fetch(`https://provinces.open-api.vn/api/d/${district}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setWards(data.wards || []);
          setWard("");
        });
    } else {
      setWards([]);
      setWard("");
    }
  }, [district]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePhone = (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone); // --- TÍNH TOÁN TIỀN TỆ ---

  const validCartItems = cartItems.filter(
    (item) => item.productId && item.productId.sellingPrice
  );
  const totalQuantity = validCartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );
  const totalCostVND = validCartItems.reduce(
    (acc, item) => acc + item.quantity * item.productId.sellingPrice,
    0
  );
  const safeTotalCostVND = Math.round(totalCostVND);
  const totalCostUSD = safeTotalCostVND / EXCHANGE_RATE;
  const totalCostUSDString = totalCostUSD.toFixed(2); // Chuỗi 2 chữ số thập phân cho PayPal

  // Lấy địa chỉ đầy đủ
  const getFullAddress = () => {
    const wardObj = wards.find((w) => String(w.code) === String(ward));
    const districtObj = districts.find(
      (d) => String(d.code) === String(district)
    );
    const provinceObj = provinces.find(
      (p) => String(p.code) === String(province)
    );
    return `${wardObj?.name}, ${districtObj?.name}, ${provinceObj?.name}`;
  }; // --- HÀM XỬ LÝ THANH TOÁN COD ---

  const handleCODPayment = async (e) => {
    e.preventDefault();

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

    const { isConfirmed } = await Swal.fire({
      title: "Xác nhận thanh toán COD",
      html: `<div style="text-align:left; font-size:15px;"><p><b>Tổng tiền:</b> ${displayINRCurrency(
        safeTotalCostVND
      )}</p><p><b>Phương thức:</b> Thanh toán khi nhận hàng</p><p><b>Địa chỉ:</b> ${fullAddress}</p></div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "✅ Xác nhận",
      cancelButtonText: "❌ Hủy",
      reverseButtons: true,
    });

    if (!isConfirmed) return;

    try {
      Swal.fire({
        title: "Đang xử lý đơn hàng...",
        text: "Vui lòng chờ...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const formattedItems = validCartItems.map((item) => ({
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
        totalCost: safeTotalCostVND,
      };

      const res = await fetch(SummaryApi.processPayment.url, {
        method: SummaryApi.processPayment.method,
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(paymentData),
      });
      const result = await res.json();
      if (!result.success) throw new Error("Không thể lưu đơn hàng.");

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
  }; // ------------------------------------------------------------- // --- GIAO DIỆN CHÍNH --- // -------------------------------------------------------------

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

        {loading && (
          <div className="text-center text-lg text-red-500 font-semibold mb-6">
            Đang tải giỏ hàng và thông tin địa chỉ...
          </div>
        )}

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
          {/* Tóm tắt đơn hàng */}
          <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100 h-fit sticky top-4">
            <h2 className="text-2xl font-semibold text-red-600 mb-5 border-b pb-3">
              Tóm Tắt Đơn Hàng
            </h2>

            {validCartItems.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                Giỏ hàng trống hoặc các sản phẩm không hợp lệ.
              </div>
            ) : (
              <>
                {validCartItems.map((item, idx) => {
                  const product = item.productId;
                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center border-b py-3 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.productImage?.[0]}
                          alt={product.productName}
                          className="w-16 h-16 object-contain rounded-md border"
                        />
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {product.productName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            SL: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-red-600 font-semibold">
                        {displayINRCurrency(
                          product.sellingPrice * item.quantity
                        )}
                      </span>
                    </div>
                  );
                })}

                <div className="mt-5 flex justify-between font-semibold text-gray-800">
                  <span>Tổng SL:</span>
                  <span>{totalQuantity}</span>
                </div>

                <div className="mt-2 flex justify-between text-xl font-bold text-red-600">
                  <span>Tổng tiền (VND):</span>
                  <span>{displayINRCurrency(safeTotalCostVND)}</span>
                </div>
                <div className="mt-1 text-right text-sm text-gray-500">
                  (Thanh toán **{totalCostUSDString} USD** qua PayPal)
                </div>
              </>
            )}
          </div>
          {/* Form thông tin và thanh toán */}
          <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-2xl font-semibold mb-5 text-gray-800">
              Thông Tin Người Nhận & Phương Thức
            </h2>
            {/* Form submit chỉ gọi handleCODPayment khi chọn COD */}
            <form
              onSubmit={
                paymentMethod === "cod"
                  ? handleCODPayment
                  : (e) => e.preventDefault()
              }
              className="space-y-5"
            >
              {/* --- Vùng Nhập liệu --- */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  required
                />
              </div>
              {/* Vùng chọn Địa chỉ */}
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
              {/* Phương thức thanh toán */}
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
              {/* --- KHỐI THANH TOÁN PAYPAL BUTTONS (ONLINE) --- */}
              {paymentMethod === "online" && validCartItems.length > 0 && (
                <div className="mt-6 pt-4 border-t border-indigo-200">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                    <span className="text-indigo-600 mr-2">🚀</span> Thanh Toán
                    An Toàn Với PayPal
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
                      if (!userId || !province) return;

                      const orderPayload = {
                        totalCost: totalCostUSD, // Gửi USD cho Backend
                        items: validCartItems.map((item) => ({
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
                      return result.orderID;
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
                        context.setCartProductCount(0);
                        navigate("/");
                      } else {
                        Swal.fire(
                          "❌ Thất bại",
                          result.message || "Giao dịch không hoàn tất.",
                          "error"
                        );
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
              )}

              {/* Nút Xác nhận Thanh toán COD (Chỉ hiển thị khi chọn COD) */}
              {paymentMethod === "cod" && (
                <button
                  type="submit"
                  disabled={validCartItems.length === 0}
                  className={`w-full mt-6 font-bold py-3 rounded-lg shadow-md transition duration-200 ${
                    validCartItems.length === 0
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
