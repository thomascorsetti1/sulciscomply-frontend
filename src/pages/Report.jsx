import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

const SEMAFORO_COLORE = { verde: "#22c55e", giallo: "#eab308", rosso: "#ef4444" };

export default function Report() {
  const [semaforo, setSemaforo] = useState([]);
  const [scadenze, setScadenze] = useState([]);
  const [suggeriti, setSuggeriti] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/report/semaforo`, { headers }).then(r => r.json()),
      fetch(`${API}/api/report/scadenze`, { headers }).then(r => r.json()),
      fetch(`${API}/api/report/task-suggeriti`, { headers }).then(r => r.json()),
    ]).then(([s, sc, ts]) => {
      setSemaforo(s.data || []);
      setScadenze(sc.data || []);
      setSuggeriti(ts.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const accettaTask = async (t) => {
    await fetch(`${API}/api/tasks`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: t.client_id, descrizione: t.descrizione, stato: "aperto" }),
    });
    setSuggeriti(prev => prev.filter(x => x !== t));
    alert(`Task creato: ${t.descrizione}`);
  };

  if (loading) return <p style={{ padding: "2rem" }}>Caricamento...</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 900 }}>
      <h2>Report & Rischio</h2>

      {/* SEMAFORO CLIENTI */}
      <h3>Panoramica Clienti</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", marginBottom: "2rem" }}>
        <thead style={{ background: "#f1f5f9" }}>
          <tr>
            <th>Cliente</th>
            <th>Studio</th>
            <th>Rischio</th>
            <th>Task aperti</th>
          </tr>
        </thead>
        <tbody>
          {semaforo.length === 0 && (
            <tr><td colSpan={4} style={{ textAlign: "center" }}>Nessun cliente</td></tr>
          )}
          {semaforo.map(c => (
            <tr key={c.id}>
              <td>{c.nome}</td>
              <td>{c.studio || "—"}</td>
              <td style={{ textAlign: "center" }}>
                <span style={{
                  display: "inline-block", width: 18, height: 18, borderRadius: "50%",
                  background: SEMAFORO_COLORE[c.semaforo], verticalAlign: "middle"
                }} title={c.semaforo} />
                {" "}{c.semaforo}
              </td>
              <td style={{ textAlign: "center" }}>{c.task_aperti}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* SCADENZE IMMINENTI */}
      <h3>Scadenze imminenti (30 giorni)</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", marginBottom: "2rem" }}>
        <thead style={{ background: "#f1f5f9" }}>
          <tr>
            <th>Tipo</th>
            <th>Cliente</th>
            <th>Scadenza</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          {scadenze.length === 0 && (
            <tr><td colSpan={4} style={{ textAlign: "center" }}>Nessuna scadenza nei prossimi 30 giorni</td></tr>
          )}
          {scadenze.map((s, i) => (
            <tr key={i}>
              <td>{s.tipo}</td>
              <td>{s.cliente || "—"}</td>
              <td>{s.scadenza}</td>
              <td>{s.nota}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TASK SUGGERITI */}
      <h3>Task suggeriti</h3>
      {suggeriti.length === 0 && <p>Nessun task suggerito al momento.</p>}
      {suggeriti.map((t, i) => (
        <div key={i} style={{
          border: "1px solid #e2e8f0", borderRadius: 6, padding: "1rem",
          marginBottom: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <strong>{t.tipo}</strong> — {t.descrizione}
            <span style={{
              marginLeft: 12, fontSize: 12, padding: "2px 8px", borderRadius: 12,
              background: t.urgenza === "alta" ? "#fee2e2" : "#fef9c3",
              color: t.urgenza === "alta" ? "#b91c1c" : "#92400e"
            }}>{t.urgenza}</span>
          </div>
          <button onClick={() => accettaTask(t)} style={{
            background: "#2563eb", color: "white", border: "none",
            borderRadius: 4, padding: "6px 14px", cursor: "pointer"
          }}>Accetta</button>
        </div>
      ))}
    </div>
  );
}
