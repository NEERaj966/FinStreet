import React, { useEffect, useRef, useState } from 'react'

const GOOGLE_SCRIPT_ID = 'google-identity-services'

const loadGoogleScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID)
    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Unable to load Google sign-in.')),
        { once: true }
      )
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Unable to load Google sign-in.'))
    document.head.appendChild(script)
  })

const GoogleAuthButton = ({
  text = 'continue_with',
  onCredential,
  onError,
  disabled = false,
}) => {
  const containerRef = useRef(null)
  const [buttonError, setButtonError] = useState('')
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    let isMounted = true

    if (!clientId) {
      setButtonError('Google sign-in is not configured yet.')
      return () => {}
    }

    loadGoogleScript()
      .then(() => {
        if (
          !isMounted ||
          !containerRef.current ||
          !window.google?.accounts?.id
        ) {
          return
        }

        setButtonError('')
        containerRef.current.innerHTML = ''

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => {
            if (!credential) {
              const errorMessage = 'Google sign-in did not return a credential.'
              setButtonError(errorMessage)
              onError?.(errorMessage)
              return
            }

            onCredential?.(credential)
          },
        })

        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'pill',
          width: 360,
        })
      })
      .catch((error) => {
        if (!isMounted) return
        const errorMessage =
          error?.message || 'Unable to load Google sign-in right now.'
        setButtonError(errorMessage)
        onError?.(errorMessage)
      })

    return () => {
      isMounted = false
    }
  }, [clientId, onCredential, onError, text])

  return (
    <div className="space-y-2">
      <div
        className={`flex min-h-[44px] items-center justify-center rounded-full border border-slate-700/70 bg-slate-950/40 px-2 py-1 ${
          disabled ? 'pointer-events-none opacity-60' : ''
        }`}
      >
        <div ref={containerRef} className="w-full" />
      </div>
      {buttonError ? (
        <p className="text-xs text-slate-500">{buttonError}</p>
      ) : null}
    </div>
  )
}

export default GoogleAuthButton
