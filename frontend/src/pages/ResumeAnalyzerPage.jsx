import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { resumeApi } from '../api/resumeApi';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Award,
  ArrowRight,
  Download,
  PlusCircle,
  History,
  Trash2,
  FileCheck,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';
import {
  validateResumeFile,
  extractResumeText,
  verifyResumeContent,
  calculateAccurateResumeAnalysis
} from '../utils/resumeParser';

const RESUME_TEMPLATES = [
  {
    title: 'Full Stack Java & React Developer',
    fileName: 'FullStack_Engineer_Resume.pdf',
    text: `Full Stack Java Developer with 2+ years of experience designing and developing scalable microservices and reactive single-page applications.

TECHNICAL SKILLS:
- Languages: Java, JavaScript, TypeScript, SQL, HTML5, CSS3
- Frameworks: Spring Boot, React, Node.js, REST API, Hibernate
- Databases: PostgreSQL, MongoDB, MySQL
- DevOps & Cloud: Docker, Kubernetes, AWS, Git, GitHub Actions, CI/CD, Linux
- Core Concepts: Data Structures, Algorithms, Microservices, Agile, Clean Code

EXPERIENCE & PROJECTS:
- E-Commerce Microservices Engine: Developed high-throughput REST APIs using Spring Boot and PostgreSQL, handling 15,000+ daily orders with 99.9% uptime. Improved query latency by 40%.
- Real-Time Analytics Dashboard: Built an interactive React and TypeScript monitoring console with live WebSockets.
- Cloud Containerization Pipeline: Configured multi-stage Dockerfiles and automated CI/CD deployment to AWS EC2 clusters.`
  },
  {
    title: 'Frontend React & UI Engineer',
    fileName: 'Frontend_Specialist_Resume.pdf',
    text: `Frontend Software Engineer specializing in React, TypeScript, responsive CSS architecture, and modern state management.

TECHNICAL SKILLS:
- Languages & Core: JavaScript (ES6+), TypeScript, HTML, CSS, Next.js
- Frontend Ecosystem: React, Redux Toolkit, TailwindCSS, Web Vitals, GraphQL
- Tools & Version Control: Git, GitHub, Webpack, Vite, Jest, Figma to Code

EXPERIENCE & PROJECTS:
- Enterprise Design System: Built accessible UI component library in React and TypeScript adopted by 6 engineering teams.
- SaaS Customer Portal: Optimized client-side bundle size by 35% using code splitting and lazy loading, achieving 98+ Google Lighthouse score.`
  },
  {
    title: 'Cloud DevOps & Infrastructure Engineer',
    fileName: 'Cloud_DevOps_Resume.pdf',
    text: `Cloud and DevOps Engineer experienced in automating multi-cloud container orchestration, Terraform infrastructure as code, and CI/CD pipelines.

TECHNICAL SKILLS:
- Cloud Providers: AWS (EC2, S3, RDS, Lambda, VPC), Azure
- Containers & Orchestration: Docker, Kubernetes, Helm
- CI/CD & Automation: GitHub Actions, Jenkins, Linux, Bash Scripting, Terraform
- Monitoring & Version Control: Git, Prometheus, Grafana, Python`
  }
];

