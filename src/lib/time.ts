export type Remaining = { days: number; hours: number; minutes: number; seconds: number; done: boolean }

function timezoneOffset(timestamp: number, timezone: string) {
  const value = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'longOffset' })
    .formatToParts(new Date(timestamp))
    .find((part) => part.type === 'timeZoneName')?.value
  if (!value || value === 'GMT') return 0
  const match = value.match(/^GMT([+-])(\d{2}):(\d{2})$/)
  if (!match) return 0
  const minutes = Number(match[2]) * 60 + Number(match[3])
  return match[1] === '+' ? minutes : -minutes
}

export function deadlineInTimezone(date: string, time: string, timezone: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) throw new Error('Enter a valid date and time.')
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  const wallClock = Date.UTC(year, month - 1, day, hours, minutes, 0)
  const firstPass = wallClock - timezoneOffset(wallClock, timezone) * 60_000
  const epoch = wallClock - timezoneOffset(firstPass, timezone) * 60_000
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone: timezone, year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(epoch)
  const part = (type: string) => parts.find(p => p.type === type)?.value
  if (`${part('year')}-${part('month')}-${part('day')}` !== date || `${part('hour')}:${part('minute')}` !== time) throw new Error('This date or local time does not exist in the selected timezone.')
  return epoch
}

export function getRemaining(deadline: number, now: number): Remaining {
  const delta = deadline - now
  if (delta <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  const seconds = Math.floor(delta / 1000)
  return { days: Math.floor(seconds / 86_400), hours: Math.floor((seconds % 86_400) / 3600), minutes: Math.floor((seconds % 3600) / 60), seconds: seconds % 60, done: false }
}

const ZONE_LABELS: Record<string, string> = { 'Asia/Kolkata': 'IST', UTC: 'UTC' }

export function formatDeadlineLabel(date: string, time: string, timezone: string, ended = false) {
  const epoch = deadlineInTimezone(date, time, timezone)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'shortGeneric',
  }).formatToParts(epoch)
  const value = (type: string) => parts.find((part) => part.type === type)?.value || ''
  const day = value('day')
  const month = value('month')
  const hour = value('hour')
  const minute = value('minute')
  const dayPeriod = value('dayPeriod').replace(/\./g, '').replace(/\s/g, '').toUpperCase()
  const zone = ZONE_LABELS[timezone] || value('timeZoneName') || timezone
  const label = `${day} ${month}, ${hour}:${minute} ${dayPeriod} ${zone}`
  return ended ? `Ended · ${label}` : label
}
