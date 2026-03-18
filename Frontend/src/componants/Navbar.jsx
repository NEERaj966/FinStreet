import React, { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";

const Navbar = () => {
  const { user } = useContext(UserDataContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = useMemo(() => {
    if (!user) return "U";
    if (user.fullname) {
      const parts = user.fullname.trim().split(" ");
      const first = parts[0]?.[0] || "";
      const last = parts[1]?.[0] || "";
      return `${first}${last}`.toUpperCase() || "U";
    }
    if (user.email) return user.email[0].toUpperCase();
    return "U";
  }, [user]);




  return (
    <nav className="relative sticky top-0 z-50 flex flex-wrap items-center justify-center gap-5 border-b border-slate-200/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.2)] md:flex-nowrap md:justify-between">
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_1200px_at_10%_-40%,rgba(79,209,197,0.22),transparent_55%)]" />
      <Link
        className="relative z-10 flex w-full items-center justify-center gap-3 text-slate-100 no-underline md:w-auto md:justify-start font-['Syne'] text-xl tracking-wide"
        to="/"
        aria-label="FinStreet home"
      >
        <span
          className="inline-flex items-center justify-center rounded-xl bg-slate-950/40 p-1.5 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.2)]"
          aria-hidden="true"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="fsGradient" x1="2" y1="2" x2="26" y2="26">
                <stop offset="0%" stopColor="#1F9D55" />
                <stop offset="55%" stopColor="#00B4D8" />
                <stop offset="100%" stopColor="#4361EE" />
              </linearGradient>
            </defs>
            <rect
              x="1.5"
              y="1.5"
              width="25"
              height="25"
              rx="7"
              stroke="url(#fsGradient)"
              strokeWidth="2"
            />
            <path
              d="M7.5 17.5L12.2 12.8L15.4 16L20.6 10.8"
              stroke="url(#fsGradient)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="20.6" cy="10.8" r="2.2" fill="url(#fsGradient)" />
          </svg>
        </span>
        <span>FinStreet</span>
      </Link>
      <ul
        className="relative z-10 flex w-full flex-wrap items-center justify-center gap-2 md:w-auto"
        role="tablist"
      >
        <li>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-slate-900/40 px-3.5 py-2 text-[13px] font-medium tracking-wide text-slate-100 transition hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-100 font-['Sora']"
            role="tab"
            to="/main-account"
          >
            Main Account
          </Link>
        </li>
        <li>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-slate-900/40 px-3.5 py-2 text-[13px] font-medium tracking-wide text-slate-100 transition hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-100 font-['Sora']"
            role="tab"
            to="/"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-slate-900/40 px-3.5 py-2 text-[13px] font-medium tracking-wide text-slate-100 transition hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-100 font-['Sora']"
            role="tab"
            to="/dashboard"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-slate-900/40 px-3.5 py-2 text-[13px] font-medium tracking-wide text-slate-100 transition hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-100 font-['Sora']"
            role="tab"
            to="/budget"
          >
            Budget
          </Link>
        </li>
        <li>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-slate-900/40 px-3.5 py-2 text-[13px] font-medium tracking-wide text-slate-100 transition hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-100 font-['Sora']"
            role="tab"
            to="/expenses"
          >
            Expenses
          </Link>
        </li>
        <li>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-slate-900/40 px-3.5 py-2 text-[13px] font-medium tracking-wide text-slate-100 transition hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-100 font-['Sora']"
            role="tab"
            to="/investments"
          >
            Investments
          </Link>
        </li>
        <li>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-slate-900/40 px-3.5 py-2 text-[13px] font-medium tracking-wide text-slate-100 transition hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-100 font-['Sora']"
            role="tab"
            to="/events"
          >
            Events
          </Link>
        </li>
        <li>
          <Link 
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-slate-900/40 px-3.5 py-2 text-[13px] font-medium tracking-wide text-slate-100 transition hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-100 font-['Sora']"
            role="tab"
            to="/learn"
          >
            Learn Finance
          </Link>
        </li>
      </ul>
      {user ? (
        <div className="relative z-10 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-sm font-semibold text-slate-100 shadow-[0_10px_25px_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 hover:bg-slate-900 md:w-auto font-['Sora']"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 via-emerald-400 to-sky-400 text-xs font-bold text-slate-950">
              {initials}
            </span>
            <span className="text-xs uppercase tracking-[0.14em] text-emerald-200">
              Profile
            </span>
          </button>

          {menuOpen ? (
            <div className="absolute right-0 mt-3 w-60 rounded-2xl border border-slate-800 bg-slate-950/95 p-2 text-sm text-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.45)] backdrop-blur">
              <div className="px-3 pb-2 pt-1">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Signed in as
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {user?.fullname || "FinStreet User"}
                </p>
                <p className="text-xs text-slate-400">{user?.email || ""}</p>
              </div>
              <div className="my-2 h-px bg-slate-800" />
              <Link
                to="/main-account"
                className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800/70"
                onClick={() => setMenuOpen(false)}
              >
                Main Account
              </Link>
              <Link
                to="/profile"
                className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800/70"
                onClick={() => setMenuOpen(false)}
              >
                View Profile
              </Link>
              <Link
                to="/logout"
                className="block rounded-xl px-3 py-2 text-sm font-medium text-rose-200 hover:bg-rose-500/10"
                onClick={() => setMenuOpen(false)}
              >
                Logout
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        <Link
          className="relative z-10 inline-flex w-full items-center justify-center rounded-full border border-slate-200/25 bg-gradient-to-r from-slate-50 to-slate-200 px-4 py-2 text-[13px] font-semibold text-slate-900 shadow-[0_6px_18px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_22px_rgba(15,23,42,0.25)] md:w-auto font-['Sora']"
          to="/SignUP"
        >
          Profile / Login
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
