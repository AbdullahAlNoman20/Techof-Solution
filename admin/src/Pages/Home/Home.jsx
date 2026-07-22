import { Link } from "react-router-dom";

const TOOLS = [
  {
    to: "/invoice",
    icon: "fa-solid fa-file-invoice",
    title: "Invoice",
    desc: "Generate professional client invoices.",
  },
  {
    to: "/voucher",
    icon: "fa-solid fa-file-invoice-dollar",
    title: "Expense Voucher",
    desc: "Simple internal expense record.",
  },
  {
    to: "/voucher/cash-payment",
    icon: "fa-solid fa-money-bill-wave",
    title: "Cash Payment (CPV)",
    desc: "Cash decreases — pay out an expense.",
  },
  {
    to: "/voucher/cash-receipt",
    icon: "fa-solid fa-money-bill-transfer",
    title: "Cash Receipt (CRV)",
    desc: "Cash increases — record cash received.",
  },
  {
    to: "/voucher/bank-payment",
    icon: "fa-solid fa-building-columns",
    title: "Bank Payment (BPV)",
    desc: "Bank decreases — payment through bank.",
  },
  {
    to: "/voucher/bank-receipt",
    icon: "fa-solid fa-landmark",
    title: "Bank Receipt (BRV)",
    desc: "Bank increases — deposit received.",
  },
  {
    to: "/voucher/journal",
    icon: "fa-solid fa-book",
    title: "Journal Voucher (JV)",
    desc: "Adjustments, accruals and non-cash entries.",
  },
  {
    to: "/voucher/contra",
    icon: "fa-solid fa-right-left",
    title: "Contra Voucher (CV)",
    desc: "Transfer between Cash and Bank.",
  },
  {
    to: "/voucher/purchase",
    icon: "fa-solid fa-cart-arrow-down",
    title: "Purchase Voucher",
    desc: "Record supplier purchases.",
  },
  {
    to: "/voucher/sales",
    icon: "fa-solid fa-cart-shopping",
    title: "Sales Voucher",
    desc: "Record customer sales.",
  },
  {
    to: "/voucher/petty-cash",
    icon: "fa-solid fa-coins",
    title: "Petty Cash (PCV)",
    desc: "Small day-to-day office expenses.",
  },
  {
    to: "/voucher/grn",
    icon: "fa-solid fa-dolly",
    title: "Goods Receiving Note",
    desc: "Record goods received against a Purchase Order.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-lg border border-slate-200 p-10">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1B263B]">
            Accounting Vouchers & Documents
          </h1>

          <p className="text-slate-500 mt-3 text-base">
            All traditional voucher types, in one place
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {TOOLS.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 p-5 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-4">
                <i className={tool.icon}></i>
              </div>

              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                {tool.title}
              </h2>

              <p className="text-sm text-slate-500 flex-grow">
                {tool.desc}
              </p>

              <button className="mt-5 w-full rounded-lg bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 transition">
                Create
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}