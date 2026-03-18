import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext'

const Events = () => {
  const { setUser } = useContext(UserDataContext)
  const [event, setEvent] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customName, setCustomName] = useState('')
  const [customDescription, setCustomDescription] = useState('')
  const [customOptions, setCustomOptions] = useState('')
  const [customImpact, setCustomImpact] = useState('')
  const [customLoading, setCustomLoading] = useState(false)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || ''
    return token ? { Authorization: `Bearer ${token}` } : null
  }

  const fetchEvent = async () => {
    const headers = getAuthHeaders()
    if (!headers) {
      setError('Please sign in to view events.')
      return
    }
    setLoading(true)
    setError('')
    setStatus('')
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/events/random`,
        { headers }
      )
      setEvent(res?.data?.data || null)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to load event.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvent()
  }, [])

  const handleOption = async (index) => {
    const headers = getAuthHeaders()
    if (!headers) {
      setError('Please sign in to apply an event.')
      return
    }
    if (!event?._id) return
    setStatus('')
    setError('')
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/events/${event._id}/apply`,
        { optionIndex: index },
        { headers }
      )
      const data = res?.data?.data
      if (data?.user) {
        setUser(data.user)
      }
      setStatus(
        `Impact applied: ${data?.impact >= 0 ? '+' : ''}${data?.impact || 0}`
      )
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to apply event.'
      )
    }
  }

  const handleCreateEvent = async (eventSubmit) => {
    eventSubmit.preventDefault()
    const headers = getAuthHeaders()
    if (!headers) {
      setError('Please sign in to create an event.')
      return
    }
    setError('')
    setStatus('')

    if (!customName.trim() || !customOptions.trim()) {
      setError('Event name and at least one option are required.')
      return
    }

    const payload = {
      eventName: customName.trim(),
      description: customDescription.trim(),
      options: customOptions,
      financialImpact: customImpact === '' ? 0 : Number(customImpact),
    }

    try {
      setCustomLoading(true)
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/events`,
        payload,
        { headers }
      )
      const created = res?.data?.data
      if (created) {
        setEvent(created)
        setStatus('Custom event created.')
        setCustomName('')
        setCustomDescription('')
        setCustomOptions('')
        setCustomImpact('')
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to create event.'
      )
    } finally {
      setCustomLoading(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Events
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
            Real-life scenarios
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Pick an option and see how it impacts your savings.
          </p>
        </header>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-400">Loading event...</p>
          ) : event ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {event.eventName || 'Event'}
                </h2>
                <button
                  onClick={fetchEvent}
                  className="rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200"
                >
                  New event
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-300">
                {event.description || 'No description available.'}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(event.options || []).length ? (
                  event.options.map((option, index) => (
                    <button
                      key={`${option}-${index}`}
                      onClick={() => handleOption(index)}
                      className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-left text-sm text-slate-200 transition hover:-translate-y-0.5 hover:border-emerald-300/40"
                    >
                      {option}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No options available for this event.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-sm text-slate-400">
              <p>No event available.</p>
              <button
                onClick={loadSampleEvent}
                className="mt-4 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-200"
              >
                Add sample event
              </button>
            </div>
          )}

          {status ? (
            <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              {status}
            </div>
          ) : null}
        </section>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Create event</h2>
            <span className="text-xs text-slate-400">Custom scenario</span>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleCreateEvent}>
            <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Event name
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                placeholder="Unexpected medical bill"
              />
            </label>

            <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Description
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="min-h-[96px] rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                placeholder="Describe what happened..."
              />
            </label>

            <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Options (comma separated)
              <input
                value={customOptions}
                onChange={(e) => setCustomOptions(e.target.value)}
                className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                placeholder="Pay in full, Set up installments, Use emergency fund"
              />
            </label>

            <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Financial impact (optional)
              <input
                type="number"
                value={customImpact}
                onChange={(e) => setCustomImpact(e.target.value)}
                className="rounded-xl border border-slate-700/70 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
                placeholder="-1500"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={customLoading}
            >
              {customLoading ? 'Creating...' : 'Create event'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default Events
  const sampleEvents = [
    {
      eventName: 'Emergency car repair',
      description: 'Your car needs urgent repairs this week.',
      options: ['Use emergency fund', 'Delay repair', 'Use credit card'],
    },
    {
      eventName: 'Unexpected bonus',
      description: 'You received a surprise bonus from work.',
      options: ['Save 70%', 'Invest in stocks', 'Pay off debt'],
    },
  ]

  const loadSampleEvent = () => {
    setEvent(sampleEvents[0])
    setStatus('Sample event loaded for demo.')
    setError('')
  }
