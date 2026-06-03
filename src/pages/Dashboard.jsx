import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { clientsAPI, tasksAPI, amlAPI, gdprAPI } from '../api'
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const RISCHIO_COLORS = { alto: '#ef4444', medio: '#f59e0b', basso: '#22c55e' }
const STATO_COLORS   = { aperto: '#f59e0b', in_corso: '#3b82f6', chiuso: '#22c55e' }

export default function Dashboard() {
  const [clients, setClients]     = useState([])
  const [tasks, setTasks]         = useState([])
  const [amlFiles, setAmlFiles]   = useState([])
  const [gdprFiles, setGdprFiles] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const [clientsData, tasksData, amlData, gdprData] = await Promise.all([
          clientsAPI.getAll(),
          tasksAPI.getAll(),
          amlAPI.getAll(),
          gdprAPI.getAll(),
        ])
        setClients(clientsData)
        setTasks(tasksData)
        setAmlFiles(amlData)
        setGdprFiles(gdprData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const oggi = new Date()
  oggi.setHours(0, 0, 0, 0)
  const fraSetteGiorni = new Date(oggi)
  fraSetteGiorni.setDate(oggi.getDate() + 7)

  const tasksAperti    = tasks.filter(t => t.stato !== 'chiuso')
  const tasksInRitardo = tasksAperti.filter(t => t.due_date && new Date(t.due_date) < oggi)
  const tasksUrgenti   = tasksAperti
    .filter(t => t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5)

  const clientiAltoRischio = clients.filter(c => c.rischi === 'alto')
  const amlApprovati  = amlFiles.filter(a => a.status === 'Approvato').length
  const gdprApprovati = gdprFiles.filter(g => g.status === 'Approvato').length

  const rischioData = ['alto', 'medio', 'basso']
    .map(r => ({
      name: r.charAt(0).toUpperCase() + r.slice(1),
      value: clients.filter(c => c.rischi === r).length,
      color: RISCHIO_COLORS[r],
    }))
    .filter(d => d.value > 0)

  const statoData = [
    { name: 'Aperto',   value: tasks.filter(t => t.stato === 'aperto').length,   color: STATO_COLORS.aperto },
    { name: 'In corso', value: tasks.filter(t => t.stato === 'in_corso').length, color: STATO_COLORS.in_corso },
    { name: 'Chiuso',   value: tasks.filter(t => t.stato === 'chiuso').length,   color: STATO_COLORS.chiuso },
  ]

  const formatData = (d) =>
    d ? new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

  const badgeRitardo = (due_date) => {
    const scad = new Date(due_date)
    scad.setHours(0, 0, 0, 0)
    if (scad < oggi) return <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">In ritardo</span>
    if (scad <= fraSetteGiorni) return <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full font-medium">Scade presto</span>
    return null
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Caricamento...</div>

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard di Compliance</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">Errore: {error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Clienti Totali</p>
          <p className="text-3xl font-bold text-blue-600">{clients.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Task in Ritardo</p>
          <p className={"text-3xl font-bold " + (tasksInRitardo.length > 0 ? 'text-red-600' : 'text-gray-400')}>
            {tasksInRitardo.length}
          </p>
          {tasksInRitardo.length > 0 && <p className="text-xs text-red-500 mt-1">Attenzione richiesta</p>}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">AML Approvati</p>
          <p className="text-3xl font-bold text-purple-600">{amlApprovati}</p>
          <p className="text-xs text-gray-400 mt-1">su {amlFiles.length} fascicoli</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">GDPR Approvati</p>
          <p className="text-3xl font-bold text-teal-600">{gdprApprovati}</p>
          <p className="text-xs text-gray-400 mt-1">su {gdprFiles.length} registri</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribuzione Rischio Clienti</h2>
          {rischioData.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Nessun cliente presente</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={rischioData} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                  label={({ name, value }) => name + ': ' + value}>
                  {rischioData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, 'Rischio ' + n]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Task per Stato</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Nessun task presente</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statoData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Task" radius={[6, 6, 0, 0]}>
                  {statoData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Prossime Scadenze Task</h2>
            <Link to="/tasks" className="text-xs text-blue-600 hover:underline">Vedi tutti</Link>
          </div>
          {tasksUrgenti.length === 0 ? (
            <p className="text-gray-400 text-center py-6">Nessun task in scadenza</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {tasksUrgenti.map(t => (
                <li key={t.id} className="py-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.descrizione || t.titolo || 'Task #' + t.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Scadenza: {formatData(t.due_date)}</p>
                  </div>
                  <div className="shrink-0">{t.due_date && badgeRitardo(t.due_date)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Clienti ad Alto Rischio</h2>
            <Link to="/clients" className="text-xs text-blue-600 hover:underline">Vedi tutti</Link>
          </div>

cat > src/pages/Dashboard.jsx << 'ENDOFFILE'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { clientsAPI, tasksAPI, amlAPI, gdprAPI } from '../api'
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const RISCHIO_COLORS = { alto: '#ef4444', medio: '#f59e0b', basso: '#22c55e' }
const STATO_COLORS   = { aperto: '#f59e0b', in_corso: '#3b82f6', chiuso: '#22c55e' }

export default function Dashboard() {
  const [clients, setClients]     = useState([])
  const [tasks, setTasks]         = useState([])
  const [amlFiles, setAmlFiles]   = useState([])
  const [gdprFiles, setGdprFiles] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const [clientsData, tasksData, amlData, gdprData] = await Promise.all([
          clientsAPI.getAll(),
          tasksAPI.getAll(),
          amlAPI.getAll(),
          gdprAPI.getAll(),
        ])
        setClients(clientsData)
        setTasks(tasksData)
        setAmlFiles(amlData)
        setGdprFiles(gdprData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const oggi = new Date()
  oggi.setHours(0, 0, 0, 0)
  const fraSetteGiorni = new Date(oggi)
  fraSetteGiorni.setDate(oggi.getDate() + 7)

  const tasksAperti    = tasks.filter(t => t.stato !== 'chiuso')
  const tasksInRitardo = tasksAperti.filter(t => t.due_date && new Date(t.due_date) < oggi)
  const tasksUrgenti   = tasksAperti
    .filter(t => t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5)

  const clientiAltoRischio = clients.filter(c => c.rischi === 'alto')
  const amlApprovati  = amlFiles.filter(a => a.status === 'Approvato').length
  const gdprApprovati = gdprFiles.filter(g => g.status === 'Approvato').length

  const rischioData = ['alto', 'medio', 'basso']
    .map(r => ({
      name: r.charAt(0).toUpperCase() + r.slice(1),
      value: clients.filter(c => c.rischi === r).length,
      color: RISCHIO_COLORS[r],
    }))
    .filter(d => d.value > 0)

  const statoData = [
    { name: 'Aperto',   value: tasks.filter(t => t.stato === 'aperto').length,   color: STATO_COLORS.aperto },
    { name: 'In corso', value: tasks.filter(t => t.stato === 'in_corso').length, color: STATO_COLORS.in_corso },
    { name: 'Chiuso',   value: tasks.filter(t => t.stato === 'chiuso').length,   color: STATO_COLORS.chiuso },
  ]

  const formatData = (d) =>
    d ? new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

  const badgeRitardo = (due_date) => {
    const scad = new Date(due_date)
    scad.setHours(0, 0, 0, 0)
    if (scad < oggi) return <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">In ritardo</span>
    if (scad <= fraSetteGiorni) return <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full font-medium">Scade presto</span>
    return null
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Caricamento...</div>

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard di Compliance</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">Errore: {error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Clienti Totali</p>
          <p className="text-3xl font-bold text-blue-600">{clients.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">Task in Ritardo</p>
          <p className={"text-3xl font-bold " + (tasksInRitardo.length > 0 ? 'text-red-600' : 'text-gray-400')}>
            {tasksInRitardo.length}
          </p>
          {tasksInRitardo.length > 0 && <p className="text-xs text-red-500 mt-1">Attenzione richiesta</p>}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">AML Approvati</p>
          <p className="text-3xl font-bold text-purple-600">{amlApprovati}</p>
          <p className="text-xs text-gray-400 mt-1">su {amlFiles.length} fascicoli</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">GDPR Approvati</p>
          <p className="text-3xl font-bold text-teal-600">{gdprApprovati}</p>
          <p className="text-xs text-gray-400 mt-1">su {gdprFiles.length} registri</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribuzione Rischio Clienti</h2>
          {rischioData.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Nessun cliente presente</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={rischioData} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                  label={({ name, value }) => name + ': ' + value}>
                  {rischioData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, 'Rischio ' + n]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Task per Stato</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Nessun task presente</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statoData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Task" radius={[6, 6, 0, 0]}>
                  {statoData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Prossime Scadenze Task</h2>
            <Link to="/tasks" className="text-xs text-blue-600 hover:underline">Vedi tutti</Link>
          </div>
          {tasksUrgenti.length === 0 ? (
            <p className="text-gray-400 text-center py-6">Nessun task in scadenza</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {tasksUrgenti.map(t => (
                <li key={t.id} className="py-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.descrizione || t.titolo || 'Task #' + t.id}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Scadenza: {formatData(t.due_date)}</p>
                  </div>
                  <div className="shrink-0">{t.due_date && badgeRitardo(t.due_date)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Clienti ad Alto Rischio</h2>
            <Link to="/clients" className="text-xs text-blue-600 hover:underline">Vedi tutti</Link>
          </div>
          {clientiAltoRischio.length === 0 ? (
            <p className="text-gray-400 text-center py-6">Nessun cliente ad alto rischio</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {clientiAltoRischio.map(c => (
                <li key={c.id}>
                  <Link to={'/clients/' + c.id}
                    className="py-3 flex items-center justify-between hover:bg-red-50 -mx-2 px-2 rounded transition">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.nome}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.tipo_cliente || '—'}</p>
                    </div>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium shrink-0">Alto rischio</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
