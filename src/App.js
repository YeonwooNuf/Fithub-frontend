import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // AuthProvider 추가
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";

import MyPage from "./pages/mypage/MyPage";
import Points from "./pages/point/Points";
import Coupons from "./pages/coupon/Coupons";

import Address from "./pages/address/Address";
import Asking from "./pages/asking/Asking";
import Review from "./pages/review/Reviews";
import Orders from "./pages/order/Orders";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard";
import AdminUser from "./pages/admin/user/AdminUser";
import AdminProduct from "./pages/admin/product/AdminProduct";
import AddProduct from "./pages/admin/product/AddProduct";
import AdminBrand from "./pages/admin/brand/AdminBrand";
import AdminCoupon from "./pages/admin/coupon/AdminCoupon";
import AddCoupon from "./pages/admin/coupon/AddCoupon";
import ProductDetail from "./pages/product/ProductDetail";
import Checkout from "./pages/checkout/Checkout";

function App() {
  return (
    <AuthProvider> {/* AuthProvider로 전체 감싸기 */}
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/mypage" element={<MyPage />} />
            <Route path="/points" element={<Points />} />
            <Route path="/coupons" element={<Coupons />} />

            <Route path="/address" element={<Address />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/asking" element={<Asking />} />
            <Route path="/review/:id" element={<Review />} />

            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* 관리자 탭 */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUser />} />
            <Route path="/admin/brands" element={<AdminBrand />} />
            <Route path="/admin/products" element={<AdminProduct />} />
            <Route path="/admin/products/add" element={<AddProduct />} />
            <Route path="/admin/coupons" element={<AdminCoupon />} />
            <Route path="/admin/coupons/add" element={<AddCoupon />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
