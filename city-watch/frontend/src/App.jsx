import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import api from "./api";
import {
  ShieldCheck,
  Flame,
  HeartPulse,
  Siren,
  CarFront,
  Mic,
  LogOut,
  Bell,
  MapPin,
  Clock3,
  CheckCircle2,
  ArrowRight,
  Radio,
} from "lucide-react";

const getUser = () =>
  JSON.parse(localStorage.getItem("citywatch_user") || "null");

const saveSession = (data) => {
  localStorage.setItem("citywatch_token", data.token);
  localStorage.setItem("citywatch_user", JSON.stringify(data));
};

const logout = () => {
  localStorage.removeItem("citywatch_token");
  localStorage.removeItem("citywatch_user");
};

/* =========================
   PROTECTED ROUTE
========================= */

function Protected({ role, children }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === "AUTHORITY" ? "/authority" : "/citizen"}
        replace
      />
    );
  }

  return children;
}

/* =========================
   LAYOUT
========================= */

function Layout({ children }) {
  const user = getUser();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link
          className="brand"
          to={user?.role === "AUTHORITY" ? "/authority" : "/citizen"}
        >
          <span className="brand-mark">
            <ShieldCheck size={22} />
          </span>

          <span>
            City <b>Watch</b>
          </span>
        </Link>

        <div className="top-actions">
          <span className="role-pill">
            {user?.role === "AUTHORITY" ? user.department : "Citizen"}
          </span>

          <button
            className="ghost-btn"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

/* =========================
   LANDING PAGE
========================= */

function Landing() {
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(
        user.role === "AUTHORITY"
          ? "/authority"
          : "/citizen",
        { replace: true }
      );
    }
  }, [user, navigate]);

  return (
    <div className="landing">
      <nav className="landing-nav">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <ShieldCheck size={22} />
          </span>

          City <b>Watch</b>
        </Link>

        <div className="nav-links">
          <Link to="/login">Citizen Login</Link>
          <Link to="/register">Register</Link>
          <Link className="nav-authority" to="/authority-login">
            Authority Login
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <Radio size={15} />
            Emergency response made simple
          </div>

          <h1>
            Report. <span>Respond.</span>
            <br />
            Protect.
          </h1>

          <p>
            City Watch connects citizens with the right emergency department
            so reports reach the people who can respond, faster.
          </p>

          <div className="hero-buttons">
            <Link className="primary-btn" to="/login">
              Report an Emergency
              <ArrowRight size={18} />
            </Link>

            <Link className="secondary-btn" to="/register">
              Create Account
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-head">
            <span className="live-dot" />
            City Watch Response Network
          </div>

          <div className="response-line">
            <div className="response-icon fire">
              <Flame />
            </div>

            <div>
              <b>Fire Department</b>
              <small>Ready to respond</small>
            </div>

            <span className="online">ONLINE</span>
          </div>

          <div className="response-line">
            <div className="response-icon medical">
              <HeartPulse />
            </div>

            <div>
              <b>Medical Department</b>
              <small>Ready to respond</small>
            </div>

            <span className="online">ONLINE</span>
          </div>

          <div className="response-line">
            <div className="response-icon crime">
              <Siren />
            </div>

            <div>
              <b>Crime Department</b>
              <small>Ready to respond</small>
            </div>

            <span className="online">ONLINE</span>
          </div>

          <div className="response-line">
            <div className="response-icon accident">
              <CarFront />
            </div>

            <div>
              <b>Accident Department</b>
              <small>Ready to respond</small>
            </div>

            <span className="online">ONLINE</span>
          </div>
        </div>
      </section>

      <section className="how">
        <div>
          <span>01</span>
          <h3>Report</h3>
          <p>Describe the emergency in seconds, including voice input.</p>
        </div>

        <div>
          <span>02</span>
          <h3>Route</h3>
          <p>Your report is automatically sent to the right department.</p>
        </div>

        <div>
          <span>03</span>
          <h3>Respond</h3>
          <p>Track acknowledgement, response and resolution.</p>
        </div>
      </section>
    </div>
  );
}

/* =========================
   LOGIN
========================= */

