import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ForgotPassowrd from "../pages/ForgotPassword";
import SignUp from "../pages/SignUp";
import AdminPanel from "../pages/AdminPanel";
import AllUsers from "../pages/AllUsers";
import AllProducts from "../pages/AllProducts";
import CategoryProduct from "../pages/CategoryProduct";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import SearchProduct from "../pages/SearchProduct";
import Payment from "../pages/Payment";
import OrderManagement from "../pages/OrderManagement";
import MyOder from "../pages/MyOder";
import ResetPassword from "../pages/ResetPassword";
import ChangPass from "../pages/ChangPass";
import VerifyOtp from "../pages/VerifyOtp";
import SetPassword from "../pages/SetPassword";
import Qr from "../pages/Qr";
import TwoFAVerify from "../pages/TwoFAVerify"; // Cần tạo component này
import TwoFASetup from "../pages/TwoFASetup"; // Cần tạo component này
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentFailed from "../pages/PaymentFailed";
import PrivacyPolicy from "../components/PrivacyPolicy";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "2fa-verify", // Trang nhập OTP khi bị chặn
        element: <TwoFAVerify />,
      },
      {
        path: "admin-panel/2fa-setup", // Trang cấu hình 2FA lần đầu cho Admin
        element: <TwoFASetup />,
      },

      {
        path: "privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "",
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "payment-success",
        element: <PaymentSuccess />,
      },
      {
        path: "payment-failed",
        element: <PaymentFailed />,
      },
      {
        path: "payment",
        element: <Payment />,
      },
      {
        path: "myoder",
        element: <MyOder />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassowrd />,
      },
      {
        path: "verify-otp",
        element: <VerifyOtp />,
      },
      {
        path: "set-password",
        element: <SetPassword />,
      },

      {
        path: "sign-up",
        element: <SignUp />,
      },
      {
        path: "/qr-payment",
        element: <Qr />,
      },

      {
        path: "product-category",
        element: <CategoryProduct />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "chang-password",
        element: <ChangPass />,
      },
      {
        path: "product/:id",
        element: <ProductDetails />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "search",
        element: <SearchProduct />,
      },
      {
        path: "admin-panel",
        element: <AdminPanel />,
        children: [
          {
            path: "all-users",
            element: <AllUsers />,
          },
          {
            path: "all-products",
            element: <AllProducts />,
          },
          {
            path: "all-payment",
            element: <OrderManagement />,
          },
        ],
      },
    ],
  },
]);

export default router;
