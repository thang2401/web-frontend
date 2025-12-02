const backendDomin = "https://api.domanhhung.id.vn"; // Đã sửa lỗi chính tả domain

const SummaryApi = {
  // Authentication & User
  signUP: {
    url: `${backendDomin}/api/signup`,
    method: "post",
  },
  signIn: {
    url: `${backendDomin}/api/signin`,
    method: "post",
  },
  current_user: {
    url: `${backendDomin}/api/user-details`,
    method: "get",
  },
  // KHÔNG CÒN API SIGNUP CŨ GÂY LỖI 404

  // ✅ API MỚI CHO QUY TRÌNH ĐĂNG KÝ 1-BƯỚC

  sendOtpToSignUp: {
    url: "https://api.domanhhung.id.vn/api/send-otp-to-signup",
    method: "POST",
  },
  verifyOtp: {
    url: "https://api.domanhhung.id.vn/api/verify-otp",
    method: "POST",
  },
  setPassword: {
    url: "https://api.domanhhung.id.vn/api/set-password",
    method: "POST",
  },
  logout_user: {
    url: `${backendDomin}/api/userLogout`,
    method: "get",
  },
  allUser: {
    url: `${backendDomin}/api/all-user`,
    method: "get",
  },
  updateUser: {
    url: `${backendDomin}/api/update-user`,
    method: "post",
  },
  deleteUser: {
    url: `${backendDomin}/api/delete-user`,
    method: "delete",
  },

  // Product
  uploadProduct: {
    url: `${backendDomin}/api/upload-product`,
    method: "post",
  },
  allProduct: {
    url: `${backendDomin}/api/get-product`,
    method: "get",
  },
  updateProduct: {
    url: `${backendDomin}/api/update-product`,
    method: "post",
  },
  categoryProduct: {
    url: `${backendDomin}/api/get-categoryProduct`,
    method: "get",
  },
  categoryWiseProduct: {
    url: `${backendDomin}/api/category-product`,
    method: "post",
  },
  productDetails: {
    url: `${backendDomin}/api/product-details`,
    method: "post",
  },
  searchProduct: {
    url: `${backendDomin}/api/search`,
    method: "get",
  },
  filterProduct: {
    url: `${backendDomin}/api/filter-product`,
    method: "post",
  },
  deleteProduct: {
    url: `${backendDomin}/api/products`,
    method: "delete",
  },

  // Cart & Orders
  addToCartProduct: {
    url: `${backendDomin}/api/addtocart`,
    method: "post",
  },
  addToCartProductCount: {
    url: `${backendDomin}/api/countAddToCartProduct`,
    method: "get",
  },
  addToCartProductView: {
    url: `${backendDomin}/api/view-card-product`,
    method: "get",
  },
  updateCartProduct: {
    url: `${backendDomin}/api/update-cart-product`,
    method: "post",
  },
  deleteCartProduct: {
    url: `${backendDomin}/api/delete-cart-product`,
    method: "post",
  },
  deleteCart: {
    // Đổi tên từ cleanCart sang deleteCart
    url: `${backendDomin}/api/clean-cart`,
    method: "DELETE",
  },

  processPayment: {
    url: `${backendDomin}/api/payment`,
    method: "POST",
  },
  confirmPayment: {
    url: `${backendDomin}/api/confirm-payment`,
    method: "POST",
  },
  orders: {
    url: `${backendDomin}/api/orders`,
    method: "GET",
  },
  getUserOrders: {
    url: `${backendDomin}/api/user`,
    method: "GET",
  },
  deleteOrder: {
    url: `${backendDomin}/api/orders`,
    method: "DELETE",
  },
  paypalCreateOrder: {
    url: `${backendDomin}/api/paypal_create_order`,
    method: "post",
  },

  // 2. Xác nhận Capture (Frontend gọi -> Backend gọi PayPal)
  paypalCaptureOrder: {
    url: `${backendDomin} /api/paypal_capture_order`,
    method: "post",
  },
  vnpayCreatePaymentUrl: {
    url: `${backendDomin}/api/payment/create_payment_url`,
    method: "POST",
  },
  // Password & Admin
  forgotPassword: {
    url: `${backendDomin}/api/forgot-password`,
    method: "POST",
  },
  resetPassword: {
    url: `${backendDomin}/api/reset-password`,
    method: "POST",
  },
  changePassword: {
    url: `${backendDomin}/api/change-password`,
    method: "POST",
  },
  verifyOTP: {
    url: `${backendDomin}/api/verify-otp`,
    method: "POST",
  },
  twoFA_generate: {
    url: `${backendDomin}/api/2fa/generate`,
    method: "get",
  },
  twoFA_verify: {
    url: `${backendDomin}/api/2fa/verify`,
    method: "post",
  },

  // ✅ FIX LỖI LOCALHOST (ĐÃ THÊM backendDomain)
  updateOrderStatus: (orderId) => ({
    url: `${backendDomin}/api/orders/${orderId}/status`,
    method: "PUT",
  }),
};

export default SummaryApi;
