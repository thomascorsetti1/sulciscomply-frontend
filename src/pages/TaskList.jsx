import { useState, useEffect } from 'react'
import { tasksAPI, clientsAPI } from '../api'

export default function TaskList() {
  const [tasks, setTasks] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    client_id: '',
    descrizione: '',
    stato: 'aperto',
    due_date: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const tasksData = await tasksAPI.getAll()
      const clientsData = await clientsAPI.getAll()
      setTasks(tasksData)
      setClients(clientsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await tasksAPI.create({
        ...formData,
        due_date: formData.due_date || null,
      })
      setFormData({ client_id: '', descrizione: '', stato: 'aperto', due_date: '' })
      setShowForm(false)
      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Sei sicuro di voler eliminare questo task?')) {
      try {
        await tasksAPI.delete(id)
        fetchData()
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const handleStatusChange = async (id, newStato) => {
    try {
      await tasksAPI.update(id, { stato: newStato })
      fetchData()
    } catch (err) {
      setError(err.message)
    }
  }

  const getClientName = (task) => {
    if (task.clients) return task.clients.nome
    const client = clients.find(c => c.id === task.client_id)
    return client ? client.nome : '—'
  }

  const getStatoColor = (stato) => {
    switch (stato) {
      case 'chiuso': return 'bg-green-100 text-green-800'
      case 'in_corso': return 'bg-blue-100 text-blue-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const isOverdue = (task) => {
    if (!task.due_date || task.stato === 'chiuso') return false
    return new Date(task.due_date) < new Date()
  }

  const isDueToday = (task) => {
    if (!task.due_date || task.stato === 'chiuso') return false
    const due = new Date(task.due_date)
    const today = new Date()
    return due.toDateString() === today.toDateString()
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('it-IT')
  }

  const overdueCount = tasks.filter(isOverdue).length
  const dueTodayCount = tasks.filter(isDueToday).length

  if (loading) return <div className="p-8 text-center">Caricamento...</div>

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Task</h1>
          <div className="flex gap-3 mt-2">
            {overdueCount > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full font-medium">
                ⚠ {overdueCount} in ritardo
              </span>
            )}
            {dueTodayCount > 0 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-medium">
                🕐 {dueTodayCount} in scadenza oggi
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Annulla' : 'Nuovo Task'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">Errore: {error}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Aggiungi Nuovo Task</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cliente *</label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
              >
                <option value="">Seleziona un cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descrizione *</label>
              <textarea
                name="descrizione"
                value={formData.descrizione}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
                rows="3"
                placeholder="Es. Verifica documentazione antiriciclaggio"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Stato</label>
                <select
                  name="stato"
                  value={formData.stato}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
                >
                  <option value="aperto">Aperto</option>
                  <option value="in_corso">In corso</option>
                  <option value="chiuso">Chiuso</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Scadenza</label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Salva Task
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Descrizione</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cliente</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Scadenza</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stato</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  Nessun task trovato. Aggiungi il primo task.
                </td>
              </tr>
            )}
            {tasks.map(task => (
              <tr
                key={task.id}
                className={`border-b hover:bg-gray-50 ${isOverdue(task) ? 'bg-red-50' : ''}`}
              >
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    {isOverdue(task) && <span title="In ritardo">🔴</span>}
                    {isDueToday(task) && <span title="Scade oggi">🟠</span>}
                    {task.descrizione}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{getClientName(task)}</td>
                <td className={`px-6 py-4 text-sm font-medium ${isOverdue(task) ? 'text-red-600' : isDueToday(task) ? 'text-orange-600' : 'text-gray-600'}`}>
                  {formatDate(task.due_date)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={task.stato}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`rounded px-2 py-1 text-sm font-medium ${getStatoColor(task.stato)}`}
                  >
                    <option value="aperto">Aperto</option>
                    <option value="in_corso">In corso</option>
                    <option value="chiuso">Chiuso</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
