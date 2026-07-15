import techofLogo from "../../assets/Techof Logo 2.jpeg";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  numberToWords,
  sanitizeText,
  clampNumber,
  generateInvoiceNo,
  generateRowId,
  formatCurrency,
} from "./invoiceHelpers";

const COMPANY = {
  name: "TechOf Solution.",
  tagline: "Smart Mind Smart Solution",
  address: "House #383/1, Btv, Banasree Main Road #1219, Dhaka, Bangladesh",
  phone: "+880 1764-308876",
  email: "info@techofsolution.com",
  website: "www.techofsolution.com",
  binVat: "000000000-0000",
  logo: techofLogo,
};

const PAYMENT_METHODS = ["Cash", "Bank", "Bkash", "Nagad", "Rocket", "Cheque", "Online Transfer"];
const CURRENCIES = ["BDT", "USD", "EUR", "GBP"];
const STATUS_STYLES = {
  Paid: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  Partial: "bg-amber-100 text-amber-700 border border-amber-300",
  Unpaid: "bg-rose-100 text-rose-700 border border-rose-300",
};

const emptyRow = () => ({
  id: generateRowId(),
  description: "",
  qty: 1,
  unitPrice: 0,
  discount: 0,
  vat: 0,
});

const todayISO = () => new Date().toISOString().slice(0, 10);
const addDaysISO = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const initialClient = () => ({
  name: "", company: "", contact: "", email: "", address: "",
});

const initialInvoiceInfo = () => ({
  invoiceNo: generateInvoiceNo(),
  invoiceDate: todayISO(),
  dueDate: addDaysISO(7),
  status: "Unpaid",
  paymentMethod: PAYMENT_METHODS[0],
  currency: "BDT",
});

const initialBank = () => ({
  bankName: "", accountName: "", accountNumber: "",
  branch: "", bkash: "", nagad: "", rocket: "",
});

