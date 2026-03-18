import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserDataContext } from '../context/UserContext'

const formatDateTime = (value, fallbackDate, fallbackTime) => {
  const parsed = value ? new Date(value) : fallbackDate ? new Date(`${fallbackDate}T${fallbackTime || '00:00:00'}`) : null
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return fallbackDate || 'No date'
  }

  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const MainAccount = () => {
  const { user, refreshUserProfile, isLoading } = useContext(UserDataContext)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    refreshUserProfile?.()
  }, [refreshUserProfile])

  const transactions = useMemo(() => {
    const list = Array.isArray(user?.mainAccountTransactions)
      ? [...user.mainAccountTransactions]
      : []

    return list.sort((a, b) => {
      const aValue = new Date(a.timestamp || `${a.date || ''}T${a.time || '00:00:00'}`).getTime()
      const bValue = new Date(b.timestamp || `${b.date || ''}T${b.time || '00:00:00'}`).getTime()
      return bValue - aValue
    })
  }, [user?.mainAccountTransactions])

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return transactions

    return transactions.filter((item) =>
      [
        item.transactionDetails,
        item.account,
        item.otherTransactionDetails,
        item.upiRefNo,
        item.remarks,
        item.amount,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    )
  }, [searchQuery, transactions])

  const summary = useMemo(() => {
    const totalCredits = transactions.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    )
    const latest = transactions[0] || null
    const uniqueSources = new Set(
      transactions.map((item) => item.account).filter(Boolean)
    ).size

    return {
      totalCredits,
      latest,
      uniqueSources,
    }
  }, [transactions])

  if (!user && !isLoading) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Main account</h1>
        <p className="mt-3 text-sm text-slate-600">
          Sign in to view your received-money history and account balance.
        </p>
        <Link
          to="/signin"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
        >
          Go to Sign In
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Main Account
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              Received money history
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Review incoming credits from imported statements, track where they
              came from, and keep an eye on your running main account balance.
            </p>
          </div>
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
              Current balance
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              ₹{typeof user?.mainAccountBalance === 'number' ? user.mainAccountBalance : 0}
            </p>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Total credits
            </p>
            <p className="mt-3 text-2xl font-semibold text-white">
              ₹{summary.totalCredits}
            </p>
            <p className="mt-2 text-xs text-emerald-300">
              Sum of all received entries
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Transactions
            </p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {transactions.length}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Imported credit records
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Credit sources
            </p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {summary.uniqueSources}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Distinct linked accounts
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Latest credit
            </p>
            <p className="mt-3 text-lg font-semibold text-white">
              {summary.latest?.transactionDetails || '—'}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              {summary.latest
                ? `+₹${summary.latest.amount} • ${formatDateTime(
                    summary.latest.timestamp,
                    summary.latest.date,
                    summary.latest.time
                  )}`
                : 'No credits yet'}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Transaction history
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Search credits by sender, account, UPI ref, remarks, or amount.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Search history
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                  placeholder="Amit, SBI, UPI ref, amount"
                />
              </label>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {filteredTransactions.length ? (
              filteredTransactions.map((item, index) => (
                <div
                  key={`${item.sourceKey || item.upiRefNo || item.timestamp || index}`}
                  className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-4 md:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-white">
                        {item.transactionDetails || 'Received credit'}
                      </p>
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                        Credit
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                      <span>{formatDateTime(item.timestamp, item.date, item.time)}</span>
                      {item.account ? <span>{item.account}</span> : null}
                      {item.upiRefNo ? <span>UPI Ref: {item.upiRefNo}</span> : null}
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                      {item.otherTransactionDetails ? (
                        <span>Source details: {item.otherTransactionDetails}</span>
                      ) : null}
                      {item.remarks ? <span>Remarks: {item.remarks}</span> : null}
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-3">
                    <span className="text-base font-semibold text-emerald-200">
                      +₹{item.amount}
                    </span>
                    <span className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                      {item.source || 'main-account'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-10 text-center text-sm text-slate-400">
                {searchQuery
                  ? 'No main account transactions matched your search.'
                  : 'No received transactions available yet.'}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default MainAccount
