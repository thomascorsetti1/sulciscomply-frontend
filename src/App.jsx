import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { supabase } from './supabase'
import Dashboard from './pages/Dashboard'
import ClientList from './pages/ClientList'
import ClientDetail from './pages/ClientDetail'
import TaskList from './pages/TaskList'
import Login from './pages/Login'

function Sidebar({ onLogout, userEmail }) {
  const location = useLocation()

  const linkClass = (path) =>
    `block px-6 py-3 rounded transition ${
      location.pathname === path
        ? 'bg-blue-600 text-white'
        : 'hover:bg-gray-800 text-gray-300'
    }`

  return (
    <div className="w-64 bg-gray-900 text-white shadow-lg flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">Compliance</h1>
        <p className="text-gray-400 text-sm">Dashboard MVP</p>
      </div>
      <nav className="mt-4 space-y-1 flex-1">
        <Link to="/" className={linkClass('/')}>📊 Dashboard</Link>
        <Link to="/clients" className={linkClass('/clients')}>👥 Clienti</Link>
        <Link to="/tasks" className={linkClass('/tasks')}>✓ Task</Link>
      </nav>
      <div className="p-6 border-t border-gray-800">
        <p className="text-xs text-gray-400 mb-2 truncate">{userEmail}</p>
        <button
          onClick={onLogout}
          className="w-full text-sm text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-2 rounded transition text-left"
        >
          🚪 Esci
        </button>
        <p className="text-xs text-gray-600 mt-3">© 2024 Compliance Dashboard</p>
      </div>
    </div>
  )
}

function AppLayout({ session }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onLogout={handleLogout} userEmail={session.user.email} />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/tasks" element={<TaskList />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Caricamento...</p>
      </div>
    )
  }

  return (
    <Router>
      {session ? <AppLayout session={session} /> : <Login />}
    </Router>
  )
}

export default App
