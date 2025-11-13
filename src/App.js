import "./App.css";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState, useCallback } from "react";
import SummaryApi from "./common";
import Context from "./context";
import { useDispatch } from "react-redux";
import { setUserDetails } from "./store/userSlice";
import ScrollToTop from "./helpers/ScrollToTop";

function App() {
  const dispatch = useDispatch();
  const [cartProductCount, setCartProductCount] = useState(0);
  const location = useLocation();

  const fetchUserDetails = useCallback(async () => {
    try {
      const dataResponse = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: "include",
      });
      const dataApi = await dataResponse.json();

      // SỬA LỖI 401: Chỉ dispatch khi API báo success (200 OK)
      // Nếu API trả về 401 hoặc lỗi khác, ta bỏ qua, không hiển thị lỗi console.
      if (dataApi.success) {
        dispatch(setUserDetails(dataApi.data));
      }
    } catch (err) {
      // Chỉ log lỗi nếu đó là lỗi mạng/hệ thống thực sự
      console.error("❌ Lỗi fetch user details:", err);
    }
  }, [dispatch]);

  const fetchUserAddToCart = useCallback(async () => {
    try {
      const dataResponse = await fetch(SummaryApi.addToCartProductCount.url, {
        method: SummaryApi.addToCartProductCount.method,
        credentials: "include",
      });
      const dataApi = await dataResponse.json();

      // SỬA LỖI 401: Chỉ cập nhật cart count khi API báo success
      if (dataApi.success) {
        setCartProductCount(dataApi?.data?.count || 0);
      } else {
        // Nếu không thành công (ví dụ: 401), set count về 0
        setCartProductCount(0);
      }
    } catch (err) {
      // Chỉ log lỗi nếu đó là lỗi mạng/hệ thống thực sự
      console.error("❌ Lỗi fetch cart count:", err);
    }
  }, []);

  useEffect(() => {
    // Chạy fetch ngay khi khởi động
    fetchUserDetails();
    fetchUserAddToCart();
  }, [fetchUserDetails, fetchUserAddToCart]);

  // Routes cần ẩn Header & Footer hoàn toàn
  const hideHeaderFooterRoutes = [
    "/login",
    "/myorder",
    "/cart",
    "/sign-up",
    "/payment",
    "/reset-password",
    "/forgot-password",
    "/chang-password",
    "/myoder",
    "/privacy-policy",
  ];

  // Routes chỉ ẩn Footer (ví dụ OrderManagement)
  const hideFooterRoutes = [
    "/admin-panel/all-payment",
    "/admin-panel/all-users",
    "/admin-panel/all-products",
  ];

  const shouldHideHeaderFooter = hideHeaderFooterRoutes.includes(
    location.pathname
  );
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <Context.Provider
      value={{
        fetchUserDetails,
        cartProductCount,
        fetchUserAddToCart,
        setCartProductCount,
      }}
    >
      <ScrollToTop />
      <ToastContainer position="top-right" />

      {!shouldHideHeaderFooter && <Header />}

      <main
        className={`min-h-[calc(100vh-120px)] ${
          !shouldHideHeaderFooter ? "pt-16" : ""
        }`}
      >
        <Outlet />
      </main>

      {!shouldHideFooter && !shouldHideHeaderFooter && <Footer />}
    </Context.Provider>
  );
}

export default App;
