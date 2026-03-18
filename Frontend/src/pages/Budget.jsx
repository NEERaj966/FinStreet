import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { normalizeCategoryName } from '../constants/categories'
import CategorySelectField from '../componants/CategorySelectField'
import {
  buildReportFileName,
  downloadCsvReport,
  downloadPdfReport,
  formatReportCurrency,
} from '../utils/reportExports'

const normalizeBudgetLabel = (value) =>
  normalizeCategoryName(value).toLowerCase()

const getBudgetHealth = (spent, limit, category) => {
  const safeLimit = Number(limit || 0)
  const safeSpent = Number(spent || 0)
  const rawPercent = safeLimit > 0 ? (safeSpent / safeLimit) * 100 : 0
  const percent = Math.max(0, Math.round(rawPercent))
  const overage = Math.max(0, Number((safeSpent - safeLimit).toFixed(2)))
  const remaining = Math.max(0, Number((safeLimit - safeSpent).toFixed(2)))

  if (safeSpent > safeLimit) {
    return {
      status: 'exceeded',
      percent,
      rawPercent,
      overage,
      remaining,
      toneClass: 'text-rose-200',
      pillClass: 'border-rose-400/25 bg-rose-400/10 text-rose-100',
      barClass: 'from-rose-400 to-orange-300',
      message: `${category} budget exceeded by ₹${overage}`,
    }
  }

  if (rawPercent >= 80) {
    return {
      status: 'warning',
      percent,
      rawPercent,
      overage,
      remaining,
      toneClass: 'text-amber-200',
      pillClass: 'border-amber-400/25 bg-amber-400/10 text-amber-100',
      barClass: 'from-amber-300 to-orange-300',
      message: `${percent}% of ${category} budget used`,
    }
  }

  if (rawPercent >= 50) {
    return {
      status: 'watch',
      percent,
      rawPercent,
      overage,
      remaining,
      toneClass: 'text-sky-200',
      pillClass: 'border-sky-400/25 bg-sky-400/10 text-sky-100',
      barClass: 'from-sky-400 to-cyan-300',
      message: `${category} is at ${percent}% usage`,
    }
  }

  return {
    status: 'healthy',
    percent,
    rawPercent,
    overage,
    remaining,
    toneClass: 'text-emerald-200',
    pillClass: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
    barClass: 'from-emerald-400 to-sky-400',
    message: `${category} has ₹${remaining} left`,
  }
}

const reportButtonClass =
  'rounded-full border border-slate-700/70 bg-slate-950/65 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45'

