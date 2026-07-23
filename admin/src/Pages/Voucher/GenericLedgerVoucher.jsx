// admin/src/Pages/Voucher/GenericLedgerVoucher.jsx

import techofLogo from "../../assets/Techof Logo 2.jpeg";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  VOUCHER_TYPE_CONFIG,
  VOUCHER_TYPES,
  COMPANY_INFO,
} from "./accountingConstants";
import {
  loadChartOfAccounts,
  findAccountByCode,
  validateDoubleEntry,
  generateVoucherNumber,
  emptyVoucherLine,
  sanitizeNarration,
} from "./accountingHelpers";
import { numberToWordsBDT, formatCurrency } from "./voucherHelpers";
import AccountSelect from "../../Components/AccountSelect";
import VoucherLineRow from "../../Components/VoucherLineRow";

const todayISO = () => new Date().toISOString().slice(0, 10);

const PAYMENT_MODES = ["Cash", "Bank", "Cheque", "Bkash", "Nagad", "Rocket", "Online Transfer"];

export default function GenericLedgerVoucher({ voucherType }) {
  const config = VOUCHER_TYPE_CONFIG[voucherType];
  const isContra = voucherType === VOUCHER_TYPES.CONTRA;
  const [accounts, setAccounts] = useState([]);
  const [voucherNo] = useState(() => generateVoucherNumber(voucherType));
  const [voucherDate, setVoucherDate] = useState(todayISO());
  const [partyName, setPartyName] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [lines, setLines] = useState([
    emptyVoucherLine(
      config.fixedSide === "debit"
        ? { accountCode: config.fixedAccountCode, debit: 0 }
        : { accountCode: config.fixedAccountCode, credit: 0 },
    ),
    emptyVoucherLine(),
  ]);
  const [narration, setNarration] = useState("");
  const signatureRoles = config.signatureRoles || [
    "Approved By",
    "Paid By",
    "Signature",
  ];
  const [signatures, setSignatures] = useState(() =>
    signatureRoles.reduce(
      (acc, role) => ({ ...acc, [role]: { name: "", date: "" } }),
      {},
    ),
  );
  const [error, setError] = useState("");

  function updateSignatureField(role, field, value) {
    setSignatures((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: sanitizeNarration(value, field === "name" ? 80 : 20),
      },
    }));
  }

  useEffect(() => {
    loadChartOfAccounts()
      .then(setAccounts)
      .catch(() => setError("Could not load chart of accounts."));
  }, []);

  function updateLine(id, field, value) {
    setLines((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              [field]:
                field === "narration" ? sanitizeNarration(value, 200) : value,
            }
          : l,
      ),
    );
  }

  function addLine() {
    setLines((prev) => [...prev, emptyVoucherLine()]);
  }

  function removeLine(id) {
    setLines((prev) =>
      prev.length > 2 ? prev.filter((l) => l.id !== id) : prev,
    );
  }

  const validation = useMemo(() => validateDoubleEntry(lines), [lines]);
  const amountInWords = useMemo(
    () => numberToWordsBDT(validation.totalDebit),
    [validation.totalDebit],
  );
  const generatedAt = useMemo(() => new Date().toLocaleString("en-GB"), []);
  const beingPlaceholder = `Being ${(config.partyLabel || "the amount").toLowerCase()} ${
    partyName || "___"
  } on account of...`;

  function handlePrint() {
    if (!validation.valid) {
      setError(validation.message);
      return;
    }
    if (config.partyLabel && !partyName.trim()) {
      setError(`${config.partyLabel} is required.`);
      return;
    }
    setError("");
    window.print();
  }

  const themeColor = voucherType.includes("receipt") ? "#0f9d58" : "#7bb8a8";
  const themeDark = "#0a2540";

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center gap-4 print:block print:bg-white print:p-0 print:min-h-0">
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          html, body { height: auto !important; }
          body * { visibility: hidden !important; }
          #ledger-voucher-print, #ledger-voucher-print * { visibility: visible !important; }
          #ledger-voucher-print {
            position: static !important; width: 100% !important; max-width: none !important;
            box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; padding: 0 !important;
          }
          #ledger-voucher-print .avoid-break { break-inside: avoid !important; page-break-inside: avoid !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="w-full max-w-[900px] flex items-center gap-2 print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 transition"
        >
          <i className="fa-solid fa-arrow-left" /> Home
        </Link>
        <button
          type="button"
          onClick={handlePrint}
          className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition shadow-sm"
          style={{
            background: `linear-gradient(to right, ${themeColor}, ${themeDark})`,
          }}
        >
          <i className="fa-solid fa-print" /> Print Voucher
        </button>
      </div>

      {/* Outer light border frame — mirrors the pale blue outer border in the template */}
      <div
        id="ledger-voucher-print"
        className="relative w-full max-w-[900px] bg-white shadow-lg print:shadow-none p-3"
        style={{ border: "3px solid #dbe9f2" }}
      >
        {/* Inner border — mirrors the thin black inner rule in the template */}
        <div className="border border-slate-800">
          {/* Company Name & Logo box */}
          <div className="flex justify-center pt-5 pb-2 px-6 avoid-break">
            <div
              className="rounded-sm px-8 py-3 flex items-center gap-3"
              style={{ border: `3px double ${themeColor}` }}
            >
              <img
                src={techofLogo}
                alt={`${COMPANY_INFO.name} logo`}
                onError={(e) => (e.currentTarget.style.display = "none")}
                className="w-9 h-9 object-contain"
              />
              <span className="text-xl font-extrabold text-slate-900 tracking-wide">
                {COMPANY_INFO.name}
              </span>
            </div>
          </div>
          <p className="text-center text-[12px] text-slate-600 pb-3">
            {COMPANY_INFO.address} · {COMPANY_INFO.phone} · {COMPANY_INFO.email}
          </p>

          {/* Title bar with Ref No / Date */}
          <div className="border-t border-b border-slate-800 px-5 py-3 flex justify-between items-start avoid-break">
            <h2 className="text-2xl font-bold" style={{ color: themeColor }}>
              {config.label}
            </h2>
            <div className="text-right text-[12px]">
              <p className="mb-1">
                <span className="font-semibold" style={{ color: themeColor }}>
                  Ref No:
                </span>{" "}
                <span className="border-b border-dotted border-slate-400 inline-block min-w-[130px]">
                  {voucherNo}
                </span>
              </p>
              <div className="border border-slate-400 rounded px-3 py-1.5 flex items-center gap-2">
                <span className="font-semibold text-slate-700">Date:</span>
                <input
                  type="date"
                  value={voucherDate}
                  onChange={(e) => setVoucherDate(e.target.value)}
                  className="bg-transparent outline-none text-[12px]"
                />
              </div>
            </div>
          </div>

          {/* Amount row */}
          <div className="border-b border-slate-800 px-5 py-2.5 flex items-center gap-3 text-[13px] avoid-break">
            <span className="font-semibold text-slate-800">Amount:</span>
            <span className="font-bold text-lg" style={{ color: themeColor }}>
              ৳ {formatCurrency(validation.totalDebit)}
            </span>
          </div>

          {/* Mode of Payment header */}
          <div className="border-b border-slate-800 py-1.5 text-center font-bold text-[13px] text-slate-800 avoid-break">
            Mode of Payment
          </div>

          {/* Cash/Bank/Cheque row */}
          <div className="border-b border-slate-800 px-5 py-2.5 flex items-center gap-5 flex-wrap text-[12.5px] avoid-break">
            <span className="font-semibold text-slate-800 shrink-0">
              Cash/Bank/Cheque:
            </span>
            <div className="flex gap-3 flex-wrap">
              {PAYMENT_MODES.map((m) => (
                <label key={m} className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="paymentMode"
                    checked={paymentMode === m}
                    onChange={() => setPaymentMode(m)}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>

          {/* To whom */}
          <div className="border-b border-slate-800 px-5 py-2.5 flex items-center gap-3 text-[13px] avoid-break">
            <span className="font-semibold shrink-0 text-slate-800">
              {config.partyLabel || "To whom"}:
            </span>
            <input
              value={partyName}
              maxLength={150}
              onChange={(e) => setPartyName(sanitizeNarration(e.target.value, 150))}
              className="w-full bg-transparent outline-none border-b border-dotted border-slate-300 py-0.5"
            />
          </div>

          {/* Amount in words */}
          <div className="border-b border-slate-800 px-5 py-2.5 flex items-center gap-3 text-[13px] avoid-break">
            <span className="font-semibold shrink-0 text-slate-800">
              Amount in words:
            </span>
            <span className="italic text-slate-700">{amountInWords}</span>
          </div>

          {/* Account Entries (full debit/credit ledger table — core functionality retained) */}
          <div className="border-b border-slate-800 px-5 py-3">
            <div className="flex justify-between items-center mb-2">
              <h3
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: themeDark }}
              >
                Account Entries
              </h3>
              {!isContra && (
                <button
                  type="button"
                  onClick={addLine}
                  className="print:hidden inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md text-white"
                  style={{ background: themeColor }}
                >
                  <i className="fa-solid fa-plus" /> Add Line
                </button>
              )}
            </div>
            {error && (
              <p className="text-rose-600 text-[11px] mb-2 print:hidden">{error}</p>
            )}

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="text-white text-[11px]" style={{ background: themeDark }}>
                    <th className="p-2 text-left">Account Head</th>
                    <th className="p-2 text-left">Narration (Being)</th>
                    <th className="p-2 text-right">Debit</th>
                    <th className="p-2 text-right">Credit</th>
                    <th className="p-2 w-[8%] print:hidden"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, idx) => (
                    <VoucherLineRow
                      key={line.id}
                      line={line}
                      onChange={updateLine}
                      onRemove={removeLine}
                      canRemove={!isContra && lines.length > 2 && idx !== 0}
                      restrictToCodes={config.restrictToAccountCodes}
                      restrictToTypes={config.restrictToTypes}
                      lockedAccountCode={idx === 0 ? config.fixedAccountCode : null}
                      lockedSide={idx === 0 ? config.fixedSide : null}
                      placeholder={idx === 0 ? beingPlaceholder : "Being the amount..."}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-semibold">
                    <td className="p-2 text-right" colSpan={2}>
                      Total
                    </td>
                    <td className="p-2 text-right">{formatCurrency(validation.totalDebit)}</td>
                    <td className="p-2 text-right">{formatCurrency(validation.totalCredit)}</td>
                    <td className="print:hidden" />
                  </tr>
                </tfoot>
              </table>
            </div>
            {!validation.valid && lines.some((l) => l.accountCode) && (
              <p className="text-rose-600 text-[11px] mt-1 print:hidden">
                {validation.message}
              </p>
            )}
            <p className="text-[10.5px] text-slate-500 mt-2 italic">{config.natureNote}</p>
          </div>

          {/* Being / Payee split row — mirrors template's two-column layout */}
          <div className="grid grid-cols-2 border-b border-slate-800 text-[13px] avoid-break">
            <div className="p-3 border-r border-slate-800">
              <p className="font-semibold mb-1 text-slate-800">Being:</p>
              <textarea
                rows={4}
                maxLength={400}
                value={narration}
                placeholder={beingPlaceholder}
                onChange={(e) => setNarration(sanitizeNarration(e.target.value, 400))}
                className="w-full bg-transparent outline-none resize-none text-slate-700 text-[12.5px] leading-relaxed"
              />
            </div>
            <div className="p-3">
              <p className="font-semibold mb-1 text-slate-800">Payee:</p>
              <p className="text-slate-700 text-[12.5px]">{partyName || "—"}</p>
            </div>
          </div>

          {/* Approved By / Paid By / Signature footer — mirrors template's 3-column grid */}
          <div className="grid grid-cols-3 text-[12px] avoid-break">
            {signatureRoles.slice(0, 3).map((role, idx) => (
              <div
                key={role}
                className={`p-3 space-y-2 ${idx < 2 ? "border-r border-slate-800" : ""}`}
              >
                <p className="font-semibold text-slate-800">{role}:</p>
                {idx === 0 && (
                  <input
                    value={signatures[role]?.name || ""}
                    onChange={(e) => updateSignatureField(role, "name", e.target.value)}
                    maxLength={80}
                    placeholder="Name"
                    className="w-full text-[11.5px] border-b border-slate-200 outline-none py-0.5 bg-transparent"
                  />
                )}
                <div className="h-8 border-b border-slate-400" />
                <input
                  type="date"
                  value={signatures[role]?.date || ""}
                  onChange={(e) => updateSignatureField(role, "date", e.target.value)}
                  className="text-[11px] outline-none bg-transparent"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer strip — sits outside the bordered template box */}
        <footer className="text-center text-[10px] text-slate-500 mt-3 pt-2 avoid-break">
          <p>
            This voucher is an official internal financial record of {COMPANY_INFO.name}.
          </p>
          <p>
            Voucher No: {voucherNo} · Generated: {generatedAt} · Copyright ©{" "}
            {new Date().getFullYear()} {COMPANY_INFO.name}
          </p>
        </footer>
      </div>
    </div>
  );
}