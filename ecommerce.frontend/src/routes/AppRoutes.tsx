import { Routes, Route } from "react-router-dom";

import LoginPage from "../features/auth/login";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}