function AuthPage({ authority = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      if (authority && data.role !== "AUTHORITY") {
        throw new Error(
          "Use the Authority Login for authority accounts."
        );
      }

      if (!authority && data.role !== "CITIZEN") {
        throw new Error(
          "Use the Citizen Login for authority accounts."
        );
      }

      saveSession(data);

      navigate(
        data.role === "AUTHORITY"
          ? "/authority"
          : "/citizen"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed."
      );
    }
  }

  return (
    <div className="auth-page">
      <Link className="brand auth-brand" to="/">
        <span className="brand-mark">
          <ShieldCheck size={22} />
        </span>

        City <b>Watch</b>
      </Link>

      <div className="auth-card">
        <div className="auth-icon">
          <ShieldCheck />
        </div>

        <div className="eyebrow">
          {authority ? "Authorized personnel" : "Citizen access"}
        </div>

        <h2>
          {authority ? "Authority Login" : "Welcome back"}
        </h2>

        <p>
          {authority
            ? "Sign in to your department response dashboard."
            : "Sign in to report an emergency and track your reports."}
        </p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={submit}>
          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={
                authority
                  ? "fire@citywatch.local"
                  : "you@example.com"
              }
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </label>

          <button className="primary-btn full">
            {authority
              ? "Enter Authority Dashboard"
              : "Login"}

            <ArrowRight size={17} />
          </button>
        </form>

        {!authority && (
          <p className="auth-foot">
            New to City Watch?{" "}
            <Link to="/register">Create an account</Link>
          </p>
        )}

        {authority && (
          <p className="auth-foot">
            <Link to="/login">Citizen Login</Link>
          </p>
        )}
      </div>
    </div>
  );
}

/* =========================
   REGISTER
========================= */

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      const { data } = await api.post(
        "/auth/register",
        form
      );

      saveSession(data);
      navigate("/citizen");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed."
      );
    }
  }

  return (
    <div className="auth-page">
      <Link className="brand auth-brand" to="/">
        <span className="brand-mark">
          <ShieldCheck size={22} />
        </span>

        City <b>Watch</b>
      </Link>

      <div className="auth-card wide">
        <div className="eyebrow">
          Citizen registration
        </div>

        <h2>Create your account</h2>

        <p>
          Your identity is saved securely so you never need
          to enter your Citizen ID when reporting.
        </p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={submit}>
          <label>
            Full Name

            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </label>

          <label>
            Email

            <input
              required
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />
          </label>

          <label>
            Phone Number

            <input
              required
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
            />
          </label>

          <label>
            Password

            <input
              required
              minLength="6"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />
          </label>

          <button className="primary-btn full">
            Create Citizen Account
            <ArrowRight size={17} />
          </button>
        </form>

        <p className="auth-foot">
          Already registered?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

/* =========================
   EMERGENCY TYPES
========================= */

const types = [
  {
    key: "FIRE",
    label: "Fire",
    icon: Flame,
    cls: "fire",
  },
  {
    key: "MEDICAL",
    label: "Medical",
    icon: HeartPulse,
    cls: "medical",
  },
  {
    key: "CRIME",
    label: "Crime",
    icon: Siren,
    cls: "crime",
  },
  {
    key: "ACCIDENT",
    label: "Accident",
    icon: CarFront,
    cls: "accident",
  },
];

/* =========================
   VOICE INPUT
========================= */

function VoiceInput({ onText }) {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");

  function start() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessage(
        "Speech recognition is not supported in this browser."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      setMessage("Listening...");
    };

    recognition.onresult = (e) => {
      const text =
        e.results[0][0].transcript;

      onText(text);

      setMessage(
        "Voice captured. Review the text before submitting."
      );
    };

    recognition.onerror = (e) => {
      setMessage(
        e.error === "not-allowed"
          ? "Microphone permission was denied."
          : "Could not recognize speech. Try again."
      );
    };

    recognition.onend = () => {
      setListening(false);
    };

    try {
      recognition.start();
    } catch {
      setListening(false);
      setMessage(
        "Voice input is already active. Try again."
      );
    }
  }

  return (
    <div className="voice-wrap">
      <button
        type="button"
        className={`voice-btn ${
          listening ? "listening" : ""
        }`}
        onClick={start}
      >
        <Mic size={18} />

        {listening
          ? "Listening..."
          : "Speak your report"}
      </button>

      {message && (
        <span className="voice-message">
          {message}
        </span>
      )}
    </div>
  );
}

