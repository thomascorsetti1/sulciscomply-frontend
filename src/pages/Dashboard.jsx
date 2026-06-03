import { useState, useEffect } from 'react'
import { clientsAPI, tasksAPI, amlAPI } from '../api'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const RISCHIO_COLORS = {
  alto: '#ef4444',
  medio: '#f59e0b',
  basso: '#22c55e',
}

const STATO_COLORS = {
  aperto: '#f59e0b',
  in_corso: '#3b82f6',
  chiuso: '#22c55e',
}

export default function Dashboard() {
  const [clients, setClients] = useState([])
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({
    totalClients: 0,
    totalTasks: 0,
    tasksOverdue: 0,
    clientsWithUpdatedAML: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const clientsData = await clientsAPI.getAll()
        const tasksData = await tasksAPI.getAll()
        const amlFiles = await amlAPI.getAll()
        const now = new Date()
        const tasksOverdue = tasksData.filter(task => {
          if (!task.due_date) return false
          return new Date(task.due_date) < now && task.stato !== 'chiuso'
        }).length
        const clientsWithAML = amlFiles.filter(aml => aml.status === 'Approvato').length
        setClients(clientsData)
        setTasks(tasksData)
        setStats({
          totalClients: clientsData.length,
          totalTasks: tasksData.length,
          tasksOverdue,
          clientsWithUpdatedAML: clientsWithAML,
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  // Dati per grafico torta rischi clienti
  const rischioData = ['alto', 'medio', 'basso'].map(r => ({
    name: r.charAt(0).toUpperCase() + r.slice(1),
    value: clients.filter(c => c.rischi === r).length,
    color: RISCHIO_COLORS[r],
  })).filter(d => d.value > 0)

  // Dati per grafico barra task per stato
  const statoData = [
    { name: 'Aperto', value: tasks.filter(t => t.stato === 'aperto').length, color: STATO_COLORS.aperto },
    { name: 'In corso', value: tasks.filter(t => t.stato === 'in_corso').length, color: STATO_COLORS.in_corso },
    { name: 'Chiuso', value: tasks.filter(t => t.stato === 'chiuso').length, color: STATO_COLORS.chiuso },
  ]

  if (loading) return <div className="p-8 text-center">Caricamento...</div>

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard di Compliance</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">Errore: {error}</div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Clienti Totali</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalClients}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Task Totali</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalTasks}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Task in Ritardo</h3>
          <p className={`text-3xl font-bold ${stats.tasksOverdue > 0 ? 'text-red-600' : 'text-gray-400'}`}>
            {stats.tasksOverdue}
          </p>
          {stats.tasksOverdue > 0 && <p className="text-xs text-red-500 mt-1">⚠ Attenzione richiesta</p>}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Clienti AML Aggiornati</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.clientsWithUpdatedAML}</p>
        </div>
      </div>

      {/* Grafici */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Torta rischi clienti */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Distribuzione Rischio Clienti</h2>
          {rischioData.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Nessun cliente presente</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={rischioData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {rischioData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, `Rischio ${name}`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Barra task per stato */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Task per Stato</h2>
          {stats.totalTasks === 0 ? (
            <p className="text-gray-400 text-center py-8">Nessun task presente</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statoData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Task" radius={[6, 6, 0, 0]}>
                  {statoData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Panoramica */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Panoramica Studio</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-red-500">{clients.filter(c => c.rischi === 'alto').length}</p>
            <p className="text-sm text-gray-500">Clienti ad alto rischio</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-500">{tasks.filter(t => t.stato === 'in_corso').length}</p>
            <p className="text-sm text-gray-500">Task in corso</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">{tasks.filter(t => t.stato === 'chiuso').length}</p>
            <p className="text-sm text-gray-500">Task completati</p>
          </div>
        </div>
      </div>
    </div>
  )
}
