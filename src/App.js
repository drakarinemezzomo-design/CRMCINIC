import { useState, useEffect, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// 🔧 COLE AQUI A URL DO SEU GOOGLE APPS SCRIPT APÓS IMPLANTAR
const SHEET_URL = "https://script.google.com/macros/s/AKfycbyFa7rK1sVO8i4JgYmS8tdGIsaWfRE9BmjupML2dv-ap56pC60CUfdx8T0lSiZGe-hd/exec";
// ══════════════════════════════════════════════════════════════════════════════

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ── Google Sheets API ─────────────────────────────────────────────────────────
async function sheetGet(sheet) {
  const r = await fetch(`${SHEET_URL}?sheet=${sheet}`);
  return r.json();
}
async function sheetSave(sheet, data) {
  await fetch(SHEET_URL, { method: "POST", body: JSON.stringify({ sheet, action: "save", data }) });
}
async function sheetDelete(sheet, id) {
  await fetch(SHEET_URL, { method: "POST", body: JSON.stringify({ sheet, action: "delete", data: { id } }) });
}
async function sheetSeed(sheet, data) {
  await fetch(SHEET_URL, { method: "POST", body: JSON.stringify({ sheet, action: "seed", data }) });
}

// ── seed data ─────────────────────────────────────────────────────────────────
const SEED_PATIENTS = [
  { id: "p1", name: "Ana Paula Souza", phone: "(11) 98765-4321", email: "ana@email.com", birthdate: "1985-03-12", gender: "Feminino", cpf: "123.456.789-00", address: "Rua das Flores, 42", plan: "Unimed", bloodType: "A+", allergies: "Penicilina", chronic: "Hipertensão", notes: "", createdAt: "2026-01-10" },
  { id: "p2", name: "Carlos Mendes", phone: "(11) 91234-5678", email: "carlos@email.com", birthdate: "1972-07-25", gender: "Masculino", cpf: "987.654.321-00", address: "Av. Paulista, 1000", plan: "Bradesco Saúde", bloodType: "O+", allergies: "Nenhuma", chronic: "Diabetes tipo 2", notes: "", createdAt: "2026-01-15" },
  { id: "p3", name: "Maria Fernanda Lima", phone: "(11) 99887-6543", email: "maria@email.com", birthdate: "1990-11-04", gender: "Feminino", cpf: "111.222.333-44", address: "Rua Augusta, 200", plan: "Particular", bloodType: "B-", allergies: "Dipirona", chronic: "Nenhuma", notes: "Gestante", createdAt: "2026-02-01" },
];
const SEED_APPTS = [
  { id: "a1", patientId: "p1", patientName: "Ana Paula Souza", date: "2026-04-25", time: "09:00", type: "Consulta", doctor: "Dr. Oliveira", status: "confirmado", notes: "" },
  { id: "a2", patientId: "p2", patientName: "Carlos Mendes", date: "2026-04-25", time: "10:30", type: "Retorno", doctor: "Dra. Santos", status: "aguardando", notes: "" },
  { id: "a3", patientId: "p3", patientName: "Maria Fernanda Lima", date: "2026-04-26", time: "14:00", type: "Exame", doctor: "Dr. Oliveira", status: "confirmado", notes: "" },
];
const SEED_HISTORY = [
  { id: "h1", patientId: "p1", patientName: "Ana Paula Souza", date: "2026-04-10", doctor: "Dr. Oliveira", type: "Consulta", diagnosis: "Hipertensão leve", prescription: "Losartana 50mg 1x/dia", notes: "Retorno em 30 dias." },
  { id: "h2", patientId: "p2", patientName: "Carlos Mendes", date: "2026-03-28", doctor: "Dra. Santos", type: "Retorno", diagnosis: "Diabetes tipo 2", prescription: "Metformina 850mg 2x/dia", notes: "HbA1c = 7.2%" },
  { id: "h3", patientId: "p3", patientName: "Maria Fernanda Lima", date: "2026-04-15", doctor: "Dr. Oliveira", type: "Consulta", diagnosis: "Gastrite", prescription: "Omeprazol 20mg", notes: "Evitar alimentos ácidos." },
];
const SEED_FINANCIAL = [
  { id: "f1", patientId: "p1", patientName: "Ana Paula Souza", date: "2026-04-10", description: "Consulta", value: 250, type: "receita", status: "pago", method: "Cartão" },
  { id: "f2", patientId: "p2", patientName: "Carlos Mendes", date: "2026-03-28", description: "Retorno", value: 180, type: "receita", status: "pago", method: "PIX" },
  { id: "f3", patientId: "p3", patientName: "Maria Fernanda Lima", date: "2026-04-15", description: "Consulta", value: 250, type: "receita", status: "pendente", method: "-" },
  { id: "f4", patientId: null, patientName: "-", date: "2026-04-20", description: "Material de escritório", value: 120, type: "despesa", status: "pago", method: "Débito" },
];
const SEED_PRONT = [
  { id: "pr1", patientId: "p1", patientName: "Ana Paula Souza", createdAt: "2026-01-10", mainComplaint: "Dores de cabeça e tontura", history: "Hipertensão familiar. Sedentária.", physicalExam: "PA: 150/95 mmHg. FC: 82 bpm.", exams: "Hemograma, perfil lipídico.", conduct: "Losartana 50mg + mudança de hábitos." },
];

// ── design ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#f0f4f8", card: "#ffffff", sidebar: "#0d1b2a", sidebarAccent: "#1b3a5c",
  accent: "#2dd4bf", accentDark: "#0f9989", text: "#0d1b2a", muted: "#64748b",
  border: "#e2e8f0", danger: "#ef4444", success: "#22c55e", warning: "#f59e0b",
};

