import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { clientsAPI, amlAPI, gdprAPI, tasksAPI } from '../api'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [amlFiles, setAmlFiles] = useState([])
  const [gdprRegisters, setGdprRegisters] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchClientDetails()
  }, [id])

  const fetchClientDetails = async () => {
    try {
      setLoading(true)
      const data = await clientsAPI.getById(id)
      setClient(data.client)
      setAmlFiles(data.aml || [])
      setGdprRegisters(data.gdpr || [])
      setTasks(data.tasks || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching client details:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Caricamento...</div>
  }

  if (!client) {
    return (
      <div className="p-8">
        <p className="text-red-600">Cliente non trovato</p>
        <button
          onClick={() => navigate('/clients')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Torna ai Clienti
        </button>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate('/clients')}
        className="mb-6 text-blue-600 hover:text-blue-800"
      >
        ← Torna ai Clienti
      </button>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          Errore: {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{client.name}</h1>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Indirizzo</p>
            <p className="text-lg font-medium text-gray-900">{client.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Codice Fiscale</p>
            <p className="text-lg font-medium text-gray-900">{client.tax_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Contesto Fiscale</p>
            <p className="text-lg font-medium text-gray-900">{client.fiscal_context}</p>
          </div>
        </div>
      </div>

      {/* AML Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">File AML</h2>
        {amlFiles.length === 0 ? (
          <p className="text-gray-600">Nessun file AML presente</p>
        ) : (
          <div className="space-y-3">
            {amlFiles.map(aml => (
              <div key={aml.id} className="border rounded p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Status: <span className="font-medium">{aml.status}</span></p>
                    <p className="text-sm text-gray-600">Risk Rating: <span className="font-medium">{aml.risk_rating}</span></p>
                  </div>
                  <p className="text-xs text-gray-500">Aggiornato: {new Date(aml.last_updated).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GDPR Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Registri GDPR</h2>
        {gdprRegisters.length === 0 ? (
          <p className="text-gray-600">Nessun registro GDPR presente</p>
        ) : (
          <div className="space-y-3">
            {gdprRegisters.map(gdpr => (
              <div key={gdpr.id} className="border rounded p-4">
                <p className="text-sm text-gray-600">Interessato: <span className="font-medium">{gdpr.data_subject_name}</span></p>
                <p className="text-sm text-gray-600">Categoria Dati: <span className="font-medium">{gdpr.data_category}</span></p>
                <p className="text-sm text-gray-600">Scopo: <span className="font-medium">{gdpr.processing_purpose}</span></p>
                <p className="text-sm text-gray-600">Status GDPR: <span className="font-medium">{gdpr.gdpr_status}</span></p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Task Associati</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-600">Nessun task associato</p>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{task.description}</p>
                    <p className="text-sm text-gray-600">Status: <span className="font-medium">{task.status}</span></p>
                    {task.due_date && (
                      <p className="text-sm text-gray-600">Scadenza: <span className="font-medium">{new Date(task.due_date).toLocaleDateString()}</span></p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
