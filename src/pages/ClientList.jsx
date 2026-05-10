import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientsAPI } from '../api'

export default function ClientList() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    studio: '',
    rischi: 'basso',
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const data = await clientsAPI.getAll()
      setClients(data)
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
      await clientsAPI.create(formData)
      setFormData({ nome: '', studio: '', rischi: 'basso' })
      setShowForm(false)
      fetchClients()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Sei sicuro di voler eliminare questo cliente?')) {
      try {
        await clientsAPI.delete(id)
        fetchClients()
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const rischioColor = (rischio) => {
    if (rischio === 'alto') return 'text-red-600 font-semibold'
    if (rischio === 'medio') return 'text-yellow-600 font-semibold'
    return 'text-green-600 font-semibold'
  }

  if (loading) return <div className="p-8 text-center">Caricamento...</div>

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Clienti</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Annulla' : 'Nuovo Cliente'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          Errore: {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Aggiungi Nuovo Cliente</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome *</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
                placeholder="Es. Mario Rossi Srl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Studio</label>
              <input
                type="text"
                name="studio"
                value={formData.studio}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
                placeholder="Es. Studio Bianchi & Associati"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Livello di Rischio</label>
              <select
                name="rischi"
                value={formData.rischi}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
              >
                <option value="basso">Basso</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
              </select>
            </div>
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Salva Cliente
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Studio</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rischio</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  Nessun cliente trovato. Aggiungi il primo cliente.
                </td>
              </tr>
            )}
            {clients.map(client => (
              <tr key={client.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{client.nome}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{client.studio || '—'}</td>
                <td className={`px-6 py-4 text-sm ${rischioColor(client.rischi)}`}>
                  {client.rischi ? client.rischi.charAt(0).toUpperCase() + client.rischi.slice(1) : '—'}
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Dettagli
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
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
