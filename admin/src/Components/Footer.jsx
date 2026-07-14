// admin/src/Components/Footer.jsx

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="print:hidden bg-[#1B263B] text-white/80 mt-10 border-t-4 border-[#0A66C2]">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div>
          <p className="text-white font-bold text-base">TechOf Solution.</p>
          <p className="text-white/60 italic text-xs mt-1">
            Smart Mind Smart Solution
          </p>
          <p className="mt-3 text-xs leading-relaxed text-white/60">
            Internal accounting &amp; invoicing panel for company vouchers and
            client invoices.
          </p>
        </div>

        <div>
          <p className="text-white font-semibold text-xs uppercase tracking-wide mb-2">
            Quick Links
          </p>
          <ul className="space-y-1.5 text-xs text-white/70">
            <li>
              <a href="/" className="hover:text-white transition">
                Home
              </a>
            </li>
            <li>
              <a href="/voucher" className="hover:text-white transition">
                Expense Voucher
              </a>
            </li>
            <li>
              <a href="/invoice" className="hover:text-white transition">
                Invoice
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-white font-semibold text-xs uppercase tracking-wide mb-2">
            Contact
          </p>
          <ul className="space-y-1.5 text-xs text-white/70">
            <li>
              <i className="fa-solid fa-envelope w-4 text-[#4d9fef]" />{" "}
              info@techofsolution.com
            </li>
            <li>
              <i className="fa-solid fa-phone w-4 text-[#4d9fef]" /> +880
              1XXX-XXXXXX
            </li>
            <li>
              <i className="fa-solid fa-globe w-4 text-[#4d9fef]" />{" "}
              www.techofsolution.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-3 text-center text-[11px] text-white/50">
        Copyright © {year} TechOf Solution. · All rights reserved.
      </div>
    </footer>
  );
}
