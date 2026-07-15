// admin/src/Pages/Home/Home.jsx

import { Link } from "react-router-dom";

const STATS = [
  { value: "7", label: "Client Countries" },
  { value: "132", label: "Projects Delivered Successfully" },
  { value: "4", label: "Core Focus Areas" },
];

const MISSION_POINTS = [
  "Deliver high-quality and reliable digital products tailored to client success.",
  "Promote innovation in AI, data science, and automation.",
  "Foster learning, mentorship, and knowledge-sharing within the IT community.",
  "Support sustainable and ethical business practices.",
  "Build strategic partnerships globally for technological collaboration.",
];

const VISION_POINTS = [
  "Establish a global reputation for innovation and reliability.",
  "Lead digital transformation across industries through R&D and creativity.",
  "Contribute to Bangladesh's position as a global tech innovation hub.",
  "Develop an ecosystem integrating software, education, and research.",
  "Inspire a generation of creators, engineers, and problem-solvers.",
];

const CORE_VALUES = [
  { icon: "fa-solid fa-heart", title: "Customer-Caring", desc: "Every solution starts with a person, not a spec sheet. We build for real outcomes." },
  { icon: "fa-solid fa-gem", title: "Perfection-Craving", desc: "Good enough never is. We chase world-class in every deliverable, every time." },
  { icon: "fa-solid fa-compass", title: "Boundary-Breaking", desc: "We treat AI, automation, and research as playgrounds, not obligations." },
  { icon: "fa-solid fa-shield-halved", title: "Trust-Driven", desc: "Integrity isn't a policy for us — it's the default setting." },
  { icon: "fa-solid fa-seedling", title: "Growth-Chasing", desc: "We stay students of the craft — always learning, always leveling up." },
];

