import React, { useEffect, useState } from 'react'
import axios from 'axios'

const Investments = () => {
  const [investments, setInvestments] = useState([])
  const [investmentType, setInvestmentType] = useState('FD')
  const [investmentAccount, setInvestmentAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [ratePercent, setRatePercent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const token = localStorage.getItem('token') || ''
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  const fetchInvestments = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/investments`,
        { headers }
      )
      const list = Array.isArray(res?.data?.data) ? res.data.data : []
      setInvestments(list)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to load investments.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvestments()
  }, [])

  const handleCreate = async (event) => {
    event.preventDefault()
    setError('')
    setStatus('')
    if (!amount) {
      setError('Please enter an amount.')
      return
    }
    if (ratePercent === '') {
      setError('Please enter a rate percentage.')
      return
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/investments`,
        {
          investmentType,
          investmentAccount: investmentAccount.trim() || undefined,
          amount: Number(amount),
          ratePercent: Number(ratePercent),
        },
        { headers }
      )
      const data = res?.data?.data
      if (data?.investment) {
        setInvestments((prev) => [data.investment, ...prev])
        setStatus(`Return simulated: ${data.returnPercent}%`)
      }
      setInvestmentAccount('')
      setAmount('')
      setRatePercent('')
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to create investment.'
      )
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Investments
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
            Simulate returns
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Compare FD, Stocks, and Gold performance.
          </p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
            <h2 className="text-lg font-semibold text-white">New investment</h2>
            <form className="mt-6 space-y-4" onSubmit={handleCreate}>
              <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Type
                <select
                  value={investmentType}
                  onChange={(e) => setInvestmentType(e.target.value)}
                  className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="FD">FD</option>
                  <option value="Stocks">Stocks</option>
                  <option value="Gold">Gold</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Investment Account / Platform
                <input
                  type="text"
                  value={investmentAccount}
                  onChange={(e) => setInvestmentAccount(e.target.value)}
                  className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                  placeholder="Groww, Zerodha, SBI FD"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Amount
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                  placeholder="5000"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Rate (%)
                <input
                  type="number"
                  value={ratePercent}
                  onChange={(e) => setRatePercent(e.target.value)}
                  className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                  placeholder="3.25"
                  step="0.01"
                />
              </label>
              {error ? (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                  {error}
                </div>
              ) : null}
              {status ? (
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-200">
                  {status}
                </div>
              ) : null}
              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
              >
                Simulate return
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Recent investments
              </h2>
              <span className="text-xs text-slate-400">
                {loading ? 'Loading...' : `${investments.length} items`}
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {investments.length ? (
                investments.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.investmentType}
                      </p>
                      <p className="text-xs text-slate-400">
                        Amount: ₹{item.amount}
                      </p>
                      {item.investmentAccount ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Account: {item.investmentAccount}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-sm font-semibold text-emerald-200">
                      ₹{item.returnValue}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-6 text-center text-sm text-slate-400">
                  {loading ? 'Fetching investments...' : 'No investments yet.'}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default Investments
