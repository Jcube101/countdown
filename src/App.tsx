import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router-dom'
import { listPublic, themes } from './lib/countdowns'
import type { Countdown } from './lib/countdowns'
import { CountdownTimer } from './components/CountdownTimer'
import { VoteControl } from './components/VoteControl'
import { Manage } from './components/Manage'
import { deadlineInTimezone } from './lib/time'
import './index.css'

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <header>
        <Link to="/">COUNTDOWN</Link>
        <nav aria-label="Main navigation">
          <Link to="/settings">Settings</Link>
          <Link to="/manage">Manage</Link>
        </nav>
      </header>
      {children}
    </main>
  )
}

function PublicPage() {
  const [items, setItems] = useState<Countdown[]>([])
  const [state, setState] = useState('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    listPublic()
      .then((data) => { if (active) { setItems(data); setState('ready') } })
      .catch(() => { if (active) setState('error') })
    return () => { active = false }
  }, [attempt])
  if (state === 'loading') return <section className="library" role="status">Loading countdowns…</section>
  if (state === 'error') return (
    <section className="library">
      <h1>Unable to load countdowns</h1>
      <p role="alert">Please check your connection and try again.</p>
      <button onClick={() => { setState('loading'); setAttempt(attempt + 1) }}>Try again</button>
    </section>
  )
  return (
    <section className="library">
      <p className="eyebrow">PUBLIC LIBRARY</p>
      <h1>Every deadline, in its right form.</h1>
      {items.length ? (
        <div className="grid">
          {items.map((x) => (
            <Link className="card" key={x.id} to={`/c/${x.slug}`}>
              <small>{themes.find((t) => t.id === x.theme_id)?.name}</small>
              <h2>{x.title}</h2>
              <p>{x.deadline_date} · {x.deadline_time} · {x.timezone}</p>
            </Link>
          ))}
        </div>
      ) : <p className="empty">No public countdowns yet.</p>}
    </section>
  )
}

function Detail() {
  const { slug } = useParams()
  const [items, setItems] = useState<Countdown[]>([])
  const [state, setState] = useState('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    listPublic()
      .then((data) => { if (active) { setItems(data); setState('ready') } })
      .catch(() => { if (active) setState('error') })
    return () => { active = false }
  }, [attempt])
  if (state === 'loading') return <main className="chronograph" role="status">Loading countdowns…</main>
  if (state === 'error') return (
    <main className="chronograph">
      <Link className="back-control" to="/">Library</Link>
      <h1>Unable to load countdowns</h1>
      <p role="alert">Please check your connection and try again.</p>
      <button onClick={() => { setState('loading'); setAttempt(attempt + 1) }}>Try again</button>
    </main>
  )
  const item = items.find((x) => x.slug === slug)
  if (!item) return (
    <main className="chronograph">
      <Link className="back-control" to="/">Library</Link>
      <h1>Countdown unavailable</h1>
      <p>This link may be archived or unavailable.</p>
    </main>
  )
  let valid = true
  try { deadlineInTimezone(item.deadline_date, item.deadline_time, item.timezone) } catch { valid = false }
  const theme = themes.find((t) => t.id === item.theme_id) || themes[0]
  return <TimerStage item={item} valid={valid} themeId={theme.id} />
}

function TimerStage({ item, valid, themeId }: { item: Countdown; valid: boolean; themeId: string }) {
  useEffect(() => {
    const previous = document.title
    document.title = item.title
    return () => { document.title = previous }
  }, [item.title])
  return (
    <main className={`chronograph ${themeId}`} aria-label={item.title}>
      <Link className="back-control" to="/">Library</Link>
      {valid ? <CountdownTimer countdown={item} /> : <p role="alert">Deadline unavailable. The owner needs to check its date and timezone.</p>}
      <h1 className="sr-only">{item.title}</h1>
      <p className="sr-only">{item.deadline_date} · {item.deadline_time} · {item.timezone}</p>
      <VoteControl key={item.id} countdown={item} />
      <Link className="settings-control" to="/settings">Settings</Link>
    </main>
  )
}

function Settings() {
  const [zone, setZone] = useState(localStorage.getItem('countdown:timezone') || 'Asia/Kolkata')
  return (
    <section className="panel">
      <h1>Settings</h1>
      <p>These preferences affect only how this browser presents deadline context.</p>
      <label>Preferred timezone<input value={zone} onChange={(e) => setZone(e.target.value)} /></label>
      <button onClick={() => localStorage.setItem('countdown:timezone', zone)}>Save preference</button>
    </section>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell><PublicPage /></Shell>} />
        <Route path="/c/:slug" element={<Detail />} />
        <Route path="/settings" element={<Shell><Settings /></Shell>} />
        <Route path="/manage" element={<Shell><Manage /></Shell>} />
        <Route path="*" element={<Shell><section className="library"><h1>Page not found</h1><Link to="/">Back to library</Link></section></Shell>} />
      </Routes>
    </BrowserRouter>
  )
}
