import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext'

const Home = () => {
  const { user } = useContext(UserDataContext)
  const [totalSpend, setTotalSpend] = useState(0)
  const [recentExpenses, setRecentExpenses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchSnapshot = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token') || ''
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        const [totalRes, listRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/expenses/total`, {
            headers,
          }),
          axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/expenses`, {
            headers,
          }),
        ])

        const total = totalRes?.data?.data?.total || 0
        const list = Array.isArray(listRes?.data?.data)
          ? listRes.data.data
          : []

        setTotalSpend(total)
        setRecentExpenses(list.slice(0, 3))
      } catch (error) {
        setTotalSpend(0)
        setRecentExpenses([])
      } finally {
        setLoading(false)
      }
    }

    fetchSnapshot()
  }, [user])

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100">
      <section className="relative overflow-hidden">
        <div className="absolute -top-28 left-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute top-20 right-10 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              FinStreet
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-white md:text-6xl">
              Master your money.
              <span className="block text-emerald-300">
                Everything in one clear view.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-300">
              Track budgets, expenses, investments, and real-time events with a
              single finance hub built for focus. FinStreet turns complexity
              into confidence with clean dashboards and actionable advice.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_16px_30px_rgba(34,197,94,0.25)] transition hover:-translate-y-0.5"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-sky-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_16px_30px_rgba(34,197,94,0.25)] transition hover:-translate-y-0.5"
                  >
                    Create account
                  </Link>
                  <Link
                    to="/signin"
                    className="inline-flex items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-300/10 px-6 py-3 text-sm font-semibold text-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-300/20"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: 'Financial Score',
                  value:
                    typeof user?.financialScore === 'number'
                      ? `${user.financialScore}/100`
                      : 'Real-time metrics',
                },
                { label: 'Budget Planner', value: 'Custom categories' },
                { label: 'Advisor AI', value: 'Weekly guidance' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
                >
                  <p className="text-sm font-semibold text-white">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <div className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Overview
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    Monthly Snapshot
                  </p>
                </div>
                <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Live
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Savings
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {user ? `₹${user.savings ?? 0}` : '₹24,560'}
                  </p>
                  <p className="mt-1 text-xs text-emerald-300">
                    {user ? 'Updated from profile' : '+18% this month'}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Spend
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {user ? `₹${totalSpend}` : '₹12,840'}
                  </p>
                  <p className="mt-1 text-xs text-sky-300">
                    {user
                      ? loading
                        ? 'Updating...'
                        : 'All expenses included'
                      : '4 categories active'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">
                    {user ? 'Recent Expenses' : 'Upcoming Events'}
                  </p>
                  <span className="text-xs text-slate-400">Next 7 days</span>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {user ? (
                    recentExpenses.length ? (
                      recentExpenses.map((expense) => (
                        <li
                          key={expense._id}
                          className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2"
                        >
                          <span>
                            {expense.spentAt || expense.category}
                            <span className="ml-2 text-xs text-slate-400">
                              {expense.category}
                            </span>
                          </span>
                          <span className="text-sky-300">
                            -₹{expense.amount}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="rounded-xl bg-slate-900/60 px-3 py-2 text-slate-400">
                        {loading ? 'Loading expenses...' : 'No expenses yet.'}
                      </li>
                    )
                  ) : (
                    <>
                      <li className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2">
                        <span>Salary credited</span>
                        <span className="text-emerald-300">+₹52,000</span>
                      </li>
                      <li className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2">
                        <span>Investment SIP</span>
                        <span className="text-sky-300">-₹5,000</span>
                      </li>
                      <li className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2">
                        <span>Emergency fund</span>
                        <span className="text-slate-200">+₹1,200</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