/* =========================
   CITIZEN DASHBOARD
========================= */

function CitizenDashboard() {
  const user = getUser();

  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    emergencyType: "FIRE",
    location: "",
    description: "",
    latitude: null,
    longitude: null,
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try {
      const r = await api.get("/citizen/reports");
      setReports(r.data);

      const n = await api.get(
        "/citizen/notifications"
      );

      setNotifications(n.data.items || []);
    } catch {
      // Ignore polling errors
    }
  }

  useEffect(() => {
    load();

    const t = setInterval(load, 5000);

    return () => clearInterval(t);
  }, []);

  function getCurrentLocation() {
    setLocationLoading(true);
    setLocationMessage("");
    setError("");

    if (!navigator.geolocation) {
      setLocationMessage(
        "Location services are not supported by this browser."
      );
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setForm((f) => ({
          ...f,
          latitude,
          longitude,
        }));

        setLocationMessage("✓ Current location detected.");
        setLocationLoading(false);
      },
      (error) => {
        console.error("Location error:", error);

        let message =
          "Unable to access your location. Please allow location permission.";

        if (error.code === error.TIMEOUT) {
          message = "Location request timed out. Please try again.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Your current location is unavailable. Please try again.";
        }

        setLocationMessage(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  function voiceText(text) {
    setForm((f) => {
      const lower = text.toLowerCase();

      let type = f.emergencyType;

      if (
        /fire|smoke|burning|flame/.test(lower)
      ) {
        type = "FIRE";
      } else if (
        /ambulance|unconscious|injured|medical|bleeding/.test(
          lower
        )
      ) {
        type = "MEDICAL";
      } else if (
        /robbery|theft|attack|crime|assault/.test(
          lower
        )
      ) {
        type = "CRIME";
      } else if (
        /accident|collision|crash|car accident/.test(
          lower
        )
      ) {
        type = "ACCIDENT";
      }

      return {
        ...f,
        description: text,
        emergencyType: type,
      };
    });
  }

  async function submit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      const { data } = await api.post(
        "/citizen/reports",
        form
      );

      setSuccess(
        `Report ${data.reportCode} submitted to ${data.department}.`
      );

      setForm({
        emergencyType: "FIRE",
        location: "",
        description: "",
        latitude: null,
        longitude: null,
      });

      setLocationMessage("");
      setShowForm(false);

      load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not submit the report."
      );
    }
  }

  return (
    <Layout>
      <div className="dashboard">
        <section className="dash-head">
          <div>
            <div className="eyebrow">
              Citizen dashboard
            </div>

            <h1>
              Good to see you,{" "}
              {user?.name?.split(" ")[0]}.
            </h1>

            <p>
              Report an emergency quickly and track the
              response from City Watch.
            </p>
          </div>

          <button
            className="danger-btn"
            onClick={() => setShowForm(true)}
          >
            <Siren size={19} />
            Report Emergency
          </button>
        </section>

        {success && (
          <div className="success-box">
            <CheckCircle2 />
            {success}
          </div>
        )}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {showForm && (
          <section className="report-form card">
            <div className="section-title">
              <div>
                <div className="eyebrow">
                  Emergency report
                </div>

                <h2>What is happening?</h2>
              </div>

              <button
                className="icon-close"
                onClick={() =>
                  setShowForm(false)
                }
              >
                ×
              </button>
            </div>

            <form onSubmit={submit}>
              <label>
                Emergency Type

                <div className="type-grid">
                  {types.map((t) => {
                    const I = t.icon;

                    return (
                      <button
                        type="button"
                        key={t.key}
                        className={`type-option ${
                          t.cls
                        } ${
                          form.emergencyType ===
                          t.key
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          setForm({
                            ...form,
                            emergencyType:
                              t.key,
                          })
                        }
                      >
                        <I />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </label>

              <label>
                Location

                <input
                  required
                  value={form.location}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      location:
                        e.target.value,
                    })
                  }
                  placeholder="Where is the emergency?"
                />

                <button
                  type="button"
                  className="secondary-btn location-btn"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  style={{ marginTop: "10px" }}
                >
                  <MapPin size={17} />
                  {locationLoading
                    ? "Detecting location..."
                    : "Share Current Location"}
                </button>

                {locationMessage && (
                  <small
                    className="location-message"
                    style={{
                      display: "block",
                      marginTop: "8px",
                    }}
                  >
                    {locationMessage}
                  </small>
                )}

                {form.latitude !== null &&
                  form.longitude !== null && (
                    <small
                      className="location-coordinates"
                      style={{
                        display: "block",
                        marginTop: "5px",
                        opacity: 0.75,
                      }}
                    >
                      Location coordinates captured.
                    </small>
                  )}
              </label>

              <label>
                Description

                <textarea
                  required
                  rows="5"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    })
                  }
                  placeholder="Describe what happened..."
                />
              </label>

              <VoiceInput
                onText={voiceText}
              />

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="primary-btn"
                  type="submit"
                >
                  Submit Emergency
                  <ArrowRight size={17} />
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="stats-grid">
          <div className="stat card">
            <span>Active Reports</span>

            <strong>
              {
                reports.filter(
                  (r) => r.status !== "RESOLVED"
                ).length
              }
            </strong>
          </div>

          <div className="stat card">
            <span>Total Reports</span>

            <strong>{reports.length}</strong>
          </div>

          <div className="stat card">
            <span>Notifications</span>

            <strong>
              {
                notifications.filter(
                  (n) => !n.readFlag
                ).length
              }
            </strong>
          </div>
        </section>

        <section className="card">
          <div className="section-title">
            <div>
              <div className="eyebrow">
                Your activity
              </div>

              <h2>My Reports</h2>
            </div>

            <span className="muted">
              {reports.length} reports
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="empty">
              <Siren size={30} />

              <h3>No reports yet</h3>

              <p>
                When you report an emergency, it will
                appear here.
              </p>
            </div>
          ) : (
            <div className="report-list">
              {reports.map((r) => (
                <ReportCard
                  key={r.reportCode}
                  report={r}
                />
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div className="section-title">
            <div>
              <div className="eyebrow">
                Updates
              </div>

              <h2>Notifications</h2>
            </div>
          </div>

          {notifications.length === 0 ? (
            <p className="muted">
              No notifications yet.
            </p>
          ) : (
            <div className="notification-list">
              {notifications
                .slice(0, 8)
                .map((n) => (
                  <div
                    className={`notification ${
                      n.readFlag
                        ? ""
                        : "unread"
                    }`}
                    key={n.id}
                  >
                    <Bell size={17} />

                    <div>
                      <b>{n.message}</b>

                      <small>
                        {new Date(
                          n.createdAt
                        ).toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

/* =========================
   REPORT CARD
========================= */

function ReportCard({
  report,
  authority = false,
  onStatus,
}) {
  const statusOrder = [
    "REPORTED",
    "ACKNOWLEDGED",
    "ON_THE_WAY",
    "RESOLVED",
  ];

  const index = statusOrder.indexOf(
    report.status
  );

  return (
    <div className="report-card">
      <div className="report-card-top">
        <div>
          <span className="report-id">
            {report.reportCode}
          </span>

          <span
            className={`status ${report.status.toLowerCase()}`}
          >
            {report.status.replaceAll("_", " ")}
          </span>
        </div>

        <b>{report.emergencyType}</b>
      </div>

      <div className="report-main">
        <h3>{report.description}</h3>

        <div className="meta">
          <span>
            <MapPin size={15} />
            {report.location}
          </span>

          <span>
            <Clock3 size={15} />
            {new Date(
              report.createdAt
            ).toLocaleString()}
          </span>

          <span>{report.department}</span>
        </div>

        {report.latitude != null &&
          report.longitude != null && (
            <div style={{ marginTop: "10px" }}>
              <a
                className="secondary-btn"
                href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  textDecoration: "none",
                }}
              >
                <MapPin size={16} />
                {authority
                  ? "View Citizen Location"
                  : "View Report Location"}
              </a>
            </div>
          )}
      </div>

      <div className="timeline">
        {statusOrder.map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`timeline-step ${
                i <= index ? "done" : ""
              }`}
            >
              <span>
                {i < index ? (
                  <CheckCircle2 size={15} />
                ) : i === index ? (
                  <span className="dot" />
                ) : (
                  <span className="empty-dot" />
                )}
              </span>

              <small>
                {s.replaceAll("_", " ")}
              </small>
            </div>

            {i < 3 && (
              <div
                className={`timeline-line ${
                  i < index ? "done" : ""
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {authority && (
        <div className="authority-actions">
          {report.status === "REPORTED" && (
            <button
              onClick={() =>
                onStatus(
                  report.reportCode,
                  "ACKNOWLEDGED"
                )
              }
              className="primary-btn"
            >
              Acknowledge
            </button>
          )}

          {report.status === "ACKNOWLEDGED" && (
            <button
              onClick={() =>
                onStatus(
                  report.reportCode,
                  "ON_THE_WAY"
                )
              }
              className="primary-btn"
            >
              On the Way
            </button>
          )}

          {report.status === "ON_THE_WAY" && (
            <button
              onClick={() =>
                onStatus(
                  report.reportCode,
                  "RESOLVED"
                )
              }
              className="primary-btn"
            >
              Mark Resolved
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================
   AUTHORITY DASHBOARD
========================= */

function AuthorityDashboard() {
  const user = getUser();

  const [reports, setReports] = useState([]);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const r = await api.get(
        "/authority/reports"
      );

      setReports(r.data);

      const n = await api.get(
        "/authority/notifications"
      );

      setNotes(n.data.items || []);
    } catch {
      // Ignore polling errors
    }
  }

  useEffect(() => {
    load();

    const t = setInterval(load, 5000);

    return () => clearInterval(t);
  }, []);

  async function update(code, status) {
    setError("");

    try {
      await api.patch(
        `/authority/reports/${code}/status`,
        { status }
      );

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Status update failed."
      );
    }
  }

  const active = reports.filter(
    (r) => r.status !== "RESOLVED"
  );

  return (
    <Layout>
      <div className="dashboard">
        <section className="dash-head">
          <div>
            <div className="eyebrow">
              Authority dashboard
            </div>

            <h1>{user?.department}</h1>

            <p>
              Monitor and respond to emergencies
              assigned to your department.
            </p>
          </div>

          <div className="authority-online">
            <span className="live-dot" />
            Response network online
          </div>
        </section>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <section className="stats-grid four">
          <div className="stat card alert-stat">
            <span>New Alerts</span>

            <strong>
              {
                notes.filter(
                  (n) => !n.readFlag
                ).length
              }
            </strong>
          </div>

          <div className="stat card">
            <span>Active</span>

            <strong>{active.length}</strong>
          </div>

          <div className="stat card">
            <span>On the Way</span>

            <strong>
              {
                reports.filter(
                  (r) =>
                    r.status === "ON_THE_WAY"
                ).length
              }
            </strong>
          </div>

          <div className="stat card">
            <span>Resolved</span>

            <strong>
              {
                reports.filter(
                  (r) =>
                    r.status === "RESOLVED"
                ).length
              }
            </strong>
          </div>
        </section>

        {notes
          .filter((n) => !n.readFlag)
          .slice(0, 4)
          .map((n) => (
            <div
              className="alert-card"
              key={n.id}
            >
              <div className="alert-icon">
                <Bell />
              </div>

              <div>
                <b>NEW EMERGENCY</b>

                <p>{n.message}</p>

                <small>
                  Report{" "}
                  {n.report?.reportCode}
                </small>
              </div>
            </div>
          ))}

        <section className="card">
          <div className="section-title">
            <div>
              <div className="eyebrow">
                Department queue
              </div>

              <h2>Emergency Reports</h2>
            </div>

            <span className="muted">
              {reports.length} reports
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="empty">
              <ShieldCheck size={30} />

              <h3>No reports right now</h3>

              <p>
                New {user?.department} emergencies
                will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="report-list">
              {reports.map((r) => (
                <ReportCard
                  key={r.reportCode}
                  report={r}
                  authority
                  onStatus={update}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

/* =========================
   MAIN APP
========================= */

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={<AuthPage />}
      />

      <Route
        path="/authority-login"
        element={<AuthPage authority />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/citizen"
        element={
          <Protected role="CITIZEN">
            <CitizenDashboard />
          </Protected>
        }
      />

      <Route
        path="/authority"
        element={
          <Protected role="AUTHORITY">
            <AuthorityDashboard />
          </Protected>
        }
      />

      <Route
        path="*"
        element={
          <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}

export default App;