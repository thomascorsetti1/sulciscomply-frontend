import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "https://sulciscomply-api.onrender.com/api";

const RISK_COLORS = {
  alto: "#ef4444",
  medio: "#f59e0b",
  basso: "#22c55e",
};

const TASK_STATUS_COLORS = {
  aperto: "bg-blue-100 text-blue-800",
  "in corso": "bg-yellow-100 text-yellow-800",
  chiuso: "bg-green-100 text-green-800",
};

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [aml, setAml] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [clientRes, tasksRes, amlRes] = await Promise.all([
          fetch(`${API_BASE}/clients/${id}`, { headers }),
          fetch(`${API_BASE}/tasks?client_id=${id}`, { headers }),
          fetch(`${API_BASE}/aml/${id}`, { headers }),
        ]);

        if (!clientRes.ok) throw new Error("Cliente non trovato");

        const clientData = await clientRes.json();
        const tasksData = tasksRes.ok ? await tasksRes.json() : [];
        const amlData = amlRes.ok ? await amlRes.json() : null;

        setClient(clientData);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setAml(amlData);
      } catch (err) {
        setError(err.message || "Errore nel caricamento dei dati");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAll();
  }, [id]);

  // Stats task per il mini grafico
  const taskStats = [
    { name: "Aperto", value: tasks.filter((t) => t.stato === "aperto").length },
    { name: "In corso", value: tasks.filter((t) => t.stato === "in corso").length },
    { name: "Chiuso", value: tasks.filter((t) => t.stato === "chiuso").length },
  ].filter((s) => s.value > 0);

  const STAT_COLORS = ["#3b82f6", "#f59e0b", "#22c55e"];

  const taskInRitardo = tasks.filter(
    (t) =>
      t.due_date && new Date(t.due_date) < new Date() && t.stato !== "chiuso"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Caricamento cliente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white rounded-xl shadow p-8 max-w-sm w-full">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Errore</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => navigate("/clients")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Torna ai Clienti
          </button>
        </div>
      </div>
    );
  }

  if (!client) return null;

  const riskLevel = client.livello_rischio?.toLowerCase() || "basso";
  const riskColor = RISK_COLORS[riskLevel] || "#6b7280";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate("/clients")}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Torna indietro"
          >
            ← 
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{client.nome}</h1>
            <p className="text-sm text-gray-400">ID: {client.id}</p>
          </div>
          <span
            className="ml-auto px-3 py-1 rounded-full text-sm font-semibold text-white capitalize"
            style={{ backgroundColor: riskColor }}
          >
            Rischio {riskLevel}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-5xl mx-auto flex gap-6">
          {["overview", "task", "aml"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 capitalize transition ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "overview" ? "Panoramica" : tab === "task" ? "Task" : "AML"}
              {tab === "task" && tasks.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {tasks.length}
                </span>
              )}
              {tab === "task" && taskInRitardo.length > 0 && (
                <span className="ml-1 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                  {taskInRitardo.length} ritardo
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">

        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Anagrafica */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Dati Anagrafici
              </h2>
              <dl className="space-y-3">
                {[
                  { label: "Nome", value: client.nome },
                  { label: "Email", value: client.email },
                  { label: "Telefono", value: client.telefono },
                  { label: "Codice Fiscale", value: client.codice_fiscale },
                  { label: "Indirizzo", value: client.indirizzo },
                  { label: "Tipo Cliente", value: client.tipo },
                  {
                    label: "Data Inserimento",
                    value: client.created_at
                      ? new Date(client.created_at).toLocaleDateString("it-IT")
                      : null,
                  },
                ]
                  .filter((item) => item.value)
                  .map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <dt className="text-gray-400">{label}</dt>
                      <dd className="text-gray-800 font-medium text-right max-w-xs truncate">
                        {value}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>

            {/* Card task summary */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                  <div className="text-3xl font-bold text-blue-600">{tasks.length}</div>
                  <div className="text-xs text-gray-400 mt-1">Task Totali</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                  <div className="text-3xl font-bold text-red-500">{taskInRitardo.length}</div>
                  <div className="text-xs text-gray-400 mt-1">In Ritardo</div>
                </div>
              </div>

              {/* Mini grafico */}
              {taskStats.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Distribuzione Task
                  </h3>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={taskStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {taskStats.map((_, index) => (
                          <Cell key={index} fill={STAT_COLORS[index % STAT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2">
                    {taskStats.map((s, i) => (
                      <div key={s.name} className="flex items-center gap-1 text-xs text-gray-500">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: STAT_COLORS[i % STAT_COLORS.length] }}
                        />
                        {s.name}: {s.value}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AML status card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Stato AML
                </h3>
                {aml ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {aml.aggiornato ? "✅" : "⚠️"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {aml.aggiornato ? "Posizione aggiornata" : "Richiede aggiornamento"}
                      </p>
                      {aml.data_aggiornamento && (
                        <p className="text-xs text-gray-400">
                          Ultimo aggiornamento:{" "}
                          {new Date(aml.data_aggiornamento).toLocaleDateString("it-IT")}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Nessun dato AML disponibile</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: TASK */}
        {activeTab === "task" && (
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
                <p className="text-gray-400">Nessun task associato a questo cliente</p>
              </div>
            ) : (
              tasks.map((task) => {
                const isLate =
                  task.due_date &&
                  new Date(task.due_date) < new Date() &&
                  task.stato !== "chiuso";
                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-xl shadow-sm border p-5 flex items-start justify-between gap-4 ${
                      isLate ? "border-red-200" : "border-gray-100"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isLate && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                            In ritardo
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                            TASK_STATUS_COLORS[task.stato] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {task.stato}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 mt-1 truncate">
                        {task.descrizione}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {task.due_date && (
                        <p className={`text-xs ${isLate ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                          Scadenza:{" "}
                          {new Date(task.due_date).toLocaleDateString("it-IT")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB: AML */}
        {activeTab === "aml" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Dati Anti-Money Laundering
            </h2>
            {aml ? (
              <dl className="space-y-3">
                {Object.entries(aml)
                  .filter(([k]) => k !== "id" && k !== "client_id")
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm border-b border-gray-50 pb-2">
                      <dt className="text-gray-400 capitalize">{key.replace(/_/g, " ")}</dt>
                      <dd className="text-gray-800 font-medium">
                        {typeof value === "boolean"
                          ? value ? "Sì" : "No"
                          : typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/)
                          ? new Date(value).toLocaleDateString("it-IT")
                          : String(value)}
                      </dd>
                    </div>
                  ))}
              </dl>
            ) : (
              <p className="text-gray-400 text-sm">Nessun dato AML disponibile per questo cliente.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
