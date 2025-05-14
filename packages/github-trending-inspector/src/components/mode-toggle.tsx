"use client"

import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'motion/react'

export function ModeToggle({ iconOnly = false }: { iconOnly?: boolean }) {
  const { theme, setTheme } = useTheme()

  return (
    <motion.button
      id="theme-toggle"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="relative h-6 w-6"
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        {theme === 'light' ? (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <SunIcon className="h-6 w-6" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -90 }}
            transition={{ duration: 0.2 }}
          >
            <MoonIcon className="h-6 w-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
