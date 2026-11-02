import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Activity, Calendar, Pill, Stethoscope, HeartPulse, Droplet, Brain, ShieldCheck, ClipboardCheck, Loader2, Plus, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { fetchVitals, fetchAppointments, fetchMedications, insertAppointment, insertMedication, insertVitals } from "@/lib/db";

// ── QuickStats ──────────────────────────────────────────────────────────────
const QuickStats = ({ appointments, medications, vitals }: any) => {
  const { t } = useLanguage();
  const stats = [
    {
      label: t("nav_records") || "Next Appointment",
      value: appointments[0] ? `${appointments[0].date} • ${appointments[0].time}` : "No upcoming",
      icon: Calendar
    },
    {
      label: t("nav_store") || "Medications",
      value: medications.length > 0 ? `${medications.length} Active` : "None",
      icon: Pill
    },
    {
      label: t("nav_blood") || "Lab Results",
      value: "0 New",
      icon: Droplet
    },
    {
      label: t("nav_dashboard") || "Wellness Score",
      value: vitals ? "84 / 100" : "—",
      icon: Activity
    }
  ];
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-lg shadow-primary/5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-semibold mt-1">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Add Appointment Modal ────────────────────────────────────────────────────
const AddAppointmentModal = ({ onClose, onSave }: { onClose: () => void; onSave: (a: any) => void }) => {
  const [form, setForm] = useState({ title: "", date: "", time: "", location: "" });
  const [saving, setSaving] = useState(false);
  const userEmail = localStorage.getItem("az_user_email") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await insertAppointment({ user_email: userEmail, ...form });
    setSaving(false);
    if (result) { onSave(result); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/60 backdrop-blur-xl" onClick={onClose}>
      <div className="bg-card border border-border/60 rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Add Appointment</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: "title", label: "Title", placeholder: "e.g. Primary Care Checkup" },
            { key: "date", label: "Date", placeholder: "e.g. Apr 12" },
            { key: "time", label: "Time", placeholder: "e.g. 9:30 AM" },
            { key: "location", label: "Location", placeholder: "e.g. Arogya Clinic" }
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs uppercase tracking-wide text-muted-foreground">{f.label}</label>
              <input
                required
                type="text"
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save to Supabase"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Add Medication Modal ─────────────────────────────────────────────────────
const AddMedicationModal = ({ onClose, onSave }: { onClose: () => void; onSave: (m: any) => void }) => {
  const [form, setForm] = useState({ name: "", dose: "", schedule: "", adherence: "0%" });
  const [saving, setSaving] = useState(false);
  const userEmail = localStorage.getItem("az_user_email") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await insertMedication({ user_email: userEmail, ...form });
    setSaving(false);
    if (result) { onSave(result); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/60 backdrop-blur-xl" onClick={onClose}>
      <div className="bg-card border border-border/60 rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Add Medication</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: "name", label: "Medicine Name", placeholder: "e.g. Metformin" },
            { key: "dose", label: "Dose", placeholder: "e.g. 500 mg" },
            { key: "schedule", label: "Schedule", placeholder: "e.g. After breakfast" }
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs uppercase tracking-wide text-muted-foreground">{f.label}</label>
              <input
                required
                type="text"
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save to Supabase"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const PatientDashboard = () => {
  const { t } = useLanguage();
  const userName = useMemo(() => localStorage.getItem("az_user_name") || "User", []);
  const userEmail = useMemo(() => localStorage.getItem("az_user_email") || "", []);

  const [loading, setLoading] = useState(true);
  const [vitals, setVitals] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [showApptModal, setShowApptModal] = useState(false);
  const [showMedModal, setShowMedModal] = useState(false);

  // Use real data only
  const displayVitals = vitals
    ? [
        { label: "Heart Rate", value: vitals.heart_rate || "—", trend: "", status: "Logged" },
        { label: "Blood Pressure", value: vitals.blood_pressure || "—", trend: "", status: "Logged" },
        { label: "Sleep", value: vitals.sleep || "—", trend: "", status: "Logged" },
        { label: "Steps", value: vitals.steps || "—", trend: "", status: "Logged" }
      ]
    : [];

  const displayAppointments = appointments;
  const displayMedications = medications;

  useEffect(() => {
    if (!userEmail) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      const [v, a, m] = await Promise.all([
        fetchVitals(userEmail),
        fetchAppointments(userEmail),
        fetchMedications(userEmail)
      ]);
      setVitals(v);
      setAppointments(a);
      setMedications(m);
      setLoading(false);
    };
    load();
  }, [userEmail]);

  const hasData = appointments.length > 0 || medications.length > 0 || vitals;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      )}
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{t("nav_dashboard")}</p>
                {!hasData && (
                  <span className="text-[10px] uppercase tracking-[0.3em] px-3 py-1 rounded-full border border-border/60 bg-card/70 text-muted-foreground">
                    No Data Yet
                  </span>
                )}
                {hasData && (
                  <span className="text-[10px] uppercase tracking-[0.3em] px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary">
                    Live Data ✓
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mt-3">
                {t("home_ai_title") || "Welcome back,"} <span className="gradient-text">{userName}</span>
              </h1>
              <div className="mt-3 text-sm text-muted-foreground space-y-1">
                <p>{userEmail || "Logged in via Supabase"}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Primary Physician</p>
                  <p className="text-lg font-semibold">Dr. Meera Iyer</p>
                  <p className="text-xs text-muted-foreground">Endocrinology • Arogya Midtown</p>
                  <p className="text-xs text-muted-foreground mt-1">Last visit: Mar 10, 2026</p>
                </div>
              </div>
            </div>
          </div>

          <QuickStats appointments={displayAppointments} medications={displayMedications} vitals={vitals} />

          {/* Vitals & AI Insights */}
          <div className="mt-12 grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
            <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg shadow-primary/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Vitals &amp; Trends</h2>
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {vitals ? "From DB" : "Demo"}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {displayVitals.length === 0 ? (
                  <div className="col-span-2 text-center text-sm text-muted-foreground py-6">
                    No vitals logged yet.
                  </div>
                ) : (
                  displayVitals.map((vital) => (
                    <div key={vital.label} className="rounded-2xl border border-border/60 bg-background/60 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{vital.label}</p>
                      <p className="text-2xl font-semibold mt-2">{vital.value}</p>
                      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <span>{vital.status}</span>
                        {vital.trend && <span>{vital.trend}</span>}
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-muted/60">
                        <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-primary to-secondary" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">AI Insights</h2>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>Your fasting glucose average is down 5% this week. Keep breakfast protein steady to maintain the trend.</p>
                <p>Blood pressure is within target range. Continue sodium tracking for consistent control.</p>
                <div className="rounded-2xl border border-border/60 bg-background/60 p-4 text-foreground">
                  Suggested focus: <span className="font-semibold">20-minute walk</span> after dinner tonight.
                </div>
              </div>
            </div>
          </div>

          {/* Appointments, Medications, Labs */}
          <div className="mt-12 grid lg:grid-cols-3 gap-8">
            {/* Appointments */}
            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Upcoming Appointments</h3>
                </div>
                <button
                  onClick={() => setShowApptModal(true)}
                  className="p-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition"
                  title="Add appointment"
                >
                  <Plus className="w-4 h-4 text-primary" />
                </button>
              </div>
              <div className="space-y-4">
                {displayAppointments.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">No upcoming appointments.</div>
                ) : (
                  displayAppointments.map((item: any) => (
                    <div key={item.id} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.date} • {item.time}</p>
                      <p className="text-xs text-muted-foreground">{item.location}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Medications */}
            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Pill className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Medications</h3>
                </div>
                <button
                  onClick={() => setShowMedModal(true)}
                  className="p-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition"
                  title="Add medication"
                >
                  <Plus className="w-4 h-4 text-primary" />
                </button>
              </div>
              <div className="space-y-4">
                {displayMedications.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">No medications added.</div>
                ) : (
                  displayMedications.map((med: any) => (
                    <div key={med.id} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{med.name}</p>
                        <span className="text-xs text-muted-foreground">{med.adherence}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{med.dose} • {med.schedule}</p>
                      <div className="mt-3 h-2 rounded-full bg-muted/60">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: med.adherence || "0%" }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Lab Results */}
            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3 mb-5">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Lab Results</h3>
              </div>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground text-center py-4">No lab results available.</div>
              </div>
            </div>
          </div>

          {/* Today's Care Tasks */}
          <div className="mt-12 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-lg shadow-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">Today's Care Tasks</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="col-span-full text-sm text-muted-foreground text-center py-4">No tasks for today.</div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {showApptModal && (
        <AddAppointmentModal
          onClose={() => setShowApptModal(false)}
          onSave={(a) => setAppointments([a, ...appointments])}
        />
      )}
      {showMedModal && (
        <AddMedicationModal
          onClose={() => setShowMedModal(false)}
          onSave={(m) => setMedications([m, ...medications])}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
