import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ClientList from './pages/ClientList'
import ClientDetail from './pages/ClientDetail'
import TaskList from './pages/TaskList'

function Dashboard() {
  return <div className="p-8 text-3xl font-bold">Dashboard</div>
}

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <div className="w-64 bg-gray-900 text-white shadow-lg relative">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Compliance</h1>
            <p className="text-gray-400 text-sm">Dashboard MVP</p>
          </div>

          <nav className="mt-8 space-y-2">
            <Link to="/" className="block px-6 py-3 hover:bg-gray-800 rounded transition">
              📊 Dashboard
            </Link>
            <Link to="/clients" className="block px-6 py-3 hover:bg-gray-800 rounded transition">
              👥 Clienti
            </Link>
            <Link to="/tasks" className="block px-6 py-3 hover:bg-gray-800 rounded transition">
              ✓ Task
            </Link>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
            <p className="text-xs text-gray-400">© 2024 Compliance Dashboard</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/tasks" element={<TaskList />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App