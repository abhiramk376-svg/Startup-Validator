import { useEffect, useMemo, useState } from 'react'

// Reveals `text` one word at a time, like it is being written live.
// Restarts only when `text` itself changes, so re-renders from polling do not
// replay it. Users who prefer reduced motion get the full text immediately.
export default function Typewriter({ text = '', msPerWord = 45, onDone }) {
  const words = useMemo(() => text.split(' '), [text])
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [count, setCount] = useState(reduceMotion ? words.length : 0)

  useEffect(() => {
    if (reduceMotion) {
      setCount(words.length)
      return undefined
    }
    setCount(0)
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= words.length) {
          clearInterval(id)
          return c
        }
        return c + 1
      })
    }, msPerWord)
    return () => clearInterval(id)
  }, [words, msPerWord, reduceMotion])

  const done = count >= words.length

  useEffect(() => {
    if (done && text) onDone?.()
  }, [done, text])

  return (
    <>
      {words.slice(0, count).join(' ')}
      {!done && <span className="typewriter-caret" aria-hidden="true" />}
    </>
  )
}
