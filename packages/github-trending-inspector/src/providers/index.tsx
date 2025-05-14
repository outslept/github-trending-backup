import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider } from '$/providers/theme';
import { TooltipProvider } from '$/components/ui/tooltip';
import { Toaster } from '$/components/ui/sonner';

type DesignSystemProviderProperties = ThemeProviderProps & {
  privacyUrl?: string;
  termsUrl?: string;
  helpUrl?: string;
};

export const DesignSystemProvider = ({
  children,
  privacyUrl,
  termsUrl,
  helpUrl,
  ...properties
}: DesignSystemProviderProperties) => (
  <ThemeProvider {...properties}>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
  </ThemeProvider>
);
