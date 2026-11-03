'use client'

import { useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  FileImage,
  Leaf,
  Microscope,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react'
py
const diseaseInfo = {
  'Tomato Early Blight': {
    plant: 'Tomato',
    type: 'Fungal disease',
    symptoms: 'Brown spots with concentric rings on lower leaves.',
    cause: 'Fungal infection caused by Alternaria solani.',
    treatment: 'Remove affected leaves. Apply fungicide spray and improve air circulation.',
    prevention: 'Maintain leaf spacing, avoid prolonged leaf wetness, and remove bottom leaves.',
    confidence: 94.8,
  },
  'Tomato Late Blight': {
    plant: 'Tomato',
    type: 'Fungal disease',
    symptoms: 'Dark, water-soaked lesions that spread quickly across leaves.',
    cause: 'Phytophthora infestans, favored by cool and humid conditions.',
    treatment: 'Remove infected material and follow appropriate fungicide recommendations.',
    prevention: 'Water at the soil line, provide airflow, and avoid working with wet foliage.',
    confidence: 91.2,
  },
  'Pepper Healthy': {
    plant: 'Pepper',
    type: 'Healthy plant',
    symptoms: 'Plant appears healthy with even green foliage and no visible lesions.',
    cause: 'No disease detected.',
    treatment: 'Continue regular watering, feeding, and routine maintenance.',
    prevention: 'Monitor regularly for changes in color, texture, or leaf shape.',
    confidence: 97.1,
  },
} as const

type ResultKey = keyof typeof diseaseInfo

export function AgriVisionDashboard() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('tomato-leaf-sample.jpg')
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultKey, setResultKey] = useState<ResultKey>('Tomato Early Blight')
  const [activeNav, setActiveNav] = useState('Dashboard')

  const result = diseaseInfo[resultKey]

  function handleFile(file?: File) {
    if (!file || !file.type.startsWith('image/')) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => setPreview(String(reader.result))
    reader.readAsDataURL(file)
    setIsProcessing(true)
    window.setTimeout(() => {
      setResultKey(file.name.toLowerCase().includes('pepper') ? 'Pepper Healthy' : 'Tomato Early Blight')
      setIsProcessing(false)
    }, 800)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="hidden w-[228px] shrink-0 border-r border-border bg-card px-5 py-7 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="size-5" />
            </div>
            <span className="font-mono text-[15px] font-bold tracking-tight">AgriVision AI</span>
          </div>
          <div className="mt-12 flex flex-col gap-2">
            {['Dashboard', 'How it works', 'Model details'].map((item) => (
              <button key={item} onClick={() => setActiveNav(item)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${activeNav === item ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                {item === 'Dashboard' ? <BarChart3 className="size-4" /> : item === 'How it works' ? <Microscope className="size-4" /> : <Sparkles className="size-4" />}
                {item}
              </button>
            ))}
          </div>
          <div className="mt-auto rounded-xl border border-border bg-muted/50 p-4">
            <ShieldCheck className="size-5 text-primary" />
            <p className="mt-3 text-xs font-semibold">Built for demonstration</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">A simple, explainable model workflow for your college project.</p>
          </div>
        </aside>

        <section className="flex-1 px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
          <header className="flex items-start justify-between gap-6 border-b border-border pb-7">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Plant health intelligence</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Leaf disease detection</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Upload a leaf image to identify common diseases and receive practical next steps.</p>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-border px-3 py-2 text-xs text-muted-foreground sm:flex"><span className="size-2 rounded-full bg-primary" />Model ready</div>
          </header>

          <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]">
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">01 / Upload sample</p><h2 className="mt-2 text-xl font-semibold">Analyze a plant leaf</h2></div>
                  <FileImage className="size-5 text-muted-foreground" />
                </div>
                <button onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }} className="mt-6 flex min-h-[210px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-primary/35 bg-primary/[0.035] px-6 text-center transition-colors hover:border-primary hover:bg-primary/[0.07]">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><Upload className="size-5" /></div>
                  <p className="mt-4 text-sm font-semibold">Drop your image here or browse</p>
                  <p className="mt-1 text-xs text-muted-foreground">JPG, JPEG, or PNG · Recommended 224 × 224 px</p>
                  <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} />
                </button>
                <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2.5 text-xs"><span className="flex min-w-0 items-center gap-2 truncate text-muted-foreground"><Check className="size-3.5 shrink-0 text-primary" />{fileName}</span><button className="shrink-0 font-medium text-primary" onClick={() => inputRef.current?.click()}>Change</button></div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                <div className="flex items-center justify-between"><div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">02 / Model pipeline</p><h2 className="mt-2 text-xl font-semibold">How it works</h2></div><ArrowUpRight className="size-5 text-muted-foreground" /></div>
                <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-medium"><span className="rounded-md border border-border px-3 py-2">Leaf image</span><span className="text-muted-foreground">→</span><span className="rounded-md border border-border px-3 py-2">224 × 224</span><span className="text-muted-foreground">→</span><span className="rounded-md border border-border px-3 py-2">MobileNetV2</span><span className="text-muted-foreground">→</span><span className="rounded-md bg-primary px-3 py-2 text-primary-foreground">Prediction</span></div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
              <div className="flex items-center justify-between"><div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">03 / Result</p><h2 className="mt-2 text-xl font-semibold">Analysis report</h2></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{isProcessing ? 'Processing' : 'Complete'}</span></div>
              <div className="mt-6 overflow-hidden rounded-xl bg-muted">{preview ? <img src={preview} alt="Uploaded plant leaf" className="h-52 w-full object-cover" /> : <div className="flex h-52 items-center justify-center"><Leaf className="size-14 text-primary/30" /></div>}</div>
              <div className="mt-5 flex items-end justify-between gap-4"><div><p className="text-xs text-muted-foreground">Predicted condition</p><h3 className="mt-1 text-2xl font-semibold tracking-tight">{isProcessing ? 'Analyzing…' : resultKey}</h3><p className="mt-1 text-xs text-muted-foreground">{result.plant} · {result.type}</p></div><div className="text-right"><p className="text-xs text-muted-foreground">Confidence</p><p className="mt-1 font-mono text-2xl font-bold text-primary">{result.confidence}%</p></div></div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${result.confidence}%` }} /></div>
              <div className="mt-7 flex flex-col gap-5 border-t border-border pt-6"><InfoRow label="Symptoms" value={result.symptoms} /><InfoRow label="Possible cause" value={result.cause} /><InfoRow label="Treatment recommendation" value={result.treatment} /><InfoRow label="Prevention tips" value={result.prevention} /></div>
              <div className="mt-7 flex gap-3 rounded-lg border border-primary/20 bg-primary/[0.045] p-3 text-xs leading-5 text-muted-foreground"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" /><span><strong className="text-foreground">General guidance only.</strong> Consult a qualified agricultural professional before treating crops.</span></div>
            </div>
          </div>
          <footer className="mt-10 flex items-center justify-between border-t border-border pt-5 text-xs text-muted-foreground"><span>AgriVision AI · PlantVillage subset · MobileNetV2</span><span className="hidden sm:block">Local demonstration project</span></footer>
        </section>
      </div>
    </main>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 sm:grid-cols-[150px_1fr]"><p className="text-xs font-semibold text-foreground">{label}</p><p className="text-sm leading-6 text-muted-foreground">{value}</p></div>
}
