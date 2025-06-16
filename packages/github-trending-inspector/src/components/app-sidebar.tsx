"use client";

import { PanelLeftOpen } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMediaQuery } from "../hooks/use-media-query";
import { useSidebarMachine } from "../hooks/use-sidebar-machine";
import { DateSelector } from "./date-selector";
import { ThemeControls } from "./theme-controls";

interface AppSidebarProps {
  selectedDate: Date;
}

export function AppSidebar({ selectedDate }: AppSidebarProps) {
  const { state, toggle, isVisible, isAnimating } = useSidebarMachine("open");
  const isMobile = useMediaQuery("(max-width: 767px)");

  const isOpen = state === "open" || state === "expanding";
  const showToggleButton = state === "closed" && !isAnimating;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isVisible && (
          <motion.div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={toggle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Desktop Hover Sidebar */}
      <AnimatePresence>
        {!isMobile && state === "closed" && !isAnimating && (
          <div className="fixed top-0 left-0 w-4 h-screen z-30 group">
            <motion.aside
              className="fixed top-0 left-0 h-screen w-72 bg-background border-r border-border/60 z-40 flex flex-col"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8,
              }}
            >
              <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/8 border border-primary/12">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 48 48"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m24 27-11-6-11 6v14l11 6V34z" />
                      <path d="M24 41V14L13 7l11-6 11 6v14l-11 6 11 7 11-7v14l-11 6z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-base font-semibold tracking-tight text-foreground">
                      Trending Inspector
                    </h1>
                  </div>
                </div>
                <motion.button
                  onClick={toggle}
                  className="size-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PanelLeftOpen className="size-4" />
                </motion.button>
              </div>

              <DateSelector selectedDate={selectedDate} />

              <div className="flex-1" />

              <ThemeControls />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className="fixed md:sticky top-0 left-0 h-screen w-72 bg-background border-r border-border/60 z-50 md:z-auto flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 40,
              mass: 1,
            }}
          >
            <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between flex-shrink-0">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <div className="p-2 rounded-lg bg-primary/8 border border-primary/12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m24 27-11-6-11 6v14l11 6V34z" />
                    <path d="M24 41V14L13 7l11-6 11 6v14l-11 6 11 7 11-7v14l-11 6z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-base font-semibold tracking-tight text-foreground">
                    Trending Inspector
                  </h1>
                </div>
              </motion.div>
              <motion.button
                onClick={toggle}
                className="size-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors duration-200"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, rotate: -10 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                <PanelLeftOpen className="size-4" />
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <DateSelector selectedDate={selectedDate} />
            </motion.div>

            <div className="flex-1" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <ThemeControls />
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <AnimatePresence>
        {showToggleButton && (
          <motion.button
            onClick={toggle}
            className="fixed top-4 left-4 z-40 size-10 border border-border/60 bg-background rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm hover:shadow-md hover:border-border transition-colors duration-200"
            initial={{
              opacity: 0,
              x: -20,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: -20,
              scale: 0.8,
            }}
            whileHover={{
              scale: 1.05,
              y: -2,
              boxShadow:
                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
          >
            <PanelLeftOpen className="size-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
