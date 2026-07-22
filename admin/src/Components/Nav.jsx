
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/invoice", label: "Invoice" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? "bg-white text-[#0A66C2]" : "text-white/90 hover:bg-white/10"
    }`;

  return (
    <nav className="print:hidden sticky top-0 z-50 bg-gradient-to-r from-[#0A66C2] via-[#1B263B] to-[#0A66C2] shadow-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/public/Image/Techof Logo 2.jpeg"
            alt="TechOf Solution"
            onError={(e) => (e.currentTarget.style.display = "none")}
            className="w-9 h-9 object-contain bg-white rounded-md p-0.5" />
          <div className="leading-tight">
            <p className="text-white font-bold text-sm">TechOf Solution.</p>
            <p className="text-white/70 text-[10px] italic">We Don't Just Build Tech. We Give It Lift-Off.</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
          
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="md:hidden text-white text-xl w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10">
          <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} />
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#1B263B] px-4 pb-3 flex flex-col gap-1">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === "/"} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}