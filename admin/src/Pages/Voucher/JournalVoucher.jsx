// FILE: admin/src/Pages/Voucher/JournalVoucher.jsx  (NEW)
// Journal Voucher needs no locked cash/bank side — the shared engine already
// supports this because VOUCHER_TYPE_CONFIG.journal has fixedSide/fixedAccountCode = null.
import GenericLedgerVoucher from "./GenericLedgerVoucher";
import { VOUCHER_TYPES } from "./accountingConstants";

export default function JournalVoucher() {
  return <GenericLedgerVoucher voucherType={VOUCHER_TYPES.JOURNAL} />;
}