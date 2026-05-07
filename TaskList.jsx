import { useState, useEffect } from 'react'
import { tasksAPI, usersAPI } from '../api'

export default function TaskList() {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    assigned_to_user_id: '',
    client_id: '',
    description: '',
    due_date: '',
    status: 'In corso',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const tasksData = await tasksAPI.getAll()
      const usersData = await usersAPI.getAll()
      setTasks(tasksData)
      setUsers(usersData)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await tasksAPI.create(formData)
      setFormData({
        assigned_to_user_id: '',
        client_id: '',
        description: '',
        due_date: '',
        status: 'In corso',
      })
      setShowForm(false)
      fetchData()
    } catch (err) {
      setError(err.message)
      console.error('Error creating task:', err)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Sei sicuro di voler eliminare questo task?')) {
      try {
        await tasksAPI.delete(id)
        fetchData()
      } catch (err) {
        setError(err.message)
        console.error('Error deleting task:', err)
      }
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      const task = tasks.find(t => t.id === id)
      await tasksAPI.update(id, { ...task, status: newStatus })
      fetchData()
    } catch (err) {
      setError(err.message)
      console.error('Error updating task:', err)
    }
  }

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    return user ? user.username : 'Sconosciuto'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completato':
        return 'bg-green-100 text-green-800'
      case 'In corso':
        return 'bg-blue-100 text-blue-800'
      case 'In attesa':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Caricamento...</div>
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Task</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Annulla' : 'Nuovo Task'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          Errore: {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Aggiungi Nuovo Task</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Assegnato a</label>
              <select
                name="assigned_to_user_id"
                value={formData.assigned_to_user_id}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
              >
                <option value="">Seleziona un utente</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descrizione</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Scadenza</label>
              <input
                type="datetime-local"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
              >
                <option value="In corso">In corso</option>
                <option value="Completato">Completato</option>
                <option value="In attesa">In attesa</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Salva Task
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Descrizione</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Assegnato a</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Scadenza</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{task.description}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{getUserName(task.assigned_to_user_id)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`rounded px-2 py-1 text-sm font-medium ${getStatusColor(task.status)}`}
                  >
                    <option value="In corso">In corso</option>
                    <option value="Completato">Completato</option>
                    <option value="In attesa">In attesa</option>
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
