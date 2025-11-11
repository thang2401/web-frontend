import React, { useEffect, useState, useContext } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Context from "../context";
import SummaryApi from "../common";
import displayINRCurrency from "../helpers/displayCurrency";

const Payment = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod"); // COD mặc định
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

  // 🧭 Lấy thông tin giỏ hàng + danh sách tỉnh
  useEffect(() => {
    if (user?.name) setFormData((prev) => ({ ...prev, name: user.name }));

    setLoading(true);
    fetchCartItems();
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then(setProvinces)
      .finally(() => setLoading(false));
  }, [user.name]);

  const fetchCartItems = async () => {
    const res = await fetch(SummaryApi.addToCartProductView.url, {
      method: SummaryApi.addToCartProductView.method,
      credentials: "include",
      headers: { "content-type": "application/json" },
    });
    const result = await res.json();
    if (result.success) setCartItems(result.data || []);
  };

  // 🧭 Load quận, huyện, phường
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
  }, [province]);

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

  const validatePhone = (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCost = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.productId.sellingPrice,
    0
  );

  // 🧾 Xử lý thanh toán
  const handlePayment = async (e) => {
    e.preventDefault();

    if (!userId) return alert("Vui lòng đăng nhập để thanh toán.");
    if (!province || !district || !ward)
      return alert("Vui lòng chọn đầy đủ địa chỉ.");
    if (!validatePhone(formData.phone))
      return alert("Số điện thoại không hợp lệ.");

    const wardObj = wards.find((w) => String(w.code) === String(ward));
    const districtObj = districts.find(
      (d) => String(d.code) === String(district)
    );
    const provinceObj = provinces.find(
      (p) => String(p.code) === String(province)
    );
    const fullAddress = `${wardObj?.name}, ${districtObj?.name}, ${provinceObj?.name}`;

    const confirmCheckout = window.confirm(
      `Xác nhận thanh toán ${displayINRCurrency(totalCost)}?\nPhương thức: ${
        paymentMethod === "cod"
          ? "Thanh toán khi nhận hàng"
          : "Thanh toán online"
      }\nĐịa chỉ: ${fullAddress}`
    );
    if (!confirmCheckout) return;

    try {
      const paymentData = {
        ...formData,
        address: fullAddress,
        items: cartItems,
        userId,
        paymentMethod,
        totalCost,
      };

      if (paymentMethod === "online") {
        // Chuẩn bị nội dung chuyển khoản
        const productNames = cartItems
          .map((item) => item.productId.productName)
          .join(", ");

        // Chuyển hướng sang trang QR, gửi dữ liệu
        navigate("/qr-payment", {
          state: {
            name: formData.name,
            phone: formData.phone,
            address: `${wardObj?.name}, ${districtObj?.name}, ${provinceObj?.name}`,
            totalCost,
            products: productNames,
            orderId: Math.floor(Math.random() * 1000000), // mã đơn ngẫu nhiên
          },
        });
        return;
      }

      // Gửi thông tin đơn hàng
      const payment = await fetch(SummaryApi.processPayment.url, {
        method: SummaryApi.processPayment.method,
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      const paymentResult = await payment.json();
      if (!paymentResult.success) return alert("Lỗi khi lưu đơn hàng.");

      // Xóa giỏ hàng
      const clear = await fetch(SummaryApi.cleanCart.url, {
        method: SummaryApi.cleanCart.method,
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const clearResult = await clear.json();
      if (clearResult.success) {
        alert("✅ Đặt hàng thành công!");
        setCartItems([]);
        navigate("/");
        context.setCartProductCount(0);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi hệ thống khi thanh toán. Vui lòng thử lại.");
    }
  };

  // 🎨 Giao diện
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4">
      <button
        onClick={() => navigate("/cart")}
        className="absolute top-5 left-6 flex items-center gap-2 bg-white border border-gray-300 hover:border-red-500 text-gray-700 hover:text-red-600 font-medium rounded-full px-5 py-2 shadow-sm hover:shadow-md transition duration-200"
      >
        ← Quay lại
      </button>

      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-12">
        💳 Thanh Toán Đơn Hàng
      </h1>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
        {/* Tóm tắt đơn hàng */}
        <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold text-red-600 mb-5 border-b pb-3">
            Tóm Tắt Đơn Hàng
          </h2>

          {loading ? (
            <div className="text-center text-gray-500 animate-pulse">
              Đang tải...
            </div>
          ) : (
            <>
              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center border-b py-3 hover:bg-gray-50 transition"
                >
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
                <span>Tổng tiền:</span>
                <span>{displayINRCurrency(totalCost)}</span>
              </div>
            </>
          )}
        </div>

        {/* Form thanh toán */}
        <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold mb-5 text-gray-800">
            Thông Tin Người Nhận
          </h2>

          <form onSubmit={handlePayment} className="space-y-5">
            {/* Họ tên */}
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

            {/* Số điện thoại (kiểm tra hợp lệ) */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({ ...prev, phone: value }));
                  const vnPhoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
                  if (value && !vnPhoneRegex.test(value)) {
                    e.target.setCustomValidity("Số điện thoại không hợp lệ!");
                  } else {
                    e.target.setCustomValidity("");
                  }
                }}
                placeholder="VD: 0901234567"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                required
              />
            </div>

            {/* Địa chỉ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                required
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
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                disabled={!province}
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
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                disabled={!district}
              >
                <option value="">Phường / Xã</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn phương thức thanh toán */}
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
                  <span>Thanh toán online</span>
                </label>
              </div>
            </div>

            {/* Nút xác nhận */}
            <button
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition duration-200"
            >
              ✅ Xác Nhận Thanh Toán
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Payment;
