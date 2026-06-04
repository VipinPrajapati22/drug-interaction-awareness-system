import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  FileSpreadsheet,
  Github,
  HeartPulse,
  Linkedin,
  LogOut,
  Mail,
  Moon,
  Pill,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  Sun,
  Upload
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "./api.js";

const severityClass = {
  Minor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200",
  Moderate: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200",
  Severe: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200",
  Contraindicated: "bg-rose-200 text-rose-800 dark:bg-rose-950 dark:text-rose-100"
};
const warningColor = { red: "border-red-400 bg-red-50 dark:bg-red-950/40", yellow: "border-amber-400 bg-amber-50 dark:bg-amber-950/40", green: "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" };
const nav = [
  ["Dashboard", BarChart3],
  ["Drug Database", Pill],
  ["Interaction Checker", AlertTriangle],
  ["Food Checker", Stethoscope],
  ["ICSR Reporting", HeartPulse],
  ["Counseling", ShieldCheck],
  ["Admin", FileSpreadsheet],
  ["About", Activity]
];

const professionalLinks = [
  { label: "vipin22nov@gmail.com", helper: "Email", href: "mailto:vipin22nov@gmail.com", icon: Mail },
  { label: "LinkedIn profile", helper: "www.linkedin.com/in/vipin-prajapati-5a11a0275", href: "https://www.linkedin.com/in/vipin-prajapati-5a11a0275", icon: Linkedin },
  { label: "GitHub profile", helper: "github.com/VipinPrajapati22", href: "https://github.com/VipinPrajapati22", icon: Github }
];

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "admin@dias.local", password: "Admin@123", role: "Admin" });
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, form);
      localStorage.setItem("dias_token", data.token);
      localStorage.setItem("dias_user", JSON.stringify(data.user));
      toast.success("Welcome to DIAS");
      onLogin(data.user);
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Authentication failed. Please try again.";
      toast.error(message);
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-clinical-50 text-slate-900">
      <section className="mx-auto grid min-h-screen max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-clinical-600 shadow-soft">
            <ShieldCheck size={18} /> Pharmacovigilance awareness platform
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-clinical-900 md:text-6xl">Drug Interaction Awareness System</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Screen drug combinations, food risks, adverse reactions, and counseling warnings with WHO-DD and MedDRA-inspired demo data.
          </p>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {["50 medicines", "30 DDIs", "25 MedDRA terms"].map((item) => (
              <div key={item} className="rounded-lg bg-white p-4 font-semibold shadow-soft">{item}</div>
            ))}
          </div>
        </div>
        <form onSubmit={submit} className="rounded-lg bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-bold">{mode === "login" ? "Sign in" : "Create account"}</h2>
          <p className="mt-1 text-sm text-slate-500">Demo admin: admin@dias.local / Admin@123</p>
          {mode === "register" && <Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />}
          <Input label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
          <Input label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
          {mode === "register" && (
            <select className="field mt-4" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option>Admin</option><option>Pharmacist</option><option>User</option>
            </select>
          )}
          <button disabled={loading} className="mt-5 w-full rounded-lg bg-clinical-600 px-4 py-3 font-semibold text-white hover:bg-clinical-500 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? "Authenticating..." : (mode === "login" ? "Login" : "Register")}</button>
          <button type="button" disabled={loading} onClick={() => setMode(mode === "login" ? "register" : "login")} className="mt-3 w-full text-sm font-semibold text-clinical-600 disabled:opacity-50">{mode === "login" ? "Need an account?" : "Already registered?"}</button>
        </form>
        <div className="lg:col-span-2">
          <ProfessionalLinks />
        </div>
      </section>
    </main>
  );
}

