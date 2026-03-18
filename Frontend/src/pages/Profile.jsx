import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserDataContext } from '../context/UserContext'

const Profile = () => {
  const { user } = useContext(UserDataContext)

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-3 text-sm text-slate-600">
          Sign in to see your profile details and personalized dashboards.
        </p>
        <Link
          to="/SignUP"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
        >
          Go to Sign In
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-slate-900">
        {user.fullname ? `${user.fullname.split(' ')[0]}` : 'Your'} Profile
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Manage your account details and preferences.
      </p>

      <div className="mt-8 grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Full name
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {user.fullname || '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Email
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {user.email || '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Savings
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {typeof user.savings === 'number' ? `₹${user.savings}` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Main account
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {typeof user.mainAccountBalance === 'number'
              ? `₹${user.mainAccountBalance}`
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Financial score
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {typeof user.financialScore === 'number'
              ? user.financialScore
              : '—'}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Account status
          </p>
          <p className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Active
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Imported credits
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {Array.isArray(user.mainAccountTransactions)
              ? `${user.mainAccountTransactions.length} transaction(s)`
              : '0 transaction(s)'}
          </p>
          <Link
            to="/main-account"
            className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white"
          >
            View Main Account
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Profile
