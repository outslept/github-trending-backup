import { ErrorProvider } from "./error";
import { QueryProvider } from "./query";
import { ThemeProvider } from "./theme";
import type { ReactNode } from "react";

export function DesignSystemProvider({ children }: { children: ReactNode }) {
  return (
    <ErrorProvider>
      <QueryProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryProvider>
    </ErrorProvider>
  );
}