const Badge = ({ label }) => {
  const map = { confirmado: [C.accent+"22", C.accentDark], aguardando: ["#fef9c3","#92400e"], agendado: ["#dbeafe","#1e3a8a"], cancelado: ["#fee2e2","#7f1d1d"], pago: ["#dcfce7","#14532d"], pendente: ["#fef9c3","#92400e"], receita: ["#dcfce7","#14532d"], despesa: ["#fee2e2","#7f1d1d"] };
  const [bg, color] = map[label] || ["#f1f5f9","#334155"];
  return <span style={{ background: bg, color, padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{label}</span>;
};
const Btn = ({ children, onClick, variant = "primary", small, style: s }) => {
  const styles = { primary: { background: C.text, color: "#fff" }, ghost: { background: "#f1f5f9", color: C.text }, danger: { background: "#fee2e2", color: C.danger }, accent: { background: C.accent, color: "#0d1b2a" } };
  return <button onClick={onClick} style={{ ...styles[variant], border: "none", borderRadius: 9, padding: small ? "6px 13px" : "10px 20px", fontSize: small ? 12 : 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", ...s }}>{children}</button>;
};
const iStyle = { width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, outline: "none", background: "#f8fafc", boxSizing: "border-box", fontFamily: "inherit" };
const Field = ({ label, children }) => <div style={{ marginBottom: 14 }}><label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>{children}</div>;
const Inp = ({ label, ...p }) => <Field label={label}><input {...p} style={{ ...iStyle, ...p.style }} /></Field>;
const Sel = ({ label, children, ...p }) => <Field label={label}><select {...p} style={{ ...iStyle, ...p.style }}>{children}</select></Field>;
const Tex = ({ label, ...p }) => <Field label={label}><textarea {...p} rows={3} style={{ ...iStyle, resize: "vertical", ...p.style }} /></Field>;

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(13,27,42,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
    <div style={{ background: C.card, borderRadius: 18, padding: 32, width: wide ? 680 : 480, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.22)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: C.muted }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const Table = ({ cols, rows }) => (
  <div style={{ background: C.card, borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
      <thead><tr style={{ background: "#f8fafc" }}>{cols.map(c => <th key={c} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{c}</th>)}</tr></thead>
      <tbody>{rows}</tbody>
    </table>
  </div>
);
const TR = ({ cells }) => (
  <tr style={{ borderTop: `1px solid ${C.border}` }}>
    {cells.map((c, i) => <td key={i} style={{ padding: "13px 16px", fontSize: 14, color: i === 0 ? C.text : C.muted, fontWeight: i === 0 ? 600 : 400, verticalAlign: "middle" }}>{c}</td>)}
  </tr>
);
const StatCard = ({ label, value, color, icon }) => (
  <div style={{ background: C.card, borderRadius: 14, padding: 22, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${color}` }}>
    <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{value}</div>
    <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{label}</div>
  </div>
);
const PageHeader = ({ title, sub, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
    <div><h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>{title}</h1>{sub && <p style={{ color: C.muted, margin: "4px 0 0", fontSize: 14 }}>{sub}</p>}</div>
    {action}
  </div>
);

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function CRMClinica() {
  const [tab, setTab] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [financial, setFinancial] = useState([]);
  const [prontuarios, setProntuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const isConfigured = SHEET_URL !== "https://script.google.com/macros/s/AKfycbyFa7rK1sVO8i4JgYmS8tdGIsaWfRE9BmjupML2dv-ap56pC60CUfdx8T0lSiZGe-hd/exec";

  // ── load all data on mount ──
  useEffect(() => {
    if (!isConfigured) { setLoading(false); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, a, h, f, pr] = await Promise.all([
        sheetGet("patients"), sheetGet("appointments"), sheetGet("history"),
        sheetGet("financial"), sheetGet("prontuarios"),
      ]);
      const isEmpty = !p || p.length === 0;
      if (isEmpty && !seeded) {
        // first time: seed demo data
        await Promise.all([
          sheetSeed("patients", SEED_PATIENTS), sheetSeed("appointments", SEED_APPTS),
          sheetSeed("history", SEED_HISTORY), sheetSeed("financial", SEED_FINANCIAL),
          sheetSeed("prontuarios", SEED_PRONT),
        ]);
        setSeeded(true);
        setPatients(SEED_PATIENTS); setAppointments(SEED_APPTS);
        setHistory(SEED_HISTORY); setFinancial(SEED_FINANCIAL); setProntuarios(SEED_PRONT);
      } else {
        setPatients(p || []); setAppointments(a || []); setHistory(h || []);
        setFinancial(f || []); setProntuarios(pr || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const openModal = (type, data = {}) => { setModal(type); setForm(data); };
  const closeModal = () => { setModal(null); setForm({}); };
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const withSave = async (fn) => { setSaving(true); await fn(); setSaving(false); };

  // ── saves ──
  const savePatient = async () => {
    const entry = form.id ? form : { ...form, id: uid(), createdAt: today() };
    await withSave(() => sheetSave("patients", entry));
    if (form.id) setPatients(ps => ps.map(p => p.id === entry.id ? entry : p));
    else setPatients(ps => [...ps, entry]);
    closeModal();
  };
  const deletePatient = async (id) => {
    if (!confirm("Remover paciente?")) return;
    await withSave(() => sheetDelete("patients", id));
    setPatients(ps => ps.filter(p => p.id !== id)); setSelectedPatient(null);
  };

  const saveAppointment = async () => {
    const pat = patients.find(p => p.id === form.patientId);
    const entry = { ...form, id: form.id || uid(), patientName: pat?.name || form.patientName || "" };
    await withSave(() => sheetSave("appointments", entry));
    if (form.id) setAppointments(as => as.map(a => a.id === entry.id ? entry : a));
    else setAppointments(as => [...as, entry]);
    closeModal();
  };
  const deleteAppointment = async (id) => {
    if (!confirm("Remover?")) return;
    await withSave(() => sheetDelete("appointments", id));
    setAppointments(as => as.filter(a => a.id !== id));
  };

  const saveHistory = async () => {
    const pat = patients.find(p => p.id === form.patientId);
    const entry = { ...form, id: form.id || uid(), patientName: pat?.name || form.patientName || "" };
    await withSave(() => sheetSave("history", entry));
    if (form.id) setHistory(hs => hs.map(h => h.id === entry.id ? entry : h));
    else setHistory(hs => [...hs, entry]);
    closeModal();
  };
  const deleteHistory = async (id) => {
    if (!confirm("Remover?")) return;
    await withSave(() => sheetDelete("history", id));
    setHistory(hs => hs.filter(h => h.id !== id));
  };

  const saveFinancial = async () => {
    const entry = { ...form, id: form.id || uid() };
    await withSave(() => sheetSave("financial", entry));
    if (form.id) setFinancial(fs => fs.map(f => f.id === entry.id ? entry : f));
    else setFinancial(fs => [...fs, entry]);
    closeModal();
  };
  const deleteFinancial = async (id) => {
    if (!confirm("Remover?")) return;
    await withSave(() => sheetDelete("financial", id));
    setFinancial(fs => fs.filter(f => f.id !== id));
  };

  const saveProntuario = async () => {
    const pat = patients.find(p => p.id === form.patientId);
    const entry = { ...form, id: form.id || uid(), patientName: pat?.name || form.patientName || "" };
    await withSave(() => sheetSave("prontuarios", entry));
    if (form.id) setProntuarios(ps => ps.map(p => p.id === entry.id ? entry : p));
    else setProntuarios(ps => [...ps, entry]);
    closeModal();
  };
  const deleteProntuario = async (id) => {
    if (!confirm("Remover?")) return;
    await withSave(() => sheetDelete("prontuarios", id));
    setProntuarios(ps => ps.filter(p => p.id !== id));
  };

  // ── computed ──
  const receita = financial.filter(f => f.type === "receita" && f.status === "pago").reduce((s, f) => s + Number(f.value || 0), 0);
  const despesa = financial.filter(f => f.type === "despesa" && f.status === "pago").reduce((s, f) => s + Number(f.value || 0), 0);
  const pendente = financial.filter(f => f.status === "pendente").reduce((s, f) => s + Number(f.value || 0), 0);
  const agendamentosHoje = appointments.filter(a => a.date === today()).length;
  const filteredPatients = patients.filter(p => [p.name, p.phone, p.email, p.cpf].some(v => (v || "").toLowerCase().includes(search.toLowerCase())));
  const patientOptions = patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>);

  const nav = [
    { id: "dashboard", icon: "▦", label: "Dashboard" },
    { id: "patients", icon: "✦", label: "Pacientes" },
    { id: "appointments", icon: "◷", label: "Agendamentos" },
    { id: "history", icon: "⌖", label: "Histórico" },
    { id: "prontuario", icon: "⊕", label: "Prontuário" },
    { id: "financial", icon: "◈", label: "Financeiro" },
  ];

  // ── not configured screen ──
  if (!isConfigured) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ background: C.card, borderRadius: 20, padding: 48, maxWidth: 520, textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
        <h2 style={{ color: C.text, marginBottom: 12 }}>Configure o Google Sheets</h2>
        <p style={{ color: C.muted, lineHeight: 1.7 }}>Abra o arquivo <code>crm-clinica-sheets.jsx</code> e substitua <code>https://script.google.com/macros/s/AKfycbyFa7rK1sVO8i4JgYmS8tdGIsaWfRE9BmjupML2dv-ap56pC60CUfdx8T0lSiZGe-hd/exec</code> pela URL do seu Apps Script implantado.</p>
        <p style={{ color: C.muted, fontSize: 13, marginTop: 16 }}>Siga o passo a passo que acompanha este arquivo.</p>
      </div>
    </div>
  );

  // ── loading screen ──
  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 48, height: 48, border: `4px solid ${C.border}`, borderTop: `4px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: C.muted }}>Carregando dados do Google Sheets...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", fontSize: 14 }}>

      {/* saving toast */}
      {saving && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: C.text, color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 300, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 14, height: 14, border: "2px solid #ffffff44", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          Salvando no Google Sheets...
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── SIDEBAR ── */}
      <div style={{ width: 210, background: C.sidebar, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 10 }}>
        <div style={{ padding: "26px 22px 22px", borderBottom: "1px solid #1e2d3d" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.accent }}>Clínica<span style={{ color: "#fff" }}>CRM</span></div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 3, letterSpacing: "0.05em" }}>GESTÃO COMPLETA</div>
        </div>
        <nav style={{ flex: 1, padding: "14px 10px" }}>
          {nav.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); setSearch(""); setSelectedPatient(null); }} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px",
              borderRadius: 10, border: "none", cursor: "pointer", marginBottom: 3,
              background: tab === item.id ? C.sidebarAccent : "transparent",
              color: tab === item.id ? C.accent : "#64748b",
              fontWeight: tab === item.id ? 700 : 400, fontSize: 13, textAlign: "left", transition: "all 0.12s",
            }}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 22px", borderTop: "1px solid #1e2d3d" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, background: C.accent, borderRadius: "50%" }} />
            <span style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>Google Sheets ativo</span>
          </div>
          <button onClick={loadAll} style={{ marginTop: 10, background: "none", border: "none", color: "#475569", fontSize: 11, cursor: "pointer", padding: 0 }}>↻ Atualizar dados</button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ marginLeft: 210, flex: 1, padding: 32 }}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div>
            <PageHeader title="Dashboard" sub={`Hoje é ${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}`} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
              <StatCard label="Pacientes" value={patients.length} color={C.accent} icon="✦" />
              <StatCard label="Agendamentos hoje" value={agendamentosHoje} color="#a78bfa" icon="◷" />
              <StatCard label="Receita (pago)" value={fmt(receita)} color={C.success} icon="↑" />
              <StatCard label="Pendente" value={fmt(pendente)} color={C.warning} icon="⚠" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: C.card, borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: C.text }}>Próximos agendamentos</h3>
                {[...appointments].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5).map(a => (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div><div style={{ fontWeight: 600, color: C.text }}>{a.patientName}</div><div style={{ fontSize: 12, color: C.muted }}>{a.date} · {a.time} · {a.doctor}</div></div>
                    <Badge label={a.status} />
                  </div>
                ))}
                {appointments.length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>Nenhum agendamento.</p>}
              </div>
              <div style={{ background: C.card, borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: C.text }}>Últimos lançamentos</h3>
                {[...financial].slice(-5).reverse().map(f => (
                  <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div><div style={{ fontWeight: 600, color: C.text }}>{f.description}</div><div style={{ fontSize: 12, color: C.muted }}>{f.patientName} · {f.date}</div></div>
                    <span style={{ fontWeight: 700, color: f.type === "receita" ? C.success : C.danger }}>{f.type === "receita" ? "+" : "-"}{fmt(f.value)}</span>
                  </div>
                ))}
                {financial.length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>Nenhum lançamento.</p>}
              </div>
            </div>
          </div>
        )}

        {/* PATIENTS LIST */}
        {tab === "patients" && !selectedPatient && (
          <div>
            <PageHeader title="Pacientes" sub={`${patients.length} cadastrados`} action={<Btn onClick={() => openModal("patient")}>+ Novo Paciente</Btn>} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nome, telefone, CPF ou e-mail..." style={{ ...iStyle, marginBottom: 16 }} />
            <Table cols={["Nome","Telefone","Plano","Tipo Sang.","Cadastro","Ações"]} rows={filteredPatients.map(p => (
              <TR key={p.id} cells={[
                <button onClick={() => setSelectedPatient(p)} style={{ background: "none", border: "none", fontWeight: 700, color: C.accent, cursor: "pointer", textDecoration: "underline", fontSize: 14, padding: 0 }}>{p.name}</button>,
                p.phone, p.plan, p.bloodType, p.createdAt,
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn small variant="ghost" onClick={() => openModal("patient", p)}>Editar</Btn>
                  <Btn small variant="danger" onClick={() => deletePatient(p.id)}>Excluir</Btn>
                </div>
              ]} />
            ))} />
          </div>
        )}

        {/* PATIENT DETAIL */}
        {tab === "patients" && selectedPatient && (() => {
          const p = patients.find(x => x.id === selectedPatient.id) || selectedPatient;
          const pAppts = appointments.filter(a => a.patientId === p.id);
          const pHistory = history.filter(h => h.patientId === p.id);
          const pPront = prontuarios.filter(pr => pr.patientId === p.id);
          const age = p.birthdate ? Math.floor((new Date() - new Date(p.birthdate)) / 3.156e10) : "—";
          return (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <Btn variant="ghost" onClick={() => setSelectedPatient(null)}>← Voltar</Btn>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text }}>{p.name}</h1>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
                <div style={{ background: C.card, borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", alignSelf: "start" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.accent+"30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: C.accentDark, marginBottom: 16 }}>{p.name[0]}</div>
                  {[["Idade",`${age} anos`],["Sexo",p.gender],["CPF",p.cpf],["Telefone",p.phone],["E-mail",p.email],["Endereço",p.address],["Plano",p.plan],["Tipo Sang.",p.bloodType],["Alergias",p.allergies],["Crônicas",p.chronic]].map(([k,v]) => (
                    <div key={k} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div>
                      <div style={{ fontSize: 13, color: C.text, marginTop: 2 }}>{v || "—"}</div>
                    </div>
                  ))}
                  {p.notes && <div style={{ marginTop: 10, padding: 10, background: "#fffbeb", borderRadius: 8, fontSize: 12, color: "#92400e" }}>📝 {p.notes}</div>}
                  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    <Btn small variant="ghost" onClick={() => openModal("patient", p)}>Editar</Btn>
                    <Btn small variant="danger" onClick={() => deletePatient(p.id)}>Excluir</Btn>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { title: "Agendamentos", items: pAppts, addModal: "appointment", addData: { patientId: p.id, patientName: p.name }, render: a => `${a.date} · ${a.time} · ${a.type} · ${a.doctor}`, badge: a => a.status },
                    { title: "Histórico de consultas", items: pHistory, addModal: "history", addData: { patientId: p.id, patientName: p.name }, render: h => `${h.date} · ${h.type} · ${h.doctor} — Dx: ${h.diagnosis}`, badge: null },
                    { title: "Prontuários", items: pPront, addModal: "prontuario", addData: { patientId: p.id, patientName: p.name }, render: pr => `${pr.createdAt} — ${pr.mainComplaint}`, badge: null, editable: true },
                  ].map(sec => (
                    <div key={sec.title} style={{ background: C.card, borderRadius: 14, padding: 22, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{sec.title} ({sec.items.length})</h3>
                        <Btn small onClick={() => openModal(sec.addModal, sec.addData)}>+ Novo</Btn>
                      </div>
                      {sec.items.length === 0 ? <p style={{ color: C.muted, fontSize: 13 }}>Nenhum registro.</p> : sec.items.map(item => (
                        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ color: C.text, fontSize: 13 }}>{sec.render(item)}</span>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            {sec.badge && <Badge label={sec.badge(item)} />}
                            {sec.editable && <Btn small variant="ghost" onClick={() => openModal(sec.addModal, item)}>Editar</Btn>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* APPOINTMENTS */}
        {tab === "appointments" && (
          <div>
            <PageHeader title="Agendamentos" sub={`${appointments.length} no total`} action={<Btn onClick={() => openModal("appointment")}>+ Novo Agendamento</Btn>} />
            <Table cols={["Paciente","Data","Hora","Tipo","Médico","Status","Ações"]} rows={[...appointments].sort((a,b)=>a.date.localeCompare(b.date)).map(a => (
              <TR key={a.id} cells={[a.patientName, a.date, a.time, a.type, a.doctor, <Badge label={a.status} />,
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn small variant="ghost" onClick={() => openModal("appointment", a)}>Editar</Btn>
                  <Btn small variant="danger" onClick={() => deleteAppointment(a.id)}>✕</Btn>
                </div>
              ]} />
            ))} />
          </div>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <div>
            <PageHeader title="Histórico de Consultas" sub={`${history.length} registros`} action={<Btn onClick={() => openModal("history")}>+ Novo Registro</Btn>} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[...history].sort((a,b)=>b.date.localeCompare(a.date)).map(h => (
                <div key={h.id} style={{ background: C.card, borderRadius: 14, padding: 22, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${C.accent}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div><div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{h.patientName}</div><div style={{ fontSize: 12, color: C.muted }}>{h.date} · {h.doctor} · {h.type}</div></div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn small variant="ghost" onClick={() => openModal("history", h)}>Editar</Btn>
                      <Btn small variant="danger" onClick={() => deleteHistory(h.id)}>✕</Btn>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 14 }}>
                    {[["Diagnóstico",h.diagnosis],["Prescrição",h.prescription],["Observações",h.notes]].map(([k,v]) => (
                      <div key={k}><div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</div><div style={{ fontSize: 13, color: C.text, marginTop: 3 }}>{v||"—"}</div></div>
                    ))}
                  </div>
                </div>
              ))}
              {history.length === 0 && <p style={{ color: C.muted }}>Nenhum registro.</p>}
            </div>
          </div>
        )}

        {/* PRONTUÁRIO */}
        {tab === "prontuario" && (
          <div>
            <PageHeader title="Prontuários" sub={`${prontuarios.length} prontuários`} action={<Btn onClick={() => openModal("prontuario")}>+ Novo Prontuário</Btn>} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por paciente..." style={{ ...iStyle, marginBottom: 16 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {prontuarios.filter(pr=>(pr.patientName||"").toLowerCase().includes(search.toLowerCase())).map(pr => (
                <div key={pr.id} style={{ background: C.card, borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: "4px solid #a78bfa" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <div><div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{pr.patientName}</div><div style={{ fontSize: 12, color: C.muted }}>Abertura: {pr.createdAt}</div></div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn small variant="ghost" onClick={() => openModal("prontuario", pr)}>Editar</Btn>
                      <Btn small variant="danger" onClick={() => deleteProntuario(pr.id)}>Excluir</Btn>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {[["Queixa Principal",pr.mainComplaint],["História Clínica",pr.history],["Exame Físico",pr.physicalExam],["Exames Solicitados",pr.exams],["Conduta",pr.conduct]].filter(([,v])=>v).map(([k,v]) => (
                      <div key={k} style={{ gridColumn: k==="Conduta" ? "1/-1" : "auto" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k}</div>
                        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, background: "#f8fafc", borderRadius: 8, padding: "10px 12px" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {prontuarios.length === 0 && <p style={{ color: C.muted }}>Nenhum prontuário.</p>}
            </div>
          </div>
        )}

        {/* FINANCIAL */}
        {tab === "financial" && (
          <div>
            <PageHeader title="Financeiro" sub="Receitas e despesas" action={<Btn onClick={() => openModal("financial")}>+ Lançamento</Btn>} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
              <StatCard label="Receitas pagas" value={fmt(receita)} color={C.success} icon="↑" />
              <StatCard label="Despesas pagas" value={fmt(despesa)} color={C.danger} icon="↓" />
              <StatCard label="Saldo" value={fmt(receita-despesa)} color={receita-despesa>=0?C.accent:C.danger} icon="=" />
              <StatCard label="A receber" value={fmt(pendente)} color={C.warning} icon="⏳" />
            </div>
            <Table cols={["Data","Descrição","Paciente","Valor","Tipo","Forma","Status","Ações"]} rows={[...financial].sort((a,b)=>b.date.localeCompare(a.date)).map(f => (
              <TR key={f.id} cells={[
                f.date, f.description, f.patientName,
                <span style={{ fontWeight: 700, color: f.type==="receita"?C.success:C.danger }}>{f.type==="receita"?"+":"-"}{fmt(f.value)}</span>,
                <Badge label={f.type} />, f.method, <Badge label={f.status} />,
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn small variant="ghost" onClick={() => openModal("financial", f)}>Editar</Btn>
                  <Btn small variant="danger" onClick={() => deleteFinancial(f.id)}>✕</Btn>
                </div>
              ]} />
            ))} />
          </div>
        )}
      </div>

      {/* ══ MODALS ══ */}
      {modal === "patient" && (
        <Modal title={form.id ? "Editar Paciente" : "Novo Paciente"} onClose={closeModal} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <Inp label="Nome completo" value={form.name||""} onChange={e=>setF("name",e.target.value)} style={{ gridColumn:"1/-1" }} />
            <Inp label="CPF" value={form.cpf||""} onChange={e=>setF("cpf",e.target.value)} />
            <Inp label="Data de nascimento" type="date" value={form.birthdate||""} onChange={e=>setF("birthdate",e.target.value)} />
            <Sel label="Sexo" value={form.gender||""} onChange={e=>setF("gender",e.target.value)}><option value="">Selecione...</option>{["Masculino","Feminino","Outro"].map(o=><option key={o}>{o}</option>)}</Sel>
            <Inp label="Telefone" value={form.phone||""} onChange={e=>setF("phone",e.target.value)} />
            <Inp label="E-mail" value={form.email||""} onChange={e=>setF("email",e.target.value)} />
            <Inp label="Endereço" value={form.address||""} onChange={e=>setF("address",e.target.value)} style={{ gridColumn:"1/-1" }} />
            <Inp label="Plano de saúde" value={form.plan||""} onChange={e=>setF("plan",e.target.value)} />
            <Sel label="Tipo Sanguíneo" value={form.bloodType||""} onChange={e=>setF("bloodType",e.target.value)}><option value="">—</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(o=><option key={o}>{o}</option>)}</Sel>
            <Inp label="Alergias" value={form.allergies||""} onChange={e=>setF("allergies",e.target.value)} />
            <Inp label="Doenças Crônicas" value={form.chronic||""} onChange={e=>setF("chronic",e.target.value)} />
            <Tex label="Observações" value={form.notes||""} onChange={e=>setF("notes",e.target.value)} style={{ gridColumn:"1/-1" }} />
          </div>
          <Btn onClick={savePatient} style={{ width:"100%", marginTop:8 }}>Salvar Paciente</Btn>
        </Modal>
      )}

      {modal === "appointment" && (
        <Modal title={form.id?"Editar Agendamento":"Novo Agendamento"} onClose={closeModal}>
          <Sel label="Paciente" value={form.patientId||""} onChange={e=>setF("patientId",e.target.value)}><option value="">Selecione...</option>{patientOptions}</Sel>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Inp label="Data" type="date" value={form.date||""} onChange={e=>setF("date",e.target.value)} />
            <Inp label="Horário" type="time" value={form.time||""} onChange={e=>setF("time",e.target.value)} />
          </div>
          <Sel label="Tipo" value={form.type||""} onChange={e=>setF("type",e.target.value)}><option value="">Selecione...</option>{["Consulta","Retorno","Exame","Procedimento","Emergência"].map(o=><option key={o}>{o}</option>)}</Sel>
          <Inp label="Médico responsável" value={form.doctor||""} onChange={e=>setF("doctor",e.target.value)} />
          <Sel label="Status" value={form.status||"agendado"} onChange={e=>setF("status",e.target.value)}>{["agendado","confirmado","aguardando","cancelado"].map(o=><option key={o}>{o}</option>)}</Sel>
          <Tex label="Observações" value={form.notes||""} onChange={e=>setF("notes",e.target.value)} />
          <Btn onClick={saveAppointment} style={{ width:"100%", marginTop:8 }}>Salvar</Btn>
        </Modal>
      )}

      {modal === "history" && (
        <Modal title={form.id?"Editar Registro":"Novo Registro de Consulta"} onClose={closeModal} wide>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
            <Sel label="Paciente" value={form.patientId||""} onChange={e=>setF("patientId",e.target.value)} style={{ gridColumn:"1/-1" }}><option value="">Selecione...</option>{patientOptions}</Sel>
            <Inp label="Data" type="date" value={form.date||""} onChange={e=>setF("date",e.target.value)} />
            <Inp label="Médico" value={form.doctor||""} onChange={e=>setF("doctor",e.target.value)} />
            <Sel label="Tipo" value={form.type||""} onChange={e=>setF("type",e.target.value)}><option value="">Selecione...</option>{["Consulta","Retorno","Exame","Procedimento"].map(o=><option key={o}>{o}</option>)}</Sel>
            <div/>
            <Tex label="Diagnóstico" value={form.diagnosis||""} onChange={e=>setF("diagnosis",e.target.value)} />
            <Tex label="Prescrição" value={form.prescription||""} onChange={e=>setF("prescription",e.target.value)} />
            <Tex label="Observações" value={form.notes||""} onChange={e=>setF("notes",e.target.value)} style={{ gridColumn:"1/-1" }} />
          </div>
          <Btn onClick={saveHistory} style={{ width:"100%", marginTop:8 }}>Salvar</Btn>
        </Modal>
      )}

      {modal === "prontuario" && (
        <Modal title={form.id?"Editar Prontuário":"Novo Prontuário"} onClose={closeModal} wide>
          <Sel label="Paciente" value={form.patientId||""} onChange={e=>{setF("patientId",e.target.value);setF("patientName",patients.find(p=>p.id===e.target.value)?.name||"");}}><option value="">Selecione...</option>{patientOptions}</Sel>
          <Inp label="Data de abertura" type="date" value={form.createdAt||today()} onChange={e=>setF("createdAt",e.target.value)} />
          <Tex label="Queixa principal" value={form.mainComplaint||""} onChange={e=>setF("mainComplaint",e.target.value)} />
          <Tex label="História clínica (HDA / HPP)" value={form.history||""} onChange={e=>setF("history",e.target.value)} />
          <Tex label="Exame físico" value={form.physicalExam||""} onChange={e=>setF("physicalExam",e.target.value)} />
          <Tex label="Exames solicitados / resultados" value={form.exams||""} onChange={e=>setF("exams",e.target.value)} />
          <Tex label="Conduta / plano terapêutico" value={form.conduct||""} onChange={e=>setF("conduct",e.target.value)} />
          <Btn onClick={saveProntuario} style={{ width:"100%", marginTop:8 }}>Salvar Prontuário</Btn>
        </Modal>
      )}

      {modal === "financial" && (
        <Modal title={form.id?"Editar Lançamento":"Novo Lançamento"} onClose={closeModal}>
          <Inp label="Descrição" value={form.description||""} onChange={e=>setF("description",e.target.value)} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" }}>
            <Inp label="Data" type="date" value={form.date||today()} onChange={e=>setF("date",e.target.value)} />
            <Inp label="Valor (R$)" type="number" min="0" step="0.01" value={form.value||""} onChange={e=>setF("value",e.target.value)} />
            <Sel label="Tipo" value={form.type||"receita"} onChange={e=>setF("type",e.target.value)}><option value="receita">Receita</option><option value="despesa">Despesa</option></Sel>
            <Sel label="Status" value={form.status||"pendente"} onChange={e=>setF("status",e.target.value)}><option value="pago">Pago</option><option value="pendente">Pendente</option></Sel>
          </div>
          <Sel label="Forma de pagamento" value={form.method||""} onChange={e=>setF("method",e.target.value)}><option value="">Selecione...</option>{["PIX","Cartão de Crédito","Cartão de Débito","Dinheiro","Transferência","Convênio"].map(o=><option key={o}>{o}</option>)}</Sel>
          <Inp label="Paciente (opcional)" value={form.patientName||""} onChange={e=>setF("patientName",e.target.value)} />
          <Btn onClick={saveFinancial} style={{ width:"100%", marginTop:8 }}>Salvar Lançamento</Btn>
        </Modal>
      )}
    </div>
  );
}
