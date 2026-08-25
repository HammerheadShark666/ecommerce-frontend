import { Routes, Route } from "react-router-dom";

import LoginPage from "../features/auth/login/login";
import PasswordResetRequestPage from "../features/auth/password-reset/password-reset-request/password-reset-request";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<PasswordResetRequestPage />} />
    </Routes>
  );
}