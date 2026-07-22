// FILE: admin/src/Pages/Voucher/BankPaymentVoucher.jsx  (NEW)
import GenericLedgerVoucher from "./GenericLedgerVoucher";
import { VOUCHER_TYPES } from "./accountingConstants";

export default function BankPaymentVoucher() {
  return <GenericLedgerVoucher voucherType={VOUCHER_TYPES.BANK_PAYMENT} />;
}