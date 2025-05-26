'use client'

import type { TableView } from '$/lib/types'
import { useEffect, useState } from 'react'

export function useViewport(): TableView {
  const [view, setView] = useState<TableView>('desktop')

  useEffect(() => {
    const checkViewport = () => {
      setView(window.innerWidth < 768 ? 'mobile' : 'desktop')
    }

    checkViewport()
    window.addEventListener('resize', checkViewport)
    return () => window.removeEventListener('resize', checkViewport)
  }, [])

  return view
}
