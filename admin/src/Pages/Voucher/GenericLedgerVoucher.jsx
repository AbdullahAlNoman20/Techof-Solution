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

export default function GenericLedgerVoucher({ voucherType }) {
  const config = VOUCHER_TYPE_CONFIG[voucherType];
  const isContra = voucherType === VOUCHER_TYPES.CONTRA;
  const [accounts, setAccounts] = useState([]);
  const [voucherNo] = useState(() => generateVoucherNumber(voucherType));
  const [voucherDate, setVoucherDate] = useState(todayISO());
  const [partyName, setPartyName] = useState("");
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
    "Prepared By",
    "Checked By",
    "Approved By",
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
    if (!partyName.trim()) {
      setError(`${config.partyLabel} is required.`);
      return;
    }
    setError("");
    window.print();
  }

  const themeColor = voucherType.includes("receipt") ? "#0f9d58" : "#1d4ed8";
  const themeDark = "#0a2540";

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center gap-4 print:block print:bg-white print:p-0 print:min-h-0">
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { height: auto !important; }
          body * { visibility: hidden !important; }
          #ledger-voucher-print, #ledger-voucher-print * { visibility: visible !important; }
          #ledger-voucher-print {
            position: static !important; width: 100% !important; max-width: none !important;
            box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; padding: 0 !important;
          }
          #ledger-voucher-print section { break-inside: avoid !important; page-break-inside: avoid !important; }
        }
      `}</style>

      <div className="w-full max-w-[820px] flex items-center gap-2 print:hidden">
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

      <div
        id="ledger-voucher-print"
        className="relative w-full max-w-[820px] bg-white rounded-2xl shadow-lg print:shadow-none print:rounded-none p-8 print:p-0"
      >
        <img
          src={techofLogo}
          alt=""
          aria-hidden="true"
          onError={(e) => (e.currentTarget.style.display = "none")}
          className="pointer-events-none select-none absolute inset-0 m-auto w-64 opacity-[0.06] z-0 print:hidden"
        />
        <header
          className="relative z-10 grid grid-cols-3 gap-3 items-start pb-3 border-b-2"
          style={{ borderColor: themeDark }}
        >
          {/* Left */}
          <div className="flex items-center gap-3">
            <img
              src={techofLogo}
              alt={`${COMPANY_INFO.name} logo`}
              onError={(e) => (e.currentTarget.style.display = "none")}
              className="w-12 h-12 object-contain"
            />

            <div>
              <h1 className="text-lg font-bold" style={{ color: themeDark }}>
                {COMPANY_INFO.name}
              </h1>

              <p className="text-[11px] italic" style={{ color: themeColor }}>
                {COMPANY_INFO.tagline}
              </p>
            </div>
          </div>

          {/* Center */}
          <div className="text-center">
            <h2
              className="text-lg font-extrabold tracking-wide"
              style={{ color: themeDark }}
            >
              {config.label.toUpperCase()}
            </h2>

            <p className="text-[11px] text-slate-500">
              Internal Accounting Voucher
            </p>
          </div>

          {/* Right */}
          <div className="text-right text-[10.5px] text-slate-600 leading-relaxed">
            <p>{COMPANY_INFO.address}</p>
            <p>
              {COMPANY_INFO.phone} · {COMPANY_INFO.email}
            </p>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-x-4 gap-y-2 mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 text-[12px]">
          <Field label="Voucher No.">
            <span className="font-semibold" style={{ color: themeDark }}>
              {voucherNo}
            </span>
          </Field>
          <Field label="Voucher Date">
            <input
              type="date"
              value={voucherDate}
              onChange={(e) => setVoucherDate(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </Field>
          <Field label={config.partyLabel}>
            <input
              value={partyName}
              maxLength={150}
              onChange={(e) =>
                setPartyName(sanitizeNarration(e.target.value, 150))
              }
              className="w-full bg-transparent outline-none border-b border-slate-200 py-0.5"
            />
          </Field>
        </section>

        <p className="text-[10.5px] text-slate-500 mt-3 italic">
          {config.natureNote}
        </p>

        <section className="mt-4">
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
            <p className="text-rose-600 text-[11px] mb-2 print:hidden">
              {error}
            </p>
          )}

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr
                  className="text-white text-[11px]"
                  style={{ background: themeDark }}
                >
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
                    lockedAccountCode={
                      idx === 0 ? config.fixedAccountCode : null
                    }
                    lockedSide={idx === 0 ? config.fixedSide : null}
                    placeholder={
                      idx === 0 ? beingPlaceholder : "Being the amount..."
                    }
                  />
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-semibold">
                  <td className="p-2 text-right" colSpan={2}>
                    Total
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(validation.totalDebit)}
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(validation.totalCredit)}
                  </td>
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
        </section>

        <section className="mt-4 rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] text-slate-500">Amount in Words</p>
          <p
            className="text-[12.5px] font-semibold"
            style={{ color: themeDark }}
          >
            {amountInWords}
          </p>
        </section>

        <section
          className="relative z-10 grid gap-4 mt-6"
          style={{
            gridTemplateColumns: `repeat(${signatureRoles.length}, minmax(0, 1fr))`,
          }}
        >
          {signatureRoles.map((role, idx) => (
            <SignatureBlock
              key={role}
              label={role}
              name={signatures[role]?.name}
              onName={
                idx === 0 ? (v) => updateSignatureField(role, "name", v) : null
              }
              dateValue={signatures[role]?.date}
              onDate={(v) => updateSignatureField(role, "date", v)}
              nameless={idx !== 0}
            />
          ))}
        </section>

        <footer
          className="relative z-10 text-center text-[10px] text-slate-500 mt-6 pt-3 border-t-4"
          style={{ borderColor: themeColor }}
        >
          <p>
            This voucher is an official internal financial record of{" "}
            {COMPANY_INFO.name}.
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

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-slate-500 text-[10.5px]">{label}</span>
      {children}
    </label>
  );
}

function SignatureBlock({ label, name, onName, dateValue, onDate, nameless }) {
  return (
    <div className="pt-2 space-y-1.5">
      <p className="text-[11px] font-bold uppercase text-slate-700">{label}</p>
      {!nameless && (
        <input
          value={name}
          onChange={(e) => onName(e.target.value)}
          maxLength={80}
          placeholder="Name"
          className="w-full text-[11.5px] border-b border-slate-200 outline-none py-0.5 bg-transparent"
        />
      )}
      <div className="h-7 border-b border-slate-400 text-[10px] text-slate-400">
        Signature
      </div>
      {onDate && (
        <input
          type="date"
          value={dateValue}
          onChange={(e) => onDate(e.target.value)}
          className="text-[11px] outline-none bg-transparent"
        />
      )}
    </div>
  );
}
