import React, { useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext'

const Dashboard = () => {
  const { user } = useContext(UserDataContext)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    const fetchExpenses = async () => {
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('token') || ''
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/v1/expenses`,
          { headers }
        )
        const list = Array.isArray(res?.data?.data) ? res.data.data : []
        setExpenses(list)
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Unable to load expenses.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [user])

  const { weeklyTotals, weeklyLabels, monthlyTotals, monthlyLabels } =
    useMemo(() => {
      const today = new Date()
      const startOfDay = (date) =>
        new Date(date.getFullYear(), date.getMonth(), date.getDate())

      const days = Array.from({ length: 7 }, (_, index) => {
        const d = new Date(today)
        d.setDate(today.getDate() - (6 - index))
        return startOfDay(d)
      })

      const months = Array.from({ length: 6 }, (_, index) => {
        const d = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1)
        return d
      })

      const totalsByDay = new Array(7).fill(0)
      const totalsByMonth = new Array(6).fill(0)

      expenses.forEach((expense) => {
        const dateValue = expense?.date || expense?.createdAt
        if (!dateValue) return
        const expenseDate = startOfDay(new Date(dateValue))
        const dayIndex = days.findIndex(
          (day) => day.getTime() === expenseDate.getTime()
        )
        if (dayIndex >= 0) {
          totalsByDay[dayIndex] += Number(expense.amount || 0)
        }

        const monthIndex = months.findIndex(
          (month) =>
            month.getFullYear() === expenseDate.getFullYear() &&
            month.getMonth() === expenseDate.getMonth()
        )
        if (monthIndex >= 0) {
          totalsByMonth[monthIndex] += Number(expense.amount || 0)
        }
      })

      const labelsByDay = days.map((date) =>
        date.toLocaleDateString('en-US', { weekday: 'short' })
      )
      const labelsByMonth = months.map((date) =>
        date.toLocaleDateString('en-US', { month: 'short' })
      )

      return {
        weeklyTotals: totalsByDay,
        weeklyLabels: labelsByDay,
        monthlyTotals: totalsByMonth,
        monthlyLabels: labelsByMonth,
      }
    }, [expenses])

  const weeklyMax = Math.max(...weeklyTotals, 1)
  const monthlyMax = Math.max(...monthlyTotals, 1)
  const weeklyPoints = weeklyTotals
    .map((value, index) => {
      const x = (index / (weeklyTotals.length - 1)) * 100
      const y = 100 - (value / weeklyMax) * 80 - 10
      return `${x},${y}`
    })
    .join(' ')
  const monthlySavings =
    typeof user?.monthlySavings === 'number' ? user.monthlySavings : null
  const totalSavings = typeof user?.savings === 'number' ? user.savings : null
  const summaryCards = [
    { title: 'Top category', value: 'Groceries', delta: '-3%' },
    { title: 'Highest day', value: 'Saturday', delta: '+12%' },
    {
      title: 'Monthly savings',
      value: monthlySavings === null ? '—' : `₹${monthlySavings}`,
      delta:
        monthlySavings === null
          ? 'No data yet'
          : monthlySavings < 0
            ? 'Over budget'
            : 'Under budget',
      deltaClass:
        monthlySavings !== null && monthlySavings < 0
          ? 'text-rose-300'
          : 'text-emerald-300',
    },
    {
      title: 'Total savings',
      value: totalSavings === null ? '—' : `₹${totalSavings}`,
      delta: totalSavings === null ? 'No data yet' : 'Overall balance',
      deltaClass: 'text-slate-300',
    },
  ]

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Dashboard
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              Spending overview
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Track weekly and monthly spend trends at a glance.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200">
              Last 30 days
            </button>
            <button className="rounded-full bg-emerald-400/20 px-4 py-2 text-xs font-semibold text-emerald-200">
              This quarter
            </button>
          </div>
        </header>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Weekly spend trend
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Total spent: ₹
                  {weeklyTotals.reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                {loading ? 'Updating...' : 'Last 7 days'}
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <svg viewBox="0 0 100 100" className="h-48 w-full">
                <defs>
                  <linearGradient id="weeklyLine" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
                <polyline
                  fill="none"
                  stroke="url(#weeklyLine)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={weeklyPoints}
                />
                {weeklyTotals.map((value, index) => {
                  const x = (index / (weeklyTotals.length - 1)) * 100
                  const y = 100 - (value / weeklyMax) * 80 - 10
                  return (
                    <circle
                      key={`${value}-${index}`}
                      cx={x}
                      cy={y}
                      r="2.4"
                      fill="#38bdf8"
                    />
                  )
                })}
              </svg>
              <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[10px] uppercase text-slate-400">
                {weeklyLabels.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Monthly spend
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Average: ₹
                  {Math.round(
                    monthlyTotals.reduce((a, b) => a + b, 0) /
                      (monthlyTotals.length || 1)
                  )}
                </p>
              </div>
              <span className="rounded-full border border-sky-400/40 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
                Last 6 months
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {monthlyTotals.map((value, index) => (
                <div
                  key={`${value}-${index}`}
                  className="grid grid-cols-[60px_1fr_60px] items-center gap-3"
                >
                  <span className="text-xs uppercase text-slate-400">
                    {monthlyLabels[index]}
                  </span>
                  <div className="h-2.5 w-full rounded-full bg-slate-950/60">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                      style={{ width: `${(value / monthlyMax) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    ₹{value}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {card.title}
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {card.value}
              </p>
              <p className={`mt-2 text-xs ${card.deltaClass || 'text-emerald-300'}`}>
                {card.delta}
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}

export default Dashboard
