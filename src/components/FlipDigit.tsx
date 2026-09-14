import { useEffect, useRef, useState } from 'react'

export const FLIP_MS = 600

type FlipDigitProps = {
  digit: string
  done?: boolean
}

export function FlipDigit({ digit, done = false }: FlipDigitProps) {
  const settledRef = useRef(digit)
  const flippingRef = useRef(false)
  const pendingRef = useRef<string | null>(null)
  const timerRef = useRef(0)

  const [settled, setSettled] = useState(digit)
  const [target, setTarget] = useState(digit)
  const [flipping, setFlipping] = useState(false)
  const [flipGen, setFlipGen] = useState(0)

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = 0
      }
    }

    const beginFlip = (to: string) => {
      const from = settledRef.current
      if (to === from && !flippingRef.current) return
      if (flippingRef.current) {
        pendingRef.current = to
        return
      }

      flippingRef.current = true
      setTarget(to)
      setFlipGen((g) => g + 1)
      setFlipping(true)

      clearTimer()
      timerRef.current = window.setTimeout(() => {
        timerRef.current = 0
        settledRef.current = to
        setSettled(to)
        setTarget(to)
        flippingRef.current = false
        setFlipping(false)

        const pending = pendingRef.current
        pendingRef.current = null
        if (pending !== null && pending !== to) beginFlip(pending)
      }, FLIP_MS)
    }

    if (digit !== settledRef.current) beginFlip(digit)
  }, [digit])

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
  }, [])

  const staticTop = flipping ? target : settled

  return (
    <div
      className={done ? 'flip-digit flip-digit-done' : 'flip-digit'}
      data-flipping={flipping ? 'true' : 'false'}
      data-settled={settled}
      data-target={target}
      aria-hidden="true"
    >
      <div className="flip-static flip-static-top"><span>{staticTop}</span></div>
      <div className="flip-static flip-static-bottom"><span>{settled}</span></div>
      {flipping ? (
        <>
          <div key={`top-${flipGen}`} className="flip-animated flip-animated-top"><span>{settled}</span></div>
          <div key={`bottom-${flipGen}`} className="flip-animated flip-animated-bottom"><span>{target}</span></div>
        </>
      ) : null}
    </div>
  )
}

export function FlipUnit({ value, label, done = false }: { value: string; label: string; done?: boolean }) {
  return (
    <div className="flip-unit">
      <div className="flip-unit-digits">
        {value.split('').map((digit, index) => (
          <FlipDigit key={`${label}-${index}`} digit={digit} done={done} />
        ))}
      </div>
      <span>{label}</span>
    </div>
  )
}
