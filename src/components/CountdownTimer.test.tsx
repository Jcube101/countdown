// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { CountdownTimer } from './CountdownTimer'
import { newCountdown } from '../lib/countdowns'

afterEach(cleanup)

const live = {
  ...newCountdown(),
  id: '1',
  title: 'Live',
  slug: 'live',
  deadline_date: '2099-01-01',
  deadline_time: '12:00',
  timezone: 'UTC',
}

it('uses split-flap digits for Midnight Chronograph', () => {
  render(<CountdownTimer countdown={{ ...live, theme_id: 'midnight-chronograph' }} />)
  expect(document.querySelectorAll('.flip-digit').length).toBeGreaterThan(0)
  expect(screen.getByRole('timer').className).toContain('flip-clock')
})

it('keeps Studio Minimal on static numerals', () => {
  render(<CountdownTimer countdown={{ ...live, theme_id: 'studio-minimal' }} />)
  expect(document.querySelectorAll('.flip-digit').length).toBe(0)
  expect(screen.getByRole('timer').querySelector('strong')).toBeTruthy()
})
