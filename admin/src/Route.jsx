// admin/src/Route.jsx

import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home/Home.jsx";
import Voucher from "./Pages/Voucher/Voucher.jsx";
import Invoice from "./Pages/Invoice/Invoice.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/voucher" element={<Voucher />} />
      <Route path="/invoice" element={<Invoice />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <h1 style={{ fontSize: "28px", color: "#0a2540" }}>404 — Page Not Found</h1>
      <p style={{ color: "#6b7280" }}>The page you are looking for does not exist.</p>
    </div>
  );
}