const Budget = () => {
  const [budgets, setBudgets] = useState([])
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState('')
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    const token = localStorage.getItem('token') || ''
    if (!token) {
      setError('Please sign in to view budget analytics.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [budgetRes, expenseRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/budgets`, {
          headers,
        }),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/expenses`, {
          headers,
        }),
      ])
      const budgetList = Array.isArray(budgetRes?.data?.data)
        ? budgetRes.data.data
        : []
      const expenseList = Array.isArray(expenseRes?.data?.data)
        ? expenseRes.data.data
        : []
      setBudgets(budgetList)
      setExpenses(expenseList)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to load budgets.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const spentByCategory = useMemo(() => {
    return expenses.reduce((acc, item) => {
      const key = normalizeBudgetLabel(item.tag || item.category || 'Other')
      acc[key] = (acc[key] || 0) + Number(item.amount || 0)
      return acc
    }, {})
  }, [expenses])

  const totals = useMemo(() => {
    const totalLimit = budgets.reduce(
      (sum, item) => sum + Number(item.limit || 0),
      0
    )
    const totalSpent = expenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    )
    return { totalLimit, totalSpent }
  }, [budgets, expenses])

  const budgetInsights = useMemo(() => {
    const items = budgets.map((item) => {
      const spent = spentByCategory[normalizeBudgetLabel(item.category)] || 0
      return {
        ...item,
        spent,
        ...getBudgetHealth(spent, item.limit, item.category),
      }
    })

    const alerts = items
      .filter((item) => item.status === 'exceeded' || item.status === 'warning')
      .sort((a, b) => {
        const statusWeight = { exceeded: 0, warning: 1 }
        return (
          statusWeight[a.status] - statusWeight[b.status] || b.rawPercent - a.rawPercent
        )
      })

    const watchlist = items
      .filter((item) => item.status === 'watch')
      .sort((a, b) => b.rawPercent - a.rawPercent)

    const overallPercent =
      totals.totalLimit > 0 ? Math.round((totals.totalSpent / totals.totalLimit) * 100) : 0
    const totalOverBudget = items.reduce(
      (sum, item) => sum + Number(item.overage || 0),
      0
    )
    const strongestCategory = [...items].sort(
      (a, b) => b.rawPercent - a.rawPercent
    )[0]

    return {
      items,
      alerts,
      watchlist,
      summary: {
        overallPercent,
        totalOverBudget,
        alertCount: alerts.length,
        strongestCategory,
      },
    }
  }, [budgets, spentByCategory, totals.totalLimit, totals.totalSpent])

  const handleAddBudget = async (event) => {
    event.preventDefault()
    setError('')

    if (!category.trim() || !limit) {
      setError('Category and limit are required.')
      return
    }

    const numericLimit = Number(limit)
    if (!Number.isFinite(numericLimit) || numericLimit <= 0) {
      setError('Limit must be a positive number.')
      return
    }

    try {
      const token = localStorage.getItem('token') || ''
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/budgets`,
        { category: category.trim(), limit: numericLimit },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const created = res?.data?.data
      if (created) {
        setBudgets((prev) => [created, ...prev])
      }
      setCategory('')
      setLimit('')
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to create budget.'
      )
    }
  }

  const handleRemove = async (id) => {
    try {
      const token = localStorage.getItem('token') || ''
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/budgets/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setBudgets((prev) => prev.filter((item) => item._id !== id))
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to delete budget.'
      )
    }
  }

  const budgetReportColumns = [
    {
      label: 'Category',
      value: (item) => item.category,
    },
    {
      label: 'Monthly Limit',
      value: (item) => Number(item.limit || 0).toFixed(2),
    },
    {
      label: 'Spent',
      value: (item) => Number(item.spent || 0).toFixed(2),
    },
    {
      label: 'Usage %',
      value: (item) => Math.round(item.rawPercent || 0),
    },
    {
      label: 'Status',
      value: (item) => item.status,
    },
    {
      label: 'Remaining / Over',
      value: (item) =>
        item.overage > 0
          ? `Over by ${Number(item.overage || 0).toFixed(2)}`
          : `Left ${Number(item.remaining || 0).toFixed(2)}`,
    },
    {
      label: 'Insight',
      value: (item) => item.message,
    },
  ]

  const handleExportBudgetCsv = () => {
    downloadCsvReport({
      fileName: buildReportFileName('budget-summary-report', 'csv'),
      metaRows: [
        ['Report', 'Budget summary'],
        ['Budgets', budgets.length],
        ['Total limit', Number(totals.totalLimit || 0).toFixed(2)],
        ['Total spent', Number(totals.totalSpent || 0).toFixed(2)],
        ['Overall usage', `${budgetInsights.summary.overallPercent}%`],
        ['Alert count', budgetInsights.summary.alertCount],
        ['Over budget total', Number(budgetInsights.summary.totalOverBudget || 0).toFixed(2)],
      ],
      columns: budgetReportColumns,
      rows: budgetInsights.items,
    })
  }

  const handleExportBudgetPdf = () => {
    downloadPdfReport({
      fileName: buildReportFileName('budget-summary-report', 'pdf'),
      title: 'FinStreet Budget Summary',
      subtitleLines: ['Monthly category budget and alert overview'],
      summaryLines: [
        `Budgets tracked: ${budgets.length}`,
        `Total limit: ${formatReportCurrency(totals.totalLimit)}`,
        `Total spent: ${formatReportCurrency(totals.totalSpent)}`,
        `Overall usage: ${budgetInsights.summary.overallPercent}%`,
        `Alert count: ${budgetInsights.summary.alertCount}`,
        `Over budget total: ${formatReportCurrency(budgetInsights.summary.totalOverBudget)}`,
        `Highest pressure category: ${budgetInsights.summary.strongestCategory?.category || '—'}`,
      ],
      columns: budgetReportColumns,
      rows: budgetInsights.items,
      orientation: 'landscape',
    })
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Budget
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              Plan your spending
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Set limits and compare against actual spend.
            </p>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
            <h2 className="text-lg font-semibold text-white">New budget</h2>
            <form className="mt-6 space-y-4" onSubmit={handleAddBudget}>
              <CategorySelectField
                value={category}
                onChange={setCategory}
                helperText="This uses the same category list as expenses and imported statements."
              />
              <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Monthly limit
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                  placeholder="8000"
                />
              </label>
              {error ? (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                  {error}
                </div>
              ) : null}
              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
              >
                Add budget
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Summary</h2>
                <span className="text-xs text-slate-400">
                  {loading ? 'Loading...' : `${budgets.length} budgets`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExportBudgetCsv}
                  disabled={!budgetInsights.items.length}
                  className={reportButtonClass}
                >
                  Budget CSV
                </button>
                <button
                  type="button"
                  onClick={handleExportBudgetPdf}
                  disabled={!budgetInsights.items.length}
                  className={reportButtonClass}
                >
                  Budget PDF
                </button>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Total limit
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  ₹{totals.totalLimit}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Total spent
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  ₹{totals.totalSpent}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Alert count
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {budgetInsights.summary.alertCount}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Over budget total
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  ₹{budgetInsights.summary.totalOverBudget}
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Budget insights
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Actionable signals based on your current category budgets.
                </p>
              </div>
              <span className="rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-xs font-semibold text-slate-200">
                {budgetInsights.summary.overallPercent}% overall usage
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Highest pressure
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {budgetInsights.summary.strongestCategory?.category || '—'}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {budgetInsights.summary.strongestCategory
                    ? `${Math.round(
                        budgetInsights.summary.strongestCategory.rawPercent
                      )}% used`
                    : 'No budgets yet'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Attention needed
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {budgetInsights.summary.alertCount}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Budgets over or near the limit
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Next move
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {budgetInsights.alerts[0]?.category || 'On track'}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {budgetInsights.alerts[0]?.message || 'No urgent budget alerts'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Alerts</h2>
              <span className="text-xs text-slate-400">
                {budgetInsights.alerts.length + budgetInsights.watchlist.length} signals
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {budgetInsights.alerts.length ? (
                budgetInsights.alerts.map((item) => (
                  <div
                    key={`alert-${item._id}`}
                    className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">
                        {item.category}
                      </p>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${item.pillClass}`}
                      >
                        {item.status === 'exceeded' ? 'Exceeded' : 'Warning'}
                      </span>
                    </div>
                    <p className={`mt-2 text-sm ${item.toneClass}`}>
                      {item.message}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      ₹{item.spent} spent from ₹{item.limit}
                    </p>
                  </div>
                ))
              ) : budgetInsights.watchlist.length ? (
                budgetInsights.watchlist.slice(0, 3).map((item) => (
                  <div
                    key={`watch-${item._id}`}
                    className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">
                        {item.category}
                      </p>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${item.pillClass}`}
                      >
                        Watch
                      </span>
                    </div>
                    <p className={`mt-2 text-sm ${item.toneClass}`}>
                      {item.message}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      ₹{item.remaining} left before the limit
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-6 text-center text-sm text-emerald-100">
                  No active budget alerts right now. Your category spend looks healthy.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Budgets</h2>
            <button
              onClick={fetchData}
              className="rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200"
            >
              Refresh spends
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {budgets.length ? (
              budgetInsights.items.map((item) => {
                const percent = Math.min(Math.round(item.rawPercent), 100)
                return (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">
                            {item.category}
                          </p>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${item.pillClass}`}
                          >
                            {item.status === 'exceeded'
                              ? 'Exceeded'
                              : item.status === 'warning'
                                ? 'Warning'
                                : item.status === 'watch'
                                  ? 'Watch'
                                  : 'Healthy'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          ₹{item.spent} of ₹{item.limit}
                        </p>
                        <p className={`mt-2 text-xs ${item.toneClass}`}>
                          {item.message}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="text-xs text-rose-200 hover:text-rose-100"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-3 h-2.5 w-full rounded-full bg-slate-900/80">
                      <div
                        className={`h-2.5 rounded-full bg-gradient-to-r ${item.barClass}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{percent}% used</span>
                      <span>
                        {item.overage > 0
                          ? `Over by ₹${item.overage}`
                          : `₹${item.remaining} left`}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-6 text-center text-sm text-slate-400">
                Add your first budget to start tracking.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default Budget
