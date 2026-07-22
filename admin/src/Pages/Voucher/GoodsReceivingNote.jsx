
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { COMPANY_INFO } from "./accountingConstants";
import { generateGrnNumber, generateLineId, sanitizeNarration, clampAmount } from "./accountingHelpers";

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyItem = () => ({
  id: generateLineId(),
  goodsName: "",
  brandSpec: "",
  productSerialNo: "",
  orderQty: 0,
  deliveredQty: 0,
  comments: "",
});

export default function GoodsReceivingNote() {
  const [grnNo] = useState(() => generateGrnNumber());
  const [supplier, setSupplier] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [reqNo, setReqNo] = useState("");
  const [receivingDate, setReceivingDate] = useState(todayISO());
  const [deliverLocation, setDeliverLocation] = useState("");
  const [challanNoDate, setChallanNoDate] = useState("");
  const [items, setItems] = useState([emptyItem()]);
  const [qualityOk, setQualityOk] = useState(null); // true | false | null
  const [receivedBy, setReceivedBy] = useState("");
  const [checkedBy, setCheckedBy] = useState("");
  const [error, setError] = useState("");

  function updateItem(id, field, value) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        if (field === "orderQty" || field === "deliveredQty") return { ...it, [field]: clampAmount(value) };
        if (field === "comments") return { ...it, comments: sanitizeNarration(value, 200) };
        return { ...it, [field]: sanitizeNarration(value, 150) };
      })
    );
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(id) {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));
  }

  const hasShortage = useMemo(() => items.some((it) => clampAmount(it.deliveredQty) < clampAmount(it.orderQty)), [items]);

  function handlePrint() {
    if (!supplier.trim()) { setError("Supplier is required."); return; }
    if (items.every((it) => !it.goodsName.trim())) { setError("Add at least one goods line."); return; }
    if (qualityOk === null) { setError("Please mark quality check Yes or No."); return; }
    setError("");
    window.print();
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center gap-4 print:block print:bg-white print:p-0 print:min-h-0">
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { height: auto !important; }
          body * { visibility: hidden !important; }
          #grn-print-area, #grn-print-area * { visibility: visible !important; }
          #grn-print-area {
            position: static !important; width: 100% !important; max-width: none !important;
            box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; padding: 0 !important;
          }
          #grn-print-area section { break-inside: avoid !important; page-break-inside: avoid !important; }
        }
      `}</style>

      <div className="w-full max-w-[820px] flex items-center gap-2 print:hidden">
        <Link to="/" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 transition">
          <i className="fa-solid fa-arrow-left" /> Home
        </Link>
        <button
          type="button"
          onClick={handlePrint}
          className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-slate-800 hover:opacity-90 transition shadow-sm"
        >
          <i className="fa-solid fa-print" /> Print GRN
        </button>
      </div>

      <div id="grn-print-area" className="relative w-full max-w-[820px] bg-white rounded-2xl shadow-lg print:shadow-none print:rounded-none p-8 print:p-0">
        <header className="grid grid-cols-3 gap-3 items-start pb-3 border-b-2 border-slate-800">
          <div>
            <h1 className="text-lg font-bold text-slate-800">{COMPANY_INFO.name}</h1>
            <p className="text-[11px] italic text-amber-700">{COMPANY_INFO.tagline}</p>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-extrabold tracking-wide text-slate-800">GOODS RECEIVING NOTE</h2>
            <p className="text-[11px] text-slate-500">GRN No: {grnNo}</p>
          </div>
          <div className="text-right text-[10.5px] text-slate-600 leading-relaxed">
            <p>{COMPANY_INFO.address}</p>
            <p>{COMPANY_INFO.phone}</p>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 text-[12px]">
          <Field label="Supplier" required>
            <input value={supplier} maxLength={150} onChange={(e) => setSupplier(sanitizeNarration(e.target.value, 150))} className="w-full bg-transparent outline-none border-b border-slate-200 py-0.5" />
          </Field>
          <Field label="PO Number">
            <input value={poNumber} maxLength={60} onChange={(e) => setPoNumber(sanitizeNarration(e.target.value, 60))} className="w-full bg-transparent outline-none border-b border-slate-200 py-0.5" />
          </Field>
          <Field label="Req. No">
            <input value={reqNo} maxLength={60} onChange={(e) => setReqNo(sanitizeNarration(e.target.value, 60))} className="w-full bg-transparent outline-none border-b border-slate-200 py-0.5" />
          </Field>
          <Field label="Receiving Date">
            <input type="date" value={receivingDate} onChange={(e) => setReceivingDate(e.target.value)} className="w-full bg-transparent outline-none border-b border-slate-200 py-0.5" />
          </Field>
          <Field label="Deliver Location">
            <input value={deliverLocation} maxLength={150} onChange={(e) => setDeliverLocation(sanitizeNarration(e.target.value, 150))} className="w-full bg-transparent outline-none border-b border-slate-200 py-0.5" />
          </Field>
          <Field label="Challan No & Date">
            <input value={challanNoDate} maxLength={100} onChange={(e) => setChallanNoDate(sanitizeNarration(e.target.value, 100))} className="w-full bg-transparent outline-none border-b border-slate-200 py-0.5" />
          </Field>
        </section>

        <section className="mt-5">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">Goods Received</h3>
            <button type="button" onClick={addItem} className="print:hidden inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-amber-600 text-white hover:bg-amber-700">
              <i className="fa-solid fa-plus" /> Add Row
            </button>
          </div>
          {error && <p className="text-rose-600 text-[11px] mb-2 print:hidden">{error}</p>}

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white text-[11px]">
                  <th className="p-2 text-left w-[4%]">SI</th>
                  <th className="p-2 text-left w-[22%]">Goods Name</th>
                  <th className="p-2 text-left w-[18%]">Brand/Specification</th>
                  <th className="p-2 text-left w-[14%]">Product Serial No</th>
                  <th className="p-2 text-right w-[10%]">Order Qty</th>
                  <th className="p-2 text-right w-[10%]">Delivered Qty</th>
                  <th className="p-2 text-left w-[16%]">Comments</th>
                  <th className="p-2 w-[6%] print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const short = clampAmount(it.deliveredQty) < clampAmount(it.orderQty);
                  return (
                    <tr key={it.id} className={idx % 2 === 0 ? "bg-white" : "bg-amber-50/40"}>
                      <td className="p-2 border-b border-slate-200">{idx + 1}</td>
                      <td className="p-2 border-b border-slate-200">
                        <input value={it.goodsName} onChange={(e) => updateItem(it.id, "goodsName", e.target.value)} className="w-full bg-transparent outline-none px-1" />
                      </td>
                      <td className="p-2 border-b border-slate-200">
                        <input value={it.brandSpec} onChange={(e) => updateItem(it.id, "brandSpec", e.target.value)} className="w-full bg-transparent outline-none px-1" />
                      </td>
                      <td className="p-2 border-b border-slate-200">
                        <input value={it.productSerialNo} onChange={(e) => updateItem(it.id, "productSerialNo", e.target.value)} className="w-full bg-transparent outline-none px-1" />
                      </td>
                      <td className="p-2 border-b border-slate-200 text-right">
                        <input type="number" min="0" value={it.orderQty} onChange={(e) => updateItem(it.id, "orderQty", e.target.value)} className="w-full bg-transparent outline-none text-right px-1" />
                      </td>
                      <td className={`p-2 border-b border-slate-200 text-right ${short ? "bg-rose-50" : ""}`}>
                        <input type="number" min="0" value={it.deliveredQty} onChange={(e) => updateItem(it.id, "deliveredQty", e.target.value)} className="w-full bg-transparent outline-none text-right px-1" />
                      </td>
                      <td className="p-2 border-b border-slate-200">
                        <input value={it.comments} onChange={(e) => updateItem(it.id, "comments", e.target.value)} className="w-full bg-transparent outline-none px-1" />
                      </td>
                      <td className="p-2 border-b border-slate-200 text-center print:hidden">
                        <button type="button" onClick={() => removeItem(it.id)} disabled={items.length === 1} className="text-rose-600 disabled:opacity-30" aria-label="Remove row">
                          <i className="fa-solid fa-trash" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {hasShortage && <p className="text-amber-700 text-[11px] mt-1 print:hidden">One or more items show delivered quantity less than ordered — will be flagged as short delivery.</p>}
        </section>

        <section className="mt-5 flex items-center gap-6 text-[12px]">
          <span className="font-semibold text-slate-800">Quality as per purchase order specification:</span>
          <label className="flex items-center gap-1.5">
            <input type="radio" name="qualityOk" checked={qualityOk === true} onChange={() => setQualityOk(true)} /> Yes
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" name="qualityOk" checked={qualityOk === false} onChange={() => setQualityOk(false)} /> No
          </label>
        </section>

        <section className="grid grid-cols-2 gap-6 mt-6">
          <div className="pt-2 space-y-1.5">
            <p className="text-[11px] font-bold uppercase text-slate-700">Received By</p>
            <input value={receivedBy} onChange={(e) => setReceivedBy(sanitizeNarration(e.target.value, 80))} maxLength={80} className="w-full text-[11.5px] border-b border-slate-200 outline-none py-0.5 bg-transparent" />
            <div className="h-7 border-b border-slate-400 text-[10px] text-slate-400">Signature</div>
          </div>
          <div className="pt-2 space-y-1.5 text-right">
            <p className="text-[11px] font-bold uppercase text-slate-700">Checked By</p>
            <input value={checkedBy} onChange={(e) => setCheckedBy(sanitizeNarration(e.target.value, 80))} maxLength={80} className="w-full text-[11.5px] border-b border-slate-200 outline-none py-0.5 bg-transparent text-right" />
            <div className="h-7 border-b border-slate-400 text-[10px] text-slate-400 text-right">Signature</div>
          </div>
        </section>

        <footer className="relative z-10 text-center text-[10px] text-slate-500 mt-6 pt-3 border-t-4 border-amber-600">
          <p>This Goods Receiving Note is an internal store/procurement record of {COMPANY_INFO.name}.</p>
          <p>GRN No: {grnNo} · Generated: {new Date().toLocaleString("en-GB")}</p>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-slate-500 text-[10.5px]">{label} {required && <span className="text-rose-500">*</span>}</span>
      {children}
    </label>
  );
}