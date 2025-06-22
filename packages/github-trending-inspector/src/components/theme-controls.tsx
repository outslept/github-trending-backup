"use client";

import { Clock, Monitor, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function ClockDisplay() {
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  );

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    };

    const now = new Date();
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    const timeoutId = setTimeout(() => {
      updateTime();
      const intervalId = setInterval(updateTime, 60000);

      return () => clearInterval(intervalId);
    }, msUntilNextMinute);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-md bg-muted/40">
        <Clock className="size-3 text-muted-foreground" />
      </div>
      <div>
        <span className="text-xs font-mono font-medium text-foreground tracking-tight">
          {currentTime}
        </span>
        <p className="text-[10px] text-muted-foreground tracking-tight">
          Local time
        </p>
      </div>
    </div>
  );
}

const themeButtons = [
  { theme: "light", icon: Sun, label: "Light" },
  { theme: "dark", icon: Moon, label: "Dark" },
  { theme: "system", icon: Monitor, label: "System" },
];

function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  const getActiveIndex = () => {
    return themeButtons.findIndex((btn) => btn.theme === theme);
  };

  return (
    <div className="relative flex items-center bg-muted/40 backdrop-blur-sm rounded-lg p-1">
      <motion.div
        className="absolute bg-background/90 backdrop-blur-md rounded-md shadow-sm border border-border/50"
        initial={false}
        animate={{
          x: getActiveIndex() * 28, // 28px = button width
          opacity: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 35,
          mass: 0.5,
        }}
        style={{
          width: "28px",
          height: "28px",
          top: "4px",
          left: "4px",
        }}
      />

      {themeButtons.map(({ theme: themeOption, icon: Icon, label }) => (
        <button
          key={themeOption}
          onClick={() => setTheme(themeOption)}
          title={label}
          className={`
            relative z-10 size-7 flex items-center justify-center rounded-md
            transition-colors duration-150 ease-out
            ${
              theme === themeOption
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }
          `}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}

export function ThemeControls() {
  return (
    <div className="px-6 py-4 border-t border-border/40 flex-shrink-0 mt-auto">
      <div className="flex items-center justify-between">
        <ClockDisplay />
        <ThemeSwitcher />
      </div>
    </div>
  );
}
