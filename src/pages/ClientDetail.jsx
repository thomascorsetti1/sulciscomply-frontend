import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const API_BASE = "https://sulciscomply-api.onrender.com/api";

const RISK_COLORS = {
  alto: "#ef4444",
  medio: "#f59e0b",
  basso: "#22c55e",
};

const TASK_STATUS_COLORS = {
  aperto: "bg-blue-100 text-blue-800",
  in_corso: "bg-yellow-100 text-yellow-800",
  chiuso: "bg-green-100 text-green-800",
};

const TASK_STATUS_LABELS = {
  aperto: "Aperto",
  in_corso: "In corso",
  chiuso: "Chiuso",
};

const emptyForm = { descrizione: "", stato: "aperto", due_date: "" };

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [aml, setAml] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    return token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getHeaders();
      const plainHeaders = { Authorization: headers.Authorization };

      const [clientRes, tasksRes, amlRes] = await Promise.all([
        fetch(`${API_BASE}/clients/${id}`, { headers: plainHeaders }),
        fetch(`${API_BASE}/tasks?client_id=${id}`, { headers: plainHeaders }),
        fetch(`${API_BASE}/aml-fascicoli?client_id=${id}`, { headers: plainHeaders }),
      ]);

      if (!clientRes.ok) throw new Error("Cliente non trovato");

      const clientJson = await clientRes.json();
      const tasksJson = tasksRes.ok ? await tasksRes.json() : { data: [] };
      const amlJson = amlRes.ok ? await amlRes.json() : { data: null };

      setClient(clientJson.data);
      setTasks(Array.isArray(tasksJson.data) ? tasksJson.data : []);
      setAml(amlJson.data?.[0] || null);
    } catch (err) {
      setError(err.message || "Errore nel caricamento dei dati");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAll();
  }, [id]);

  // ─── EXPORT PDF ───────────────────────────────────────────────
  const exportPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("it-IT");

    // Intestazione
    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175);
    doc.text("SulcisComply", 14, 18);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Scheda Cliente — ${today}`, 14, 26);
    doc.setDrawColor(200);
    doc.line(14, 30, 196, 30);

    // Dati anagrafici
    doc.setFontSize(13);
    doc.setTextColor(30);
    doc.text("Dati Anagrafici", 14, 40);

    const anagrafica = [
      ["Nome", client.nome || "—"],
      ["Email", client.email || "—"],
      ["Telefono", client.telefono || "—"],
      ["Codice Fiscale", client.codice_fiscale || "—"],
      ["Indirizzo", client.indirizzo || "—"],
      ["Tipo Cliente", client.tipo || "—"],
      ["Livello Rischio", (client.rischi || "—").toUpperCase()],
      ["Data Inserimento", client.created_at ? new Date(client.created_at).toLocaleDateString("it-IT") : "—"],
    ];

    autoTable(doc, {
      startY: 44,
      head: [["Campo", "Valore"]],
      body: anagrafica,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 64, 175] },
      alternateRowStyles: { fillColor: [239, 246, 255] },
    });

    // Task
    const afterAnagrafica = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setTextColor(30);
    doc.text("Task", 14, afterAnagrafica);

    if (tasks.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text("Nessun task presente.", 14, afterAnagrafica + 8);
    } else {
      const taskRows = tasks.map((t) => [
        t.descrizione || "—",
        TASK_STATUS_LABELS[t.stato] || t.stato,
        t.due_date ? new Date(t.due_date).toLocaleDateString("it-IT") : "—",
        t.due_date && new Date(t.due_date) < new Date() && t.stato !== "chiuso" ? "Sì" : "No",
      ]);

      autoTable(doc, {
        startY: afterAnagrafica + 4,
        head: [["Descrizione", "Stato", "Scadenza", "In Ritardo"]],
        body: taskRows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 64, 175] },
        alternateRowStyles: { fillColor: [239, 246, 255] },
      });
    }

    // AML
    if (aml) {
      const afterTasks = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : afterAnagrafica + 30;
      doc.setFontSize(13);
      doc.setTextColor(30);
      doc.text("Dati AML", 14, afterTasks);

      const amlRows = Object.entries(aml)
        .filter(([k]) => k !== "id" && k !== "client_id")
        .map(([key, value]) => [
          key.replace(/_/g, " "),
          typeof value === "boolean"
            ? value ? "Sì" : "No"
            : typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/)
            ? new Date(value).toLocaleDateString("it-IT")
            : String(value ?? "—"),
        ]);

      autoTable(doc, {
        startY: afterTasks + 4,
        head: [["Campo", "Valore"]],
        body: amlRows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 64, 175] },
        alternateRowStyles: { fillColor: [239, 246, 255] },
      });
    }

    const nomeFile = (client.nome || "cliente").replace(/\s+/g, "_");
    doc.save(`${nomeFile}_scheda.pdf`);
  };

  // ─── EXPORT EXCEL ─────────────────────────────────────────────
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Foglio 1: Anagrafica
    const anagrafica = [
      ["Campo", "Valore"],
      ["Nome", client.nome || ""],
      ["Email", client.email || ""],
      ["Telefono", client.telefono || ""],
      ["Codice Fiscale", client.codice_fiscale || ""],
      ["Indirizzo", client.indirizzo || ""],
      ["Tipo Cliente", client.tipo || ""],
      ["Livello Rischio", client.rischi || ""],
      ["Data Inserimento", client.created_at ? new Date(client.created_at).toLocaleDateString("it-IT") : ""],
    ];
    const wsAnagrafica = XLSX.utils.aoa_to_sheet(anagrafica);
    XLSX.utils.book_append_sheet(wb, wsAnagrafica, "Anagrafica");

    // Foglio 2: Task
    const taskData = [["Descrizione", "Stato", "Scadenza", "In Ritardo"]];
    tasks.forEach((t) => {
      taskData.push([
        t.descrizione || "",
        TASK_STATUS_LABELS[t.stato] || t.stato,
        t.due_date ? new Date(t.due_date).toLocaleDateString("it-IT") : "",
        t.due_date && new Date(t.due_date) < new Date() && t.stato !== "chiuso" ? "Sì" : "No",
      ]);
    });
    const wsTasks = XLSX.utils.aoa_to_sheet(taskData);
    XLSX.utils.book_append_sheet(wb, wsTasks, "Task");

    // Foglio 3: AML
    if (aml) {
      const amlData = [["Campo", "Valore"]];
      Object.entries(aml)
        .filter(([k]) => k !== "id" && k !== "client_id")
        .forEach(([key, value]) => {
          amlData.push([
            key.replace(/_/g, " "),
            typeof value === "boolean"
              ? value ? "Sì" : "No"
              : typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/)
              ? new Date(value).toLocaleDateString("it-IT")
              : String(value ?? ""),
          ]);
        });
      const wsAml = XLSX.utils.aoa_to_sheet(amlData);
      XLSX.utils.book_append_sheet(wb, wsAml, "AML");
    }

    const nomeFile = (client.nome || "cliente").replace(/\s+/g, "_");
    XLSX.writeFile(wb, `${nomeFile}_scheda.xlsx`);
  };

  // ─────────────────────────────────────────────────────────────

  const openNewTask = () => {
    setEditingTask(null);
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setForm({
      descrizione: task.descrizione || "",
      stato: task.stato || "aperto",
      due_date: task.due_date ? task.due_date.substring(0, 10) : "",
    });
    setFormError(null);
    setShowModal(true);
  };

  const saveTask = async () => {
    if (!form.descrizione.trim()) {
      setFormError("La descrizione è obbligatoria");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const headers = await getHeaders();
      const body = {
        client_id: id,
        descrizione: form.descrizione.trim(),
        stato: form.stato,
        due_date: form.due_date || null,
      };

      const url = editingTask
        ? `${API_BASE}/tasks/${editingTask.id}`
        : `${API_BASE}/tasks`;
      const method = editingTask ? "PUT" : "POST";

      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Errore nel salvataggio");

      setShowModal(false);
      await fetchAll();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Eliminare questo task?")) return;
    try {
      const headers = await getHeaders();
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, { method: "DELETE", headers });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Errore eliminazione");
      await fetchAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const taskStats = [
    { name: "Aperto", value: tasks.filter((t) => t.stato === "aperto").length },
    { name: "In corso", value: tasks.filter((t) => t.stato === "in_corso").length },
    { name: "Chiuso", value: tasks.filter((t) => t.stato === "chiuso").length },
  ].filter((s) => s.value > 0);

  const STAT_COLORS = ["#3b82f6", "#f59e0b", "#22c55e"];

  const taskInRitardo = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.stato !== "chiuso"
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

  const riskLevel = client.rischi?.toLowerCase() || "basso";
  const riskColor = RISK_COLORS[riskLevel] || "#6b7280";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Modal Task */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              {editingTask ? "Modifica Task" : "Nuovo Task"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Descrizione *</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Descrivi il task..."
                  value={form.descrizione}
                  onChange={(e) => setForm({ ...form, descrizione: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Stato</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.stato}
                  onChange={(e) => setForm({ ...form, stato: e.target.value })}
                >
                  <option value="aperto">Aperto</option>
                  <option value="in_corso">In corso</option>
                  <option value="chiuso">Chiuso</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Scadenza (opzionale)</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
              {formError && <p className="text-sm text-red-500">{formError}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                disabled={saving}
              >
                Annulla
              </button>
              <button
                onClick={saveTask}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Salvataggio..." : editingTask ? "Salva modifiche" : "Crea task"}
              </button>
            </div>
          </div>
        </div>
      )}

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
          {/* Pulsanti Export */}
          <button
            onClick={exportPDF}
            className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition"
            title="Esporta scheda in PDF"
          >
            ↓ PDF
          </button>
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg text-sm font-medium transition"
            title="Esporta scheda in Excel"
          >
            ↓ Excel
          </button>
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

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Stato AML
                </h3>
                {aml ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {aml.stato === "aggiornato" ? "✅" : "⚠️"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {aml.stato === "aggiornato" ? "Posizione aggiornata" : "Richiede aggiornamento"}
                      </p>
                      {aml.ultima_due_diligence && (
                        <p className="text-xs text-gray-400">
                          Ultimo aggiornamento:{" "}
                          {new Date(aml.ultima_due_diligence).toLocaleDateString("it-IT")}
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
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {tasks.length} task
                {taskInRitardo.length > 0 && (
                  <span className="ml-2 text-red-500 font-medium">
                    · {taskInRitardo.length} in ritardo
                  </span>
                )}
              </p>
              <button
                onClick={openNewTask}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                + Nuovo Task
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
                <p className="text-gray-400 mb-4">Nessun task associato a questo cliente</p>
                <button
                  onClick={openNewTask}
                  className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  + Crea il primo task
                </button>
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
                          {TASK_STATUS_LABELS[task.stato] || task.stato}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 mt-1">
                        {task.descrizione}
                      </p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-2">
                      {task.due_date && (
                        <p className={`text-xs ${isLate ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                          Scadenza:{" "}
                          {new Date(task.due_date).toLocaleDateString("it-IT")}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditTask(task)}
                          className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-2 py-1 rounded-md transition"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-2 py-1 rounded-md transition"
                        >
                          Elimina
                        </button>
                      </div>
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
