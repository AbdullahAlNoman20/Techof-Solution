import techofLogo from "../../assets/Techof Logo 2.jpeg";
import signatureImg from "../../assets/Noman_Signature.jpg";
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

const PAYMENT_METHODS = [
  "Cash",
  "Bank",
  "Bkash",
  "Nagad",
  "Rocket",
  "Cheque",
  "Online Transfer",
];
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
  name: "",
  company: "",
  contact: "",
  email: "",
  address: "",
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
  bankName: "City Bank",
  accountName: "TECHOF SOLUTION",
  accountNumber: "1325128524001",
  branch: "Banani Sub Branch, Dhaka",
  bkash: "X",
  nagad: "X",
  rocket: "X",
});

export default function Invoice() {
  const [client, setClient] = useState(initialClient);
  const [info, setInfo] = useState(initialInvoiceInfo);
  const [rows, setRows] = useState([emptyRow()]);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [previousDue, setPreviousDue] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [advancePaidDate, setAdvancePaidDate] = useState(todayISO());
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [overallVat, setOverallVat] = useState(0);
  const [notes, setNotes] = useState(
    "Thank you for choosing TechOf Solution.\nPayment should be completed before the due date.\nThis invoice is system generated.",
  );
  const [bank, setBank] = useState(initialBank);
  const [signatures, setSignatures] = useState({ authorizedByDate: "" });
  const [errors, setErrors] = useState({});

  const qrRef = useRef(null);
  const barcodeRef = useRef(null);

  const subtotal = useMemo(
    () =>
      rows.reduce(
        (sum, r) => sum + clampNumber(r.qty) * clampNumber(r.unitPrice),
        0,
      ),
    [rows],
  );
  const rowsDiscount = useMemo(
    () => rows.reduce((sum, r) => sum + clampNumber(r.discount), 0),
    [rows],
  );
  const rowsVat = useMemo(
    () =>
      rows.reduce((sum, r) => {
        const base =
          clampNumber(r.qty) * clampNumber(r.unitPrice) -
          clampNumber(r.discount);
        return sum + (base * clampNumber(r.vat, 0, 100)) / 100;
      }, 0),
    [rows],
  );
  // Overall discount/VAT lets the user add a summary-level adjustment
  // even when individual rows have no discount/VAT of their own.
  const totalDiscount = useMemo(
    () => rowsDiscount + clampNumber(overallDiscount),
    [rowsDiscount, overallDiscount],
  );
  const totalVat = useMemo(
    () => rowsVat + clampNumber(overallVat),
    [rowsVat, overallVat],
  );
  const grandTotal = useMemo(() => {
    const total =
      subtotal -
      totalDiscount +
      totalVat +
      clampNumber(additionalCharges) +
      clampNumber(previousDue);
    return total > 0 ? total : 0;
  }, [subtotal, totalDiscount, totalVat, additionalCharges, previousDue]);

  const hasAdvancePaid = clampNumber(advancePaid) > 0;

  const totalAmountDue = useMemo(() => {
    const due = grandTotal - clampNumber(advancePaid);
    return due > 0 ? due : 0;
  }, [grandTotal, advancePaid]);

  const amountInWords = useMemo(
    () =>
      numberToWords(
        hasAdvancePaid ? totalAmountDue : grandTotal,
        info.currency === "BDT" ? "Taka" : info.currency,
      ),
    [hasAdvancePaid, totalAmountDue, grandTotal, info.currency],
  );

  const rowTotal = (r) => {
    const base =
      clampNumber(r.qty) * clampNumber(r.unitPrice) - clampNumber(r.discount);
    const vatAmt = (base * clampNumber(r.vat, 0, 100)) / 100;
    return base + vatAmt;
  };

  const updateRow = useCallback((id, field, value) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === "description")
          return { ...r, description: sanitizeText(value, 250) };
        if (field === "qty")
          return { ...r, qty: clampNumber(value, 0, 100000) };
        if (field === "unitPrice")
          return { ...r, unitPrice: clampNumber(value, 0, 99999999) };
        if (field === "discount")
          return { ...r, discount: clampNumber(value, 0, 99999999) };
        if (field === "vat") return { ...r, vat: clampNumber(value, 0, 100) };
        return r;
      }),
    );
  }, []);

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (id) =>
    setRows((prev) =>
      prev.length > 1 ? prev.filter((r) => r.id !== id) : prev,
    );

  const updateClient = (field, value, maxLen = 120) =>
    setClient((prev) => ({ ...prev, [field]: sanitizeText(value, maxLen) }));
  const updateInfo = (field, value, maxLen = 100) =>
    setInfo((prev) => ({ ...prev, [field]: sanitizeText(value, maxLen) }));
  const updateBank = (field, value, maxLen = 100) =>
    setBank((prev) => ({ ...prev, [field]: sanitizeText(value, maxLen) }));
  const updateSignature = (field, value, maxLen = 20) =>
    setSignatures((prev) => ({
      ...prev,
      [field]: sanitizeText(value, maxLen),
    }));

  const validate = () => {
    const errs = {};
    if (!client.name.trim()) errs.clientName = "Required";
    if (!info.invoiceDate) errs.invoiceDate = "Required";
    if (!info.dueDate) errs.dueDate = "Required";
    if (rows.every((r) => !r.description.trim()))
      errs.rows = "Add at least one service line";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePrint = () => {
    if (!validate()) return;
    window.print();
  };

  useEffect(() => {
    if (!barcodeRef.current) return;

    try {
      JsBarcode(barcodeRef.current, info.invoiceNo, {
        format: "CODE128",
        width: 1.3,
        height: 36,
        fontSize: 10,
        margin: 4,
        displayValue: true,
      });
    } catch (err) {
      console.error(err);
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
          /* Service Details is the only section allowed to split across pages.
             It re-flows naturally and repeats its header row on every new page. */
          #invoice-print-area section.service-section {
            break-inside: auto !important;
            page-break-inside: auto !important;
          }
          #invoice-print-area section.service-section table {
            break-inside: auto !important;
            page-break-inside: auto !important;
          }
          #invoice-print-area section.service-section thead {
            display: table-header-group;
          }
          #invoice-print-area section.service-section tr {
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
          className="pointer-events-none select-none absolute inset-0 m-auto w-64 opacity-[0.06] z-0 print:block print:opacity-[0.08]"
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
              <h1 className="text-lg font-bold text-[#1B263B]">
                {COMPANY.name}
              </h1>
              <p className="text-[11px] italic text-[#0A66C2]">
                {COMPANY.tagline}
              </p>
              <span className="inline-block mt-1.5 text-[10px] font-bold tracking-widest text-white bg-[#0A66C2] px-2.5 py-0.5 rounded-full print:bg-none print:bg-white print:text-black print:border print:border-black">
                INVOICE
              </span>
            </div>
          </div>

          <div className="text-right text-[10.5px] text-slate-600 leading-relaxed">
            <p>
              <i className="fa-solid fa-phone w-3 text-[#0A66C2] mr-1" />
              {COMPANY.phone}
            </p>
            <p>
              <i className="fa-solid fa-envelope w-3 text-[#0A66C2] mr-1" />
              {COMPANY.email}
            </p>
            <p>
              <i className="fa-solid fa-globe w-3 text-[#0A66C2] mr-1" />
              {COMPANY.website}
            </p>
            <p>
              <i className="fa-solid fa-location-dot w-3 text-[#0A66C2] mr-1" />
              {COMPANY.address}
            </p>
            {/* <p>BIN/VAT: {COMPANY.binVat}</p> */}
          </div>
        </header>

        {/* Bill To / Invoice Details */}
        <section className="relative z-10 grid grid-cols-2 gap-4 mt-4 print:mt-2">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 print:p-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1B263B] mb-2">
              Bill To
            </h3>
            <div className="space-y-2 text-[12px]">
              <LabeledInput
                label="Client Name"
                value={client.name}
                error={errors.clientName}
                onChange={(v) => updateClient("name", v)}
              />
              <LabeledInput
                label="Company Name"
                value={client.company}
                onChange={(v) => updateClient("company", v)}
              />
              <LabeledInput
                label="Contact Number"
                value={client.contact}
                onChange={(v) => updateClient("contact", v, 30)}
              />
              <LabeledInput
                label="Email"
                type="email"
                value={client.email}
                onChange={(v) => updateClient("email", v)}
              />
              <LabeledInput
                label="Billing Address"
                value={client.address}
                onChange={(v) => updateClient("address", v, 200)}
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 print:p-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1B263B] mb-2">
              Invoice Details
            </h3>
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Invoice No.</span>
                <span className="font-semibold text-[#1B263B]">
                  {info.invoiceNo}
                </span>
              </div>
              <LabeledInput
                label="Invoice Date"
                type="date"
                value={info.invoiceDate}
                error={errors.invoiceDate}
                onChange={(v) => updateInfo("invoiceDate", v, 20)}
              />
              <LabeledInput
                label="Due Date"
                type="date"
                value={info.dueDate}
                error={errors.dueDate}
                onChange={(v) => updateInfo("dueDate", v, 20)}
              />
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Status</span>
                <select
                  value={info.status}
                  onChange={(e) => updateInfo("status", e.target.value, 20)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full outline-none print:bg-white print:text-black print:border print:border-black ${STATUS_STYLES[info.status]}`}
                >
                  <option>Paid</option>
                  <option>Partial</option>
                  <option>Unpaid</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Method</span>
                <select
                  value={info.paymentMethod}
                  onChange={(e) => updateInfo("paymentMethod", e.target.value)}
                  className="bg-transparent outline-none text-right"
                >
                  {PAYMENT_METHODS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Currency</span>
                <select
                  value={info.currency}
                  onChange={(e) => updateInfo("currency", e.target.value, 5)}
                  className="bg-transparent outline-none text-right"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Service Table */}
        <section className="relative z-10 mt-5 print:mt-3 service-section">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1B263B]">
              Service Details
            </h3>
            <button
              type="button"
              onClick={addRow}
              className="print:hidden inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#0A66C2] text-white hover:bg-blue-700"
            >
              <i className="fa-solid fa-plus" /> Add Row
            </button>
          </div>
          {errors.rows && (
            <p className="text-rose-600 text-[11px] mb-2">{errors.rows}</p>
          )}

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="bg-[#1B263B] text-white text-[11px] print:bg-white print:text-black print:border-b-2 print:border-black">
                  <th className="p-2 print:p-1 text-left w-[4%]">SL</th>
                  <th className="p-2 print:p-1 text-left w-[30%]">
                    Service / Description
                  </th>
                  <th className="p-2 print:p-1 text-right w-[10%]">Qty</th>
                  <th className="p-2 print:p-1 text-right w-[14%]">
                    Unit Price
                  </th>
                  <th className="p-2 print:p-1 text-right w-[12%]">Discount</th>
                  <th className="p-2 print:p-1 text-right w-[10%]">VAT %</th>
                  <th className="p-2 print:p-1 text-right w-[14%]">Total</th>
                  <th className="p-2 w-[6%] print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/40"}
                  >
                    <td className="p-2 border-b border-slate-200">{idx + 1}</td>
                    <td className="p-2 border-b border-slate-200 align-top">
                      <textarea
                        value={row.description}
                        maxLength={250}
                        rows={1}
                        placeholder="e.g. Web application development – Phase 1"
                        onChange={(e) =>
                          updateRow(row.id, "description", e.target.value)
                        }
                        onInput={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        className="w-full bg-transparent outline-none focus:bg-white rounded px-1 resize-none overflow-hidden leading-snug"
                      />
                    </td>
                    <td className="p-2 border-b border-slate-200 text-right">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={row.qty}
                        onChange={(e) =>
                          updateRow(row.id, "qty", e.target.value)
                        }
                        className="w-full bg-transparent outline-none text-right px-1"
                      />
                    </td>
                    <td className="p-2 border-b border-slate-200 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.unitPrice}
                        onChange={(e) =>
                          updateRow(row.id, "unitPrice", e.target.value)
                        }
                        className="w-full bg-transparent outline-none text-right px-1"
                      />
                    </td>
                    <td className="p-2 border-b border-slate-200 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.discount}
                        onChange={(e) =>
                          updateRow(row.id, "discount", e.target.value)
                        }
                        className="w-full bg-transparent outline-none text-right px-1"
                      />
                    </td>
                    <td className="p-2 border-b border-slate-200 text-right">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={row.vat}
                        onChange={(e) =>
                          updateRow(row.id, "vat", e.target.value)
                        }
                        className="w-full bg-transparent outline-none text-right px-1"
                      />
                    </td>
                    <td className="p-2 border-b border-slate-200 text-right font-semibold text-[#1B263B]">
                      {formatCurrency(rowTotal(row), info.currency)}
                    </td>
                    <td className="p-2 border-b border-slate-200 text-center print:hidden">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length === 1}
                        className="text-rose-600 disabled:opacity-30"
                        aria-label="Remove row"
                      >
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
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1B263B] mb-2">
              Notes
            </h3>

            <div className="w-full min-h-[112px] text-[12px] text-slate-700 rounded-lg leading-relaxed">
              <p className="font-semibold text-[#1B263B]">
                Thank You for Choosing Techof Solution!
              </p>

              <p className="mt-2">
                We sincerely appreciate your trust and the opportunity to serve
                you. This invoice serves as an official record of the products
                and/or services provided.
              </p>

              <p className="mt-2">
                Please retain this invoice for your records. If you have any
                questions regarding this invoice or require further assistance,
                our support team will be happy to help.
              </p>

              <p className="mt-2 font-medium text-[#0A66C2]">
                We look forward to serving you again.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 print:p-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#1B263B] mb-2">
              Summary
            </h3>
            <SummaryLine
              label="Subtotal"
              value={formatCurrency(subtotal, info.currency)}
            />

            <div className="flex justify-between items-center py-1 text-[12.5px] border-b border-dashed border-slate-200 gap-2">
              <span className="text-slate-600 shrink-0">Discount</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">
                  - {formatCurrency(totalDiscount, info.currency)}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={overallDiscount}
                  onChange={(e) =>
                    setOverallDiscount(clampNumber(e.target.value))
                  }
                  title="Overall discount, added on top of any per-item discount"
                  className="print:hidden w-16 text-right border border-slate-200 rounded-md px-1.5 py-0.5 outline-none focus:border-[#0A66C2]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center py-1 text-[12.5px] border-b border-dashed border-slate-200 gap-2">
              <span className="text-slate-600 shrink-0">VAT / Tax</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">
                  {formatCurrency(totalVat, info.currency)}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={overallVat}
                  onChange={(e) => setOverallVat(clampNumber(e.target.value))}
                  title="Overall VAT/Tax, added on top of any per-item VAT"
                  className="print:hidden w-16 text-right border border-slate-200 rounded-md px-1.5 py-0.5 outline-none focus:border-[#0A66C2]"
                />
              </div>
            </div>

            <SummaryEditLine
              label="Additional Charges"
              value={additionalCharges}
              onChange={(v) => setAdditionalCharges(clampNumber(v))}
            />
            <SummaryEditLine
              label="Previous Due"
              value={previousDue}
              onChange={(v) => setPreviousDue(clampNumber(v))}
            />

            <div className="flex justify-between items-center py-1.5 text-[12.5px] border-b border-dashed border-slate-200 gap-2">
              <span className="text-slate-600 shrink-0">
                Advanced Paid
                {hasAdvancePaid && advancePaidDate && (
                  <span className="block text-[10px] text-slate-400 print:inline print:ml-1">
                    (
                    {new Date(advancePaidDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    )
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="date"
                  value={advancePaidDate}
                  onChange={(e) => setAdvancePaidDate(e.target.value)}
                  className="print:hidden text-[11px] border border-slate-200 rounded-md px-1.5 py-0.5 outline-none focus:border-[#0A66C2]"
                />
                <input
                  type="number"
                  step="0.01"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(clampNumber(e.target.value))}
                  className="w-24 text-right border border-slate-200 rounded-md px-2 py-0.5 outline-none focus:border-[#0A66C2]"
                />
              </div>
            </div>

            {hasAdvancePaid ? (
              <div className="flex justify-between items-center py-2 mt-2 rounded-lg bg-gradient-to-r from-[#0A66C2] to-[#1B263B] text-white px-3 print:bg-none print:bg-white print:text-black print:border print:border-black print:rounded-md">
                <span className="text-sm font-bold leading-tight print:font-semibold">
                  Total Amount Due
                  <span className="block font-normal text-[9.5px] opacity-80 print:opacity-100">
                    (VAT / Tax Applicable as per Govt. Rate)
                  </span>
                </span>
                <span className="text-base font-extrabold print:font-semibold">
                  {formatCurrency(totalAmountDue, info.currency)}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center py-2 mt-2 rounded-lg bg-gradient-to-r from-[#0A66C2] to-[#1B263B] text-white px-3 print:bg-none print:bg-white print:text-black print:border print:border-black print:rounded-md">
                <span className="text-sm font-bold print:font-semibold">Grand Total</span>
                <span className="text-base font-extrabold print:font-semibold">
                  {formatCurrency(grandTotal, info.currency)}
                </span>
              </div>
            )}

            <p className="text-[11.5px] font-semibold text-slate-800 mt-3">
              In Word: {amountInWords}
            </p>
          </div>
        </section>

        {/* Bank / Payment Info */}
        <section className="relative z-10 mt-5 print:mt-3 rounded-xl bg-slate-50 border border-slate-200 p-4 print:p-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#1B263B] mb-2">
            Bank / Payment Information
          </h3>
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-[12px]">
            <LabeledInput
              label="Bank Name"
              value={bank.bankName}
              onChange={(v) => updateBank("bankName", v)}
            />
            <LabeledInput
              label="Account Name"
              value={bank.accountName}
              onChange={(v) => updateBank("accountName", v)}
            />
            <LabeledInput
              label="Account Number"
              value={bank.accountNumber}
              onChange={(v) => updateBank("accountNumber", v, 40)}
            />
            <LabeledInput
              label="Branch"
              value={bank.branch}
              onChange={(v) => updateBank("branch", v)}
            />
            <LabeledInput
              label="Bkash"
              value={bank.bkash}
              onChange={(v) => updateBank("bkash", v, 20)}
            />
            <LabeledInput
              label="Nagad"
              value={bank.nagad}
              onChange={(v) => updateBank("nagad", v, 20)}
            />
          </div>
        </section>

        {/* Authorized By only */}
        <section className="relative z-10 mt-5 print:mt-3">
          <div className="pt-2 flex flex-col items-end max-w-xs ml-auto">
            <p className="text-[11px] font-bold uppercase text-[#1B263B]">
              Authorized By
            </p>

            <p className="text-[12px] font-semibold text-slate-700">
              Abdullah Al Noman
            </p>
            <p className="text-[11px] text-slate-500">
              AI/ML Engineer And R&amp;D Lead
            </p>

            <p className="text-[11px] text-slate-500">{COMPANY.name}</p>

            {/* Signature */}
            <img
              src={signatureImg}
              alt="Authorized Signature"
              className="h-8 object-contain mt-2 border-b border-slate-300 print:h-9 print:mt-1.5 print:border-b print:border-slate-300"
            />

            {/* Date */}
            <input
              type="date"
              value={signatures.authorizedByDate}
              onChange={(e) =>
                updateSignature("authorizedByDate", e.target.value, 20)
              }
              className="mt-0 text-[12px] bg-transparent outline-none text-right print:text-right print:w-[120px]"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = "text", error }) {
  const isGrowable = type === "text" || type === "email";

  if (!isGrowable) {
    return (
      <div className="flex justify-between items-center gap-2">
        <span className="text-slate-500 shrink-0">{label}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`text-right w-[60%] border-b outline-none bg-transparent py-0.5 ${
            error
              ? "border-rose-400"
              : "border-slate-200 focus:border-[#0A66C2]"
          }`}
        />
      </div>
    );
  }

  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-slate-500 shrink-0 pt-0.5">{label}</span>
      <textarea
        value={value}
        rows={1}
        onChange={(e) => onChange(e.target.value)}
        onInput={(e) => {
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        className={`text-right w-[60%] border-b outline-none bg-transparent py-0.5 resize-none overflow-hidden leading-snug ${
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
