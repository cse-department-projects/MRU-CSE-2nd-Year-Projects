import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  Droplets,
  FileText,
  HeartPulse,
  PhoneCall,
  ShieldCheck,
  UserCircle,
  Loader2,
  X,
  Edit
} from "lucide-react";
import { fetchUserProfile, upsertUserProfile, fetchVitals, fetchAppointments, fetchMedications } from "@/lib/db";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const userName = useMemo(() => localStorage.getItem("az_user_name") || "User", []);
  const userEmail = useMemo(() => localStorage.getItem("az_user_email") || "", []);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [vitals, setVitals] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!userEmail) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      const [p, v, a, m] = await Promise.all([
        fetchUserProfile(userEmail),
        fetchVitals(userEmail),
        fetchAppointments(userEmail),
        fetchMedications(userEmail)
      ]);
      setProfile(p);
      setVitals(v);
      setAppointments(a);
      setMedications(m);
      setLoading(false);
    };
    load();
  }, [userEmail]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("az_logged_in");
    localStorage.removeItem("az_user_name");
    localStorage.removeItem("az_user_email");
    navigate("/login");
  };

  const vitalsDisplay = [
    { label: "Heart Rate", value: vitals?.heart_rate || "—" },
    { label: "Blood Pressure", value: vitals?.blood_pressure || "—" },
    { label: "HbA1c", value: vitals?.hba1c || "—" },
    { label: "BMI", value: vitals?.bmi || "—" }
  ];

  const upcomingAppointments = appointments;

  const medsList = medications;

  const handleProfileUpdate = (updated: any) => {
    setProfile(updated);
    setShowEditModal(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      )}
      <main className="pt-28 pb-24">
        {/* Header Card */}
        <section className="container mx-auto px-6">
          <div className="rounded-[2.5rem] border border-border/60 bg-gradient-to-br from-card via-background to-card/70 p-8 md:p-12 shadow-xl shadow-primary/5 relative overflow-hidden">
            <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-secondary/10 blur-[120px]" />
            <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                  <UserCircle className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Patient Profile</p>
                  <h1 className="text-3xl md:text-4xl font-bold mt-2">{userName}</h1>
                  <p className="text-sm text-muted-foreground mt-1">{userEmail}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
                  {profile ? "Live Data ✓" : "Demo Data"}
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-700">
                  Active Patient
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Personal Details, Health Summary, Coverage */}
        <section className="container mx-auto px-6 mt-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Personal Details</h2>
                </div>
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="p-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition"
                  title="Edit Profile"
                >
                  <Edit className="w-4 h-4 text-primary" />
                </button>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><span className="font-semibold text-foreground">Name:</span> {profile?.name || userName}</p>
                <p><span className="font-semibold text-foreground">Email:</span> {userEmail}</p>
                <p><span className="font-semibold text-foreground">Blood Group:</span> {profile?.blood_group || "—"}</p>
                <p><span className="font-semibold text-foreground">Address:</span> {profile?.address || "—"}</p>
                <p><span className="font-semibold text-foreground">Emergency Contact:</span> {profile?.emergency_contact || "—"}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <HeartPulse className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Health Summary</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><span className="font-semibold text-foreground">Primary Conditions:</span> Type 2 Diabetes, Mild Hypertension</p>
                <p><span className="font-semibold text-foreground">Allergies:</span> Penicillin, Latex</p>
                <p><span className="font-semibold text-foreground">Care Plan:</span> Glucose monitoring, low sodium diet</p>
                <p><span className="font-semibold text-foreground">Primary Physician:</span> Dr. Meera Iyer</p>
                <p><span className="font-semibold text-foreground">Last Visit:</span> Mar 10, 2026</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Coverage</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><span className="font-semibold text-foreground">Insurance:</span> Arogya Plus Gold</p>
                <p><span className="font-semibold text-foreground">Policy #:</span> AG-8820319</p>
                <p><span className="font-semibold text-foreground">Coverage:</span> OPD + Hospitalization</p>
                <p><span className="font-semibold text-foreground">Valid Until:</span> Dec 31, 2026</p>
              </div>
            </div>
          </div>
        </section>

        {/* Vitals & Upcoming Appointments */}
        <section className="container mx-auto px-6 mt-12">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Vitals Snapshot</h2>
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {vitals ? "From Supabase ✓" : "No vitals logged yet"}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {vitalsDisplay.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-semibold mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Upcoming Care</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                {upcomingAppointments.length === 0 ? (
                   <p className="text-center py-4">No upcoming appointments.</p>
                ) : (
                  upcomingAppointments.map((appt: any) => (
                    <div key={appt.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <p className="font-semibold text-foreground">{appt.title}</p>
                      <p className="text-xs text-muted-foreground">{appt.date} • {appt.time}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Medications & Medical Notes */}
        <section className="container mx-auto px-6 mt-12">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <Droplets className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Medications</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                {medsList.length === 0 ? (
                  <p className="text-center py-4">No medications added.</p>
                ) : (
                  medsList.map((m: any) => (
                    <div key={m.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      {m.name} {m.dose} • {m.schedule}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Medical Notes</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Diet focus: reduce refined carbs, increase protein and fiber.</p>
                <p>Exercise: 20-minute walk after dinner, 5x weekly.</p>
                <p>Next review: monitor HbA1c in 6 weeks.</p>
              </div>
              <button className="mt-5 w-full rounded-xl border border-border/60 bg-background/70 py-2 text-sm font-semibold">
                Download summary
              </button>
            </div>
          </div>
        </section>

        {/* Logout */}
        <section className="container mx-auto px-6 mt-12">
          <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-lg shadow-primary/5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <PhoneCall className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <p className="text-lg font-semibold">{userEmail || userName}</p>
              </div>
            </div>
            <button
              className="rounded-xl bg-destructive text-destructive-foreground px-6 py-2 text-sm font-semibold"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </section>
      </main>
      <Footer />
      
      {showEditModal && (
        <EditProfileModal 
          userEmail={userEmail}
          initialData={{
            name: profile?.name || userName,
            blood_group: profile?.blood_group || "",
            address: profile?.address || "",
            emergency_contact: profile?.emergency_contact || "",
          }}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
};

const EditProfileModal = ({ userEmail, initialData, onClose, onSave }: any) => {
  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await upsertUserProfile({
      user_email: userEmail,
      name: form.name,
      blood_group: form.blood_group,
      address: form.address,
      emergency_contact: form.emergency_contact
    });
    setSaving(false);
    if (result) {
      toast.success("Profile updated securely");
      onSave(result);
    } else {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/60 backdrop-blur-xl" onClick={onClose}>
      <div className="bg-card border border-border/60 rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Edit Profile</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: "name", label: "Full Name", placeholder: "Your Name" },
            { key: "blood_group", label: "Blood Group", placeholder: "e.g. O+" },
            { key: "emergency_contact", label: "Emergency Contact", placeholder: "Phone Number" },
            { key: "address", label: "Address", placeholder: "City, Region" }
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
            className="mt-2 w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save to Supabase"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
