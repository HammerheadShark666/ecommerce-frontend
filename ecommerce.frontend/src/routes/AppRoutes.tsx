import { Routes, Route } from "react-router-dom";

import LoginPage from "../features/auth/login/login";
import PasswordResetRequestPage from "../features/auth/password-reset/password-reset-request/password-reset-request";
import PasswordResetPage from "../features/auth/password-reset/password-reset/password-reset";  
import Login2faPage from "../features/auth/login2fa/login2fa";
import HomePage from "../features/home/home";
import TwofaEnrolmentRequestPage from "@/features/auth/2faEnrolment/2faEnrolmentRequest";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<PasswordResetRequestPage />} />
      <Route path="/password-reset" element={<PasswordResetPage />} />
      <Route path="/2fa-authentication" element={<Login2faPage />} />
      <Route path="/2fa-enrolment-request" element={<TwofaEnrolmentRequestPage />} />

      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}