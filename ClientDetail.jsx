import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { clientsAPI, tasksAPI } from '../api'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({ descrizione: '', stato: 'aperto' })

  useEffect(() => {
    fetchClientDetails()
  }, [id])

  const fetchClientDetails = async () => {
    try {
      setLoading(true)
      const clientData = await clientsAPI.getById(id)
      setClient(clientData)
      const tasksData = await tasksAPI.getAll()
      const clientTasks = Array.isArray(tasksData)
        ? tasksData.filter(t => t.client_id === id)
        : []
      setTasks(clientTasks)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async () => {
    try {
      await tasksAPI.create({ ...taskForm, client_id: id })
      setTaskForm({ descrizione: '', stato: 'aperto' })
      setShowTaskForm(false)
      fetchClientDetails()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (confirm('Eliminare questo task?')) {
      try {
        await tasksAPI.delete(taskId)
        fetchClientDetails()
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const handleStatusChange = async (taskId, newStato) => {
    try {
      await tasksAPI.update(taskId, { stato: newStato })
      fetchClientDetails()
    } catch (err) {
      setError(err.message)
    }
  }

  const rischioColor = (rischio) => {
    if (rischio === 'alto') return 'bg-red-100 text-red-700'
    if (rischio === 'medio') return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  const statoColor = (stato) => {
    if (stato === 'chiuso') return 'bg-green-100 text-green-800'
    if (stato === 'in_corso') return 'bg-blue-100 text-blue-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  if (loading) return <div className="p-8 text-center">Caricamento...</div>

  if (!client) {
    return (
      <div className="p-8">
        <p className="text-red-600">Cliente non trovato</p>
        <button onClick={() => navigate('/clients')} className="mt-4 text-blue-600 hover:text-blue-800">
          ← Torna ai Clienti
        </button>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <button onClick={() => navigate('/clients')} className="mb-6 text-blue-600 hover:text-blue-800">
        ← Torna ai Clienti
      </button>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">Errore: {error}</div>
      )}

      {/* Scheda cliente */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-900">{client.nome}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${rischioColor(client.rischi)}`}>
            Rischio {client.rischi ? client.rischi.charAt(0).toUpperCase() + client.rischi.slice(1) : '—'}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Studio</p>
            <p className="text-lg font-medium text-gray-900">{client.studio || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Creato il</p>
            <p className="text-lg font-medium text-gray-900">
              {new Date(client.created_at).toLocaleDateString('it-IT')}
            </p>
          </div>
        </div>
      </div>

      {/* Task associati */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Task Associati
            <span className="ml-2 text-sm font-normal text-gray-500">({tasks.length})</span>
          </h2>
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
          >
            {showTaskForm ? 'Annulla' : '+ Nuovo Task'}
          </button>
        </div>

        {showTaskForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrizione *</label>
                <textarea
                  value={taskForm.descrizione}
                  onChange={e => setTaskForm(p => ({ ...p, descrizione: e.target.value }))}
                  className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
                  rows="2"
                  placeholder="Es. Verifica documentazione antiriciclaggio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stato</label>
                <select
                  value={taskForm.stato}
                  onChange={e => setTaskForm(p => ({ ...p, stato: e.target.value }))}
                  className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
                >
                  <option value="aperto">Aperto</option>
                  <option value="in_corso">In corso</option>
                  <option value="chiuso">Chiuso</option>
                </select>
              </div>
              <button
                onClick={handleAddTask}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
              >
                Salva Task
              </button>
            </div>
          </div>
        )}

        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-6">Nessun task associato a questo cliente.</p>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="border rounded-lg p-4 flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{task.descrizione}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <select
                    value={task.stato}
                    onChange={e => handleStatusChange(task.id, e.target.value)}
                    className={`rounded px-2 py-1 text-sm font-medium ${statoColor(task.stato)}`}
                  >
                    <option value="aperto">Aperto</option>
                    <option value="in_corso">In corso</option>
                    <option value="chiuso">Chiuso</option>
                  </select>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
