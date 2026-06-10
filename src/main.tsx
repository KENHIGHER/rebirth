import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { hydrateGameSave, startGameAutosave } from './lib/gameSave'

hydrateGameSave()
startGameAutosave()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
