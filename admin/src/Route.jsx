import { Routes, Route } from "react-router-dom";

import Home from "./Pages/Home/Home.jsx";
import Voucher from "./Pages/Voucher/Voucher.jsx";
import Invoice from "./Pages/Invoice/Invoice.jsx";

import CashPaymentVoucher from "./Pages/Voucher/CashPaymentVoucher.jsx";
import CashReceiptVoucher from "./Pages/Voucher/CashReceiptVoucher.jsx";
import BankPaymentVoucher from "./Pages/Voucher/BankPaymentVoucher.jsx";
import BankReceiptVoucher from "./Pages/Voucher/BankReceiptVoucher.jsx";
import JournalVoucher from "./Pages/Voucher/JournalVoucher.jsx";
import ContraVoucher from "./Pages/Voucher/ContraVoucher.jsx";
import GoodsReceivingNote from "./Pages/Voucher/GoodsReceivingNote.jsx";
import PurchaseVoucher from "./Pages/Voucher/PurchaseVoucher.jsx";
import SalesVoucher from "./Pages/Voucher/SalesVoucher.jsx";
import PettyCashVoucher from "./Pages/Voucher/PettyCashVoucher.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Main Pages */}
      <Route path="/voucher" element={<Voucher />} />
      <Route path="/invoice" element={<Invoice />} />

      {/* Voucher Pages */}
      <Route path="/voucher/cash-payment" element={<CashPaymentVoucher />} />
      <Route path="/voucher/cash-receipt" element={<CashReceiptVoucher />} />
      <Route path="/voucher/bank-payment" element={<BankPaymentVoucher />} />
      <Route path="/voucher/bank-receipt" element={<BankReceiptVoucher />} />
      <Route path="/voucher/journal" element={<JournalVoucher />} />

      <Route path="/voucher/contra" element={<ContraVoucher />} />

      <Route path="/voucher/grn" element={<GoodsReceivingNote />} />
      <Route path="/voucher/purchase" element={<PurchaseVoucher />} />

      <Route path="/voucher/sales" element={<SalesVoucher />} />

      <Route path="/voucher/petty-cash" element={<PettyCashVoucher />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <h1 style={{ fontSize: "28px", color: "#0a2540" }}>
        404 — Page Not Found
      </h1>
      <p style={{ color: "#6b7280" }}>
        The page you are looking for does not exist.
      </p>
    </div>
  );
}
