import { useState, useEffect } from 'react'
import { clientsAPI, tasksAPI, amlAPI } from '../api'

export default function Dashboard() {
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
        const clients = await clientsAPI.getAll()
        const tasks = await tasksAPI.getAll()
        const amlFiles = await amlAPI.getAll()

        const now = new Date()
        const tasksOverdue = tasks.filter(task => {
          if (!task.due_date) return false
          return new Date(task.due_date) < now && task.status !== 'Completato'
        }).length

        const clientsWithAML = amlFiles.filter(aml => aml.status === 'Approvato').length

        setStats({
          totalClients: clients.length,
          totalTasks: tasks.length,
          tasksOverdue,
          clientsWithUpdatedAML: clientsWithAML,
        })
      } catch (err) {
        setError(err.message)
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="p-8 text-center">Caricamento...</div>
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard di Compliance</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          Errore: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* KPI Card 1: Total Clients */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Clienti Totali</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalClients}</p>
        </div>

        {/* KPI Card 2: Total Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Task Totali</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalTasks}</p>
        </div>

        {/* KPI Card 3: Overdue Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Task in Ritardo</h3>
          <p className="text-3xl font-bold text-red-600">{stats.tasksOverdue}</p>
        </div>

        {/* KPI Card 4: Clients with Updated AML */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Clienti AML Aggiornati</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.clientsWithUpdatedAML}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Panoramica Studio</h2>
        <p className="text-gray-600">
          Benvenuto nella dashboard di compliance. Utilizza il menu di navigazione per gestire clienti, file AML, registri GDPR e task.
        </p>
      </div>
    </div>
  )
}
