import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SpeedInsights } from "@vercel/speed-insights/react"
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/next"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
    <App />
    <SpeedInsights />
    <Analytics/>
  </HelmetProvider>
  </StrictMode>,
)
