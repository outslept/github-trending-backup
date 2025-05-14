"use client"

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Clock } from 'lucide-react'

function NextUpdateTimer() {
  const [currentTime, setCurrentTime] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    function updateTimes() {
      const now = new Date()
      const nextUpdate = new Date(now)
      nextUpdate.setUTCHours(24, 0, 0, 0)

      const diff = nextUpdate.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }))
      setTimeLeft(`${hours}h ${minutes}m until next update`)
    }

    const timer = setInterval(updateTimes, 60000)
    updateTimes()

    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      <Clock className="h-4 w-4" />
      <div className="flex flex-col">
        <span className="text-sm font-medium tabular-nums">{currentTime}</span>
        <span className="text-xs text-muted-foreground/70 tabular-nums">{timeLeft}</span>
      </div>
    </motion.div>
  )
}

export { NextUpdateTimer };
