import techofLogo from "../../assets/Techof Logo 2.jpeg";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  numberToWordsBDT,
  sanitizeText,
  clampNumber,
  generateVoucherNo,
  generateRowId,
  formatCurrency,
} from "./voucherHelpers";

const COMPANY = {
  name: "TechOf Solution.",
  tagline: "Smart Mind Smart Solution",
  address: "House #383/1, Btv, Banasree Main Road #1219, Dhaka, Bangladesh",
  phone: "+880 1764-308876",
  email: "info@techofsolution.com",
  website: "www.techofsolution.com",
  tradeLicense: "TRAD/DHK/000000/2024",
  binVat: "000000000-0000",
  logo: techofLogo,
};

const EXPENSE_CATEGORIES = [
  "Office Rent", "Electricity Bill", "Internet Bill", "Software Subscription",
  "Domain & Hosting", "Cloud Service", "Office Equipment", "Furniture",
  "Marketing", "Transportation", "Fuel", "Printing", "Stationery", "Salary",
  "Entertainment", "Repair & Maintenance", "Training", "Miscellaneous",
];

const PAYMENT_METHODS = ["Cash", "Bank", "Bkash", "Nagad", "Rocket", "Cheque", "Online Transfer"];

const DOC_CHECKS = [
  { key: "invoice", label: "Invoice Attached" },
  { key: "receipt", label: "Money Receipt Attached" },
  { key: "quotation", label: "Quotation Attached" },
  { key: "bill", label: "Bill Attached" },
  { key: "approval", label: "Approval Letter Attached" },
  { key: "other", label: "Other Documents Attached" },
];

const emptyRow = () => ({
  id: generateRowId(),
  description: "",
  category: EXPENSE_CATEGORIES[0],
  quantity: 1,
  unit: "pcs",
  amount: 0,
});

const todayISO = () => new Date().toISOString().slice(0, 10);

const initialHeader = () => ({
  voucherNo: generateVoucherNo(),
  voucherDate: todayISO(),
  expenseDate: todayISO(),
  financialYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  expenseCategory: EXPENSE_CATEGORIES[0],
  paymentMethod: PAYMENT_METHODS[0],
});

