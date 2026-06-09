import { useEffect, useState, useCallback } from "react";
import { auditLogAPI, clientsAPI } from "../api";



const ENTITA_OPTIONS = [
  { value: "", label: "Tutte le entità" },
  { value: "clients", label: "Clienti" },
  { value: "tasks", label: "Task" },
  { value: "aml-fascicoli", label: "AML Fascicoli" },
  { value: "gdpr", label: "GDPR" },
  { value: "profili-fiscali", label: "Profili Fiscali" },
];

const AZIONE_COLORS = {
  CREATE: "bg-emerald-100 text-emerald-800",
  UPDATE: "bg-amber-100 text-amber-800",
  DELETE: "bg-red-100 text-red-800",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DiffViewer({ prev, next }) {
  const [open, setOpen] = useState(false);
  if (!prev && !next) return null;

  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-indigo-600 hover:underline focus:outline-none"
      >
        {open ? "▲ Nascondi dettagli" : "▼ Mostra dettagli"}
      </button>
      {open && (
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {prev && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Prima</p>
              <pre className="text-xs bg-slate-100 rounded p-2 overflow-auto max-h-40 whitespace-pre-wrap">
                {JSON.stringify(prev, null, 2)}
              </pre>
            </div>
          )}
          {next && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Dopo</p>
              <pre className="text-xs bg-slate-100 rounded p-2 overflow-auto max-h-40 whitespace-pre-wrap">
                {JSON.stringify(next, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroEntita, setFiltroEntita] = useState("");

  // Carica lista clienti per il filtro
  useEffect(() => {
    clientsAPI.getAll().then(setClients).catch(() => {});
  }, []);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filtroCliente) params.set("client_id", filtroCliente);
    if (filtroEntita) params.set("entita", filtroEntita);

    auditLogAPI.getAll(params.toString() ? `?${params.toString()}` : '')
      .then(setLogs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filtroCliente, filtroEntita]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Audit Trail</h1>
        <p className="text-sm text-slate-500 mt-1">
          Storico di tutte le modifiche registrate nel sistema.
        </p>
      </div>

      {/* Filtri */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Tutti i clienti</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.ragione_sociale || c.nome || c.id}
            </option>
          ))}
        </select>

        <select
          value={filtroEntita}
          onChange={(e) => setFiltroEntita(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {ENTITA_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <button
          onClick={fetchLogs}
          className="sm:ml-auto px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Aggiorna
        </button>
      </div>

      {/* Stato */}
      {loading && (
        <div className="text-center py-16 text-slate-400 text-sm">
          Caricamento in corso…
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {!loading && !error && logs.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm">
          Nessun log trovato per i filtri selezionati.
        </div>
      )}

      {/* Tabella log */}
      {!loading && logs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Data</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Azione</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Entità</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Dettagli</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={log.id}
                  className={`border-b border-slate-100 ${
                    i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                  } hover:bg-indigo-50/40 transition-colors`}
                >
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {formatDate(log.creato_a)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        AZIONE_COLORS[log.azione] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {log.azione}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 capitalize">
                    {log.entita?.replace("-", " ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {log.client_id
                      ? clients.find((c) => c.id === log.client_id)?.ragione_sociale ||
                        log.client_id
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <DiffViewer prev={log.dati_precedenti} next={log.dati_nuovi} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contatore */}
      {!loading && logs.length > 0 && (
        <p className="text-xs text-slate-400 mt-3 text-right">
          {logs.length} record mostrati
        </p>
      )}
    </div>
  );
}
