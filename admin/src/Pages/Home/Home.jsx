import { Link } from "react-router-dom";

const TOOLS = [
  {
    to: "/invoice",
    title: "Invoice",
    icon: "fa-solid fa-file-invoice",
    description: "Create Client Invoice",
  },
  {
    to: "/voucher",
    title: "Voucher",
    icon: "fa-solid fa-file-invoice-dollar",
    description: "Create Expense Voucher",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-lg border border-slate-200 p-10">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800">
            TechOf Solution
          </h1>
          <p className="text-slate-500 mt-2">
            Internal Accounting System
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {TOOLS.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="border rounded-xl p-8 text-center hover:shadow-md transition"
            >
              <div className="w-16 h-16 mx-auto rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl mb-5">
                <i className={tool.icon}></i>
              </div>

              <h2 className="text-xl font-semibold text-slate-800">
                {tool.title}
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                {tool.description}
              </p>

              <button className="mt-6 px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                Create
              </button>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}