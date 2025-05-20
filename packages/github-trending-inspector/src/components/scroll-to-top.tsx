'use client'

import { Button } from '$/components/ui/button'
import { ChevronUpIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 400)
    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <Button
          asChild
          size="icon"
          className="fixed bottom-8 right-8 rounded-full group h-12 w-12 hover:scale-110 transition-transform duration-200"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-center -mt-1">
              <ChevronUpIcon className="h-5 w-5 -mb-2 stroke-[3]" />
              <ChevronUpIcon className="h-5 w-5 stroke-[3]" />
            </div>
          </motion.div>
        </Button>
      )}
    </AnimatePresence>
  )
}
