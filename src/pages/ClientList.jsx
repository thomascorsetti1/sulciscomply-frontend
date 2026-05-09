import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientsAPI } from '../api'

export default function ClientList() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    studio_id: 1,
    name: '',
    address: '',
    tax_id: '',
    fiscal_context: '',
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
      console.error('Error fetching clients:', err)
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
      await clientsAPI.create(formData)
      setFormData({
        studio_id: 1,
        name: '',
        address: '',
        tax_id: '',
        fiscal_context: '',
      })
      setShowForm(false)
      fetchClients()
    } catch (err) {
      setError(err.message)
      console.error('Error creating client:', err)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Sei sicuro di voler eliminare questo cliente?')) {
      try {
        await clientsAPI.delete(id)
        fetchClients()
      } catch (err) {
        setError(err.message)
        console.error('Error deleting client:', err)
      }
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Caricamento...</div>
  }

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Indirizzo</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Codice Fiscale</label>
              <input
                type="text"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contesto Fiscale</label>
              <input
                type="text"
                name="fiscal_context"
                value={formData.fiscal_context}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded border-gray-300 border px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Salva Cliente
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Indirizzo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Codice Fiscale</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{client.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{client.address}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{client.tax_id}</td>
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