const TOOLS = [
  { to: "/voucher", icon: "fa-solid fa-file-invoice-dollar", title: "Expense Voucher", desc: "Create and print internal expense vouchers." },
  { to: "/invoice", icon: "fa-solid fa-file-invoice", title: "Invoice", desc: "Generate professional client invoices." },
];

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A66C2] via-[#12407a] to-[#1B263B] text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center relative z-10">
          <span className="inline-block text-[11px] font-semibold tracking-widest uppercase bg-white/10 text-white/90 px-3 py-1 rounded-full mb-4">
            Web-First Digital Agency · Dhaka, Bangladesh
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            We Don't Just Build Tech.
            <br />
            <span className="text-white/90">We Give It Lift — Off.</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-sm md:text-base text-white/80 leading-relaxed">
            TechOf Solution. is a Bangladesh-based technology partner turning ambitious ideas into
            scalable web, mobile, AI, and enterprise systems — MERN applications, business
            websites, LMS platforms, and e-commerce solutions crafted for performance, usability,
            and strong SEO.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            
              href="tel:+8801798392494"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-[#0A66C2] hover:bg-blue-50 transition shadow-sm"
              <i className="fa-solid fa-phone" /> Say Hi — 01798392494
          
            
              href="https://techofsolution.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border border-white/40 text-white hover:bg-white/10 transition"
              <i className="fa-solid fa-globe" /> Visit Website
            
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-3 gap-4 bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl md:text-4xl font-extrabold text-[#0A66C2]">{s.value}</p>
              <p className="text-[11px] md:text-xs text-slate-500 mt-1 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Meaning */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-[#0A66C2] mb-2">01 — THE MEANING</p>
          <h2 className="text-2xl font-bold text-[#1B263B] mb-3">Tech + Off = TechOf.</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The name isn't decoration. "Off" is our nod to takeoff — the exact moment an idea
            leaves the ground and becomes real. TechOf Solutions exists to give technology that
            same lift: turning grounded ideas into systems that actually fly.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">
          <p className="text-[11px] font-bold tracking-widest text-[#0A66C2] mb-2">02 — THE COMPANY</p>
          <h3 className="text-lg font-bold text-[#1B263B] mb-3">An IT company built to scale ambition.</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            TechOf Solution delivers advanced web, mobile, AI, and enterprise-grade digital
            solutions from Dhaka, Bangladesh — while investing in technology education and
            research to grow the next generation of digital creators.
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1">
            <p className="text-[11px] font-bold tracking-widest text-[#0A66C2] mb-2">03 — THE FOUNDER</p>
            <h2 className="text-2xl font-bold text-[#1B263B]">One Man. One Direction.</h2>
          </div>
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-[#0A66C2]">S M Golam Faruk Alamgir Arman</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-0.5">Founder &amp; CEO</p>
            <p className="text-sm text-slate-600 leading-relaxed mt-3">
              Former Director &amp; Vice President of the Dhaka Chamber of Commerce and Industry,
              and COO of BDCOM Online Ltd. Former Director &amp; Sr. Vice President of the Dhaka
              Chamber of Commerce and Industry and Managing Director of BDCOM Online Limited.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <p className="text-[11px] font-bold tracking-widest text-[#0A66C2] mb-2 text-center">04 — WHAT WE STAND FOR</p>
        <h2 className="text-2xl font-bold text-[#1B263B] mb-8 text-center">Mission and vision, not slogans.</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-[#0A66C2] mb-2">Mission</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              To empower people and businesses by creating transformative, intelligent, and
              future-ready digital solutions through innovation, education, and technology.
            </p>
            <ul className="space-y-2 text-[13px] text-slate-600">
              {MISSION_POINTS.map((p) => (
                <li key={p} className="flex gap-2">
                  <i className="fa-solid fa-check text-[#0A66C2] mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6">
            <h3 className="text-base font-bold text-[#1B263B] mb-2">Vision</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              To be South Asia's most trusted, innovative, and research-driven technology
              powerhouse — shaping the future through intelligent systems, digital transformation,
              and human-centered design.
            </p>
            <ul className="space-y-2 text-[13px] text-slate-600">
              {VISION_POINTS.map((p) => (
                <li key={p} className="flex gap-2">
                  <i className="fa-solid fa-check text-[#1B263B] mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Giving Back */}
      <section className="bg-gradient-to-r from-[#0A66C2] to-[#1B263B] text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-1">
            <p className="text-[11px] font-bold tracking-widest text-white/70 mb-2">05 — GIVING BACK</p>
            <h2 className="text-2xl font-bold">Before the defense, we showed up.</h2>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-white/90">
              Daffodil International University — 64th Batch, CSE
            </p>
            <p className="text-xs text-white/70 italic mt-1">
              A room full of final-year students, sharing knowledge about Research &amp; Defense.
            </p>
            <p className="text-sm text-white/80 leading-relaxed mt-3">
              Final defense pressure is real — we've been there too. So TechOf Solutions sat down
              with the 64th batch CSE students before their big day, walked through what actually
              matters in a defense, and made clear that our door stays open if any of them need
              guidance, review, or just someone to talk it through with.
            </p>
            
              href="https://www.facebook.com/reel/1606791157128452"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-white hover:text-white/80 transition"
              <i className="fa-solid fa-circle-play" /> Watch the Session
            
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <p className="text-[11px] font-bold tracking-widest text-[#0A66C2] mb-2 text-center">06 — CORE VALUES</p>
        <h2 className="text-2xl font-bold text-[#1B263B] mb-8 text-center">Five things we won't compromise on.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {CORE_VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-slate-200 p-5 text-center hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0A66C2] flex items-center justify-center mx-auto mb-3 text-lg">
                <i className={v.icon} />
              </div>
              <h3 className="text-sm font-bold text-[#1B263B] mb-1.5">{v.title}</h3>
              <p className="text-[12px] text-slate-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal Tools */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-[#1B263B] mb-2">Internal Accounting Tools</h2>
          <p className="text-sm text-slate-500 mb-8">Quick access to company vouchers and client invoices</p>
          <div className="flex flex-wrap justify-center gap-6">
            {TOOLS.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="w-56 p-7 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A66C2] to-[#1B263B] text-white flex items-center justify-center text-xl">
                  <i className={t.icon} />
                </div>
                <span className="font-bold text-[#1B263B]">{t.title}</span>
                <span className="text-[12px] text-slate-500 -mt-2">{t.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Say Hi CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-[11px] font-bold tracking-widest text-[#0A66C2] mb-2">LET'S TALK</p>
        <h2 className="text-3xl font-extrabold text-[#1B263B] mb-2">SAY HI!</h2>
        <p className="text-sm text-slate-500 mb-6">Tell us about your project. Let's collaborate and make great stuff.</p>
        
          href="tel:+8801798392494"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#0A66C2] to-[#1B263B] hover:opacity-90 transition shadow-sm"
          <i className="fa-solid fa-phone" /> 01798392494
        
      </section>
    </div>
  );
}