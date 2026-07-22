import GenericLedgerVoucher from "./GenericLedgerVoucher";
import { VOUCHER_TYPES } from "./accountingConstants";

export default function CashReceiptVoucher() {
  return <GenericLedgerVoucher voucherType={VOUCHER_TYPES.CASH_RECEIPT} />;
}