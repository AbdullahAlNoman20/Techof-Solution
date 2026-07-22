// FILE: admin/src/Pages/Voucher/SalesVoucher.jsx  (NEW)
// Credit sale: Dr Accounts Receivable (1020, locked), Cr Sales/Service Income (user picks).
// When the customer eventually pays, that's recorded with a Bank/Cash Receipt Voucher
// against the same Accounts Receivable account — this Sales Voucher just creates the debt.
import GenericLedgerVoucher from "./GenericLedgerVoucher";
import { VOUCHER_TYPES } from "./accountingConstants";

export default function SalesVoucher() {
  return <GenericLedgerVoucher voucherType={VOUCHER_TYPES.SALES} />;
}