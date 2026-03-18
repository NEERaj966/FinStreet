import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useContext(UserDataContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!email.trim() || !password) {
      setFormError('Please enter your email and password.')
      return
    }

    try {
      setIsLoading(true)
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/users/login`,
        {
          email: email.trim(),
          password,
        }
      )

      if (res.status === 200) {
        const data = res.data?.data
        setUser(data?.user)
        if (data?.token) {
          localStorage.setItem('token', data.token)
        }
        navigate('/dashboard')
      }
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to sign in. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:flex-row lg:items-center">
        <div className="absolute -top-24 left-10 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

        <section className="relative z-10 flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Welcome Back
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl">
            Your money, organized.
            <span className="block text-emerald-300">
              Continue where you left off.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-300">
            Sign in to track budgets, expenses, and investments with a clear
            snapshot of your financial health.
          </p>
        </section>

        <section className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Sign in</h2>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              Secure
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Access your FinStreet account.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Email
              <input
                type="email"
                placeholder="you@finstreet.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/20"
              />
            </label>

            <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Password
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/20"
              />
            </label>

            {formError ? (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                {formError}
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_16px_30px_rgba(34,197,94,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
            <span>New to FinStreet?</span>
            <Link className="font-semibold text-emerald-300" to="/SignUP">
              Create account
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

export default SignIn
