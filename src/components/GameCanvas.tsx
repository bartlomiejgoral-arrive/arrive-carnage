import { useEffect, useRef } from 'react'
import type { Application } from 'pixi.js'
import { createGame } from '../game/Game'

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)

  useEffect(() => {
    if (!containerRef.current || appRef.current) return

    let app: Application | null = null

    const init = async () => {
      app = await createGame(containerRef.current!)
      appRef.current = app
    }

    init()

    return () => {
      appRef.current?.destroy(true)
      appRef.current = null
    }
  }, [])

  return <div ref={containerRef} className="game-canvas" />
}
