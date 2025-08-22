import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App'
import '../styles/globals.css'
import { Toaster } from 'sonner'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element #root not found in index.html')
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
    <Toaster richColors />
  </React.StrictMode>
)

