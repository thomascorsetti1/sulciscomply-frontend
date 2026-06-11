import { useEffect, useState } from "react";
import { clientsAPI, tasksAPI } from "../api";

const API_BASE = 'https://sulciscomply-api.onrender.com/api';

const SEMAFORO_COLORE = {
  verde: "bg-green-100 text-green-700",
  giallo: "bg-yellow-100 text-yellow-700",
  rosso: "bg-red-100 text-red-700"
};

const SEMAFORO_DOT = {
  verde: "bg-green-500",
  giallo: "bg-yellow-500",
  rosso: "bg-red-500"
};

export default function Report() {
  const [semaforo, setSemaforo] = useState([]);
  const [scadenze, setScadenze] = useState([]);
  const [suggeriti, setSuggeriti] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/report/semaforo`).then(r => r.json()),
      fetch(`${API_BASE}/report/scadenze`).then(r => r.json()),
      fetch(`${API_BASE}/report/task-suggeriti`).then(r => r.json()),
    ]).then(([s, sc, ts]) => {
      setSemaforo(s.data || []);
      setScadenze(sc.data || []);
      setSuggeriti(ts.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const accettaTask = async (t) => {
    try {
      await tasksAPI.create({ client_id: t.client_id, descrizione: t.descrizione, stato: 'aperto', priorita: t.urgenza === 'alta' ? 'alta' : 'media' });
      setSuggeriti(prev => prev.filter(x => x !== t));
      alert(`Task creato: ${t.descrizione}`);
    } catch (err) {
      alert('Errore nella creazione del task');
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('it-IT');
  };

  if (loading) return <div className="p-8 text-center">Caricamento...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
  <div className="flex justify-between items-center mb-8">
    <h1 className="text-4xl font-bold text-gray-900">Report & Rischio</h1>
    <button
      onClick={() => {
        const rows = [['Cliente','Studio','Rischio','Task aperti'], ...semaforo.map(c => [c.nome, c.studio || '', c.semaforo, c.task_aperti])];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'report-rischio.csv'; a.click();
      }}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
    >
      ⬇ Esporta CSV
    </button>
  </div>

      {/* SEMAFORO CLIENTI */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Panoramica Clienti</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cliente</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Studio</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rischio</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Task aperti</th>
            </tr>
          </thead>
          <tbody>
            {semaforo.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nessun cliente</td></tr>
            )}
            {semaforo.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.nome}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{c.studio || '—'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${SEMAFORO_COLORE[c.semaforo]}`}>
                    <span className={`w-2 h-2 rounded-full ${SEMAFORO_DOT[c.semaforo]}`}></span>
                    {c.semaforo}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{c.task_aperti}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SCADENZE IMMINENTI */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Scadenze imminenti (30 giorni)</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tipo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cliente</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Scadenza</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nota</th>
            </tr>
          </thead>
          <tbody>
            {scadenze.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nessuna scadenza nei prossimi 30 giorni</td></tr>
            )}
            {scadenze.map((s, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${s.tipo === 'AML' ? 'bg-purple-100 text-purple-700' : s.tipo === 'GDPR' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {s.tipo}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{s.cliente || '—'}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatDate(s.scadenza)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.nota}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TASK SUGGERITI */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Task suggeriti</h2>
        </div>
        <div className="p-6">
          {suggeriti.length === 0 && (
            <p className="text-gray-500 text-sm">Nessun task suggerito al momento.</p>
          )}
          {suggeriti.map((t, i) => (
            <div key={i} className="flex justify-between items-center p-4 border rounded-lg mb-3 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${t.tipo === 'AML' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {t.tipo}
                </span>
                <span className="text-sm text-gray-900">{t.descrizione}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.urgenza === 'alta' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {t.urgenza}
                </span>
              </div>
              <button
                onClick={() => accettaTask(t)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                Accetta
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
