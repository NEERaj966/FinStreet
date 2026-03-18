import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext'

const Logout = () => {
  const navigate = useNavigate()
  const { setUser } = useContext(UserDataContext)
  const [error, setError] = useState('')

  useEffect(() => {
    const doLogout = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/users/logout`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          withCredentials: true,
        })
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Logout failed. Please try again.'
        )
      } finally {
        localStorage.removeItem('token')
        setUser(null)
        setTimeout(() => navigate('/signin'), 600)
      }
    }

    doLogout()
  }, [navigate, setUser])

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">
        Redirecting to sign in...
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        You have been logged out. Taking you to the login page.
      </p>
      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
    </main>
  )
}

export default Logout
