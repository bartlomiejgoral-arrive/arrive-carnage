import { useEffect, useRef } from 'react'
import type { Application } from 'pixi.js'
import { createGame } from '../game/Game'

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // StrictMode fires effects twice; `cancelled` is scoped to each run so the
    // first async init self-destructs while the second one proceeds normally.
    let cancelled = false

    const init = async () => {
      const app = await createGame(containerRef.current!)
      if (cancelled) {
        app.canvas.remove()
        app.destroy()
        return
      }
      appRef.current = app
    }

    init()

    return () => {
      cancelled = true
      if (appRef.current) {
        appRef.current.canvas.remove()
        appRef.current.destroy()
        appRef.current = null
      }
    }
  }, [])

  return <div ref={containerRef} className="game-canvas" />
}
