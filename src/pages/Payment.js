import React, { useEffect, useState, useContext } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Context from "../context";
import SummaryApi from "../common"; // Cần đảm bảo file này có endpoint cho VNPay
import displayINRCurrency from "../helpers/displayCurrency";
import Swal from "sweetalert2";

const Payment = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
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

  useEffect(() => {
    if (user?.name) setFormData((prev) => ({ ...prev, name: user.name }));
    setLoading(true);
    fetchCartItems(); // Fetch Provinces
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
    if (result.success) setCartItems(result.data || []);
  }; // Logic fetch Districts

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
  }, [province]); // Logic fetch Wards

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
  ); // Giá trị số tiền an toàn (làm tròn thành số nguyên)
  const safeTotalCost = Math.round(totalCost);

  const handlePayment = async (e) => {
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

    const wardObj = wards.find((w) => String(w.code) === String(ward));
    const districtObj = districts.find(
      (d) => String(d.code) === String(district)
    );
    const provinceObj = provinces.find(
      (p) => String(p.code) === String(province)
    );
    const fullAddress = `${wardObj?.name}, ${districtObj?.name}, ${provinceObj?.name}`;

    const { isConfirmed } = await Swal.fire({
      title: "Xác nhận thanh toán",
      html: `
  <div style="text-align:left; font-size:15px;">
  <p><b>Tổng tiền:</b> ${displayINRCurrency(safeTotalCost)}</p>
  <p><b>Phương thức:</b> ${
        paymentMethod === "cod"
          ? "Thanh toán khi nhận hàng"
          : "Thanh toán online"
      }</p>
  <p><b>Địa chỉ:</b> ${fullAddress}</p>
  </div>
  `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "✅ Xác nhận",
      cancelButtonText: "❌ Hủy",
      reverseButtons: true,
    });

    if (!isConfirmed) return;

    try {
      Swal.fire({
        title: "Đang xử lý thanh toán...",
        text: "Vui lòng chờ trong giây lát.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      }); // 🔹 Format items để backend nhận ObjectId

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
        paymentMethod,
        totalCost: safeTotalCost,
      }; // ========================================================= // 🚀 XỬ LÝ THANH TOÁN ONLINE (VNPAY) // =========================================================

      if (paymentMethod === "online") {
        const orderInfo = `Thanh toan DH ${userId}`; // GỌI API BACKEND ĐỂ TẠO URL VNPAY

        // ⭐ LOG ĐỊNH DẠNG TIỀN TRƯỚC KHI GỬI ⭐
        console.log("--- DEBUG VNPAY AMOUNT ---");
        console.log("Giá trị safeTotalCost (dạng number):", safeTotalCost);
        console.log("Kiểm tra type:", typeof safeTotalCost);
        console.log("--------------------------");

        const vnpayRes = await fetch(SummaryApi.vnpayCreatePaymentUrl.url, {
          method: SummaryApi.vnpayCreatePaymentUrl.method,
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            amount: safeTotalCost,
            orderInfo: orderInfo,
            bankCode: "VNPAYQR",
          }),
        });

        const vnpayResult = await vnpayRes.json();
        Swal.close();

        if (vnpayResult.paymentUrl) {
          window.location.href = vnpayResult.paymentUrl;
          return;
        } else {
          return Swal.fire(
            "❌ Lỗi Khởi Tạo",
            vnpayResult.message || "Không thể tạo liên kết thanh toán VNPay.",
            "error"
          );
        }
      } // ========================================================= // 💻 XỬ LÝ THANH TOÁN COD (CODE CŨ GIỮ NGUYÊN) // =========================================================
      const paymentRes = await fetch(SummaryApi.processPayment.url, {
        method: SummaryApi.processPayment.method,
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      const paymentResult = await paymentRes.json();
      if (!paymentResult.success) {
        Swal.close();
        return Swal.fire(
          "❌ Lỗi",
          "Không thể lưu đơn hàng. Vui lòng thử lại.",
          "error"
        );
      } // Xóa giỏ hàng

      const clearRes = await fetch(SummaryApi.deleteCart.url, {
        method: SummaryApi.deleteCart.method,
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const clearResult = await clearRes.json();
      Swal.close();

      if (clearResult.success) {
        await Swal.fire("🎉 Thành công!", "Đặt hàng thành công!", "success");
        setCartItems([]);
        navigate("/");
        context.setCartProductCount(0);
      }
    } catch (err) {
      console.error(err);
      Swal.close();
      Swal.fire("⚠️ Lỗi hệ thống", "Vui lòng thử lại sau.", "error");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4">
           {" "}
      <button
        onClick={() => navigate("/cart")}
        className="absolute top-5 left-6 flex items-center gap-2 bg-white border border-gray-300 hover:border-red-500 text-gray-700 hover:text-red-600 font-medium rounded-full px-5 py-2 shadow-sm hover:shadow-md transition duration-200"
      >
                ← Quay lại      {" "}
      </button>
           {" "}
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-12">
                💳 Thanh Toán Đơn Hàng      {" "}
      </h1>
           {" "}
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
                {/* Tóm tắt đơn hàng */}       {" "}
        <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                   {" "}
          <h2 className="text-2xl font-semibold text-red-600 mb-5 border-b pb-3">
                        Tóm Tắt Đơn Hàng          {" "}
          </h2>
                   {" "}
          {loading ? (
            <div className="text-center text-gray-500 animate-pulse">
                            Đang tải...            {" "}
            </div>
          ) : (
            <>
                           {" "}
              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center border-b py-3 hover:bg-gray-50 transition"
                >
                                   {" "}
                  <div className="flex items-center gap-3">
                                       {" "}
                    <img
                      src={item.productId.productImage?.[0]}
                      alt={item.productId.productName}
                      className="w-16 h-16 object-contain rounded-md border"
                    />
                                       {" "}
                    <div>
                                           {" "}
                      <h3 className="font-medium text-gray-800">
                                                {item.productId?.productName}   
                                         {" "}
                      </h3>
                                           {" "}
                      <p className="text-sm text-gray-500">
                                                SL: {item.quantity}             
                               {" "}
                      </p>
                                         {" "}
                    </div>
                                     {" "}
                  </div>
                                   {" "}
                  <span className="text-red-600 font-semibold">
                                       {" "}
                    {displayINRCurrency(
                      item.productId?.sellingPrice * item.quantity
                    )}
                                     {" "}
                  </span>
                                 {" "}
                </div>
              ))}
                           {" "}
              <div className="mt-5 flex justify-between font-semibold text-gray-800">
                                <span>Tổng SL:</span>               {" "}
                <span>{totalQuantity}</span>             {" "}
              </div>
                           {" "}
              <div className="mt-2 flex justify-between text-xl font-bold text-red-600">
                                <span>Tổng tiền:</span>               {" "}
                <span>{displayINRCurrency(safeTotalCost)}</span>             {" "}
              </div>
                         {" "}
            </>
          )}
                 {" "}
        </div>
                {/* Form thanh toán */}       {" "}
        <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                   {" "}
          <h2 className="text-2xl font-semibold mb-5 text-gray-800">
                        Thông Tin Người Nhận          {" "}
          </h2>
                   {" "}
          <form onSubmit={handlePayment} className="space-y-5">
                       {" "}
            <div>
                           {" "}
              <label className="block mb-1 font-medium text-gray-700">
                                Họ và tên              {" "}
              </label>
                           {" "}
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                required
              />
                         {" "}
            </div>
                       {" "}
            <div>
                           {" "}
              <label className="block mb-1 font-medium text-gray-700">
                                Số điện thoại              {" "}
              </label>
                           {" "}
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
                         {" "}
            </div>
                       {" "}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {" "}
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                required
              >
                                <option value="">Tỉnh / TP</option>             
                 {" "}
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                                        {p.name}                 {" "}
                  </option>
                ))}
                             {" "}
              </select>
                           {" "}
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                disabled={!province}
              >
                                <option value="">Quận / Huyện</option>         
                     {" "}
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                                        {d.name}                 {" "}
                  </option>
                ))}
                             {" "}
              </select>
                           {" "}
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
                disabled={!district}
              >
                                <option value="">Phường / Xã</option>           
                   {" "}
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                                        {w.name}                 {" "}
                  </option>
                ))}
                             {" "}
              </select>
                         {" "}
            </div>
                       {" "}
            <div>
                           {" "}
              <label className="block mb-2 font-medium text-gray-700">
                                Phương thức thanh toán              {" "}
              </label>
                           {" "}
              <div className="flex gap-4">
                               {" "}
                <label className="flex items-center gap-2 cursor-pointer">
                                   {" "}
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="accent-red-500"
                  />
                                    <span>Thanh toán khi nhận hàng (COD)</span> 
                               {" "}
                </label>
                               {" "}
                <label className="flex items-center gap-2 cursor-pointer">
                                   {" "}
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                    className="accent-red-500"
                  />
                                    <span>Thanh toán online (VNPay)</span>     
                           {" "}
                </label>
                             {" "}
              </div>
                           {" "}
            </div>
                       {" "}
            <button
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition duration-200"
            >
                            ✅ Xác Nhận Thanh Toán            {" "}
            </button>
                     {" "}
          </form>
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default Payment;
