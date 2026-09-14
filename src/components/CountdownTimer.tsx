import { useEffect, useState } from 'react'
import { deadlineInTimezone, getRemaining } from '../lib/time'
import type { Countdown } from '../lib/countdowns'

export function CountdownTimer({ countdown }: { countdown: Countdown }) {
  const deadline = deadlineInTimezone(countdown.deadline_date, countdown.deadline_time, countdown.timezone)
  const [now, setNow] = useState(Date.now)
  useEffect(() => { const initial = window.setTimeout(() => setNow(Date.now()), 0); const id = window.setInterval(() => setNow(Date.now()), 1000); return () => { window.clearTimeout(initial); window.clearInterval(id) } }, [])
  const remaining = getRemaining(deadline, now)
  if (remaining.done) return <p className="expired" role="status">This countdown has ended.</p>
  return <div className="countdown-units" role="timer" aria-label={`${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} minutes, and ${remaining.seconds} seconds remaining`}>
    {([['Days', remaining.days, 3], ['Hours', remaining.hours, 2], ['Minutes', remaining.minutes, 2], ['Seconds', remaining.seconds, 2]] as const).map(([label, value, width]) => <div key={label} aria-hidden="true"><strong>{String(value).padStart(width, '0')}</strong><span>{label}</span></div>)}
  </div>
}
