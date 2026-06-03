import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { clientsAPI, amlAPI, gdprAPI, tasksAPI, profiliFiscaliAPI } from '../api'

const TAB_LIST = ['Panoramica', 'AML', 'GDPR', 'Profilo Fiscale', 'Task']

const rischioColor = (r) => {
  if (r === 'alto') return 'text-red-600 font-semibold'
  if (r === 'medio') return 'text-yellow-600 font-semibold'
  return 'text-green-600 font-semibold'
}

const statoColor = (s) => {
  if (s === 'chiuso') return 'bg-green-100 text-green-800'
  if (s === 'in_corso') return 'bg-blue-100 text-blue-800'
  return 'bg-yellow-100 text-yellow-800'
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('it-IT') : '—'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('Panoramica')
  const [client, setClient] = useState(null)
  const [aml, setAml] = useState([])
  const [gdpr, setGdpr] = useState([])
  const [tasks, setTasks] = useState([])
  const [fiscale, setFiscale] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showAmlForm, setShowAmlForm] = useState(false)
  const [showGdprForm, setShowGdprForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showFiscaleForm, setShowFiscaleForm] = useState(false)
  const [showEditClient, setShowEditClient] = useState(false)

  const [amlForm, setAmlForm] = useState({ risk_rating: 'basso', ultima_due_diligence: '', scadenza_aggiornamento: '', note: '', stato: 'attivo' })
  const [gdprForm, setGdprForm] = useState({ consensi_ottenuti: false, dpia_effettuata: false, scadenza_aggiornamento: '', categorie_dati: '', note: '', stato: 'attivo' })
  const [taskForm, setTaskForm] = useState({ descrizione: '', stato: 'aperto', due_date: '' })
  const [fiscaleForm, setFiscaleForm] = useState({ regime_fiscale: '', codice_fiscale: '', partita_iva: '', note: '', stato: 'attivo' })
  const [editForm, setEditForm] = useState({ nome: '', email: '', rischi: 'basso', tipo_cliente: '' })

  const oggi = new Date()
  oggi.setHours(0, 0, 0, 0)
  const fraSetteGiorni = new Date(oggi)
  fraSetteGiorni.setDate(oggi.getDate() + 7)

  useEffect(() => { fetchAll() }, [id])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [c, a, g, t, f] = await Promise.all([
        clientsAPI.getById(id),
        amlAPI.getByClient(id),
        gdprAPI.getByClient(id),
        tasksAPI.getByClient(id),
        profiliFiscaliAPI.getByClient(id),
      ])
      setClient(c)
      setEditForm({ nome: c.nome || '', email: c.email || '', rischi: c.rischi || 'basso', tipo_cliente: c.tipo_cliente || '' })
      setAml(Array.isArray(a) ? a : [])
      setGdpr(Array.isArray(g) ? g : [])
      setTasks(Array.isArray(t) ? t : [])
      setFiscale(Array.isArray(f) ? f : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubmit = async () => {
    try {
      await clientsAPI.update(id, editForm)
      setShowEditClient(false)
      fetchAll()
    } catch (err) { setError(err.message) }
  }

  const handleAmlSubmit = async () => {
    try {
      await amlAPI.create({ ...amlForm, client_id: id })
      setShowAmlForm(false)
      setAmlForm({ risk_rating: 'basso', ultima_due_diligence: '', scadenza_aggiornamento: '', note: '', stato: 'attivo' })
      fetchAll()
    } catch (err) { setError(err.message) }
  }

  const handleDeleteAml = async (amlId) => {
    if (confirm('Eliminare questo fascicolo AML?')) {
      try { await amlAPI.delete(amlId); fetchAll() }
      catch (err) { setError(err.message) }
    }
  }

  const handleGdprSubmit = async () => {
    try {
      await gdprAPI.create({ ...gdprForm, client_id: id })
      setShowGdprForm(false)
      setGdprForm({ consensi_ottenuti: false, dpia_effettuata: false, scadenza_aggiornamento: '', categorie_dati: '', note: '', stato: 'attivo' })
      fetchAll()
    } catch (err) { setError(err.message) }
  }

  const handleDeleteGdpr = async (gdprId) => {
    if (confirm('Eliminare questo registro GDPR?')) {
      try { await gdprAPI.delete(gdprId); fetchAll() }
      catch (err) { setError(err.message) }
    }
  }

  const handleTaskSubmit = async () => {
    try {
      await tasksAPI.create({ ...taskForm, client_id: id, due_date: taskForm.due_date || null })
      setShowTaskForm(false)
      setTaskForm({ descrizione: '', stato: 'aperto', due_date: '' })
      fetchAll()
    } catch (err) { setError(err.message) }
  }

  const handleFiscaleSubmit = async () => {
    try {
      await profiliFiscaliAPI.create({ ...fiscaleForm, client_id: id })
      setShowFiscaleForm(false)
      setFiscaleForm({ regime_fiscale: '', codice_fiscale: '', partita_iva: '', note: '', stato: 'attivo' })
      fetchAll()
    } catch (err) { setError(err.message) }
  }

  const handleDeleteFiscale = async (fiscaleId) => {
    if (confirm('Eliminare questo profilo fiscale?')) {
      try { await profiliFiscaliAPI.delete(fiscaleId); fetchAll() }
      catch (err) { setError(err.message) }
    }
  }

  const handleTaskStatus = async (taskId, newStato) => {
    try { await tasksAPI.update(taskId, { stato: newStato }); fetchAll() }
    catch (err) { setError(err.message) }
  }

  const handleDeleteTask = async (taskId) => {
    if (confirm('Eliminare questo task?')) {
      try { await tasksAPI.delete(taskId); fetchAll() }
      catch (err) { setError(err.message) }
    }
  }

  const badgeScadenza = (due_date) => {
    if (!due_date) return null
    const scad = new Date(due_date)
    scad.setHours(0, 0, 0, 0)
    if (scad < oggi) return <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">In ritardo</span>
    if (scad <= fraSetteGiorni) return <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">Scade presto</span>
    return null
  }

  if (loading) return <div className="p-8 text-center">Caricamento...</div>
  if (!client) return <div className="p-8 text-center text-red-600">Cliente non trovato.</div>

  const renderPanoramica = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-900">Dati Cliente</h3>
        <button onClick={() => setShowEditClient(!showEditClient)} className="text-sm text-blue-600 hover:underline">
          {showEditClient ? 'Annulla' : '✏️ Modifica'}
        </button>
      </div>
      {showEditClient && (
        <div className="bg-blue-50 border border-blue-100 rounded p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
              <input type="text" value={editForm.nome} onChange={e => setEditForm(p => ({ ...p, nome: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Livello di Rischio</label>
              <select value={editForm.rischi} onChange={e => setEditForm(p => ({ ...p, rischi: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="basso">Basso</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tipo Cliente</label>
              <select value={editForm.tipo_cliente} onChange={e => setEditForm(p => ({ ...p, tipo_cliente: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="">Seleziona</option>
                <option value="persona_fisica">Persona fisica</option>
                <option value="persona_giuridica">Persona giuridica</option>
              </select>
            </div>
          </div>
          <button onClick={handleEditSubmit} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Salva modifiche</button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded p-4">
          <p className="text-xs text-gray-500 mb-1">Nome</p>
          <p className="font-semibold text-gray-900">{client.nome}</p>
        </div>
        <div className="bg-gray-50 rounded p-4">
          <p className="text-xs text-gray-500 mb-1">Email</p>
          <p className="font-semibold text-gray-900">{client.email || '—'}</p>
        </div>
        <div className="bg-gray-50 rounded p-4">
          <p className="text-xs text-gray-500 mb-1">Livello di Rischio</p>
          <p className={rischioColor(client.rischi)}>{client.rischi ? client.rischi.charAt(0).toUpperCase() + client.rischi.slice(1) : '—'}</p>
        </div>
        <div className="bg-gray-50 rounded p-4">
          <p className="text-xs text-gray-500 mb-1">Creato il</p>
          <p className="font-semibold text-gray-900">{formatDate(client.created_at)}</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-4">
        {[
          { label: 'Fascicoli AML', value: aml.length, color: 'text-blue-600' },
          { label: 'Registri GDPR', value: gdpr.length, color: 'text-purple-600' },
          { label: 'Task', value: tasks.length, color: 'text-yellow-600' },
          { label: 'Profili Fiscali', value: fiscale.length, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border rounded p-4 text-center">
            <p className={'text-2xl font-bold ' + color}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAml = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Fascicoli AML</h3>
        <button onClick={() => setShowAmlForm(!showAmlForm)} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
          {showAmlForm ? 'Annulla' : '+ Nuovo'}
        </button>
      </div>
      {showAmlForm && (
        <div className="bg-gray-50 rounded p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Risk Rating</label>
              <select value={amlForm.risk_rating} onChange={e => setAmlForm(p => ({ ...p, risk_rating: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="basso">Basso</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Stato</label>
              <select value={amlForm.stato} onChange={e => setAmlForm(p => ({ ...p, stato: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="attivo">Attivo</option>
                <option value="scaduto">Scaduto</option>
                <option value="in_revisione">In revisione</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ultima Due Diligence</label>
              <input type="date" value={amlForm.ultima_due_diligence} onChange={e => setAmlForm(p => ({ ...p, ultima_due_diligence: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Scadenza Aggiornamento</label>
              <input type="date" value={amlForm.scadenza_aggiornamento} onChange={e => setAmlForm(p => ({ ...p, scadenza_aggiornamento: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
            <textarea value={amlForm.note} onChange={e => setAmlForm(p => ({ ...p, note: e.target.value }))} rows="2" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <button onClick={handleAmlSubmit} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Salva</button>
        </div>
      )}
      {aml.length === 0 ? (
        <p className="text-gray-400 text-sm py-4">Nessun fascicolo AML.</p>
      ) : (
        <div className="space-y-3">
          {aml.map(a => (
            <div key={a.id} className="border rounded p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <span className={'text-sm font-semibold ' + rischioColor(a.risk_rating)}>Rischio: {a.risk_rating}</span>
                  <span className="ml-3 text-xs bg-gray-100 px-2 py-0.5 rounded">{a.stato}</span>
                </div>
                <button onClick={() => handleDeleteAml(a.id)} className="text-red-500 hover:text-red-700 text-xs">Elimina</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                <span>Ultima DD: {formatDate(a.ultima_due_diligence)}</span>
                <span>Scadenza: {formatDate(a.scadenza_aggiornamento)}</span>
              </div>
              {a.note && <p className="text-xs text-gray-500 mt-2">{a.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderGdpr = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Registri GDPR</h3>
        <button onClick={() => setShowGdprForm(!showGdprForm)} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
          {showGdprForm ? 'Annulla' : '+ Nuovo'}
        </button>
      </div>
      {showGdprForm && (
        <div className="bg-gray-50 rounded p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Categorie Dati</label>
              <input type="text" value={gdprForm.categorie_dati} onChange={e => setGdprForm(p => ({ ...p, categorie_dati: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Es. dati anagrafici, sanitari" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Scadenza Aggiornamento</label>
              <input type="date" value={gdprForm.scadenza_aggiornamento} onChange={e => setGdprForm(p => ({ ...p, scadenza_aggiornamento: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="consensi" checked={gdprForm.consensi_ottenuti} onChange={e => setGdprForm(p => ({ ...p, consensi_ottenuti: e.target.checked }))} />
              <label htmlFor="consensi" className="text-sm text-gray-700">Consensi ottenuti</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="dpia" checked={gdprForm.dpia_effettuata} onChange={e => setGdprForm(p => ({ ...p, dpia_effettuata: e.target.checked }))} />
              <label htmlFor="dpia" className="text-sm text-gray-700">DPIA effettuata</label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
            <textarea value={gdprForm.note} onChange={e => setGdprForm(p => ({ ...p, note: e.target.value }))} rows="2" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <button onClick={handleGdprSubmit} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Salva</button>
        </div>
      )}
      {gdpr.length === 0 ? (
        <p className="text-gray-400 text-sm py-4">Nessun registro GDPR.</p>
      ) : (
        <div className="space-y-3">
          {gdpr.map(g => (
            <div key={g.id} className="border rounded p-4 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 text-xs mb-2">
                  <span className={'px-2 py-0.5 rounded ' + (g.consensi_ottenuti ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                    Consensi: {g.consensi_ottenuti ? 'Sì' : 'No'}
                  </span>
                  <span className={'px-2 py-0.5 rounded ' + (g.dpia_effettuata ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                    DPIA: {g.dpia_effettuata ? 'Sì' : 'No'}
                  </span>
                </div>
                <button onClick={() => handleDeleteGdpr(g.id)} className="text-red-500 hover:text-red-700 text-xs">Elimina</button>
              </div>
              <div className="text-xs text-gray-600">
                <span>Scadenza: {formatDate(g.scadenza_aggiornamento)}</span>
                {g.categorie_dati && <span className="ml-3">Categorie: {g.categorie_dati}</span>}
              </div>
              {g.note && <p className="text-xs text-gray-500 mt-2">{g.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderFiscale = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Profilo Fiscale</h3>
        <button onClick={() => setShowFiscaleForm(!showFiscaleForm)} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
          {showFiscaleForm ? 'Annulla' : '+ Nuovo'}
        </button>
      </div>
      {showFiscaleForm && (
        <div className="bg-gray-50 rounded p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Codice Fiscale</label>
              <input type="text" value={fiscaleForm.codice_fiscale} onChange={e => setFiscaleForm(p => ({ ...p, codice_fiscale: e.target.value.toUpperCase() }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="RSSMRA80A01H501U" maxLength={16} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Partita IVA</label>
              <input type="text" value={fiscaleForm.partita_iva} onChange={e => setFiscaleForm(p => ({ ...p, partita_iva: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="12345678901" maxLength={11} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Regime Fiscale</label>
              <select value={fiscaleForm.regime_fiscale} onChange={e => setFiscaleForm(p => ({ ...p, regime_fiscale: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="">Seleziona</option>
                <option value="ordinario">Ordinario</option>
                <option value="forfettario">Forfettario</option>
                <option value="semplificato">Semplificato</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Stato</label>
              <select value={fiscaleForm.stato} onChange={e => setFiscaleForm(p => ({ ...p, stato: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="attivo">Attivo</option>
                <option value="inattivo">Inattivo</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
            <textarea value={fiscaleForm.note} onChange={e => setFiscaleForm(p => ({ ...p, note: e.target.value }))} rows="2" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </div>
          <button onClick={handleFiscaleSubmit} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Salva</button>
        </div>
      )}
      {fiscale.length === 0 ? (
        <p className="text-gray-400 text-sm py-4">Nessun profilo fiscale.</p>
      ) : (
        <div className="space-y-3">
          {fiscale.map(f => (
            <div key={f.id} className="border rounded p-4 bg-white">
              <div className="flex justify-between items-start">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-xs text-gray-500">CF:</span> <span className="font-mono">{f.codice_fiscale || '—'}</span></div>
                  <div><span className="text-xs text-gray-500">P.IVA:</span> <span className="font-mono">{f.partita_iva || '—'}</span></div>
                  <div><span className="text-xs text-gray-500">Regime:</span> {f.regime_fiscale || '—'}</div>
                  <div><span className="text-xs text-gray-500">Stato:</span> {f.stato || '—'}</div>
                </div>
                <button onClick={() => handleDeleteFiscale(f.id)} className="text-red-500 hover:text-red-700 text-xs">Elimina</button>
              </div>
              {f.note && <p className="text-xs text-gray-500 mt-2">{f.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderTask = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Task</h3>
        <button onClick={() => setShowTaskForm(!showTaskForm)} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
          {showTaskForm ? 'Annulla' : '+ Nuovo'}
        </button>
      </div>
      {showTaskForm && (
        <div className="bg-gray-50 rounded p-4 mb-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Descrizione *</label>
            <textarea value={taskForm.descrizione} onChange={e => setTaskForm(p => ({ ...p, descrizione: e.target.value }))} rows="2" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Es. Verifica documentazione antiriciclaggio" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Stato</label>
              <select value={taskForm.stato} onChange={e => setTaskForm(p => ({ ...p, stato: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="aperto">Aperto</option>
                <option value="in_corso">In corso</option>
                <option value="chiuso">Chiuso</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Scadenza</label>
              <input type="date" value={taskForm.due_date} onChange={e => setTaskForm(p => ({ ...p, due_date: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <button onClick={handleTaskSubmit} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Salva</button>
        </div>
      )}
      {tasks.length === 0 ? (
        <p className="text-gray-400 text-sm py-4">Nessun task.</p>
      ) : (
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} className="border rounded p-3 bg-white flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">{t.descrizione}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-500">Scadenza: {formatDate(t.due_date)}</p>
                  {badgeScadenza(t.due_date)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select value={t.stato} onChange={e => handleTaskStatus(t.id, e.target.value)} className={'rounded px-2 py-1 text-xs font-medium ' + statoColor(t.stato)}>
                  <option value="aperto">Aperto</option>
                  <option value="in_corso">In corso</option>
                  <option value="chiuso">Chiuso</option>
                </select>
                <button onClick={() => handleDeleteTask(t.id)} className="text-red-500 hover:text-red-700 text-xs">Elimina</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <button onClick={() => navigate('/clients')} className="text-blue-600 hover:text-blue-800 text-sm mb-4 flex items-center gap-1">
        ← Torna ai clienti
      </button>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{client.nome}</h1>
          {client.studio && <p className="text-gray-500 mt-1">{client.studio}</p>}
        </div>
        <span className={'text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 ' + rischioColor(client.rischi)}>
          Rischio {client.rischi}
        </span>
      </div>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">Errore: {error}</div>}
      <div className="flex border-b border-gray-200 mb-6">
        {TAB_LIST.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={'px-4 py-2 text-sm font-medium border-b-2 transition ' + (activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700')}>
            {tab}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'Panoramica' && renderPanoramica()}
        {activeTab === 'AML' && renderAml()}
        {activeTab === 'GDPR' && renderGdpr()}
        {activeTab === 'Profilo Fiscale' && renderFiscale()}
        {activeTab === 'Task' && renderTask()}
      </div>
    </div>
  )
}