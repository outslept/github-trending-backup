"use client";

import { AlertCircle } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "../components/ui/button";
import type { ReactNode } from "react";

export function ErrorProvider({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 max-w-md text-center px-4">
            <AlertCircle className="size-10 text-destructive" />
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Button onClick={resetErrorBoundary} variant="outline">
              Try again
            </Button>
          </div>
        </div>
      )}
      onReset={() => window.location.reload()}
    >
      {children}
    </ErrorBoundary>
  );
}
