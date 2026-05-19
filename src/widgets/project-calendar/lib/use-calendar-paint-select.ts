import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const DRAG_THRESHOLD_PX = 5

export type PaintMode = 'add' | 'remove'

interface UseCalendarPaintSelectOptions {
  selectedKeys: ReadonlySet<string>
  onPaintCommit: (keys: string[], mode: PaintMode) => void
}

interface ActiveGesture {
  mode: PaintMode
  baselineKeys: ReadonlySet<string>
  paintedKeys: Set<string>
  startX: number
  startY: number
  started: boolean
}

function isRemoveModifier(event: { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean }) {
  return event.shiftKey || event.ctrlKey || event.metaKey
}

export function useCalendarPaintSelect({
  selectedKeys,
  onPaintCommit,
}: UseCalendarPaintSelectOptions) {
  const [isPainting, setIsPainting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [paintedKeys, setPaintedKeys] = useState<Set<string>>(() => new Set())
  const [paintMode, setPaintMode] = useState<PaintMode>('add')
  const [baselineKeys, setBaselineKeys] = useState<ReadonlySet<string>>(selectedKeys)

  const gestureRef = useRef<ActiveGesture | null>(null)
  const suppressClickRef = useRef(false)

  const selectedKeysRef = useRef(selectedKeys)
  const onPaintCommitRef = useRef(onPaintCommit)
  useEffect(() => {
    selectedKeysRef.current = selectedKeys
  }, [selectedKeys])
  useEffect(() => {
    onPaintCommitRef.current = onPaintCommit
  }, [onPaintCommit])

  const startDragUi = useCallback((gesture: ActiveGesture) => {
    gesture.started = true
    setBaselineKeys(gesture.baselineKeys)
    setPaintedKeys(new Set(gesture.paintedKeys))
    setPaintMode(gesture.mode)
    setIsPainting(true)
    setIsDragging(true)
  }, [])

  const addPaintedKey = useCallback((key: string) => {
    const gesture = gestureRef.current
    if (!gesture || !gesture.started) return
    if (gesture.paintedKeys.has(key)) return
    gesture.paintedKeys.add(key)
    setPaintedKeys(new Set(gesture.paintedKeys))
  }, [])

  const finishGesture = useCallback(() => {
    const gesture = gestureRef.current
    if (!gesture) return
    gestureRef.current = null

    if (!gesture.started) return

    if (gesture.paintedKeys.size > 0) {
      onPaintCommitRef.current([...gesture.paintedKeys], gesture.mode)
      suppressClickRef.current = true
    }

    setIsPainting(false)
    setIsDragging(false)
    setPaintedKeys(new Set())
    setPaintMode('add')
  }, [])

  useEffect(() => {
    const handlePointerUp = () => finishGesture()
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
    return () => {
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [finishGesture])

  const handleDayPointerDown = useCallback((dayKey: string, event: React.PointerEvent) => {
    if (event.button !== 0) return

    const mode: PaintMode = isRemoveModifier(event) ? 'remove' : 'add'
    gestureRef.current = {
      mode,
      baselineKeys: selectedKeysRef.current,
      paintedKeys: new Set([dayKey]),
      startX: event.clientX,
      startY: event.clientY,
      started: false,
    }
    suppressClickRef.current = false
  }, [])

  const handleDayPointerEnter = useCallback(
    (dayKey: string, event: React.PointerEvent) => {
      const gesture = gestureRef.current
      if (!gesture) return
      if ((event.buttons & 1) === 0) return

      if (!gesture.started) {
        const dx = event.clientX - gesture.startX
        const dy = event.clientY - gesture.startY
        if (Math.hypot(dx, dy) <= DRAG_THRESHOLD_PX) {
          gesture.paintedKeys.add(dayKey)
          return
        }
        startDragUi(gesture)
      }

      addPaintedKey(dayKey)
    },
    [startDragUi, addPaintedKey],
  )

  const shouldSuppressClick = useCallback(() => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return true
    }
    return false
  }, [])

  const effectiveSelectedKeys = useMemo(() => {
    if (!isPainting) return selectedKeys

    const preview = new Set(baselineKeys)
    if (paintMode === 'add') {
      for (const key of paintedKeys) preview.add(key)
    } else {
      for (const key of paintedKeys) preview.delete(key)
    }
    return preview
  }, [selectedKeys, isPainting, paintedKeys, paintMode, baselineKeys])

  return {
    effectiveSelectedKeys,
    isDragging,
    handleDayPointerDown,
    handleDayPointerEnter,
    shouldSuppressClick,
  }
}
