// FILE: admin/src/Pages/Voucher/PurchaseVoucher.jsx  (NEW)
// Credit purchase: Dr Inventory/Expense (any Assets/Expenses account, user picks),
// Cr Accounts Payable (2000, locked). This is what your 14-step purchase process
// posts to GL once the invoice is verified and registered (step 9 in your document).
import GenericLedgerVoucher from "./GenericLedgerVoucher";
import { VOUCHER_TYPES } from "./accountingConstants";

export default function PurchaseVoucher() {
  return <GenericLedgerVoucher voucherType={VOUCHER_TYPES.PURCHASE} />;
}