function ProfessionalLinks() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Professional Links</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {professionalLinks.map(({ label, helper, href, icon: Icon }) => (
          <a key={href} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-4 rounded-lg border border-slate-200 p-4 transition hover:border-clinical-300 hover:bg-clinical-50 dark:border-slate-800 dark:hover:bg-slate-800">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-clinical-100 text-clinical-700 dark:bg-clinical-900/50 dark:text-clinical-100"><Icon size={20} /></span>
            <span className="min-w-0">
              <span className="block truncate font-semibold">{label}</span>
              <span className="block truncate text-sm text-slate-500">{helper}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="mt-4 block text-sm font-semibold text-slate-600 dark:text-slate-300">
      {label}
      <input className="field mt-1" type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Shell({ user, onLogout, dark, setDark, children, active, setActive }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <div className="flex items-center gap-3 text-xl font-bold text-clinical-600"><Activity /> DIAS</div>
        <nav className="mt-8 space-y-1">
          {nav.map(([item, Icon]) => (
            <button key={item} onClick={() => setActive(item)} className={`nav-btn ${active === item ? "nav-active" : ""}`}><Icon size={18} /> {item}</button>
          ))}
        </nav>
      </aside>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 lg:ml-72">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-clinical-600">{user.role}</p>
            <h1 className="text-xl font-bold">{active}</h1>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="flex lg:hidden">
              <select className="field" value={active} onChange={(e) => setActive(e.target.value)}>{nav.map(([item]) => <option key={item}>{item}</option>)}</select>
            </div>
            <button title="Toggle dark mode" className="icon-btn" onClick={() => setDark(!dark)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button title="Logout" className="icon-btn" onClick={onLogout}><LogOut size={18} /></button>
          </div>
        </div>
      </header>
      <main className="p-4 lg:ml-72 lg:p-6">{children}</main>
    </div>
  );
}

function Stat({ label, value, icon: Icon }) {
  return <div className="panel flex items-center justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="text-3xl font-bold">{value}</p></div><Icon className="text-clinical-500" /></div>;
}

function Dashboard({ analytics }) {
  const pieColors = ["#22c55e", "#f59e0b", "#ef4444", "#9f1239"];
  return (
    <View>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Medicines" value={analytics?.totals?.drugs || 0} icon={Pill} />
        <Stat label="Interactions" value={analytics?.totals?.interactions || 0} icon={AlertTriangle} />
        <Stat label="ICSR Reports" value={analytics?.totals?.reports || 0} icon={HeartPulse} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartPanel title="Severity Distribution">
          <ResponsiveContainer width="100%" height={260}><PieChart><Pie data={analytics?.severityDistribution || []} dataKey="value" nameKey="name" outerRadius={95} label>{(analytics?.severityDistribution || []).map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="ADR Trends">
          <ResponsiveContainer width="100%" height={260}><LineChart data={analytics?.adrTrends || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis allowDecimals={false} /><Tooltip /><Line dataKey="count" stroke="#1d78d8" strokeWidth={3} /></LineChart></ResponsiveContainer>
        </ChartPanel>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartPanel title="Top Reported Drugs">
          <ResponsiveContainer width="100%" height={260}><BarChart data={analytics?.topReportedDrugs || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#1d78d8" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
        </ChartPanel>
        <div className="panel">
          <h2 className="section-title">Recent ICSRs</h2>
          <div className="space-y-3">{(analytics?.recentIcsrs || []).map((item) => <ReportRow key={item.icsrId} item={item} />)}</div>
        </div>
      </div>
    </View>
  );
}

function ChartPanel({ title, children }) {
  return <div className="panel"><h2 className="section-title">{title}</h2>{children}</div>;
}

function ReportRow({ item }) {
  return <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"><div className="flex justify-between gap-2"><b>{item.icsrId}</b><Badge value={item.severityClassification} /></div><p className="mt-1 text-sm text-slate-500">{item.suspectedDrug} · {item.reactionDescription}</p></div>;
}

function DrugDatabase({ drugs, refresh }) {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState({ drugName: "", genericName: "", atcCode: "", therapeuticClass: "", dosageForm: "Tablet", route: "Oral", strength: "", manufacturer: "", drugCode: "" });
  const filtered = useMemo(() => drugs.filter((d) => `${d.drugName} ${d.genericName} ${d.atcCode}`.toLowerCase().includes(q.toLowerCase())), [drugs, q]);
  useEffect(() => {
    if (q.trim().length < 2) return setSuggestions([]);
    const id = setTimeout(async () => {
      const { data } = await api.get(`/drugs/autocomplete?q=${encodeURIComponent(q)}&limit=8`);
      setSuggestions(data.data);
    }, 250);
    return () => clearTimeout(id);
  }, [q]);
  const save = async () => {
    await api.post("/drugs", { ...form, contraindications: ["Hypersensitivity"], indications: ["Therapeutic use"] });
    toast.success("Drug added");
    setForm({ ...form, drugName: "", genericName: "", drugCode: "" });
    refresh();
  };

  return (
    <View>
      <div className="panel">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="section-title">Global Medicine Search</h2><SearchBox value={q} setValue={setQ} suggestions={suggestions} /></div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">{(q ? suggestions : filtered).slice(0, 50).map((drug) => <DrugCard key={drug._id || drug.drugCode || drug.rxcui} drug={drug} />)}</div>
      </div>
      <div className="panel mt-4">
        <h2 className="section-title">Add Medicine</h2>
        <div className="grid gap-3 md:grid-cols-4">{Object.keys(form).map((key) => <Input key={key} label={key} value={form[key]} onChange={(value) => setForm({ ...form, [key]: value })} />)}</div>
        <button onClick={save} className="primary mt-4"><Plus size={18} /> Add drug</button>
      </div>
    </View>
  );
}

function DrugCard({ drug }) {
  return <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"><div className="flex justify-between gap-2"><b>{drug.drugName}</b><span className="text-xs font-bold text-clinical-600">{drug.rxcui || drug.atcCode}</span></div><p className="text-sm text-slate-500">{drug.genericName}</p><p className="mt-2 text-sm">{drug.therapeuticClass} - {drug.dosageForm || "Standard dosage form"} - {drug.strength || "standardized"} - {drug.route || "RxNorm"}</p>{drug.brandNames?.length > 0 && <p className="mt-2 text-xs text-slate-500">Brands: {drug.brandNames.slice(0, 3).join(", ")}</p>}<p className="mt-2 text-xs text-slate-500">{drug.drugCode || drug.source}</p></div>;
}

function InteractionChecker({ drugs }) {
  const [selected, setSelected] = useState(["Warfarin", "Aspirin"]);
  const [severity, setSeverity] = useState("All");
  const [results, setResults] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [checked, setChecked] = useState(false);
  const check = async () => {
    try {
      const { data } = await api.post("/interactions/check", { drugs: selected.filter(Boolean), severity });
      setResults(data.results || []);
      setGrouped(data.grouped || {});
      setChecked(true);
      toast.success(`${data.count} interaction signal(s) found`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Interaction check failed");
    }
  };
  return (
    <View>
      <CheckerPanel title="Drug-Drug Interaction Checker" selected={selected} setSelected={setSelected} drugs={drugs} onCheck={check} severity={severity} setSeverity={setSeverity} actionLabel="Check interactions" />
      <Results results={results} grouped={grouped} checked={checked} emptyText="No important interaction signal found for this selection." />
    </View>
  );
}

function CheckerPanel({ title, selected, setSelected, drugs, onCheck, severity, setSeverity, actionLabel = "Proceed" }) {
  return <div className="panel"><h2 className="section-title">{title}</h2><div className="grid gap-3 md:grid-cols-3">{selected.map((value, index) => <DrugAutocomplete key={index} value={value} fallbackDrugs={drugs} onChange={(nextValue) => { const next = [...selected]; next[index] = nextValue; setSelected(next); }} />)}</div><div className="relative z-10 mt-5 flex flex-wrap gap-2">{setSeverity && <select className="field max-w-xs" value={severity} onChange={(e) => setSeverity(e.target.value)}><option>All</option><option>Minor</option><option>Moderate</option><option>Severe</option><option>Contraindicated</option></select>}<button className="secondary" onClick={() => setSelected([...selected, ""])}><Plus size={18} /> Add drug</button><button className="primary" onClick={onCheck}><Search size={18} /> {actionLabel}</button></div></div>;
}

function Results({ results, grouped = {}, checked = false, emptyText = "No result found." }) {
  if (!checked && results.length === 0) return null;
  if (checked && results.length === 0) return <div className="panel mt-4 border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">{emptyText}</div>;
  const groups = Object.keys(grouped).length ? Object.entries(grouped) : [["Interaction results", results]];
  return <div className="mt-4 space-y-4">{groups.map(([group, items]) => <div key={group} className="space-y-3"><h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{group}</h3>{items.map((item) => <div key={item._id || item.rawDescription || item.drugs.join()} className="panel"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-bold">{item.drugs.join(" + ")}</h3><Badge value={item.severity} /></div><p className="mt-3"><b>Mechanism:</b> {item.mechanism}</p><p><b>Clinical effect:</b> {item.clinicalEffect}</p><p><b>Recommendation:</b> {item.pharmacistRecommendation}</p><p><b>Monitoring:</b> {item.monitoringAdvice}</p>{item.source && <p className="mt-2 text-xs font-semibold text-clinical-600">Source: {item.source}</p>}{item.meddraTerms?.[0] && <p className="mt-2 text-sm text-slate-500">MedDRA: {item.meddraTerms[0].soc} / {item.meddraTerms[0].pt} / {item.meddraTerms[0].llt}</p>}</div>)}</div>)}</div>;
}

function FoodChecker() {
  const [form, setForm] = useState({ drug: "Metronidazole", food: "Alcohol" });
  const [results, setResults] = useState([]);
  const [checked, setChecked] = useState(false);
  const check = async () => {
    try {
      const { data } = await api.post("/food/check", form);
      setResults(data.results || []);
      setChecked(true);
      toast.success(`${data.count} food signal(s) found`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Food check failed");
    }
  };
  return <View><div className="panel"><h2 className="section-title">Drug-Food Interaction Checker</h2><div className="grid gap-3 md:grid-cols-2"><Input label="Drug" value={form.drug} onChange={(drug) => setForm({ ...form, drug })} /><Input label="Food or drink" value={form.food} onChange={(food) => setForm({ ...form, food })} /></div><button className="primary mt-4" onClick={check}><Search size={18} /> Check food risk</button></div>{checked && results.length === 0 && <div className="panel mt-4 border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">No important food interaction signal found.</div>}<div className="mt-4 space-y-3">{results.map((item) => <div className="panel" key={`${item.drug}-${item.food}`}><div className="flex justify-between gap-2"><h3 className="text-lg font-bold">{item.drug} + {item.food}</h3><Badge value={item.severity} /></div><p className="mt-3"><b>Why it matters:</b> {item.pharmacologyExplanation}</p><p><b>Mechanism:</b> {item.riskMechanism}</p><p><b>Advice:</b> {item.patientCounselingAdvice}</p></div>)}</div></View>;
}

function IcsrReporting() {
  const [form, setForm] = useState({ patientAge: 45, gender: "Female", suspectedDrug: "Warfarin", concomitantDrugs: "Aspirin", reactionDescription: "Black stool and weakness after taking medicines together", seriousness: "Hospitalisation", outcome: "Recovering", reporterType: "Pharmacist" });
  const [last, setLast] = useState(null);
  const submit = async () => {
    const payload = { ...form, concomitantDrugs: String(form.concomitantDrugs).split(",").map((x) => x.trim()).filter(Boolean) };
    const { data } = await api.post("/icsr/report", payload);
    setLast(data.data);
    toast.success(`Generated ${data.data.icsrId}`);
  };
  const pdf = () => {
    if (!last) return;
    const doc = new jsPDF();
    doc.text("Individual Case Safety Report", 14, 18);
    doc.text(`ICSR ID: ${last.icsrId}`, 14, 32);
    doc.text(`Suspected drug: ${last.suspectedDrug}`, 14, 44);
    doc.text(`Reaction: ${last.reactionDescription}`, 14, 56, { maxWidth: 180 });
    doc.save(`${last.icsrId}.pdf`);
  };
  return <View><div className="panel"><h2 className="section-title">Simplified ICSR Reporting</h2><div className="grid gap-3 md:grid-cols-3">{Object.keys(form).map((key) => <Input key={key} label={key} value={form[key]} onChange={(value) => setForm({ ...form, [key]: value })} />)}</div><div className="mt-4 flex gap-2"><button className="primary" onClick={submit}><HeartPulse size={18} /> Submit ICSR</button><button className="secondary" onClick={pdf}>PDF export</button></div></div>{last && <div className="panel mt-4"><h3 className="text-lg font-bold">{last.icsrId}</h3><p>Severity classification: <Badge value={last.severityClassification} /></p><p className="mt-2 text-slate-500">{last.reactionDescription}</p></div>}</View>;
}

function Counseling({ drugs }) {
  const [medicines, setMedicines] = useState(["Warfarin", "Aspirin"]);
  const [profile, setProfile] = useState({ ageGroup: "elderly", pregnancy: false, kidneyDisease: false, liverDisease: false, selfMedication: true });
  const [foods, setFoods] = useState("Vitamin K rich foods, Alcohol");
  const [warnings, setWarnings] = useState([]);
  const run = async () => {
    const { data } = await api.post("/interactions/counseling", { medicines, patientProfile: profile, foods: foods.split(",").map((item) => item.trim()).filter(Boolean) });
    setWarnings(data.warnings);
  };
  return <View><CheckerPanel title="Patient Counseling Assistant" selected={medicines} setSelected={setMedicines} drugs={drugs} onCheck={run} actionLabel="Proceed" /><div className="panel mt-4"><h2 className="section-title">Patient profile</h2><div className="flex flex-wrap gap-3"><select className="field max-w-xs" value={profile.ageGroup} onChange={(e) => setProfile({ ...profile, ageGroup: e.target.value })}><option>adult</option><option>elderly</option><option>pediatric</option></select>{["pregnancy", "kidneyDisease", "liverDisease", "selfMedication"].map((key) => <label key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"><input type="checkbox" checked={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.checked })} /> {key}</label>)}<input className="field max-w-sm" value={foods} onChange={(e) => setFoods(e.target.value)} placeholder="Foods, alcohol, supplements" /></div></div><div className="mt-4 grid gap-3 md:grid-cols-2">{warnings.map((warning, index) => <div key={index} className={`rounded-lg border-l-4 p-4 ${warningColor[warning.level]}`}><h3 className="font-bold">{warning.title}</h3><p className="mt-1 text-sm">{warning.message}</p></div>)}</div></View>;
}

const previewColumns = {
  interactions: [
    { key: "drug1", label: "Drug 1", value: (row) => row.drugs?.[0] },
    { key: "drug2", label: "Drug 2", value: (row) => row.drugs?.[1] },
    { key: "severity", label: "Severity", value: (row) => row.severity },
    { key: "clinicalEffect", label: "Clinical effect", value: (row) => row.clinicalEffect },
    { key: "pharmacistRecommendation", label: "Recommendation", value: (row) => row.pharmacistRecommendation }
  ],
  food: [
    { key: "drug", label: "Drug", value: (row) => row.drug },
    { key: "food", label: "Food or drink", value: (row) => row.food },
    { key: "severity", label: "Severity", value: (row) => row.severity },
    { key: "pharmacologyExplanation", label: "Explanation", value: (row) => row.pharmacologyExplanation },
    { key: "patientCounselingAdvice", label: "Counseling advice", value: (row) => row.patientCounselingAdvice }
  ],
  drugs: [
    { key: "drugName", label: "Drug name", value: (row) => row.drugName },
    { key: "genericName", label: "Generic", value: (row) => row.genericName },
    { key: "atcCode", label: "ATC", value: (row) => row.atcCode },
    { key: "dosageForm", label: "Dosage form", value: (row) => row.dosageForm },
    { key: "strength", label: "Strength", value: (row) => row.strength },
    { key: "route", label: "Route", value: (row) => row.route }
  ],
  icsr: [
    { key: "patientAge", label: "Age", value: (row) => row.patientAge },
    { key: "gender", label: "Gender", value: (row) => row.gender },
    { key: "suspectedDrug", label: "Suspected drug", value: (row) => row.suspectedDrug },
    { key: "reactionDescription", label: "Reaction", value: (row) => row.reactionDescription },
    { key: "seriousness", label: "Seriousness", value: (row) => row.seriousness }
  ]
};

function PreviewTable({ preview }) {
  const rows = preview.preview || [];
  const columns = previewColumns[preview.detectedType] || previewColumns.drugs;
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
            <tr>{columns.map((column) => <th key={column.key} className="px-4 py-3">{column.label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {rows.map((row, index) => (
              <tr key={`${preview.detectedType}-${index}`} className="align-top">
                {columns.map((column) => {
                  const value = column.value(row) || "Not provided";
                  return (
                    <td key={column.key} className="max-w-xs px-4 py-3">
                      {column.key === "severity" ? <Badge value={value} /> : <span className={value === "Not provided" ? "text-slate-400" : ""}>{value}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {preview.totalRows > rows.length && <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/60">Showing first {rows.length} rows from {preview.totalRows} parsed rows.</div>}
    </div>
  );
}

function Admin({ onDataChanged, uploadState, setUploadState }) {
  const { file, type, preview, imports = [] } = uploadState;
  const [uploading, setUploading] = useState(false);
  const updateUploadState = (next) => setUploadState((current) => ({ ...current, ...next }));
  const upload = async (shouldImport = false) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("type", type);
      body.append("import", String(shouldImport));
      const { data } = await api.post("/excel/upload", body);
      const nextImport = shouldImport && data.imported ? {
        id: `${Date.now()}-${file.name}`,
        fileName: file.name,
        type: data.detectedType,
        validRows: data.validRows,
        totalRows: data.totalRows,
        importedAt: new Date().toLocaleString()
      } : null;
      updateUploadState({ preview: data, imports: nextImport ? [nextImport, ...imports].slice(0, 5) : imports });
      if (shouldImport && data.imported) await onDataChanged?.();
      toast.success(shouldImport ? (data.imported ? "Import complete" : "Fix invalid rows before import") : "Preview ready");
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  return (
    <View>
      <div className="panel">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="section-title">Excel Upload and Validation</h2>
            <p className="text-sm text-slate-500">CSV/XLSX files are normalized before import, including simple drug1/drug2 interaction sheets.</p>
          </div>
          {file && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{file.name}</span>}
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.4fr_auto_auto]">
          <select className="field" value={type} onChange={(e) => updateUploadState({ type: e.target.value, preview: null })}>
            <option value="drugs">Drug dataset</option>
            <option value="interactions">Interaction dataset</option>
            <option value="food">Food interaction dataset</option>
            <option value="icsr">ADR reports</option>
          </select>
          <input className="field" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => updateUploadState({ file: e.target.files[0] || null, preview: null })} />
          <button className="primary justify-center" disabled={!file || uploading} onClick={() => upload(false)}><Upload size={18} /> {uploading ? "Reading..." : "Preview"}</button>
          <button className="secondary justify-center" disabled={!file || uploading || (preview && preview.invalidRows?.length > 0)} onClick={() => upload(true)}><FileSpreadsheet size={18} /> Import</button>
        </div>
      </div>
      {preview && (
        <div className="panel mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Import preview</h3>
              <p className="text-sm text-slate-500">{preview.validRows} valid rows from {preview.totalRows} parsed rows</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-clinical-100 px-3 py-1 text-xs font-bold uppercase text-clinical-700 dark:bg-clinical-900/50 dark:text-clinical-100">{preview.detectedType}</span>
              {preview.invalidRows.length === 0 ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">Ready to import</span> : <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-900/50 dark:text-red-200">{preview.invalidRows.length} rows need fixes</span>}
            </div>
          </div>
          {preview.requestedType !== preview.detectedType && <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">Detected as {preview.detectedType}. The importer will use this format instead of the selected {preview.requestedType} format.</p>}
          <PreviewTable preview={preview} />
          {preview.invalidRows.length > 0 && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
              <h4 className="font-bold text-red-800 dark:text-red-100">Rows needing fixes</h4>
              <div className="mt-2 grid gap-2 text-sm text-red-700 dark:text-red-100">
                {preview.invalidRows.slice(0, 6).map((item) => <p key={item.index}>Row {item.index}: {item.errors.join(", ")}</p>)}
              </div>
            </div>
          )}
        </div>
      )}
      {imports.length > 0 && (
        <div className="panel mt-4">
          <h2 className="section-title">Recent imports this session</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {imports.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{item.fileName}</p>
                    <p className="text-sm text-slate-500">{item.validRows} rows imported</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.type}</span>
                </div>
                <p className="mt-3 text-xs text-slate-500">{item.importedAt}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </View>
  );
}

function About() {
  const links = [
    { label: "vipin22nov@gmail.com", helper: "Email", href: "mailto:vipin22nov@gmail.com", icon: Mail },
    { label: "LinkedIn profile", helper: "www.linkedin.com/in/vipin-prajapati-5a11a0275", href: "https://www.linkedin.com/in/vipin-prajapati-5a11a0275", icon: Linkedin },
    { label: "GitHub profile", helper: "github.com/VipinPrajapati22", href: "https://github.com/VipinPrajapati22", icon: Github }
  ];

  return (
    <View>
      <section className="mx-auto max-w-3xl">
        <div className="panel">
          <p className="text-sm font-bold uppercase tracking-wide text-clinical-600">About the creator</p>
          <h2 className="mt-2 text-2xl font-bold">Vipin Prajapati</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Drug Interaction Awareness System is a pharmacy and pharmacovigilance portfolio project for safer self-medication awareness, interaction screening, and patient counseling support.
          </p>
          <div className="mt-6 space-y-3">
            {links.map(({ label, helper, href, icon: Icon }) => (
              <a key={href} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-4 rounded-lg border border-slate-200 p-4 transition hover:border-clinical-300 hover:bg-clinical-50 dark:border-slate-800 dark:hover:bg-slate-800">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-clinical-100 text-clinical-700 dark:bg-clinical-900/50 dark:text-clinical-100"><Icon size={20} /></span>
                <span>
                  <span className="block font-semibold">{label}</span>
                  <span className="text-sm text-slate-500">{helper}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </View>
  );
}

function SearchBox({ value, setValue, suggestions = [] }) {
  return <label className="relative block min-w-64"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><input className="field pl-10" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Search generic or brand name" />{suggestions.length > 0 && <div className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">{suggestions.map((drug) => <button type="button" key={drug._id || drug.rxcui || drug.drugName} onClick={() => setValue(drug.drugName)} className="block w-full px-3 py-2 text-left text-sm hover:bg-clinical-50 dark:hover:bg-slate-800"><b>{drug.drugName}</b><span className="ml-2 text-xs text-slate-500">{drug.genericName}</span></button>)}</div>}</label>;
}

function DrugAutocomplete({ value, onChange, fallbackDrugs }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open || !value || value.length < 2) return setSuggestions([]);
    const id = setTimeout(async () => {
      const { data } = await api.get(`/drugs/autocomplete?q=${encodeURIComponent(value)}&limit=8`);
      setSuggestions(data.data);
    }, 220);
    return () => clearTimeout(id);
  }, [value, open]);
  const list = suggestions.length ? suggestions : fallbackDrugs.slice(0, 8);
  return <div className="relative"><input className="field" value={value} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 120)} onChange={(e) => { setOpen(true); onChange(e.target.value); }} placeholder="Type generic or brand name" />{open && value?.length >= 2 && list.length > 0 && <div className="absolute z-20 mt-2 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">{list.map((drug) => <button type="button" key={drug._id || drug.rxcui || drug.drugCode || drug.drugName} onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange(drug.drugName); setSuggestions([]); setOpen(false); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-clinical-50 dark:hover:bg-slate-800"><b>{drug.drugName}</b><span className="ml-2 text-xs text-slate-500">{drug.rxcui || drug.genericName}</span></button>)}</div>}</div>;
}

function Badge({ value }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${severityClass[value] || "bg-slate-100 text-slate-700"}`}>{value}</span>;
}

function View({ children }) {
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>{children}</motion.div>;
}

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("dias_user") || "null"));
  const [active, setActive] = useState("Dashboard");
  const [dark, setDark] = useState(() => localStorage.getItem("dias_theme") === "dark");
  const [drugs, setDrugs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [adminUploadState, setAdminUploadState] = useState({ file: null, type: "drugs", preview: null, imports: [] });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("dias_theme", dark ? "dark" : "light");
  }, [dark]);

  const load = async () => {
    if (!localStorage.getItem("dias_token")) return;
    const [drugRes, analyticsRes] = await Promise.all([api.get("/drugs?limit=100"), api.get("/dashboard/analytics")]);
    setDrugs(drugRes.data.data);
    setAnalytics(analyticsRes.data);
  };

  useEffect(() => { load().catch(() => {}); }, [user]);
  useEffect(() => {
    if (user && active === "Dashboard") load().catch(() => {});
  }, [active, user]);
  if (!user) return <AuthScreen onLogin={setUser} />;

  const logout = () => {
    localStorage.removeItem("dias_token");
    localStorage.removeItem("dias_user");
    setUser(null);
  };

  const screens = {
    Dashboard: <Dashboard analytics={analytics} />,
    "Drug Database": <DrugDatabase drugs={drugs} refresh={load} />,
    "Interaction Checker": <InteractionChecker drugs={drugs} />,
    "Food Checker": <FoodChecker />,
    "ICSR Reporting": <IcsrReporting />,
    Counseling: <Counseling drugs={drugs} />,
    Admin: <Admin onDataChanged={load} uploadState={adminUploadState} setUploadState={setAdminUploadState} />,
    About: <About />
  };

  return <Shell user={user} onLogout={logout} dark={dark} setDark={setDark} active={active} setActive={setActive}>{screens[active]}</Shell>;
}
