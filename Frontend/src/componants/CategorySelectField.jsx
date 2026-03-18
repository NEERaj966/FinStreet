import React from 'react'
import { CATEGORY_OPTIONS } from '../constants/categories'

const CATEGORY_ACCENTS = {
  Food: 'from-orange-300/25 to-rose-300/10 text-orange-100 border-orange-300/20',
  Travel: 'from-sky-300/25 to-cyan-300/10 text-sky-100 border-sky-300/20',
  'Bill Payments':
    'from-amber-300/25 to-yellow-300/10 text-amber-100 border-amber-300/20',
  'Money Transfer':
    'from-emerald-300/25 to-green-300/10 text-emerald-100 border-emerald-300/20',
  Shopping: 'from-pink-300/25 to-fuchsia-300/10 text-pink-100 border-pink-300/20',
  Groceries: 'from-lime-300/25 to-emerald-300/10 text-lime-100 border-lime-300/20',
  Rent: 'from-violet-300/25 to-indigo-300/10 text-violet-100 border-violet-300/20',
  Utilities: 'from-cyan-300/25 to-teal-300/10 text-cyan-100 border-cyan-300/20',
  Entertainment:
    'from-fuchsia-300/25 to-violet-300/10 text-fuchsia-100 border-fuchsia-300/20',
  Health: 'from-rose-300/25 to-red-300/10 text-rose-100 border-rose-300/20',
  Education: 'from-blue-300/25 to-indigo-300/10 text-blue-100 border-blue-300/20',
  Other: 'from-slate-300/20 to-slate-400/10 text-slate-100 border-slate-300/20',
}

const CATEGORY_SELECT_SURFACES = {
  Food:
    'border-orange-300/20 bg-[linear-gradient(135deg,rgba(251,146,60,0.16),rgba(15,23,42,0.94)_40%,rgba(244,114,182,0.14))] text-orange-50 focus:border-orange-300/45 focus:shadow-[0_0_0_4px_rgba(251,146,60,0.09)]',
  Travel:
    'border-sky-300/20 bg-[linear-gradient(135deg,rgba(56,189,248,0.16),rgba(15,23,42,0.94)_40%,rgba(34,211,238,0.14))] text-sky-50 focus:border-sky-300/45 focus:shadow-[0_0_0_4px_rgba(56,189,248,0.09)]',
  'Bill Payments':
    'border-amber-300/20 bg-[linear-gradient(135deg,rgba(252,211,77,0.16),rgba(15,23,42,0.94)_40%,rgba(251,191,36,0.14))] text-amber-50 focus:border-amber-300/45 focus:shadow-[0_0_0_4px_rgba(252,211,77,0.09)]',
  'Money Transfer':
    'border-emerald-300/20 bg-[linear-gradient(135deg,rgba(52,211,153,0.18),rgba(15,23,42,0.94)_40%,rgba(74,222,128,0.12))] text-emerald-50 focus:border-emerald-300/45 focus:shadow-[0_0_0_4px_rgba(52,211,153,0.09)]',
  Shopping:
    'border-pink-300/20 bg-[linear-gradient(135deg,rgba(244,114,182,0.16),rgba(15,23,42,0.94)_40%,rgba(217,70,239,0.14))] text-pink-50 focus:border-pink-300/45 focus:shadow-[0_0_0_4px_rgba(244,114,182,0.09)]',
  Groceries:
    'border-lime-300/20 bg-[linear-gradient(135deg,rgba(163,230,53,0.16),rgba(15,23,42,0.94)_40%,rgba(52,211,153,0.14))] text-lime-50 focus:border-lime-300/45 focus:shadow-[0_0_0_4px_rgba(163,230,53,0.09)]',
  Rent:
    'border-violet-300/20 bg-[linear-gradient(135deg,rgba(196,181,253,0.16),rgba(15,23,42,0.94)_40%,rgba(129,140,248,0.14))] text-violet-50 focus:border-violet-300/45 focus:shadow-[0_0_0_4px_rgba(196,181,253,0.09)]',
  Utilities:
    'border-cyan-300/20 bg-[linear-gradient(135deg,rgba(103,232,249,0.16),rgba(15,23,42,0.94)_40%,rgba(45,212,191,0.14))] text-cyan-50 focus:border-cyan-300/45 focus:shadow-[0_0_0_4px_rgba(103,232,249,0.09)]',
  Entertainment:
    'border-fuchsia-300/20 bg-[linear-gradient(135deg,rgba(232,121,249,0.16),rgba(15,23,42,0.94)_40%,rgba(168,85,247,0.14))] text-fuchsia-50 focus:border-fuchsia-300/45 focus:shadow-[0_0_0_4px_rgba(232,121,249,0.09)]',
  Health:
    'border-rose-300/20 bg-[linear-gradient(135deg,rgba(253,164,175,0.16),rgba(15,23,42,0.94)_40%,rgba(248,113,113,0.14))] text-rose-50 focus:border-rose-300/45 focus:shadow-[0_0_0_4px_rgba(253,164,175,0.09)]',
  Education:
    'border-blue-300/20 bg-[linear-gradient(135deg,rgba(147,197,253,0.16),rgba(15,23,42,0.94)_40%,rgba(129,140,248,0.14))] text-blue-50 focus:border-blue-300/45 focus:shadow-[0_0_0_4px_rgba(147,197,253,0.09)]',
  Other:
    'border-slate-300/15 bg-[linear-gradient(135deg,rgba(148,163,184,0.14),rgba(15,23,42,0.94)_40%,rgba(100,116,139,0.12))] text-slate-50 focus:border-slate-300/30 focus:shadow-[0_0_0_4px_rgba(148,163,184,0.08)]',
}

const CategorySelectField = ({
  value,
  onChange,
  label = 'Category',
  helperText = 'Pick one shared category so budgets and expenses always match.',
  placeholder = 'Select category',
  emptyLabel = 'No category',
}) => {
  const accentClass = CATEGORY_ACCENTS[value] || CATEGORY_ACCENTS.Other
  const selectSurfaceClass =
    CATEGORY_SELECT_SURFACES[value] || CATEGORY_SELECT_SURFACES.Other
  const indicatorClass = value ? 'text-white' : 'text-slate-400'

  return (
    <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
      <div className="rounded-2xl border border-slate-700/70 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.08),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.86))] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="relative">
            <select
              value={value}
              onChange={(event) => onChange(event.target.value)}
              className={`w-full appearance-none rounded-xl border px-4 py-3 pr-12 text-sm outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition ${selectSurfaceClass}`}
            >
              <option value="" className="text-slate-900">
                {placeholder}
              </option>
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item} value={item} className="bg-slate-950 text-slate-100">
                  {item}
                </option>
              ))}
            </select>
            <span
              className={`pointer-events-none absolute inset-y-0 right-4 flex items-center transition ${indicatorClass}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <div
            className={`rounded-xl border bg-gradient-to-r px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${accentClass}`}
          >
            {value || emptyLabel}
          </div>
        </div>
      </div>
      <span className="text-[11px] normal-case tracking-normal text-slate-500">
        {helperText}
      </span>
    </label>
  )
}

export default CategorySelectField