export default function Invoice() {
  const [client, setClient] = useState(initialClient);
  const [info, setInfo] = useState(initialInvoiceInfo);
  const [rows, setRows] = useState([emptyRow()]);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [previousDue, setPreviousDue] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState(
    "Thank you for choosing TechOf Solution Ltd.\nPayment should be completed before the due date.\nThis invoice is system generated."
  );
  const [bank, setBank] = useState(initialBank);
  const [signatures, setSignatures] = useState({ authorizedByDate: "" });
  const [errors, setErrors] = useState({});

  const qrRef = useRef(null);
  const barcodeRef = useRef(null);

  const subtotal = useMemo(
    () => rows.reduce((sum, r) => sum + clampNumber(r.qty) * clampNumber(r.unitPrice), 0),
    [rows]
  );
  const totalDiscount = useMemo(
    () => rows.reduce((sum, r) => sum + clampNumber(r.discount), 0),
    [rows]
  );
  const totalVat = useMemo(
    () =>
      rows.reduce((sum, r) => {
        const base = clampNumber(r.qty) * clampNumber(r.unitPrice) - clampNumber(r.discount);
        return sum + (base * clampNumber(r.vat, 0, 100)) / 100;
      }, 0),
    [rows]
  );
  const grandTotal = useMemo(() => {
    const total = subtotal - totalDiscount + totalVat + clampNumber(additionalCharges) + clampNumber(previousDue);
    return total > 0 ? total : 0;
  }, [subtotal, totalDiscount, totalVat, additionalCharges, previousDue]);
  const amountDue = useMemo(() => {
    const due = grandTotal - clampNumber(paidAmount);
    return due > 0 ? due : 0;
  }, [grandTotal, paidAmount]);

  const amountInWords = useMemo(
    () => numberToWords(grandTotal, info.currency === "BDT" ? "Taka" : info.currency),
    [grandTotal, info.currency]
  );

  const rowTotal = (r) => {
    const base = clampNumber(r.qty) * clampNumber(r.unitPrice) - clampNumber(r.discount);
    const vatAmt = (base * clampNumber(r.vat, 0, 100)) / 100;
    return base + vatAmt;
  };

  const updateRow = useCallback((id, field, value) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === "description") return { ...r, description: sanitizeText(value, 250) };
        if (field === "qty") return { ...r, qty: clampNumber(value, 0, 100000) };
        if (field === "unitPrice") return { ...r, unitPrice: clampNumber(value, 0, 99999999) };
        if (field === "discount") return { ...r, discount: clampNumber(value, 0, 99999999) };
        if (field === "vat") return { ...r, vat: clampNumber(value, 0, 100) };
        return r;
      })
    );
  }, []);

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (id) => setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  const updateClient = (field, value, maxLen = 120) =>
    setClient((prev) => ({ ...prev, [field]: sanitizeText(value, maxLen) }));
  const updateInfo = (field, value, maxLen = 100) =>
    setInfo((prev) => ({ ...prev, [field]: sanitizeText(value, maxLen) }));
  const updateBank = (field, value, maxLen = 100) =>
    setBank((prev) => ({ ...prev, [field]: sanitizeText(value, maxLen) }));
  const updateSignature = (field, value, maxLen = 20) =>
    setSignatures((prev) => ({ ...prev, [field]: sanitizeText(value, maxLen) }));

  const validate = () => {
    const errs = {};
    if (!client.name.trim()) errs.clientName = "Required";
    if (!info.invoiceDate) errs.invoiceDate = "Required";
    if (!info.dueDate) errs.dueDate = "Required";
    if (rows.every((r) => !r.description.trim())) errs.rows = "Add at least one service line";
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
          text: `${info.invoiceNo}|${info.invoiceDate}|${formatCurrency(grandTotal, info.currency)}`,
          width: 76,
          height: 76,
          correctLevel: window.QRCode.CorrectLevel.M,
        });
      } catch { /* non-critical */ }
    }
  }, [info.invoiceNo, info.invoiceDate, grandTotal, info.currency]);

  useEffect(() => {
    if (barcodeRef.current && window.JsBarcode) {
      try {
        window.JsBarcode(barcodeRef.current, info.invoiceNo, {
          format: "CODE128",
          width: 1.3,
          height: 36,
          fontSize: 10,
          margin: 4,
          displayValue: true,
        });
      } catch { /* non-critical */ }
    }
  }, [info.invoiceNo]);

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
          #invoice-print-area, #invoice-print-area * { visibility: visible !important; }
          #invoice-print-area {
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
          #invoice-print-area section,
          #invoice-print-area header,
          #invoice-print-area footer {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          #invoice-print-area h1 { font-size: 15px !important; }
          #invoice-print-area h3 { font-size: 10px !important; }
          #invoice-print-area table { font-size: 10.5px !important; }
          #invoice-print-area input,
          #invoice-print-area select,
          #invoice-print-area textarea { font-size: 10.5px !important; }
        }
      `}</style>

      {/* Minimal toolbar */}
      <div className="w-full max-w-[820px] flex items-center gap-2 print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-[#0A66C2] text-[#0A66C2] bg-white hover:bg-blue-50 transition"
        >
          <i className="fa-solid fa-arrow-left" /> Home
        </Link>
        <button
          type="button"
          onClick={handlePrint}
          className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#0A66C2] to-[#1B263B] hover:opacity-90 transition shadow-sm"
        >
          <i className="fa-solid fa-print" /> Print Invoice
        </button>
      </div>

      {/* Invoice sheet — this is exactly what gets printed */}
      <div
        id="invoice-print-area"
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
        <header className="relative z-10 grid grid-cols-2 gap-4 pb-3 border-b-2 border-[#1B263B] print:pb-2">
          <div className="flex items-center gap-3">
            <img
              src={COMPANY.logo}
              alt={`${COMPANY.name} logo`}
              onError={(e) => (e.currentTarget.style.display = "none")}
              className="w-14 h-14 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-[#1B263B]">{COMPANY.name}</h1>
              <p className="text-[11px] italic text-[#0A66C2]">{COMPANY.tagline}</p>
              <span className="inline-block mt-1.5 text-[10px] font-bold tracking-widest text-white bg-[#0A66C2] px-2.5 py-0.5 rounded-full">
                INVOICE
              </span>
            </div>
          </div>

          <div className="text-right text-[10.5px] text-slate-600 leading-relaxed">
            <p><i className="fa-solid fa-phone w-3 text-[#0A66C2] mr-1" />{COMPANY.phone}</p>
            <p><i className="fa-solid fa-envelope w-3 text-[#0A66C2] mr-1" />{COMPANY.email}</p>
            <p><i className="fa-solid fa-globe w-3 text-[#0A66C2] mr-1" />{COMPANY.website}</p>
            <p><i className="fa-solid fa-location-dot w-3 text-[#0A66C2] mr-1" />{COMPANY.address}</p>
            <p>BIN/VAT: {COMPANY.binVat}</p>
          </div>
        </header>

        {/* Bill To / Invoice Details */}
        <section className="relative z-10 grid grid-cols-2 gap-4 mt-4 print:mt-2">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 print:p-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1B263B] mb-2">Bill To</h3>
            <div className="space-y-2 text-[12px]">
              <LabeledInput label="Client Name" value={client.name} error={errors.clientName}
                onChange={(v) => updateClient("name", v)} />
              <LabeledInput label="Company Name" value={client.company} onChange={(v) => updateClient("company", v)} />
              <LabeledInput label="Contact Number" value={client.contact} onChange={(v) => updateClient("contact", v, 30)} />
              <LabeledInput label="Email" type="email" value={client.email} onChange={(v) => updateClient("email", v)} />
              <LabeledInput label="Billing Address" value={client.address} onChange={(v) => updateClient("address", v, 200)} />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 print:p-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1B263B] mb-2">Invoice Details</h3>
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Invoice No.</span>
                <span className="font-semibold text-[#1B263B]">{info.invoiceNo}</span>
              </div>
              <LabeledInput label="Invoice Date" type="date" value={info.invoiceDate} error={errors.invoiceDate}
                onChange={(v) => updateInfo("invoiceDate", v, 20)} />
              <LabeledInput label="Due Date" type="date" value={info.dueDate} error={errors.dueDate}
                onChange={(v) => updateInfo("dueDate", v, 20)} />
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Status</span>
                <select
                  value={info.status}
                  onChange={(e) => updateInfo("status", e.target.value, 20)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full outline-none ${STATUS_STYLES[info.status]}`}
                >
                  <option>Paid</option>
                  <option>Partial</option>
                  <option>Unpaid</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Method</span>
                <select value={info.paymentMethod} onChange={(e) => updateInfo("paymentMethod", e.target.value)}
                  className="bg-transparent outline-none text-right">
                  {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Currency</span>
                <select value={info.currency} onChange={(e) => updateInfo("currency", e.target.value, 5)}
                  className="bg-transparent outline-none text-right">
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Service Table */}
        <section className="relative z-10 mt-5 print:mt-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1B263B]">Service Details</h3>
            <button type="button" onClick={addRow}
              className="print:hidden inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#0A66C2] text-white hover:bg-blue-700">
              <i className="fa-solid fa-plus" /> Add Row
            </button>
          </div>
          {errors.rows && <p className="text-rose-600 text-[11px] mb-2">{errors.rows}</p>}

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="bg-[#1B263B] text-white text-[11px]">
                  <th className="p-2 print:p-1 text-left w-[4%]">SL</th>
                  <th className="p-2 print:p-1 text-left w-[30%]">Service / Description</th>
                  <th className="p-2 print:p-1 text-right w-[10%]">Qty</th>
                  <th className="p-2 print:p-1 text-right w-[14%]">Unit Price</th>
                  <th className="p-2 print:p-1 text-right w-[12%]">Discount</th>
                  <th className="p-2 print:p-1 text-right w-[10%]">VAT %</th>
                  <th className="p-2 print:p-1 text-right w-[14%]">Total</th>
                  <th className="p-2 w-[6%] print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/40"}>
                    <td className="p-2 border-b border-slate-200">{idx + 1}</td>
                    <td className="p-2 border-b border-slate-200">
                      <input
                        value={row.description}
                        maxLength={250}
                        placeholder="e.g. Web application development – Phase 1"
                        onChange={(e) => updateRow(row.id, "description", e.target.value)}
                        className="w-full bg-transparent outline-none focus:bg-white rounded px-1"
                      />
                    </td>
                    <td className="p-2 border-b border-slate-200 text-right">
                      <input type="number" min="0" step="1" value={row.qty}
                        onChange={(e) => updateRow(row.id, "qty", e.target.value)}
                        className="w-full bg-transparent outline-none text-right px-1" />
                    </td>
                    <td className="p-2 border-b border-slate-200 text-right">
                      <input type="number" min="0" step="0.01" value={row.unitPrice}
                        onChange={(e) => updateRow(row.id, "unitPrice", e.target.value)}
                        className="w-full bg-transparent outline-none text-right px-1" />
                    </td>
                    <td className="p-2 border-b border-slate-200 text-right">
                      <input type="number" min="0" step="0.01" value={row.discount}
                        onChange={(e) => updateRow(row.id, "discount", e.target.value)}
                        className="w-full bg-transparent outline-none text-right px-1" />
                    </td>
                    <td className="p-2 border-b border-slate-200 text-right">
                      <input type="number" min="0" max="100" step="0.01" value={row.vat}
                        onChange={(e) => updateRow(row.id, "vat", e.target.value)}
                        className="w-full bg-transparent outline-none text-right px-1" />
                    </td>
                    <td className="p-2 border-b border-slate-200 text-right font-semibold text-[#1B263B]">
                      {formatCurrency(rowTotal(row), info.currency)}
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

        {/* Notes + Summary */}
        <section className="relative z-10 grid grid-cols-2 gap-4 mt-5 print:mt-3">
          <div className="rounded-xl border border-slate-200 p-4 print:p-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1B263B] mb-2">Notes</h3>
            <textarea
              rows={4}
              maxLength={600}
              value={notes}
              onChange={(e) => setNotes(sanitizeText(e.target.value, 600))}
              className="w-full text-[12px] text-slate-700 outline-none resize-none bg-slate-50 rounded-lg p-2 leading-relaxed"
            />
          </div>

          <div className="rounded-xl border border-slate-200 p-4 print:p-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1B263B] mb-2">Summary</h3>
            <SummaryLine label="Subtotal" value={formatCurrency(subtotal, info.currency)} />
            <SummaryLine label="Discount" value={`- ${formatCurrency(totalDiscount, info.currency)}`} />
            <SummaryLine label="VAT / Tax" value={formatCurrency(totalVat, info.currency)} />
            <SummaryEditLine label="Additional Charges" value={additionalCharges}
              onChange={(v) => setAdditionalCharges(clampNumber(v))} />
            <SummaryEditLine label="Previous Due" value={previousDue}
              onChange={(v) => setPreviousDue(clampNumber(v))} />
            <div className="flex justify-between items-center py-2 mt-2 rounded-lg bg-gradient-to-r from-[#0A66C2] to-[#1B263B] text-white px-3">
              <span className="text-sm font-bold">Grand Total</span>
              <span className="text-base font-extrabold">{formatCurrency(grandTotal, info.currency)}</span>
            </div>
            <SummaryEditLine label="Paid Amount" value={paidAmount}
              onChange={(v) => setPaidAmount(clampNumber(v))} />
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-1">
              <span className="text-sm font-bold text-rose-600">Amount Due</span>
              <span className="text-sm font-extrabold text-rose-600">{formatCurrency(amountDue, info.currency)}</span>
            </div>
            <p className="text-[11.5px] font-semibold text-[#1B263B] mt-3">{amountInWords}</p>
          </div>
        </section>

        {/* Bank / Payment Info */}
        <section className="relative z-10 mt-5 print:mt-3 rounded-xl bg-slate-50 border border-slate-200 p-4 print:p-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#1B263B] mb-2">Bank / Payment Information</h3>
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-[12px]">
            <LabeledInput label="Bank Name" value={bank.bankName} onChange={(v) => updateBank("bankName", v)} />
            <LabeledInput label="Account Name" value={bank.accountName} onChange={(v) => updateBank("accountName", v)} />
            <LabeledInput label="Account Number" value={bank.accountNumber} onChange={(v) => updateBank("accountNumber", v, 40)} />
            <LabeledInput label="Branch" value={bank.branch} onChange={(v) => updateBank("branch", v)} />
            <LabeledInput label="Bkash" value={bank.bkash} onChange={(v) => updateBank("bkash", v, 20)} />
            <LabeledInput label="Nagad" value={bank.nagad} onChange={(v) => updateBank("nagad", v, 20)} />
          </div>
        </section>

        {/* Authorized By only */}
        <section className="relative z-10 mt-5 print:mt-3">
          <div className="border-t border-slate-300 pt-2 space-y-1.5 text-right max-w-xs ml-auto">
            <p className="text-[11px] font-bold uppercase text-[#1B263B]">Authorized By</p>
            <p className="text-[12px] font-semibold text-slate-700">Managing Director</p>
            <p className="text-[11px] text-slate-500">{COMPANY.name}</p>
            <div className="h-7 border-b border-slate-400 text-[10px] text-slate-400 text-right">Signature &amp; Company Seal</div>
            <input type="date" value={signatures.authorizedByDate}
              onChange={(e) => updateSignature("authorizedByDate", e.target.value, 20)}
              className="text-[11px] outline-none bg-transparent text-right w-full" />
          </div>
        </section>

        {/* Security strip */}
        <section className="relative z-10 flex items-center gap-6 mt-5 print:mt-3 pt-3 border-t border-dashed border-slate-300">
          <div ref={qrRef} className="w-[76px] h-[76px]" />
          <svg ref={barcodeRef} className="max-w-[190px]" />
          <div className="ml-auto text-[10px] text-slate-500 text-right">
            <p>Invoice No: {info.invoiceNo}</p>
            <p>Generated: {generatedAt}</p>
          </div>
        </section>

        {/* Footer — always the last block in the flow, so it naturally lands at the end of the last page */}
        <footer className="relative z-10 text-center text-[10px] text-slate-500 mt-5 print:mt-3 pt-3 border-t-4 border-[#0A66C2] leading-relaxed">
          <p>Copyright © {new Date().getFullYear()} {COMPANY.name} · {COMPANY.website} · {COMPANY.email} · {COMPANY.phone}</p>
          <p className="font-semibold text-[#1B263B] mt-1">Thank you for your business.</p>
        </footer>
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = "text", error }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-slate-500 shrink-0">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`text-right w-[60%] border-b outline-none bg-transparent py-0.5 ${
          error ? "border-rose-400" : "border-slate-200 focus:border-[#0A66C2]"
        }`}
      />
    </div>
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
        className="w-24 text-right border border-slate-200 rounded-md px-2 py-0.5 outline-none focus:border-[#0A66C2]"
      />
    </div>
  );
}