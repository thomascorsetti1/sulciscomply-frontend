import { useState, useEffect, useCallback, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { supabase } from './supabase'
import Dashboard from './pages/Dashboard'
import ClientList from './pages/ClientList'
import ClientDetail from './pages/ClientDetail'
import TaskList from './pages/TaskList'
import Login from './pages/Login'

import AuditTrail from './pages/AuditTrail'
import Report from './pages/Report'

const API_BASE = 'https://sulciscomply-api.onrender.com/api'
const GIORNI_PREAVVISO = 7

function Sidebar({ onLogout, userEmail, taskInRitardo }) {
  const location = useLocation()
  const linkClass = (path) =>
    `flex items-center justify-between px-6 py-3 rounded transition ${
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
        <Link to="/" className={linkClass('/')}>
          <span>📊 Dashboard</span>
        </Link>
        <Link to="/clients" className={linkClass('/clients')}>
          <span>👥 Clienti</span>
        </Link>
        <Link to="/tasks" className={linkClass('/tasks')}>
          <span>✓ Task</span>
          {taskInRitardo > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
              {taskInRitardo}
            </span>
          )}
        </Link>
        <Link to="/calendario" className={linkClass('/calendario')}>
        
        </Link>
        <Link to="/audit-trail" className={linkClass('/audit-trail')}>
          <span>🔍 Audit Trail</span>
        </Link>
        <Link to="/report" className={linkClass('/report')}>
          <span>📈 Report</span>
        </Link>
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

function NotificationBell({ notifiche }) {
  const [aperto, setAperto] = useState(false)
  const ref = useRef(null)

  const ritardo = notifiche.filter((n) => n.tipo === 'ritardo')
  const scadenza = notifiche.filter((n) => n.tipo === 'scadenza')
  const totale = notifiche.length

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setAperto(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAperto(!aperto)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
        title="Notifiche"
      >
        <span className="text-xl">🔔</span>
        {totale > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {totale > 9 ? '9+' : totale}
          </span>
        )}
      </button>

      {aperto && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Notifiche</h3>
            {totale === 0 && (
              <span className="text-xs text-gray-400">Nessuna notifica</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {totale === 0 ? (
              <div className="px-4 py-6 text-center">
                <span className="text-3xl">✅</span>
                <p className="text-sm text-gray-400 mt-2">Tutto in ordine</p>
              </div>
            ) : (
              <>
                {ritardo.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-red-50 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                      <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                        In ritardo ({ritardo.length})
                      </span>
                    </div>
                    {ritardo.map((n) => (
                      <div key={n.id} className="px-4 py-3 border-b border-gray-50 hover:bg-red-50 transition">
                        <p className="text-sm text-gray-800 font-medium">{n.descrizione}</p>
                        <p className="text-xs text-red-500 mt-0.5">
                          Scaduto il {new Date(n.due_date).toLocaleDateString('it-IT')}
                          {n.cliente && ` · ${n.cliente}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {scadenza.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-yellow-50 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                      <span className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">
                        In scadenza ({scadenza.length})
                      </span>
                    </div>
                    {scadenza.map((n) => (
                      <div key={n.id} className="px-4 py-3 border-b border-gray-50 hover:bg-yellow-50 transition">
                        <p className="text-sm text-gray-800 font-medium">{n.descrizione}</p>
                        <p className="text-xs text-yellow-600 mt-0.5">
                          Scade il {new Date(n.due_date).toLocaleDateString('it-IT')}
                          {n.cliente && ` · ${n.cliente}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {totale > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <Link
                to="/tasks"
                onClick={() => setAperto(false)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Vai a tutti i task →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Header({ notifiche, userEmail }) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end gap-4">
      <span className="text-xs text-gray-400 hidden sm:block">{userEmail}</span>
      <NotificationBell notifiche={notifiche} />
    </div>
  )
}

function AppLayout({ session }) {
  const [taskInRitardo, setTaskInRitardo] = useState(0)
  const [notifiche, setNotifiche] = useState([])

  const fetchTasks = useCallback(async () => {
    try {
      const { data: { session: s } } = await supabase.auth.getSession()
      const token = s?.access_token
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const [resTasks, resAml, resGdpr] = await Promise.all([
        fetch(`${API_BASE}/tasks`, { headers }),
        fetch(`${API_BASE}/aml-fascicoli`, { headers }),
        fetch(`${API_BASE}/gdpr`, { headers }),
      ])

      const [jsonTasks, jsonAml, jsonGdpr] = await Promise.all([
        resTasks.json(),
        resAml.json(),
        resGdpr.json(),
      ])

      const oggi = new Date()
      oggi.setHours(0, 0, 0, 0)
      const fraXGiorni = new Date(oggi)
      fraXGiorni.setDate(fraXGiorni.getDate() + GIORNI_PREAVVISO)

      const nuoveNotifiche = []

      // Task
      const tasks = jsonTasks.data || []
      tasks.forEach((t) => {
        if (!t.due_date || t.stato === 'chiuso') return
        const scadenza = new Date(t.due_date)
        scadenza.setHours(0, 0, 0, 0)
        const cliente = t.clients?.nome || null
        if (scadenza < oggi) {
          nuoveNotifiche.push({ ...t, tipo: 'ritardo', cliente, categoria: 'Task' })
        } else if (scadenza <= fraXGiorni) {
          nuoveNotifiche.push({ ...t, tipo: 'scadenza', cliente, categoria: 'Task' })
        }
      })

      // AML
      const amlList = jsonAml.data || []
      amlList.forEach((a) => {
        if (!a.scadenza_aggiornamento) return
        const scadenza = new Date(a.scadenza_aggiornamento)
        scadenza.setHours(0, 0, 0, 0)
        const cliente = a.clients?.nome || null
        const item = { id: a.id, descrizione: `AML: aggiorna fascicolo`, due_date: a.scadenza_aggiornamento, cliente }
        if (scadenza < oggi) {
          nuoveNotifiche.push({ ...item, tipo: 'ritardo', categoria: 'AML' })
        } else if (scadenza <= fraXGiorni) {
          nuoveNotifiche.push({ ...item, tipo: 'scadenza', categoria: 'AML' })
        }
      })

      // GDPR
      const gdprList = jsonGdpr.data || []
      gdprList.forEach((g) => {
        if (!g.scadenza_aggiornamento) return
        const scadenza = new Date(g.scadenza_aggiornamento)
        scadenza.setHours(0, 0, 0, 0)
        const cliente = g.clients?.nome || null
        const item = { id: g.id, descrizione: `GDPR: aggiorna registro`, due_date: g.scadenza_aggiornamento, cliente }
        if (scadenza < oggi) {
          nuoveNotifiche.push({ ...item, tipo: 'ritardo', categoria: 'GDPR' })
        } else if (scadenza <= fraXGiorni) {
          nuoveNotifiche.push({ ...item, tipo: 'scadenza', categoria: 'GDPR' })
        }
      })

      nuoveNotifiche.sort((a, b) => {
        if (a.tipo === b.tipo) return new Date(a.due_date) - new Date(b.due_date)
        return a.tipo === 'ritardo' ? -1 : 1
      })

      setNotifiche(nuoveNotifiche)
      setTaskInRitardo(nuoveNotifiche.filter((n) => n.tipo === 'ritardo').length)
    } catch {
      // silenzioso
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchTasks])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        onLogout={handleLogout}
        userEmail={session.user.email}
        taskInRitardo={taskInRitardo}
      />
      <div className="flex-1 overflow-auto flex flex-col">
        <Header notifiche={notifiche} userEmail={session.user.email} />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/tasks" element={<TaskList />} />
      
            <Route path="/audit-trail" element={<AuditTrail />} />
            <Route path="/report" element={<Report />} />
          </Routes>
        </div>
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