export default function Voucher() {
  const [header, setHeader] = useState(initialHeader);
  const [rows, setRows] = useState([emptyRow()]);
  const [vatPercent, setVatPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [adjustment, setAdjustment] = useState(0);
  const [notes, setNotes] = useState("");
  const [docs, setDocs] = useState(
    DOC_CHECKS.reduce((acc, d) => ({ ...acc, [d.key]: false }), {})
  );
  const [signatures, setSignatures] = useState({
    verifiedByName: "Accounts Officer", verifiedByDate: "",
    approvedByName: "Managing Director", approvedByDate: "",
  });
  const [errors, setErrors] = useState({});

  const qrRef = useRef(null);
  const barcodeRef = useRef(null);

  const subtotal = useMemo(
    () => rows.reduce((sum, r) => sum + clampNumber(r.amount), 0),
    [rows]
  );
  const vatAmount = useMemo(() => (subtotal * clampNumber(vatPercent, 0, 100)) / 100, [subtotal, vatPercent]);
  const taxAmount = useMemo(() => (subtotal * clampNumber(taxPercent, 0, 100)) / 100, [subtotal, taxPercent]);
  const grandTotal = useMemo(() => {
    const total = subtotal + vatAmount + taxAmount - clampNumber(discount) + Number(adjustment || 0);
    return total > 0 ? total : 0;
  }, [subtotal, vatAmount, taxAmount, discount, adjustment]);

  const amountInWords = useMemo(() => numberToWordsBDT(grandTotal), [grandTotal]);

  const updateRow = useCallback((id, field, value) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === "description") return { ...r, description: sanitizeText(value, 200) };
        if (field === "category") return { ...r, category: sanitizeText(value, 100) };
        if (field === "unit") return { ...r, unit: sanitizeText(value, 30) };
        if (field === "quantity") return { ...r, quantity: clampNumber(value, 0, 100000) };
        if (field === "amount") return { ...r, amount: clampNumber(value, 0, 99999999) };
        return r;
      })
    );
  }, []);

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (id) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  const updateHeader = (field, value, maxLen = 100) =>
    setHeader((prev) => ({ ...prev, [field]: sanitizeText(value, maxLen) }));

  const updateSignature = (field, value, maxLen = 100) =>
    setSignatures((prev) => ({ ...prev, [field]: sanitizeText(value, maxLen) }));

  const toggleDoc = (key) => setDocs((prev) => ({ ...prev, [key]: !prev[key] }));

  const validate = () => {
    const errs = {};
    if (!header.voucherDate) errs.voucherDate = "Required";
    if (!header.expenseDate) errs.expenseDate = "Required";
    if (rows.every((r) => !r.description.trim())) errs.rows = "Add at least one expense line";
    if (rows.some((r) => clampNumber(r.amount) <= 0 && r.description.trim()))
      errs.amounts = "Every filled row needs an amount greater than 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePrint = () => {
    if (!validate()) return;
    window.print();
  };

  useEffect(() => {
    if (qrRef.current && window.QRCode) {
      qrRef.current.innerHTML = "";
      try {
        // eslint-disable-next-line no-new
        new window.QRCode(qrRef.current, {
          text: `${header.voucherNo}|${header.voucherDate}|BDT ${grandTotal.toFixed(2)}`,
          width: 76,
          height: 76,
          correctLevel: window.QRCode.CorrectLevel.M,
        });
      } catch { /* non-critical */ }
    }
  }, [header.voucherNo, header.voucherDate, grandTotal]);

  useEffect(() => {
    if (barcodeRef.current && window.JsBarcode) {
      try {
        window.JsBarcode(barcodeRef.current, header.voucherNo, {
          format: "CODE128",
          width: 1.3,
          height: 36,
          fontSize: 10,
          margin: 4,
          displayValue: true,
        });
      } catch { /* non-critical */ }
    }
  }, [header.voucherNo]);

  const generatedAt = useMemo(() => new Date().toLocaleString("en-GB"), []);

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center gap-4 print:block print:bg-white print:p-0 print:min-h-0">
      {/*
        Print rules:
        - No absolute positioning / inset:0 (that pins bottom to the first page and
          combined with overflow-hidden clips every page after the first one).
        - The print area stays in normal document flow (position: static, overflow: visible)
          so the browser can paginate it across as many A4 pages as needed.
        - break-inside: avoid on each section/header/footer stops a section splitting
          mid-way; if it doesn't fit the remaining space it drops whole to the next page.
      */}
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          html, body { height: auto !important; }
          body * { visibility: hidden !important; }
          #voucher-print-area, #voucher-print-area * { visibility: visible !important; }
          #voucher-print-area {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            font-size: 11px !important;
          }
          #voucher-print-area section,
          #voucher-print-area header,
          #voucher-print-area footer {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          #voucher-print-area h1 { font-size: 15px !important; }
          #voucher-print-area h2 { font-size: 17px !important; }
          #voucher-print-area h3 { font-size: 10px !important; }
          #voucher-print-area table { font-size: 10.5px !important; }
          #voucher-print-area input,
          #voucher-print-area select,
          #voucher-print-area textarea { font-size: 10.5px !important; }
        }
      `}</style>

      {/* Minimal toolbar */}
      <div className="w-full max-w-[820px] flex items-center gap-2 print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-[#1d4ed8] text-[#1d4ed8] bg-white hover:bg-blue-50 transition"
        >
          <i className="fa-solid fa-arrow-left" /> Home
        </Link>
        <button
          type="button"
          onClick={handlePrint}
          className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#1d4ed8] to-[#0a2540] hover:opacity-90 transition shadow-sm"
        >
          <i className="fa-solid fa-print" /> Print Voucher
        </button>
      </div>

      {/* Voucher sheet — this is exactly what gets printed */}
      <div
        id="voucher-print-area"
        className="relative w-full max-w-[820px] bg-white rounded-2xl shadow-lg print:shadow-none print:rounded-none p-8 print:p-0"
      >
        {/* Watermark */}
        <img
          src={COMPANY.logo}
          alt=""
          aria-hidden="true"
          onError={(e) => (e.currentTarget.style.display = "none")}
          className="pointer-events-none select-none absolute inset-0 m-auto w-64 opacity-[0.06] z-0 print:hidden"
        />

        {/* Header */}
        <header className="relative z-10 grid grid-cols-3 gap-3 items-start pb-3 border-b-2 border-[#0a2540] print:pb-2">
          <div className="flex items-center gap-3">
            <img
              src={COMPANY.logo}
              alt={`${COMPANY.name} logo`}
              onError={(e) => (e.currentTarget.style.display = "none")}
              className="w-14 h-14 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-[#0a2540]">{COMPANY.name}</h1>
              <p className="text-[11px] italic text-[#1d4ed8]">{COMPANY.tagline}</p>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-extrabold tracking-wide text-[#0a2540]">EXPENSE VOUCHER</h2>
            <p className="text-[11px] text-slate-500">Internal Company Expense Record</p>
          </div>

          <div className="text-right text-[10.5px] text-slate-600 leading-relaxed">
            <p><i className="fa-solid fa-location-dot w-3 text-[#1d4ed8] mr-1" />{COMPANY.address}</p>
            <p><i className="fa-solid fa-phone w-3 text-[#1d4ed8] mr-1" />{COMPANY.phone}</p>
            <p><i className="fa-solid fa-envelope w-3 text-[#1d4ed8] mr-1" />{COMPANY.email}</p>
            <p><i className="fa-solid fa-globe w-3 text-[#1d4ed8] mr-1" />{COMPANY.website}</p>
            <p>Trade License: {COMPANY.tradeLicense}</p>
          </div>
        </header>

        {/* Voucher Info */}
        <section className="relative z-10 grid grid-cols-3 gap-x-4 gap-y-2 mt-4 print:mt-2 rounded-xl bg-slate-50 border border-slate-200 p-4 print:p-2.5 text-[12px]">
          <Field label="Voucher No.">
            <input value={header.voucherNo} readOnly className="w-full bg-transparent font-semibold text-[#0a2540] outline-none" />
          </Field>
          <Field label="Voucher Date" error={errors.voucherDate}>
            <input type="date" value={header.voucherDate} onChange={(e) => updateHeader("voucherDate", e.target.value, 20)}
              className="w-full bg-transparent outline-none" />
          </Field>
          <Field label="Expense Date" error={errors.expenseDate}>
            <input type="date" value={header.expenseDate} onChange={(e) => updateHeader("expenseDate", e.target.value, 20)}
              className="w-full bg-transparent outline-none" />
          </Field>
          <Field label="Financial Year">
            <input value={header.financialYear} onChange={(e) => updateHeader("financialYear", e.target.value, 20)}
              className="w-full bg-transparent outline-none" />
          </Field>
          <Field label="Expense Category">
            <select value={header.expenseCategory} onChange={(e) => updateHeader("expenseCategory", e.target.value)}
              className="w-full bg-transparent outline-none">
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Payment Method">
            <select value={header.paymentMethod} onChange={(e) => updateHeader("paymentMethod", e.target.value)}
              className="w-full bg-transparent outline-none">
              {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
        </section>

        {/* Expense Table */}
        <section className="relative z-10 mt-5 print:mt-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#0a2540]">Expense Details</h3>
            <button type="button" onClick={addRow}
              className="print:hidden inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#1d4ed8] text-white hover:bg-blue-700">
              <i className="fa-solid fa-plus" /> Add Row
            </button>
          </div>
          {errors.rows && <p className="text-rose-600 text-[11px] mb-2">{errors.rows}</p>}
          {errors.amounts && <p className="text-rose-600 text-[11px] mb-2">{errors.amounts}</p>}

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="bg-[#0a2540] text-white text-[11px]">
                  <th className="p-2 print:p-1 text-left w-[4%]">SL</th>
                  <th className="p-2 print:p-1 text-left w-[34%]">Expense Description</th>
                  <th className="p-2 print:p-1 text-left w-[20%]">Category</th>
                  <th className="p-2 print:p-1 text-right w-[10%]">Quantity</th>
                  <th className="p-2 print:p-1 text-left w-[12%]">Unit</th>
                  <th className="p-2 print:p-1 text-right w-[14%]">Amount (BDT)</th>
                  <th className="p-2 w-[6%] print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/40"}>
                    <td className="p-2 border-b border-slate-200">{idx + 1}</td>
                    <td className="p-2 border-b border-slate-200">
                      <input value={row.description} maxLength={200}
                        placeholder="e.g. Office internet bill – July"
                        onChange={(e) => updateRow(row.id, "description", e.target.value)}
                        className="w-full bg-transparent outline-none focus:bg-white rounded px-1" />
                    </td>
                    <td className="p-2 border-b border-slate-200">
                      <select value={row.category} onChange={(e) => updateRow(row.id, "category", e.target.value)}
                        className="w-full bg-transparent outline-none">
                        {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="p-2 border-b border-slate-200 text-right">
                      <input type="number" min="0" step="1" value={row.quantity}
                        onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
                        className="w-full bg-transparent outline-none text-right px-1" />
                    </td>
                    <td className="p-2 border-b border-slate-200">
                      <input value={row.unit} maxLength={30}
                        onChange={(e) => updateRow(row.id, "unit", e.target.value)}
                        className="w-full bg-transparent outline-none px-1" />
                    </td>
                    <td className="p-2 border-b border-slate-200 text-right font-semibold text-[#0a2540]">
                      <input type="number" min="0" step="0.01" value={row.amount}
                        onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                        className="w-full bg-transparent outline-none text-right px-1" />
                    </td>
                    <td className="p-2 border-b border-slate-200 text-center print:hidden">
                      <button type="button" onClick={() => removeRow(row.id)} disabled={rows.length === 1}
                        className="text-rose-600 disabled:opacity-30" aria-label="Remove row">
                        <i className="fa-solid fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Purpose & Remarks (merged) + Summary */}
        <section className="relative z-10 grid grid-cols-2 gap-4 mt-5 print:mt-3">
          <div className="rounded-xl border border-slate-200 p-4 print:p-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#0a2540] mb-2">Purpose &amp; Remarks</h3>
            <textarea
              rows={4}
              maxLength={700}
              value={notes}
              placeholder="e.g. Purchase of office networking equipment for development department. Any additional remarks can be added here."
              onChange={(e) => setNotes(sanitizeText(e.target.value, 700))}
              className="w-full text-[12px] text-slate-700 outline-none resize-none bg-slate-50 rounded-lg p-2 leading-relaxed"
            />
          </div>

          <div className="rounded-xl border border-slate-200 p-4 print:p-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#0a2540] mb-2">Expense Summary</h3>
            <SummaryLine label="Subtotal" value={`৳ ${formatCurrency(subtotal)}`} />
            <SummaryEditLine label="VAT (%)" value={vatPercent} onChange={(v) => setVatPercent(clampNumber(v, 0, 100))} />
            <SummaryLine label="VAT Amount" value={`৳ ${formatCurrency(vatAmount)}`} />
            <SummaryEditLine label="Tax (%)" value={taxPercent} onChange={(v) => setTaxPercent(clampNumber(v, 0, 100))} />
            <SummaryLine label="Tax Amount" value={`৳ ${formatCurrency(taxAmount)}`} />
            <SummaryEditLine label="Discount" value={discount} onChange={(v) => setDiscount(clampNumber(v))} />
            <SummaryEditLine label="Adjustment (+/-)" value={adjustment}
              onChange={(v) => setAdjustment(clampNumber(v, -999999999, 999999999))} />
            <div className="flex justify-between items-center py-2 mt-2 rounded-lg bg-gradient-to-r from-[#1d4ed8] to-[#0a2540] text-white px-3">
              <span className="text-sm font-bold">Grand Total</span>
              <span className="text-base font-extrabold">৳ {formatCurrency(grandTotal)}</span>
            </div>
            <p className="text-[11.5px] font-semibold text-[#0a2540] mt-3">{amountInWords}</p>
          </div>
        </section>

        {/* Supporting Documents */}
        <section className="relative z-10 mt-5 print:mt-3 rounded-xl border border-slate-200 p-4 print:p-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#0a2540] mb-2">Supporting Documents</h3>
          <div className="grid grid-cols-3 gap-2 text-[12px]">
            {DOC_CHECKS.map((d) => (
              <label key={d.key} className="flex items-center gap-2 text-slate-700">
                <input type="checkbox" checked={docs[d.key]} onChange={() => toggleDoc(d.key)}
                  className="accent-[#1d4ed8] w-3.5 h-3.5" />
                {d.label}
              </label>
            ))}
          </div>
        </section>

        {/* Approval — Verified & Approved only */}
        <section className="relative z-10 grid grid-cols-2 gap-6 mt-5 print:mt-3">
          <div className="border-t border-slate-300 pt-2 space-y-1.5">
            <p className="text-[11px] font-bold uppercase text-[#0a2540]">Verified By</p>
            <input value={signatures.verifiedByName}
              onChange={(e) => updateSignature("verifiedByName", e.target.value, 80)}
              className="w-full text-[11.5px] border-b border-slate-200 outline-none py-0.5 bg-transparent" />
            <div className="h-7 border-b border-slate-400 text-[10px] text-slate-400">Signature</div>
            <input type="date" value={signatures.verifiedByDate}
              onChange={(e) => updateSignature("verifiedByDate", e.target.value, 20)}
              className="text-[11px] outline-none bg-transparent" />
          </div>

          <div className="border-t border-slate-300 pt-2 space-y-1.5 text-right">
            <p className="text-[11px] font-bold uppercase text-[#0a2540]">Approved By</p>
            <input value={signatures.approvedByName}
              onChange={(e) => updateSignature("approvedByName", e.target.value, 80)}
              className="w-full text-[11.5px] border-b border-slate-200 outline-none py-0.5 bg-transparent text-right" />
            <div className="h-7 border-b border-slate-400 text-[10px] text-slate-400 text-right">Signature &amp; Company Seal</div>
            <input type="date" value={signatures.approvedByDate}
              onChange={(e) => updateSignature("approvedByDate", e.target.value, 20)}
              className="text-[11px] outline-none bg-transparent text-right w-full" />
          </div>
        </section>

        {/* Security strip */}
        <section className="relative z-10 flex items-center gap-6 mt-5 print:mt-3 pt-3 border-t border-dashed border-slate-300">
          <div ref={qrRef} className="w-[76px] h-[76px]" />
          <svg ref={barcodeRef} className="max-w-[190px]" />
          <div className="ml-auto text-[10px] text-slate-500 text-right">
            <p>Voucher No: {header.voucherNo}</p>
            <p>Generated: {generatedAt}</p>
          </div>
        </section>

        {/* Footer — always the last block in the flow, so it naturally lands at the end of the last page */}
        <footer className="relative z-10 text-center text-[10px] text-slate-500 mt-5 print:mt-3 pt-3 border-t-4 border-[#1d4ed8] leading-relaxed">
          <p>This voucher is an official internal financial record of {COMPANY.name}.</p>
          <p>All expenses are subject to company accounting policy and audit verification.</p>
          <p>Generated by TechOf Solution ERP · Copyright © {new Date().getFullYear()} {COMPANY.name}</p>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-slate-500 text-[10.5px]">{label}</span>
      {children}
      {error && <small className="text-rose-600">{error}</small>}
    </label>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1 text-[12.5px] border-b border-dashed border-slate-200">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}

function SummaryEditLine({ label, value, onChange }) {
  return (
    <div className="flex justify-between items-center py-1 text-[12.5px] border-b border-dashed border-slate-200">
      <span className="text-slate-600">{label}</span>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 text-right border border-slate-200 rounded-md px-2 py-0.5 outline-none focus:border-[#1d4ed8]"
      />
    </div>
  );
}