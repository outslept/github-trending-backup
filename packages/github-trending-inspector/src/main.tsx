import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { DesignSystemProvider } from './providers'
import { routeTree } from './routeTree.gen'
import './styles.css'
import './fonts.css'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.querySelector('#root')
if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <DesignSystemProvider>
      <RouterProvider router={router} />
    </DesignSystemProvider>
  </StrictMode>
)
