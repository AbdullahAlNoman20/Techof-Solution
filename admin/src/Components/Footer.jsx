// admin/src/Components/Footer.jsx

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="print:hidden bg-[#1B263B] text-white/80 mt-10 border-t-4 border-[#0A66C2]">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <img
              src="/public/Image/Techof Logo 2.jpeg"
              alt="TechOf Solution"
              onError={(e) => (e.currentTarget.style.display = "none")}
              className="w-8 h-8 object-contain bg-white rounded-md p-0.5"
            />
            <p className="text-white font-bold text-base">TechOf Solution.</p>
          </div>
          <p className="text-white/60 text-xs italic">We Don't Just Build Tech. We Give It Lift-Off.</p>
          <p className="mt-3 text-xs leading-relaxed text-white/60 max-w-md">
            A Bangladesh-based, web-first digital agency building modern, fast, and scalable
            digital platforms — MERN-based applications, business websites, LMS systems, and
            e-commerce solutions enhanced with AI and research-driven innovation.
          </p>
          <p className="mt-3 text-[11px] text-white/40">© {year} TechOf Solutions Ltd. All Rights Reserved.</p>
        </div>

        <div>
          <p className="text-white font-semibold text-xs uppercase tracking-wide mb-2">Quick Links</p>
          <ul className="space-y-1.5 text-xs text-white/70">
            <li><a href="/" className="hover:text-white transition">Home</a></li>
            <li><a href="/voucher" className="hover:text-white transition">Expense Voucher</a></li>
            <li><a href="/invoice" className="hover:text-white transition">Invoice</a></li>
            <li>
              <a href="https://techofsolution.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                Company Website
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-white font-semibold text-xs uppercase tracking-wide mb-2">Contact</p>
          <ul className="space-y-1.5 text-xs text-white/70">
            <li><i className="fa-solid fa-phone w-4 text-[#4d9fef]" /> <a href="tel:+8801798392494" className="hover:text-white">+880 1798-392494</a></li>
            <li><i className="fa-solid fa-globe w-4 text-[#4d9fef]" /> www.techofsolution.com</li>
            <li><i className="fa-solid fa-location-dot w-4 text-[#4d9fef]" /> Dhaka, Bangladesh</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-3 text-center text-[11px] text-white/50">
        © {year} TechOf Solutions Ltd. · All Rights Reserved · Internal Accounting Panel
      </div>
    </footer>
  );
}