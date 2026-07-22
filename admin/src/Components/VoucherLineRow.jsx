
import AccountSelect from "./AccountSelect";
import { clampAmount, sanitizeNarration } from "../Pages/Voucher/voucherHelpers";

export default function VoucherLineRow({ line, onChange, onRemove, canRemove, restrictToCodes, restrictToTypes, lockedAccountCode, lockedSide, placeholder = "Being the amount..." }) {
  function set(field, value) {
    onChange(line.id, field, value);
  }

  const debitLocked = lockedSide === "debit";
  const creditLocked = lockedSide === "credit";

  return (
    <tr className="border-b border-slate-200">
      <td className="p-2 w-[34%]">
        <AccountSelect
          value={lockedAccountCode || line.accountCode}
          onChange={(v) => set("accountCode", v)}
          restrictToCodes={restrictToCodes}
          restrictToTypes={lockedAccountCode ? null : restrictToTypes}
          disabled={Boolean(lockedAccountCode)}
        />
      </td>
      <td className="p-2 w-[30%]">
        <input
          value={line.narration}
          maxLength={200}
          placeholder={placeholder}
          onChange={(e) => set("narration", sanitizeNarration(e.target.value, 200))}
          className="w-full bg-transparent outline-none px-1 text-sm"
        />
      </td>
      <td className="p-2 w-[14%] text-right">
        <input
          type="number"
          min="0"
          step="0.01"
          value={line.debit}
          disabled={creditLocked}
          onChange={(e) => set("debit", clampAmount(e.target.value))}
          className="w-full bg-transparent outline-none text-right px-1 text-sm disabled:text-slate-300"
        />
      </td>
      <td className="p-2 w-[14%] text-right">
        <input
          type="number"
          min="0"
          step="0.01"
          value={line.credit}
          disabled={debitLocked}
          onChange={(e) => set("credit", clampAmount(e.target.value))}
          className="w-full bg-transparent outline-none text-right px-1 text-sm disabled:text-slate-300"
        />
      </td>
      <td className="p-2 w-[8%] text-center">
        <button
          type="button"
          onClick={() => onRemove(line.id)}
          disabled={!canRemove}
          className="text-rose-600 disabled:opacity-30"
          aria-label="Remove line"
        >
          <i className="fa-solid fa-trash" />
        </button>
      </td>
    </tr>
  );
}