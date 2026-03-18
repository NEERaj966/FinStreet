import React, { useContext } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './componants/Navbar'
import { UserDataContext } from './context/UserContext'
import Budget from './pages/Budget'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Expenses from './pages/Expenses'
import Home from './pages/Home'
import Investments from './pages/Investments'
import Learn from './pages/Learn'
import MainAccount from './pages/MainAccount'
import Logout from './pages/Logout'
import Profile from './pages/Profile'
import SignIn from './pages/SignIn'
import SignUP from './pages/SignUp'

const App = () => {
  const { user } = useContext(UserDataContext)

  const RequireAuth = ({ children }) => {
    if (!user) {
      return <Navigate to="/signin" replace />
    }
    return children
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route
            path="/main-account"
            element={
              <RequireAuth>
                <MainAccount />
              </RequireAuth>
            }
          />
          <Route path="/events" element={<Events />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/learn" element={<Learn />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/logout"
            element={
              <RequireAuth>
                <Logout />
              </RequireAuth>
            }
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/profile" replace /> : <SignUP />}
          />
          <Route
            path="/signin"
            element={user ? <Navigate to="/profile" replace /> : <SignIn />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
