"use client";

import { PanelLeftOpen } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "../components/ui/sidebar";
import { DateSelector } from "./date-selector";
import { ThemeControls } from "./theme-controls";

interface AppSidebarProps {
  selectedDate: Date;
}

function CustomSidebarTrigger() {
  const { toggleSidebar, state } = useSidebar();

  if (state === "expanded") {
    return null;
  }

  return (
    <button
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-40 size-10 border border-border/60 bg-background rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm hover:shadow-md hover:border-border transition-all duration-200 hover:scale-105 hover:-translate-y-0.5"
    >
      <PanelLeftOpen className="size-4" />
    </button>
  );
}

export function AppSidebar({ selectedDate }: AppSidebarProps) {
  return (
    <>
      <Sidebar collapsible="offcanvas" className="w-72">
        <SidebarHeader className="px-6 py-5 border-b border-border/40">
          <div className="flex items-center justify-between">
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
            <SidebarTrigger className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors duration-200" />
          </div>
        </SidebarHeader>

        <SidebarContent className="flex-1">
          <DateSelector selectedDate={selectedDate} />
        </SidebarContent>

        <SidebarFooter>
          <ThemeControls />
        </SidebarFooter>
      </Sidebar>

      <CustomSidebarTrigger />
    </>
  );
}
