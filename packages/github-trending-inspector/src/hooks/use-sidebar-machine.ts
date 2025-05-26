'use client'

import type { SidebarState } from '$/lib/types'
import { useCallback, useState } from 'react'

export function useSidebarMachine(initialState: SidebarState = 'open') {
  const [state, setState] = useState<SidebarState>(initialState)

  const toggle = useCallback(() => {
    if (state === 'open') {
      setState('collapsing')
      setTimeout(() => setState('closed'), 200)
    }
    else if (state === 'closed') {
      setState('expanding')
      setTimeout(() => setState('open'), 200)
    }
  }, [state])

  const isVisible = state === 'open' || state === 'collapsing'
  const isAnimating = state === 'collapsing' || state === 'expanding'

  return { state, toggle, isVisible, isAnimating }
}
