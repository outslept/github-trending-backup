import type { ReactNode } from "react";

import { TooltipProvider } from "../components/ui/tooltip";

import { ErrorProvider } from "./error";
import { QueryProvider } from "./query";
import { ThemeProvider } from "./theme";

export function DesignSystemProvider({ children }: { children: ReactNode }) {
  return (
    <ErrorProvider>
      <QueryProvider>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorProvider>
  );
}
