import React, { createContext, useCallback, useEffect, useState } from 'react'
import axios from 'axios'

export const UserDataContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const refreshUserProfile = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      return Promise.resolve(null)
    }

    setIsLoading(true)
    return axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/v1/users/userProfile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          setUser(response.data?.data ?? null)
        }
      })
      .catch((err) => {
        console.log(err)
        localStorage.removeItem('token')
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    refreshUserProfile()
  }, [refreshUserProfile])

  return (
    <UserDataContext.Provider
      value={{ user, setUser, isLoading, refreshUserProfile }}
    >
      {children}
    </UserDataContext.Provider>
  )
}

export default UserProvider
