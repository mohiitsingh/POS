import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../Pages/Login/Login";
import LandingPage from "../Pages/LandingPage/LandingPage";
import DashboardLayout from "../Layouts/DashboardLayout/DashboardLayout";
import Dashboard from "../Pages/Dashboard/Dashboard";
import MenuManagement from "../Pages/MenuManagement/MenuManagement";
import Reports from "../Pages/Reports/Reports";
import OrdersHistory from "../Pages/OrdersHistory/OrdersHistory";
import Settings from "../Pages/Settings/Settings";
import TableManagement from "../Pages/TableManagement/TableManagement";
import ProtectedRoute from "../Components/ProtectedRoute";
import OnboardingRoute from "../Components/OnboardingRoute";
import PublicRoute from "../Components/PublicRoute";
import EmailVerification from "../Pages/EmailVerification/EmailVerification";
import Onboarding from '../Pages/OnBoarding/OnBoarding';
import PaymentPage from "../Pages/Payment/Payment";
import AdminRoute from "../Components/AdminRoute";
import AdminPage from "../Pages/Admin/Admin";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - Redirect to dashboard if already logged in */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Email Verification - Public route without redirect */}
      <Route path="/verify-email" element={<EmailVerification />} />

      {/* Onboarding Route - Logged in but no active subscription */}
      <Route element={<OnboardingRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Route>

      {/* Authenticated + Subscribed Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/menu-management" element={<MenuManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/orders" element={<OrdersHistory />} />
          <Route path="/tables" element={<TableManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Admin Route - Only accessible to mohits0819@gmail.com via direct URL */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      {/* Fallback - Redirect any unknown route to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
