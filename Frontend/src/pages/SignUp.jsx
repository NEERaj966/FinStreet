import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext'
import GoogleAuthButton from '../componants/GoogleAuthButton'

const SignUP = () => {
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useContext(UserDataContext)

  const handleAuthSuccess = (data) => {
    setUser(data?.user)
    if (data?.token) {
      localStorage.setItem('token', data.token)
    }
    navigate('/')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!fullname.trim() || !email.trim() || !password) {
      setFormError('Please fill in all required fields.')
      return
    }

    if (!email.includes('@')) {
      setFormError('Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }

    if (!accepted) {
      setFormError('Please accept the Terms & Privacy Policy.')
      return
    }

    const NewUser = {
      fullname: fullname.trim(),
      email: email.trim(),
      password,
    }

    try {
      setIsLoading(true)
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/users/register`,
        NewUser
      )

      if (res.status === 201 || res.status === 200) {
        handleAuthSuccess(res.data?.data)
      }
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
        error?.message ||
        'Unable to create account. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }

    setEmail('')
    setPassword('')
    setFullname('')
    setConfirmPassword('')
    setAccepted(false)
  };

  const handleGoogleSignUp = async (credential) => {
    setFormError('')

    try {
      setIsGoogleLoading(true)
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/users/google`,
        { credential }
      )

      if (res.status === 200 || res.status === 201) {
        handleAuthSuccess(res.data?.data)
      }
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to continue with Google right now.'
      )
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:flex-row lg:items-center">
        <div className="absolute -top-24 left-10 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

        <section className="relative z-10 flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            FinStreet Access
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl">
            Build wealth with clarity.
            <span className="block text-emerald-300">Start your plan today.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-300">
            Create your FinStreet account to track budgets, expenses, and
            investments in one clean dashboard. We will help you move from
            confusion to confidence in minutes.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Smart Insights', value: 'AI summaries each week' },
              { label: 'Budget Engine', value: 'Custom category rules' },
              { label: 'Goal Tracker', value: 'Milestones & alerts' },
              { label: 'Secure Sync', value: 'Bank-grade encryption' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-1 text-xs text-slate-400">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Create account</h2>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              New
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Join FinStreet and organize your money flow.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Full name
              <input
                type="text"
                placeholder="Neeraj Sharma"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/20"
              />
            </label>

            <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Email
              <input
                type="email"
                name="email"
                placeholder="you@finstreet.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/20"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/20"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Confirm
                <input
                  type="password"
                  name="confirm"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/20"
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-emerald-400 focus:ring-emerald-400"
              />
              I agree to the Terms & Privacy Policy.
            </label>

            {formError ? (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                {formError}
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_16px_30px_rgba(34,197,94,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-5 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
            <span className="h-px flex-1 bg-slate-800" />
            <span>or</span>
            <span className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="mt-5 flex items-center justify-center">
            <GoogleAuthButton
              text="signup_with"
              disabled={isLoading || isGoogleLoading}
              onCredential={handleGoogleSignUp}
              onError={(message) => setFormError(message)}
            />
            {isGoogleLoading ? (
              <p className="mt-2 text-xs text-slate-400">
                Connecting your Google account...
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
            <span>Already have an account?</span>
            <Link className="font-semibold text-emerald-300" to="/signin">
              Login
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

export default SignUP
