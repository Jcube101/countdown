import { useEffect, useState } from 'react'
import { deadlineInTimezone, getRemaining } from '../lib/time'
import type { Countdown } from '../lib/countdowns'
import { FlipUnit } from './FlipDigit'

function pad(value: number, width = 2) {
  return String(value).padStart(width, '0')
}

export function CountdownTimer({ countdown }: { countdown: Countdown }) {
  const deadline = deadlineInTimezone(countdown.deadline_date, countdown.deadline_time, countdown.timezone)
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const initial = window.setTimeout(() => setNow(Date.now()), 0)
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(id)
    }
  }, [])
  const remaining = getRemaining(deadline, now)
  if (remaining.done) return <p className="expired" role="status">This countdown has ended.</p>
  const dayWidth = Math.max(2, String(remaining.days).length)
  const units = [
    ['Days', pad(remaining.days, dayWidth)],
    ['Hours', pad(remaining.hours)],
    ['Minutes', pad(remaining.minutes)],
    ['Seconds', pad(remaining.seconds)],
  ] as const
  const mechanical = countdown.theme_id === 'midnight-chronograph'
  return (
    <div
      className={mechanical ? 'countdown-units flip-clock' : 'countdown-units'}
      role="timer"
      aria-label={`${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} minutes, and ${remaining.seconds} seconds remaining`}
    >
      {mechanical
        ? units.map(([label, value]) => <FlipUnit key={label} value={value} label={label} />)
        : units.map(([label, value]) => <div key={label} aria-hidden="true"><strong>{value}</strong><span>{label}</span></div>)}
    </div>
  )
}
