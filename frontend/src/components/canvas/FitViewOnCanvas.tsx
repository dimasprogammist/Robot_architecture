import { useEffect, useRef } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useUiStore } from '../../store/useUiStore'
import {
  CANVAS_FIT_MS,
  beginCanvasFit,
  isCanvasFitCurrent,
  shouldReduceMotion,
} from '../../model/canvasMotion'

export { CANVAS_FIT_MS }

export function FitViewOnCanvas({ canvasKey }: { canvasKey: string }) {
  const { fitView, getNodes } = useReactFlow()
  const finished = useRef('')

  useEffect(() => {
    finished.current = ''
  }, [canvasKey])

  useEffect(() => {
    if (!canvasKey || finished.current === canvasKey) return
    const token = beginCanvasFit()
    const reduce = shouldReduceMotion(useUiStore.getState().settings.reduce_motion)
    const run = () => {
      if (!isCanvasFitCurrent(token) || finished.current === canvasKey) return
      const empty = getNodes().length === 0
      fitView({
        padding: empty ? 0.4 : 0.18,
        duration: reduce ? 0 : CANVAS_FIT_MS,
        minZoom: 0.12,
        maxZoom: 1.6,
      })
    }
    const delays = [0, 80, 220]
    const timers = delays.map((ms, index) =>
      window.setTimeout(() => {
        run()
        if (index === delays.length - 1) finished.current = canvasKey
      }, ms),
    )
    const pane = document.querySelector('.react-flow')
    const ro =
      pane && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            if (finished.current === canvasKey) return
            run()
          })
        : null
    if (pane && ro) ro.observe(pane)
    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      ro?.disconnect()
    }
  }, [fitView, getNodes, canvasKey])
  return null
}
