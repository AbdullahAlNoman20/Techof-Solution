
import { useEffect, useState } from "react";
import {
  loadChartOfAccounts,
  groupAccountsByType,
} from "../Pages/Voucher/voucherHelpers";

export default function AccountSelect({
  value,
  onChange,
  restrictToCodes,
  restrictToTypes,
  disabled,
  placeholder = "Select account...",
}) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    loadChartOfAccounts()
      .then((data) => {
        if (mounted) setAccounts(data);
      })
      .catch(() => {
        if (mounted) setError("Could not load chart of accounts.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  let filtered = accounts;
  if (restrictToCodes)
    filtered = filtered.filter((a) => restrictToCodes.includes(a.code));
  if (restrictToTypes)
    filtered = filtered.filter((a) => restrictToTypes.includes(a.type));
  const grouped = groupAccountsByType(filtered);

  if (loading) {
    return (
      <select
        disabled
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-400"
      >
        <option>Loading accounts...</option>
      </select>
    );
  }
  if (error)
    return <p className="text-xs font-medium text-rose-600">{error}</p>;

  return (
    <select
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0A66C2] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
    >
      <option value="">{placeholder}</option>
      {Object.entries(grouped).map(([type, accs]) => (
        <optgroup key={type} label={type}>
          {accs.map((a) => (
            <option key={a.code} value={a.code}>
              {a.code} — {a.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
