// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeAll, expect, it } from 'vitest'
import { FlipDigit, FLIP_MS } from './FlipDigit'

beforeAll(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
})

function read(host: HTMLElement) {
  const el = host.querySelector('.flip-digit')
  if (!el) throw new Error('missing flip-digit')
  return {
    flipping: el.getAttribute('data-flipping'),
    top: el.querySelector('.flip-static-top span')?.textContent ?? null,
    bottom: el.querySelector('.flip-static-bottom span')?.textContent ?? null,
    flaps: [...el.querySelectorAll('.flip-animated span')].map((n) => n.textContent),
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

it('keeps the old bottom digit until the flap settles, then can replay', async () => {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)

  await act(async () => {
    root.render(<FlipDigit digit="5" />)
  })
  expect(read(host)).toMatchObject({ flipping: 'false', top: '5', bottom: '5', flaps: [] })

  await act(async () => {
    root.render(<FlipDigit digit="4" />)
  })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
  expect(read(host)).toMatchObject({ flipping: 'true', top: '4', bottom: '5', flaps: ['5', '4'] })

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, FLIP_MS + 30))
  })
  expect(read(host)).toMatchObject({ flipping: 'false', top: '4', bottom: '4', flaps: [] })

  await act(async () => {
    root.render(<FlipDigit digit="3" />)
  })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
  expect(read(host)).toMatchObject({ flipping: 'true', top: '3', bottom: '4', flaps: ['4', '3'] })

  await act(async () => {
    root.unmount()
  })
})
