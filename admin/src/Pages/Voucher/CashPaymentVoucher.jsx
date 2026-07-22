
import GenericLedgerVoucher from "./GenericLedgerVoucher";
import { VOUCHER_TYPES } from "./accountingConstants";

export default function CashPaymentVoucher() {
  return <GenericLedgerVoucher voucherType={VOUCHER_TYPES.CASH_PAYMENT} />;
}