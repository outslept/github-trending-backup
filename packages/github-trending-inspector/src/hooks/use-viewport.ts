'use client'

import { useEffect, useState } from 'react'

export function useViewport() {
  const [view, setView] = useState('desktop')

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