export const ResumeAnalyzerPage = () => {
  const [analysis, setAnalysis] = useState(null);
  const [resumeHistory, setResumeHistory] = useState([]);
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const [latestRes, historyRes] = await Promise.allSettled([
        resumeApi.getLatestResume(),
        resumeApi.getAllResumes()
      ]);

      if (latestRes.status === 'fulfilled' && latestRes.value && latestRes.value.atsScore) {
        setAnalysis(latestRes.value);
        setFileName(latestRes.value.fileName || '');
      }

      if (historyRes.status === 'fulfilled' && Array.isArray(historyRes.value)) {
        setResumeHistory(historyRes.value.filter((r) => r && r.atsScore));
      }
    } catch (err) {
      console.error('Error loading resume analysis data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setToastMsg('');

    try {
      // 1. Strict validation - rejects presentations (.ppt, .pptx) & invalid formats
      validateResumeFile(file);

      setFileName(file.name);
      setToastMsg(`Extracting text from "${file.name}"...`);

      // 2. Clean text extraction without binary bytecode
      const extracted = await extractResumeText(file);

      // 3. Verify content contains standard resume sections
      const check = verifyResumeContent(extracted);
      if (!check.isValid) {
        setErrorMessage(check.reason);
        setResumeText('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setResumeText(extracted);
      setToastMsg(`✅ Parsed "${file.name}" successfully! Click "Analyze Resume" to calculate accurate ATS scores.`);
      setTimeout(() => setToastMsg(''), 4500);
    } catch (err) {
      console.error('Resume upload error:', err);
      setErrorMessage(err.message || 'Failed to read resume file.');
      setResumeText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyTemplate = (tmpl) => {
    setResumeText(tmpl.text);
    setFileName(tmpl.fileName);
    setErrorMessage('');
    setToastMsg(`Loaded template: "${tmpl.title}". Click "Analyze Resume" to run ATS audit!`);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleResetForm = () => {
    setResumeText('');
    setFileName('');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setToastMsg('Ready for new resume. Upload your PDF/TXT resume or paste text below.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const textToAnalyze = resumeText.trim();
    if (!textToAnalyze) {
      setErrorMessage('Please upload a resume file (.pdf, .txt) or paste your resume content before analyzing.');
      return;
    }

    // Verify content looks like a resume
    const check = verifyResumeContent(textToAnalyze);
    if (!check.isValid) {
      setErrorMessage(check.reason);
      return;
    }

    const finalFileName = fileName.trim() || `Resume_${new Date().toISOString().slice(0, 10)}.pdf`;

    setIsAnalyzing(true);
    try {
      const data = await resumeApi.analyzeResume(textToAnalyze, finalFileName);
      setAnalysis(data);

      // Add to local history list
      setResumeHistory((prev) => {
        const filtered = prev.filter((r) => r.id !== data.id);
        return [data, ...filtered];
      });

      setToastMsg(`🎉 Resume successfully analyzed! Accurate ATS Compatibility Score: ${data.atsScore}/100.`);
      setTimeout(() => setToastMsg(''), 4500);
    } catch (err) {
      console.error('Backend analysis unavailable, calculating locally:', err);
      try {
        const localData = calculateAccurateResumeAnalysis(textToAnalyze, finalFileName);
        setAnalysis(localData);
        setResumeHistory((prev) => [localData, ...prev.filter((r) => r.id !== localData.id)]);
        setToastMsg(`🎉 Resume successfully analyzed! Accurate ATS Compatibility Score: ${localData.atsScore}/100.`);
        setTimeout(() => setToastMsg(''), 4500);
      } catch (localErr) {
        setErrorMessage(err.message || 'Unable to complete resume analysis.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setAnalysis(item);
    setFileName(item.fileName || 'Resume.pdf');
    setToastMsg(`Viewing audit results for "${item.fileName}"`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleDownloadReport = () => {
    if (!analysis) return;
    const report = `==============================================\nSMART CAREER GUIDANCE SYSTEM - ATS AUDIT REPORT\n==============================================\nFile Name: ${analysis.fileName}\nATS Compatibility Score: ${analysis.atsScore} / 100\nDate Analyzed: ${new Date().toLocaleString()}\n\nEXTRACTED TECHNICAL SKILLS (${analysis.extractedSkills?.length || 0}):\n- ${analysis.extractedSkills?.join(', ')}\n\nKEY RESUME STRENGTHS:\n${analysis.strengths?.map((s) => `• ${s}`).join('\n')}\n\nMISSING HIGH-DEMAND KEYWORDS:\n${analysis.missingKeywords?.map((k) => `• ${k}`).join('\n')}\n\nACTIONABLE ATS IMPROVEMENT SUGGESTIONS:\n${analysis.suggestions?.map((s) => `• ${s}`).join('\n')}\n==============================================`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ATS_Audit_${(analysis.fileName || 'Resume').replace(/\.[^/.]+$/, '')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
        <Navbar />
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
        </div>
      </div>
    );
  }

  const score = analysis?.atsScore ?? 78;

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
        <Navbar />

        <div className="dashboard-container">
          {/* Header */}
          <section className="dashboard-hero" style={{ padding: '2.25rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-emerald)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <FileText size={16} />
              <span>Automated ATS Resume Diagnostic Engine</span>
            </div>
            <h1>Resume Analyzer & ATS Compatibility Audit</h1>
            <p>
              Upload any resume document or paste text to receive instant Applicant Tracking System (ATS) scoring,
              technical keyword density extraction, and tailored recommendations. You can analyze multiple resumes at any time.
            </p>
          </section>

          {toastMsg && (
            <div className="global-alert success" style={{ marginBottom: '1.5rem' }}>
              <CheckCircle2 size={18} />
              <span>{toastMsg}</span>
            </div>
          )}

          {errorMessage && (
            <div className="global-alert error" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Upload & Input Form */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              marginBottom: '2.5rem',
              boxShadow: 'var(--shadow-subtle)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={18} color="var(--primary-400)" />
                <span>Upload New Resume or Paste Content</span>
              </h3>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleResetForm}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                  title="Clear form to analyze a new resume"
                >
                  <RotateCcw size={14} />
                  <span>Clear / New Resume</span>
                </button>
              </div>
            </div>

            {/* Quick Sample Template Buttons */}
            <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Quick Test with Pre-filled Profiles:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {RESUME_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.title}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: 'var(--primary-100)',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    + {tmpl.title}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAnalyze}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label" htmlFor="resume-file-input">
                    Upload Resume Document (.PDF or .TXT only):
                  </label>
                  <input
                    id="resume-file-input"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileUpload}
                    className="input-control"
                    style={{ padding: '0.55rem', cursor: 'pointer' }}
                  />
                  <div style={{ marginTop: '0.45rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      Current File: <strong style={{ color: 'var(--primary-400)' }}>{fileName || 'No file chosen (will use pasted text)'}</strong>
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      🔒 Presentations (.ppt, .pptx) and legacy .doc are strictly rejected. Only verified resumes (.pdf, .txt) can be processed.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="form-label" htmlFor="resume-text-input">
                    Paste / Edit Resume Text:
                  </label>
                  <textarea
                    id="resume-text-input"
                    rows="4"
                    className="input-control"
                    style={{ height: 'auto', padding: '0.75rem', fontSize: '0.88rem', fontFamily: 'monospace' }}
                    placeholder="Paste work experience, projects, skills, education, or keywords here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="btn-primary"
                  style={{ width: 'auto', padding: '0.75rem 1.75rem' }}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="spinner" />
                      <span>Analyzing ATS Scores...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>{analysis ? 'Analyze / Re-Analyze Resume' : 'Analyze Resume'}</span>
                    </>
                  )}
                </button>

                {analysis && (
                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.75rem 1.25rem',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 500
                    }}
                  >
                    <Download size={16} />
                    <span>Download Audit Report</span>
                  </button>
                )}

                <Link
                  to="/resume-matcher"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem 1.25rem',
                    background: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--primary-100)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                >
                  <span>Match with Job Description →</span>
                </Link>
              </div>
            </form>
          </div>

          {/* Previously Analyzed Resumes History */}
          {resumeHistory.length > 1 && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                <History size={16} color="var(--accent-cyan)" />
                <span>Previously Analyzed Resumes ({resumeHistory.length}):</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {resumeHistory.map((item, idx) => {
                  const isCurrent = analysis?.id === item.id;
                  const itmScore = item.atsScore ?? 75;
                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => handleSelectHistoryItem(item)}
                      style={{
                        background: isCurrent ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isCurrent ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <strong style={{ fontSize: '0.9rem', color: isCurrent ? 'var(--primary-100)' : 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.fileName || `Resume #${idx + 1}`}
                        </strong>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: itmScore >= 75 ? 'var(--accent-emerald)' : 'var(--accent-cyan)' }}>
                          {itmScore}/100
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
                        {item.extractedSkills?.length || 0} skills detected
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state when no resume analyzed yet */}
          {!analysis && (
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: '3rem 2rem',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}
            >
              <FileCheck size={48} color="var(--primary-400)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                No Resume Analyzed Yet
              </h3>
              <p style={{ maxWidth: '540px', margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Upload your resume in <strong>PDF (.pdf)</strong> or <strong>Plain Text (.txt)</strong> format above to generate an accurate, real-time ATS compatibility calculation based on your actual skills and projects.
              </p>
            </div>
          )}

          {/* ATS Score and Diagnostics Grid */}
          {analysis && (
            <div>
              {/* Score & Extracted Skills Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                  border: '1px solid var(--border-active)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '2rem',
                  marginBottom: '2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '2rem'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>Parsed Resume Document</span>
                  <h2 style={{ fontSize: '1.75rem', margin: '0.2rem 0' }}>{analysis.fileName}</h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)' }}>
                    ✓ {analysis.extractedSkills?.length || 0} Key Technical Skills Verified
                  </span>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1rem' }}>
                    {analysis.extractedSkills?.map((sk) => (
                      <span
                        key={sk}
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#a7f3d0',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem'
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    padding: '1.5rem 2rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>ATS Compatibility Score</span>
                  <span style={{ fontSize: '3rem', fontWeight: 800, color: score >= 75 ? 'var(--accent-emerald)' : 'var(--accent-cyan)' }}>
                    {score}<span style={{ fontSize: '1.5rem', color: 'var(--text-dim)' }}>/100</span>
                  </span>
                  <span style={{ fontSize: '0.78rem', color: score >= 75 ? 'var(--accent-emerald)' : 'var(--accent-cyan)', display: 'block' }}>
                    {score >= 75 ? 'Strong ATS Pass Rate' : 'Moderate ATS Fit'}
                  </span>
                </div>
              </div>

              {/* Strengths, Weaknesses, Missing Keywords */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {/* Strengths */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={18} />
                    <span>Resume Strengths</span>
                  </h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {analysis.strengths?.map((s, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                        <span style={{ color: 'var(--accent-emerald)' }}>•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Keywords */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fb7185', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={18} />
                    <span>Missing High-Demand Keywords</span>
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                    {analysis.missingKeywords?.map((kw) => (
                      <span
                        key={kw}
                        style={{
                          background: 'rgba(244, 63, 94, 0.12)',
                          border: '1px solid rgba(244, 63, 94, 0.3)',
                          color: '#fecdd3',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '4px',
                          fontSize: '0.82rem'
                        }}
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Adding these keywords into relevant project bullet points will improve ATS parsing rates.
                  </p>
                </div>

                {/* Suggestions */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={18} />
                    <span>Actionable Improvements</span>
                  </h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {analysis.suggestions?.map((s, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.88rem', color: '#cbd5e1' }}>
                        <span style={{ color: 'var(--accent-cyan)' }}>→</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};
