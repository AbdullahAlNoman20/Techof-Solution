// FILE: admin/src/Pages/Voucher/PettyCashVoucher.jsx  (NEW)
// Same shape as Cash Payment Voucher, but locked to the Petty Cash float (1001)
// instead of main Cash (1000), and the expense side is restricted to Expense accounts
// only — petty cash should never post to Assets/Liabilities by mistake.
import GenericLedgerVoucher from "./GenericLedgerVoucher";
import { VOUCHER_TYPES } from "./accountingConstants";

export default function PettyCashVoucher() {
  return <GenericLedgerVoucher voucherType={VOUCHER_TYPES.PETTY_CASH} />;
}