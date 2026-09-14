import { describe, expect, it } from 'vitest'
import { deadlineInTimezone, getRemaining } from './time'

describe('deadlineInTimezone', () => {
  it('converts the CALL-E deadline from IST to UTC', () => {
    expect(deadlineInTimezone('2026-09-14', '21:30', 'Asia/Kolkata')).toBe(Date.UTC(2026, 8, 14, 16, 0, 0))
  })

  it('handles a daylight-saving timezone correctly', () => {
    expect(deadlineInTimezone('2026-07-01', '09:00', 'America/New_York')).toBe(Date.UTC(2026, 6, 1, 13, 0, 0))
  })
})

describe('getRemaining', () => {
  it('returns a stable expired state at and past the deadline', () => {
    expect(getRemaining(1000, 1000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true })
  })

  it('splits remaining time into calendar units', () => {
    expect(getRemaining(90_061_000, 0)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1, done: false })
  })
})

it('rejects invalid dates and nonexistent daylight-saving times', () => {
 expect(() => deadlineInTimezone('2026-02-30','09:00','UTC')).toThrow()
 expect(() => deadlineInTimezone('2026-03-08','02:30','America/New_York')).toThrow()
})
