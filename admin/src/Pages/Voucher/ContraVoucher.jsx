// FILE: admin/src/Pages/Voucher/ContraVoucher.jsx  (NEW)
// Contra Voucher is always exactly Cash(1000) <-> Bank(1010), 2 lines, no add/remove —
// enforced by the isContra checks already added to GenericLedgerVoucher.
// Two flows share this: "Cash deposited to Bank" and "Cash withdrawn from Bank" —
// the user just flips which line is Debit vs Credit; both lines start unlocked
// but restricted to only Cash/Bank via config.restrictToAccountCodes.
import GenericLedgerVoucher from "./GenericLedgerVoucher";
import { VOUCHER_TYPES } from "./accountingConstants";

export default function ContraVoucher() {
  return <GenericLedgerVoucher voucherType={VOUCHER_TYPES.CONTRA} />;
}