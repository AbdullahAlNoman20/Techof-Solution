// FILE: admin/src/Pages/Voucher/BankReceiptVoucher.jsx  (NEW)
import GenericLedgerVoucher from "./GenericLedgerVoucher";
import { VOUCHER_TYPES } from "./accountingConstants";

export default function BankReceiptVoucher() {
  return <GenericLedgerVoucher voucherType={VOUCHER_TYPES.BANK_RECEIPT} />;
}